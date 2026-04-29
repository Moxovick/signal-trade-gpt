import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [referrals, user] = await Promise.all([
    prisma.referral.findMany({
      where: { referrerId: (session.user as { id: string }).id },
      include: {
        referred: { select: { email: true, createdAt: true, subscriptionPlan: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findUnique({
      where: { id: (session.user as { id: string }).id },
      select: { referralCode: true, subscriptionPlan: true },
    }),
  ]);

  const commissionRate =
    user?.subscriptionPlan === "vip" ? 20 :
    user?.subscriptionPlan === "premium" ? 15 : 10;

  return NextResponse.json({
    referrals,
    referralCode: user?.referralCode,
    commissionRate,
    totalReferrals: referrals.length,
  });
}
