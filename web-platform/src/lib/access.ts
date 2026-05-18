/**
 * Access engine — given a userId, decide which signals/perks they can see.
 *
 * Two-tier access model:
 *  - T0 (PO привязан, депо < $20): мягкий кап 3 OTC-сигнала/день.
 *  - T1+ (депо ≥ $20): полный доступ, без дневного капа.
 *
 * Доступ к /dashboard как таковой контролируется в `app/dashboard/layout.tsx`
 * (требуется привязанный PO-аккаунт). Здесь мы уже считаем перки/лимиты для
 * залогиненного юзера с привязкой.
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
  /** Сколько демо-сигналов осталось сегодня (для T0); null для T1+. */
  demoSignalsRemaining: number | null;
  /** Дневной мягкий кап (null — без лимита). */
  dailySignalLimit: number | null;
  signalsTodayUsed: number;
};

const TIER_DAILY_LIMITS: Record<number, number | null> = {
  0: 3, // T0 (Free): 3 OTC-сигнала в день
  1: null, // T1+ (Pro): без лимита
  // T2/T3/T4 — на текущем этапе не используются (см. lib/tier.ts), но
  // оставлены здесь на случай возвращения многоуровневой модели через
  // SiteSettings.tier_thresholds.
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
