/**
 * Access engine — given a userId, decide which signals/perks they can see.
 *
 * Tier-driven, no subscription checks. T0 users get a hard-capped lifetime
 * demo allowance; T1+ get unlimited signals (perks differ by tier — chart
 * indicators / early access — but signal *count* is no longer rate-limited).
 */
import { prisma } from "@/lib/prisma";

export type AccessReport = {
  userId: string;
  tier: number;
  perks: Array<{
    code: string;
    name: string;
    description: string;
    minTier: number;
    config: unknown;
    unlocked: boolean;
  }>;
  /** Lifetime cap for T0; null for T1+. */
  demoSignalsRemaining: number | null;
  /** Daily soft cap (null = unlimited). */
  dailySignalLimit: number | null;
  signalsTodayUsed: number;
};

export const T0_LIFETIME_DEMO_LIMIT = 2;

const TIER_DAILY_LIMITS: Record<number, number | null> = {
  0: 0, // T0 uses lifetime cap, not daily
  1: null, // unlimited
  2: null, // unlimited
  3: null, // unlimited
  4: null, // unlimited
};

export async function getAccessReport(userId: string): Promise<AccessReport | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, tier: true, signalsReceived: true, createdAt: true },
  });
  if (!user) return null;

  const perks = await prisma.botPerk.findMany({
    where: { isActive: true },
    orderBy: [{ minTier: "asc" }, { name: "asc" }],
  });

  // Daily usage — count "signal_view" / "signal_received" entries today.
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);
  const used = await prisma.activityLog.count({
    where: {
      userId,
      action: { in: ["signal_view", "signal_received"] },
      createdAt: { gte: startOfDay },
    },
  });

  return {
    userId: user.id,
    tier: user.tier,
    perks: perks.map((p) => ({
      code: p.code,
      name: p.name,
      description: p.description,
      minTier: p.minTier,
      config: p.config,
      unlocked: user.tier >= p.minTier,
    })),
    demoSignalsRemaining:
      user.tier === 0 ? Math.max(0, T0_LIFETIME_DEMO_LIMIT - user.signalsReceived) : null,
    dailySignalLimit: TIER_DAILY_LIMITS[user.tier] ?? null,
    signalsTodayUsed: used,
  };
}

/**
 * Returns true iff the user can receive *one more* signal right now.
 */
export async function canReceiveSignal(userId: string): Promise<{
  allowed: boolean;
  reason?: "tier_zero_exhausted" | "daily_limit" | "no_user";
  report: AccessReport | null;
}> {
  const report = await getAccessReport(userId);
  if (!report) return { allowed: false, reason: "no_user", report: null };

  if (report.tier === 0) {
    if ((report.demoSignalsRemaining ?? 0) <= 0) {
      return { allowed: false, reason: "tier_zero_exhausted", report };
    }
    return { allowed: true, report };
  }

  if (report.dailySignalLimit != null && report.signalsTodayUsed >= report.dailySignalLimit) {
    return { allowed: false, reason: "daily_limit", report };
  }
  return { allowed: true, report };
}
