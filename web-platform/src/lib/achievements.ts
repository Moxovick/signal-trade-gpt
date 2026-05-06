/**
 * Achievements — static catalogue + unlock evaluator.
 *
 * The catalogue is seeded once into the DB (via /api/cron/seed-achievements
 * or seed-content.ts). Each achievement has a `code` that the `checkAndUnlock`
 * function maps to a condition over user state.
 */
import { prisma } from "@/lib/prisma";

export type AchievementDef = {
  code: string;
  name: string;
  description: string;
  icon: string;
  minTier: number;
};

export const ACHIEVEMENT_CATALOGUE: AchievementDef[] = [
  {
    code: "first_signal",
    name: "Первый сигнал",
    description: "Получил свой первый сигнал",
    icon: "target",
    minTier: 0,
  },
  {
    code: "po_verified",
    name: "PocketOption привязан",
    description: "Подтвердил PocketOption ID через партнёрку",
    icon: "shield-check",
    minTier: 0,
  },
  {
    code: "first_deposit",
    name: "Первый депозит",
    description: "Открыл T1 — депозит от $100",
    icon: "trending-up",
    minTier: 1,
  },
  {
    code: "tier_2",
    name: "Трейдер",
    description: "Депозит от $1000 — открыт T2",
    icon: "award",
    minTier: 2,
  },
  {
    code: "tier_3",
    name: "Pro",
    description: "Депозит от $5000 — открыт T3",
    icon: "crown",
    minTier: 3,
  },
  {
    code: "tier_4",
    name: "Elite",
    description: "Депозит от $10000 — открыт T4",
    icon: "gem",
    minTier: 4,
  },
  {
    code: "streak_7",
    name: "Неделя подряд",
    description: "Заходил в кабинет 7 дней подряд",
    icon: "flame",
    minTier: 0,
  },
  {
    code: "streak_30",
    name: "Месяц подряд",
    description: "Заходил в кабинет 30 дней подряд",
    icon: "flame",
    minTier: 0,
  },
  {
    code: "referral_1",
    name: "Первый реферал",
    description: "Привёл первого друга",
    icon: "users",
    minTier: 0,
  },
  {
    code: "referral_10",
    name: "Амбассадор",
    description: "Привёл 10 друзей",
    icon: "users",
    minTier: 0,
  },
];

/** Ensure the catalogue is present in DB. Idempotent — safe to call on boot. */
export async function seedAchievementsIfMissing(): Promise<void> {
  for (const a of ACHIEVEMENT_CATALOGUE) {
    await prisma.achievement.upsert({
      where: { code: a.code },
      create: { ...a },
      update: {
        name: a.name,
        description: a.description,
        icon: a.icon,
        minTier: a.minTier,
      },
    });
  }
}

/**
 * Re-evaluate all achievements for a user and unlock any newly-qualifying
 * ones. Idempotent — unlocked achievements stay unlocked.
 */
export async function checkAndUnlockAchievements(userId: string): Promise<string[]> {
  const [user, existing, referralsCount, firstSignalReceived] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          tier: true,
          depositTotal: true,
          streakDays: true,
          signalsReceived: true,
          poAccount: {
            select: { status: true },
          },
        },
      }),
      prisma.userAchievement.findMany({
        where: { userId },
        select: { achievement: { select: { code: true } } },
      }),
      prisma.user.count({ where: { referredById: userId } }),
      prisma.user
        .findUnique({
          where: { id: userId },
          select: { signalsReceived: true },
        })
        .then((u) => (u?.signalsReceived ?? 0) > 0),
    ]);

  if (!user) return [];

  const already = new Set(existing.map((e) => e.achievement.code));
  const toUnlock: string[] = [];

  function grant(code: string, cond: boolean) {
    if (cond && !already.has(code)) toUnlock.push(code);
  }

  grant("first_signal", firstSignalReceived);
  grant("po_verified", user.poAccount?.status === "verified");
  grant("first_deposit", user.tier >= 1);
  grant("tier_2", user.tier >= 2);
  grant("tier_3", user.tier >= 3);
  grant("tier_4", user.tier >= 4);
  grant("streak_7", (user.streakDays ?? 0) >= 7);
  grant("streak_30", (user.streakDays ?? 0) >= 30);
  grant("referral_1", referralsCount >= 1);
  grant("referral_10", referralsCount >= 10);

  if (toUnlock.length === 0) return [];

  const defs = await prisma.achievement.findMany({
    where: { code: { in: toUnlock } },
  });
  const byCode = new Map(defs.map((d) => [d.code, d.id]));

  await Promise.all(
    toUnlock.map((code) => {
      const id = byCode.get(code);
      if (!id) return Promise.resolve();
      return prisma.userAchievement
        .create({ data: { userId, achievementId: id } })
        .catch(() => {
          // race — already unlocked
        });
    }),
  );

  return toUnlock;
}
