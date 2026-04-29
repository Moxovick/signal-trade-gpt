import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { generateReferralCode } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const { email, password, referralCode, promoCode } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email и пароль обязательны" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Пароль минимум 6 символов" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email уже зарегистрирован" }, { status: 409 });
    }

    let referredById: string | null = null;
    if (referralCode) {
      const referrer = await prisma.user.findUnique({ where: { referralCode } });
      if (referrer) referredById = referrer.id;
    }

    let promoCodeId: string | null = null;
    let trialExpiresAt: Date | null = null;
    let subscriptionPlan: "free" | "premium" = "free";

    if (promoCode) {
      const promo = await prisma.promoCode.findUnique({
        where: { code: promoCode.toUpperCase().trim() },
      });

      if (promo && promo.isActive) {
        const notExpired = !promo.expiresAt || promo.expiresAt > new Date();
        const hasUses = !promo.maxUses || promo.currentUses < promo.maxUses;

        if (notExpired && hasUses) {
          promoCodeId = promo.id;

          if (promo.type === "trial") {
            trialExpiresAt = new Date();
            trialExpiresAt.setDate(trialExpiresAt.getDate() + promo.trialDays);
            subscriptionPlan = "premium";
          }

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
        email,
        passwordHash,
        referralCode: code,
        referredById,
        promoCodeUsedId: promoCodeId,
        subscriptionPlan,
        trialExpiresAt,
        subscriptionExpiresAt: trialExpiresAt,
      },
      select: { id: true, email: true, referralCode: true, subscriptionPlan: true, trialExpiresAt: true },
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
