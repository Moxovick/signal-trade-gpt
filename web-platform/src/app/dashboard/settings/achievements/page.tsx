/**
 * Settings · Achievements — shows streak + unlocked/locked badges.
 *
 * On page load we re-evaluate achievements for the current user and unlock
 * any newly-qualifying ones (idempotent).
 */
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Stat } from "@/components/ui/Stat";
import {
  checkAndUnlockAchievements,
  seedAchievementsIfMissing,
} from "@/lib/achievements";
import { touchStreak } from "@/lib/streak";
import { Flame, Calendar, Trophy, Lock } from "lucide-react";

import {
  Target,
  ShieldCheck,
  TrendingUp,
  Award as AwardIcon,
  Crown,
  Gem,
  Users,
} from "lucide-react";

const ICON_MAP: Record<string, typeof Target> = {
  target: Target,
  "shield-check": ShieldCheck,
  "trending-up": TrendingUp,
  award: AwardIcon,
  crown: Crown,
  gem: Gem,
  flame: Flame,
  users: Users,
  trophy: Trophy,
};

export default async function AchievementsSettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  await seedAchievementsIfMissing();
  await touchStreak(session.user.id);
  await checkAndUnlockAchievements(session.user.id);

  const [user, catalogue, unlocked] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { streakDays: true, lastActivityDay: true, signalsReceived: true },
    }),
    prisma.achievement.findMany({
      where: { isActive: true },
      orderBy: { minTier: "asc" },
    }),
    prisma.userAchievement.findMany({
      where: { userId: session.user.id },
      select: { achievementId: true, unlockedAt: true },
    }),
  ]);
  if (!user) redirect("/login");
  const unlockedMap = new Map(
    unlocked.map((u) => [u.achievementId, u.unlockedAt]),
  );
  const unlockedCount = unlocked.length;
  const total = catalogue.length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Stat
          label="Серия"
          value={`${user.streakDays} ${dayWord(user.streakDays)}`}
          icon={<Flame size={18} />}
        />
        <Stat
          label="Открыто"
          value={`${unlockedCount} / ${total}`}
          icon={<Trophy size={18} />}
        />
        <Stat
          label="Сигналов получено"
          value={user.signalsReceived}
          icon={<Calendar size={18} />}
        />
      </div>

      <Card padding="lg">
        <h2 className="text-lg font-semibold mb-1">Достижения</h2>
        <p className="text-sm text-[var(--t-3)] mb-6">
          Получай бейджи за продвижение по платформе. Серия растёт, если
          заходишь в кабинет каждый день.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {catalogue.map((a) => {
            const Icon = ICON_MAP[a.icon] ?? Trophy;
            const unlockedAt = unlockedMap.get(a.id);
            const isUnlocked = !!unlockedAt;
            return (
              <div
                key={a.id}
                className={`rounded-xl border p-4 ${
                  isUnlocked
                    ? "border-[var(--b-hard)] bg-[rgba(212,160,23,0.06)]"
                    : "border-[var(--b-soft)] bg-[var(--bg-2)] opacity-60"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isUnlocked
                        ? "bg-[var(--brand-gold)] text-[#1a1208]"
                        : "bg-[var(--bg-3)] text-[var(--t-3)]"
                    }`}
                  >
                    {isUnlocked ? <Icon size={18} /> : <Lock size={16} />}
                  </div>
                </div>
                <div className="mt-3 text-sm font-semibold">{a.name}</div>
                <div className="text-[12px] text-[var(--t-3)] mt-1">
                  {a.description}
                </div>
                {isUnlocked && unlockedAt && (
                  <div className="text-[10px] text-[var(--t-3)] mt-2">
                    Получено{" "}
                    {new Date(unlockedAt).toLocaleDateString("ru-RU")}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function dayWord(n: number): string {
  const lastTwo = n % 100;
  if (lastTwo >= 11 && lastTwo <= 14) return "дней";
  const last = n % 10;
  if (last === 1) return "день";
  if (last >= 2 && last <= 4) return "дня";
  return "дней";
}
