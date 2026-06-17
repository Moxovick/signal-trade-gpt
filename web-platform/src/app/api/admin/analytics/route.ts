import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function isAdmin() {
  const session = await auth();
   
  return session?.user && session.user.role === "admin";
}

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);
  const monthStart = new Date(todayStart);
  monthStart.setDate(weekStart.getDate() - 30);

  const [
    totalUsers,
    newUsersToday,
    newUsersWeek,
    newUsersMonth,
    userTierCounts,
    totalSignals,
    signalsToday,
    signalResults,
    tierCounts,
    totalDeposits,
    confirmedDeposits,
    totalReferrals,
    recentLeads,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.user.count({ where: { createdAt: { gte: weekStart } } }),
    prisma.user.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.user.groupBy({ by: ["tier"], _count: true }),
    prisma.signal.count(),
    prisma.signal.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.signal.groupBy({ by: ["result"], _count: true }),
    prisma.signal.groupBy({ by: ["tier"], _count: true }),
    prisma.deposit.count(),
    prisma.deposit.aggregate({
      where: { status: "confirmed" },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.referral.count(),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        email: true,
        tier: true,
        createdAt: true,
        depositTotal: true,
        eliteUnlocked: true,
      },
    }),
  ]);

  const tiers = Object.fromEntries(userTierCounts.map((p) => [p.tier, p._count]));
  const results = Object.fromEntries(signalResults.map((r) => [r.result, r._count]));
  const signalTiers = Object.fromEntries(tierCounts.map((t) => [t.tier, t._count]));

  const winRate = totalSignals > 0
    ? ((results.win ?? 0) / Math.max(1, (results.win ?? 0) + (results.loss ?? 0)) * 100).toFixed(1)
    : "0";

  const paidUsers = (tiers[1] ?? 0) + (tiers[2] ?? 0);

  return NextResponse.json({
    users: {
      total: totalUsers,
      today: newUsersToday,
      week: newUsersWeek,
      month: newUsersMonth,
      tiers,
      conversionRate: totalUsers > 0
        ? (paidUsers / totalUsers * 100).toFixed(1)
        : "0",
    },
    signals: {
      total: totalSignals,
      today: signalsToday,
      results,
      tiers: signalTiers,
      winRate,
    },
    deposits: {
      total: totalDeposits,
      confirmed: confirmedDeposits._count,
      totalAmount: confirmedDeposits._sum.amount ?? 0,
    },
    referrals: { total: totalReferrals },
    recentLeads,
  });
}
