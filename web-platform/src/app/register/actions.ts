"use server";

/**
 * Server actions for /register.
 *
 * Referral attribution order:
 *  1. Form field `referralCode` (pre-filled from ?ref= URL param or typed manually)
 *  2. Cookie `stg_ref` (set by /r/[code] short-link, survives 30 days)
 * After successful registration, the stg_ref cookie is cleared.
 */
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { generateReferralCode } from "@/lib/utils";
import { fetchTraderInfo, isValidTraderIdFormat } from "@/lib/po-api";
import { recomputeUserTier } from "@/lib/pocketoption";

export type RegisterActionResult = {
  ok: boolean;
  error?: string;
  /** Plaintext credentials echoed back so the client can sign-in via NextAuth. */
  email?: string;
  password?: string;
  /** True when the user must finish PO attachment at /onboarding/po-id. */
  needsPoOnboarding?: boolean;
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
  const formReferralCode = String(formData.get("referralCode") ?? "").trim();
  // Cookie fallback: if form field is empty, try the stg_ref cookie (set by /r/[code])
  const cookieStore = await cookies();
  const cookieRef = cookieStore.get("stg_ref")?.value?.trim() ?? "";
  const referralCode = formReferralCode || cookieRef;
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
  const poTraderIdRaw = String(formData.get("poTraderId") ?? "").trim();
  const poTraderId = poTraderIdRaw.length > 0 ? poTraderIdRaw : null;

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!EMAIL_RE.test(email)) {
    return { ok: false, error: "Введи корректный email" };
  }
  if (password.length < 6) {
    return { ok: false, error: "Пароль минимум 6 символов" };
  }
  if (password !== confirm) {
    return { ok: false, error: "Пароли не совпадают" };
  }

  // ── Optional PO attachment ─────────────────────────────────────────────
  // If the user supplies a trader ID, validate it before creating the user
  // (so we don't leave half-baked rows). If they skip it, we create the user
  // and ship them to /onboarding/po-id to finish attachment.
  let poVerifyInfo: { depositTotal: number; ftdAt: string | null } | null = null;

  if (poTraderId !== null) {
    if (!isValidTraderIdFormat(poTraderId)) {
      return {
        ok: false,
        error: "PocketOption Trader ID должен быть числовым, 6–12 цифр.",
      };
    }

    const conflict = await prisma.pocketOptionAccount.findUnique({
      where: { poTraderId },
    });
    if (conflict) {
      return {
        ok: false,
        error: "Этот Trader ID уже привязан к другому аккаунту на сайте.",
      };
    }

    const verify = await fetchTraderInfo(poTraderId);
    if (!verify.ok) {
      if (verify.reason === "not_found") {
        return {
          ok: false,
          error:
            "PocketOption не видит этот Trader ID в нашей партнёрской сети. Зарегистрируйся ЗАНОВО по нашей реф-ссылке (откроем её сразу после создания аккаунта) — иначе сигналы не откроются.",
        };
      }
      if (verify.reason === "not_configured") {
        // Dev fallback: bind as pending (so dashboard still admits the user).
        poVerifyInfo = { depositTotal: 0, ftdAt: null };
      } else {
        return {
          ok: false,
          error: "PocketOption API сейчас не отвечает. Попробуй через минуту.",
        };
      }
    } else {
      poVerifyInfo = {
        depositTotal: verify.info.depositTotal,
        ftdAt: verify.info.ftdAt ?? null,
      };
    }
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

    if (poTraderId !== null && poVerifyInfo !== null) {
      const ftdAt = poVerifyInfo.ftdAt ? new Date(poVerifyInfo.ftdAt) : null;
      await prisma.pocketOptionAccount.create({
        data: {
          userId: user.id,
          poTraderId,
          // poVerifyInfo with depositTotal=0 + ftdAt=null also covers the dev
          // fallback when PO API creds are absent — bind as pending in that
          // case, otherwise as verified.
          status:
            poVerifyInfo.depositTotal > 0 || poVerifyInfo.ftdAt
              ? "verified"
              : "pending",
          source: "manual",
          totalDeposit: poVerifyInfo.depositTotal,
          ...(ftdAt && !Number.isNaN(ftdAt.getTime()) ? { ftdAt } : {}),
        },
      });
      await recomputeUserTier(user.id);
    }

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

    // Clear referral cookie after successful attribution
    if (cookieRef) {
      cookieStore.delete("stg_ref");
    }

    return {
      ok: true,
      email,
      password,
      needsPoOnboarding: poTraderId === null,
    };
  } catch (err) {
    console.error("[register action] failed:", err);
    const msg = err instanceof Error ? err.message : "unknown";
    return { ok: false, error: `Внутренняя ошибка: ${msg}` };
  }
}
