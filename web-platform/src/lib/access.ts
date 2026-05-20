/**
 * Access engine — given a userId, decide which signals/perks they can see.
 *
 * Two-tier access model (v2.2):
 *  - T0 (PO привязан, депо < $20): безлим OTC-сигналов, остальные тулзы скрыты.
 *  - T1+ (депо ≥ $20): безлим всё + полный набор индикаторов/перков.
 *
 * Доступ к /dashboard как таковой контролируется в `app/dashboard/layout.tsx`
 * (требуется привязанный PO-аккаунт). Здесь мы уже считаем перки/лимиты для
 * залогиненного юзера с привязкой.
 *
 * Ключевое отличие от прошлой версии: T0 НЕ имеет дневного капа. Если ты
 * захочешь вернуть лимит — задай ему положительное число в TIER_DAILY_LIMITS.
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
  /**
   * Сколько демо-сигналов осталось сегодня. Текущая модель — безлим, поэтому
   * для всех тиров возвращается null. Поле сохранено для обратной
   * совместимости с UI, который ещё может его читать.
   */
  demoSignalsRemaining: number | null;
  /** Дневной мягкий кап (null — без лимита). */
  dailySignalLimit: number | null;
  signalsTodayUsed: number;
};

const TIER_DAILY_LIMITS: Record<number, number | null> = {
  0: null, // T0 (Free · OTC): безлим
  1: null, // T1+ (Pro): безлим
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
