"use server";

/**
 * Server actions for /register.
 *
 * Why server actions instead of fetch + client form? Because the client form
 * relies on React hydration to call `e.preventDefault()`. If anything on the
 * page breaks hydration (a third-party script, a stray hook, etc.) the form
 * silently degrades to a native browser GET submit and the page reloads.
 *
 * Server actions run on the server even when JS is disabled or hydration
 * fails — Next.js wires `<form action={...}>` to a hidden POST endpoint,
 * processes the action, then redirects. This makes registration bullet-proof.
 */
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { generateReferralCode } from "@/lib/utils";

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

  if (!email.includes("@")) {
    return { ok: false, error: "Введи корректный email" };
  }
  if (password.length < 6) {
    return { ok: false, error: "Пароль минимум 6 символов" };
  }
  if (password !== confirm) {
    return { ok: false, error: "Пароли не совпадают" };
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
      },
      select: { id: true, email: true },
    });

    if (referredById) {
      await prisma.referral.create({
        data: { referrerId: referredById, referredId: user.id },
      });
    }

    return { ok: true, email, password };
  } catch (err) {
    console.error("[register action] failed:", err);
    const msg = err instanceof Error ? err.message : "unknown";
    return { ok: false, error: `Внутренняя ошибка: ${msg}` };
  }
}


