import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code")?.toUpperCase().trim();

  if (!code) {
    return NextResponse.json({ valid: false, error: "Код не указан" }, { status: 400 });
  }

  const promo = await prisma.promoCode.findUnique({ where: { code } });

  if (!promo || !promo.isActive) {
    return NextResponse.json({ valid: false, error: "Промо-код недействителен" }, { status: 404 });
  }

  if (promo.expiresAt && promo.expiresAt < new Date()) {
    return NextResponse.json({ valid: false, error: "Промо-код истёк" }, { status: 410 });
  }

  if (promo.maxUses && promo.currentUses >= promo.maxUses) {
    return NextResponse.json({ valid: false, error: "Промо-код исчерпан" }, { status: 410 });
  }

  const messages: Record<string, string> = {
    trial: `Промо-код активен! ${promo.trialDays} дней Premium бесплатно`,
    discount: `Скидка ${promo.discountPercent}% на подписку`,
    bonus: `Бонус при регистрации`,
  };

  return NextResponse.json({
    valid: true,
    type: promo.type,
    trialDays: promo.trialDays,
    message: messages[promo.type] ?? "Промо-код активен",
  });
}
