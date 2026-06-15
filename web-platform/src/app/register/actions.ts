"use server";

/**
 * Server actions for /register.
 *
 * Username + password registration. Email removed — login is the username.
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
  username?: string;
  password?: string;
  /** True when the user must finish PO attachment at /onboarding/po-id. */
  needsPoOnboarding?: boolean;
};

export async function registerAction(
  _prev: RegisterActionResult,
  formData: FormData,
): Promise<RegisterActionResult> {
  const username = String(formData.get("username") ?? "")
    .trim()
    .toLowerCase()
    .slice(0, 32);
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  const formReferralCode = String(formData.get("referralCode") ?? "").trim();
  const cookieStore = await cookies();
  const cookieRef = cookieStore.get("ss_ref")?.value?.trim() ?? "";
  const referralCode = formReferralCode || cookieRef;
  const telegramUsernameRaw = String(formData.get("telegramUsername") ?? "")
    .trim()
    .replace(/^@/, "")
    .slice(0, 32);
  const telegramUsername = /^[A-Za-z0-9_]{1,32}$/.test(telegramUsernameRaw)
    ? telegramUsernameRaw
    : "";
  const poTraderIdRaw = String(formData.get("poTraderId") ?? "").trim();
  const poTraderId = poTraderIdRaw.length > 0 ? poTraderIdRaw : null;

  // ── Validation ──────────────────────────────────────────────────────
  if (!username || username.length < 3) {
    return { ok: false, error: "Логин минимум 3 символа" };
  }
  if (!/^[a-z0-9_]+$/.test(username)) {
    return { ok: false, error: "Логин: только латиница, цифры и _" };
  }
  if (!telegramUsername) {
    return { ok: false, error: "Укажи свой Telegram username" };
  }
  if (password.length < 6) {
    return { ok: false, error: "Пароль минимум 6 символов" };
  }
  if (password !== confirm) {
    return { ok: false, error: "Пароли не совпадают" };
  }

  // ── Optional PO attachment ─────────────────────────────────────────
  let poVerifyInfo: { depositTotal: number; ftdAt: string | null } | null = null;

  if (poTraderId !== null) {
    if (!isValidTraderIdFormat(poTraderId)) {
      return {
        ok: false,
        error: "PocketOption Trader ID должен быть числовым, 6-12 цифр.",
      };
    }

    const conflict = await prisma.pocketOptionAccount.findUnique({
      where: { poTraderId },
    });
    if (conflict) {
      return {
        ok: false,
        error: "Этот Trader ID уже привязан к другому аккаунту.",
      };
    }

    const verify = await fetchTraderInfo(poTraderId);
    if (!verify.ok) {
      if (verify.reason === "not_found") {
        return {
          ok: false,
          error:
            "PocketOption не видит этот Trader ID в нашей партнёрской сети. Зарегистрируйся по нашей реф-ссылке.",
        };
      }
      if (verify.reason === "not_configured") {
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
    // Check username uniqueness
    const existing = await prisma.user.findFirst({
      where: { username: { equals: username, mode: "insensitive" } },
    });
    if (existing) {
      return { ok: false, error: "Этот логин уже занят" };
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
        username,
        passwordHash,
        referralCode: code,
        referredById,
        subscriptionPlan: "free",
        ...(telegramUsername ? { firstName: telegramUsername } : {}),
      },
      select: { id: true, username: true },
    });

    // Log registration event
    await prisma.activityLog
      .create({
        data: {
          userId: user.id,
          action: "register",
          details: {
            username,
            telegramUsername: telegramUsername || null,
            poTraderIdProvided: poTraderId !== null,
            referredBy: referredById !== null,
          },
        },
      })
      .catch(() => undefined);

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

    if (cookieRef) {
      cookieStore.delete("ss_ref");
    }

    return {
      ok: true,
      username,
      password,
      needsPoOnboarding: poTraderId === null,
    };
  } catch (err) {
    console.error("[register action] failed:", err);
    const msg = err instanceof Error ? err.message : "unknown";
    return { ok: false, error: `Внутренняя ошибка: ${msg}` };
  }
}
