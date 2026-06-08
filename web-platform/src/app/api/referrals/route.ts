import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  const [referrals, user] = await Promise.all([
    prisma.referral.findMany({
      where: { referrerId: userId },
      include: {
        referred: { select: { email: true, createdAt: true, tier: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { referralCode: true, tier: true },
    }),
  ]);

  // Commission rate based on tier (v2 model). Flat 5% for now per CLAUDE.md.
  const commissionRate = 5;

  return NextResponse.json({
    referrals,
    referralCode: user?.referralCode,
    commissionRate,
    totalReferrals: referrals.length,
  });
}
