/**
 * POST /api/auth/register — legacy API registration route.
 *
 * v2 note: subscriptions removed. Promo codes are logged but no longer grant
 * a trial/premium plan. All monetization flows through PocketOption tiers.
 * The primary registration path is the server action in /register/actions.ts;
 * this route is kept for backward compat (e.g. external integrations).
 */
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { generateReferralCode } from "@/lib/utils";
import { rateLimit, clientIp } from "@/lib/rate-limit";

/** 5 registrations per IP per 15 minutes. */
const REG_LIMIT = 5;
const REG_WINDOW_MS = 15 * 60 * 1000;

export async function POST(req: NextRequest) {
  try {
    const ip = clientIp(req);
    const rl = rateLimit(`register:${ip}`, REG_LIMIT, REG_WINDOW_MS);
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Слишком много попыток. Попробуйте позже." },
        { status: 429, headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) } },
      );
    }

    const { username, email, password, referralCode, promoCode } = await req.json();

    const GENERIC_ERROR = "Регистрация не удалась. Попробуйте снова или войдите.";

    // Accept username or email for backwards compat
    const login = (username ?? email ?? "").trim().toLowerCase();
    if (!login || !password) {
      return NextResponse.json({ error: GENERIC_ERROR }, { status: 400 });
    }
    if (typeof login !== "string" || login.length < 3 || login.length > 255) {
      return NextResponse.json({ error: GENERIC_ERROR }, { status: 400 });
    }
    if (typeof password !== "string" || password.length < 6 || password.length > 128) {
      return NextResponse.json({ error: GENERIC_ERROR }, { status: 400 });
    }

    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { username: { equals: login, mode: "insensitive" } },
          { email: { equals: login, mode: "insensitive" } },
        ],
      },
    });
    if (existing) {
      return NextResponse.json({ error: GENERIC_ERROR }, { status: 409 });
    }

    let referredById: string | null = null;
    if (referralCode) {
      const referrer = await prisma.user.findUnique({ where: { referralCode } });
      if (referrer) referredById = referrer.id;
    }

    let promoCodeId: string | null = null;

    if (promoCode) {
      const promo = await prisma.promoCode.findUnique({
        where: { code: promoCode.toUpperCase().trim() },
      });

      if (promo && promo.isActive) {
        const notExpired = !promo.expiresAt || promo.expiresAt > new Date();
        const hasUses = !promo.maxUses || promo.currentUses < promo.maxUses;

        if (notExpired && hasUses) {
          promoCodeId = promo.id;

          await prisma.promoCode.update({
            where: { id: promo.id },
            data: { currentUses: { increment: 1 } },
          });
        }
      }
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const code = generateReferralCode();

    const user = await prisma.user.create({
      data: {
        username: login,
        passwordHash,
        referralCode: code,
        referredById,
      },
      select: { id: true, username: true, referralCode: true, tier: true },
    });

    if (referredById) {
      await prisma.referral.create({
        data: { referrerId: referredById, referredId: user.id },
      });
    }

    return NextResponse.json({ user }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
  }
}
