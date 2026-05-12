/**
 * Access engine — given a userId, decide which signals/perks they can see.
 *
 * v6b model (two-tier):
 *  - T0 (Free, no PO deposit): 3 OTC demo signals per day.
 *  - T1+ (Pro, deposit ≥ $20): all signal bands, no daily cap.
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

/**
 * @deprecated v6b switched T0 from a lifetime cap to a daily cap. Kept exported
 * so any straggling caller still compiles; new code should use
 * `TIER_DAILY_LIMITS[0]` instead.
 */
export const T0_LIFETIME_DEMO_LIMIT = 0;

const TIER_DAILY_LIMITS: Record<number, number | null> = {
  0: 3, // Free: 3 OTC signals per day
  1: null, // Pro: unlimited
  2: null,
  3: null,
  4: null,
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

  const dailyLimit = TIER_DAILY_LIMITS[user.tier] ?? null;
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
      user.tier === 0 && dailyLimit != null
        ? Math.max(0, dailyLimit - used)
        : null,
    dailySignalLimit: dailyLimit,
    signalsTodayUsed: used,
  };
}

/**
 * Returns true iff the user can receive *one more* signal right now.
 */
export async function canReceiveSignal(userId: string): Promise<{
  allowed: boolean;
  reason?: "daily_limit" | "no_user";
  report: AccessReport | null;
}> {
  const report = await getAccessReport(userId);
  if (!report) return { allowed: false, reason: "no_user", report: null };

  if (
    report.dailySignalLimit != null &&
    report.signalsTodayUsed >= report.dailySignalLimit
  ) {
    return { allowed: false, reason: "daily_limit", report };
  }
  return { allowed: true, report };
}
