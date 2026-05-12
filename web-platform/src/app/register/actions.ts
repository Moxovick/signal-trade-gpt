"use server";

/**
 * Server actions for /register.
 *
 * v6b: registration is now PO-gated.
 *  - The form REQUIRES `poTraderId` (the client only submits the form after
 *    the user picked the "Yes, I have a PO account" path).
 *  - We validate the trader ID against the PocketOption Affiliate API. The
 *    account must be in our network and have `depositTotal >= MIN_DEPOSIT`.
 *  - Only then do we create the User row + bind a `PocketOptionAccount` so
 *    `User.tier` jumps to T1 immediately on first login.
 *
 * Why server actions: native browsers can submit `<form action={...}>` even
 * when JS hydration breaks, which makes signup more resilient.
 */
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { generateReferralCode } from "@/lib/utils";
import { fetchTraderInfo, isValidTraderIdFormat } from "@/lib/po-api";
import { recomputeUserTier } from "@/lib/pocketoption";

/** USD threshold for Pro access. Sub-$20 deposits are rejected at registration. */
export const REGISTER_MIN_DEPOSIT_USD = 20;

export type RegisterActionResult = {
  ok: boolean;
  error?: string;
  /** Plaintext credentials echoed back so the client can sign-in via NextAuth. */
  email?: string;
  password?: string;
};

export async function registerAction(
  _prev: RegisterActionResult,
  formData: FormData,
): Promise<RegisterActionResult> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  const referralCode = String(formData.get("referralCode") ?? "").trim();
  const nickname = String(formData.get("nickname") ?? "")
    .trim()
    .slice(0, 32);
  const promoCode = String(formData.get("promoCode") ?? "")
    .trim()
    .slice(0, 32);
  // telegramUsername: strip leading @, allow A-Za-z0-9_, max 32 chars.
  const telegramUsernameRaw = String(formData.get("telegramUsername") ?? "")
    .trim()
    .replace(/^@/, "")
    .slice(0, 32);
  const telegramUsername = /^[A-Za-z0-9_]{0,32}$/.test(telegramUsernameRaw)
    ? telegramUsernameRaw
    : "";
  const poTraderId = String(formData.get("poTraderId") ?? "").trim();

  if (!email.includes("@")) {
    return { ok: false, error: "Введи корректный email" };
  }
  if (password.length < 6) {
    return { ok: false, error: "Пароль минимум 6 символов" };
  }
  if (password !== confirm) {
    return { ok: false, error: "Пароли не совпадают" };
  }
  if (!poTraderId || !isValidTraderIdFormat(poTraderId)) {
    return {
      ok: false,
      error:
        "Введи корректный PocketOption Trader ID. Если аккаунта нет — нажми «Нет — покажи как зарегистрировать» и сначала зарегайся на PO.",
    };
  }

  // ── PO gate ────────────────────────────────────────────────────────────
  // (1) Trader ID must not be already attached to another user.
  const conflict = await prisma.pocketOptionAccount.findUnique({
    where: { poTraderId },
  });
  if (conflict) {
    return {
      ok: false,
      error: "Этот Trader ID уже привязан к другому аккаунту на сайте.",
    };
  }

  // (2) Verify against PocketOption affiliate API.
  const verify = await fetchTraderInfo(poTraderId);
  if (!verify.ok) {
    if (verify.reason === "not_found") {
      return {
        ok: false,
        error:
          "PocketOption не видит этот Trader ID в нашей сети. Зарегистрируйся по нашей реф-ссылке и попробуй снова.",
      };
    }
    if (verify.reason === "not_configured") {
      return {
        ok: false,
        error:
          "Проверка PO API временно недоступна. Напиши админу — мы привяжем вручную.",
      };
    }
    return {
      ok: false,
      error: "PocketOption API сейчас не отвечает. Попробуй через минуту.",
    };
  }

  // (3) Deposit must reach the Pro threshold.
  const depositTotal = verify.info.depositTotal;
  if (depositTotal < REGISTER_MIN_DEPOSIT_USD) {
    return {
      ok: false,
      error: `Минимальный депозит для регистрации — $${REGISTER_MIN_DEPOSIT_USD}. Сейчас на твоём PO ${depositTotal.toFixed(2)} $. Пополни счёт и возвращайся.`,
    };
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { ok: false, error: "Этот email уже зарегистрирован" };
    }

    let referredById: string | null = null;
    if (referralCode) {
      const referrer = await prisma.user.findUnique({
        where: { referralCode },
      });
      if (referrer) referredById = referrer.id;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const code = generateReferralCode();

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        referralCode: code,
        referredById,
        subscriptionPlan: "free",
        ...(nickname ? { firstName: nickname } : {}),
        ...(telegramUsername ? { username: telegramUsername } : {}),
      },
      select: { id: true, email: true },
    });

    if (referredById) {
      await prisma.referral.create({
        data: { referrerId: referredById, referredId: user.id },
      });
    }

    // Bind the verified PO account immediately.
    const ftdAt = verify.info.ftdAt ? new Date(verify.info.ftdAt) : null;
    await prisma.pocketOptionAccount.create({
      data: {
        userId: user.id,
        poTraderId,
        status: "verified",
        source: "manual",
        totalDeposit: depositTotal,
        ...(ftdAt && !Number.isNaN(ftdAt.getTime()) ? { ftdAt } : {}),
      },
    });
    await recomputeUserTier(user.id);

    if (promoCode) {
      await prisma.activityLog
        .create({
          data: {
            userId: user.id,
            action: "promo_code_submitted",
            details: { promoCode },
          },
        })
        .catch(() => undefined);
    }

    return { ok: true, email, password };
  } catch (err) {
    console.error("[register action] failed:", err);
    const msg = err instanceof Error ? err.message : "unknown";
    return { ok: false, error: `Внутренняя ошибка: ${msg}` };
  }
}
