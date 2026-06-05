/**
 * Dashboard — Achievements page.
 *
 * Catalog of achievements the user can earn. Unlocked status is computed
 * from the user's current stats (signals received, referrals, deposit, tier).
 *
 * Achievement list is hardcoded here for now; a dedicated admin CRUD can
 * be added later if the catalog grows.
 */
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAccessReport } from "@/lib/access";
import { Card } from "@/components/ui/Card";
import { Trophy, Star, Lock, CheckCircle2, Target, BarChart3, Flame, Award, Coins, Rocket, Handshake, Users } from "lucide-react";
import { redirect } from "next/navigation";
import type { LucideIcon } from "lucide-react";

type AchievementDef = {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  /** Predicate evaluated against the stats payload. */
  unlocked: (s: Stats) => boolean;
};

type Stats = {
  signalsReceived: number;
  referrals: number;
  totalDeposit: number;
  tier: number;
};

const CATALOG: AchievementDef[] = [
  {
    id: "first_signal",
    icon: Target,
    title: "Первый сигнал",
    description: "Получи свой первый AI-сигнал в боте",
    unlocked: (s) => s.signalsReceived >= 1,
  },
  {
    id: "ten_signals",
    icon: BarChart3,
    title: "Десятка",
    description: "Получи 10 сигналов",
    unlocked: (s) => s.signalsReceived >= 10,
  },
  {
    id: "fifty_signals",
    icon: Flame,
    title: "На потоке",
    description: "Получи 50 сигналов",
    unlocked: (s) => s.signalsReceived >= 50,
  },
  {
    id: "hundred_signals",
    icon: Award,
    title: "Центурион",
    description: "Получи 100 сигналов",
    unlocked: (s) => s.signalsReceived >= 100,
  },
  {
    id: "first_deposit",
    icon: Coins,
    title: "Первый депозит",
    description: "Внеси первый депозит на PocketOption",
    unlocked: (s) => s.totalDeposit > 0,
  },
  {
    id: "tier_1",
    icon: Rocket,
    title: "Pro-доступ",
    description: "Открыл T1 — депозит от $20",
    unlocked: (s) => s.tier >= 1,
  },
  {
    id: "first_referral",
    icon: Handshake,
    title: "Первый реферал",
    description: "Пригласи первого друга",
    unlocked: (s) => s.referrals >= 1,
  },
  {
    id: "five_referrals",
    icon: Users,
    title: "Пятёрка",
    description: "Пригласи 5 друзей",
    unlocked: (s) => s.referrals >= 5,
  },
  {
    id: "ten_referrals",
    icon: Star,
    title: "Лидер мнений",
    description: "Пригласи 10 друзей",
    unlocked: (s) => s.referrals >= 10,
  },
];

export default async function DashboardAchievementsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const [user, account, report] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        signalsReceived: true,
        _count: { select: { referrals: true } },
      },
    }),
    prisma.pocketOptionAccount.findUnique({ where: { userId } }),
    getAccessReport(userId),
  ]);
  if (!user || !report) return null;

  const stats: Stats = {
    signalsReceived: user.signalsReceived,
    referrals: user._count.referrals,
    totalDeposit: account?.totalDeposit ? Number(account.totalDeposit) : 0,
    tier: report.tier,
  };

  const items = CATALOG.map((a) => ({ ...a, isUnlocked: a.unlocked(stats) }));
  const unlockedCount = items.filter((i) => i.isUnlocked).length;
  const progressPct = (unlockedCount / items.length) * 100;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-[var(--brand-gold)] mb-1">
          Прогресс
        </p>
        <h1 className="text-3xl md:text-4xl font-bold">Достижения</h1>
        <p className="text-[var(--t-2)] mt-2">
          Открывай новые ачивки за активность в боте и на платформе.
        </p>
      </div>

      <Card padding="lg" variant="highlight">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Trophy size={24} className="text-[var(--brand-gold)]" />
            <div>
              <div className="text-xs uppercase tracking-widest text-[var(--t-3)]">
                Открыто
              </div>
              <div className="text-2xl font-bold">
                {unlockedCount} <span className="text-[var(--t-3)] text-base">/ {items.length}</span>
              </div>
            </div>
          </div>
          <Star size={28} className="fill-[var(--brand-gold)] text-[var(--brand-gold)]" />
        </div>
        <div className="h-2 rounded-full overflow-hidden bg-[var(--bg-2)] border border-[var(--b-soft)]">
          <div
            className="h-full transition-all duration-700"
            style={{
              width: `${progressPct}%`,
              background:
                "linear-gradient(90deg, var(--brand-gold-deep), var(--brand-gold), var(--brand-gold-bright))",
              boxShadow: "0 0 12px rgba(212, 160, 23, 0.45)",
            }}
          />
        </div>
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((a) => (
          <Card
            key={a.id}
            padding="md"
            className={`flex flex-col items-center text-center transition-opacity ${
              a.isUnlocked ? "" : "opacity-50 saturate-50"
            }`}
          >
            <div
              className={`mb-3 ${a.isUnlocked ? "text-[var(--brand-gold)]" : "text-[var(--t-3)] grayscale"}`}
              aria-hidden
            >
              <a.icon size={28} />
            </div>
            <h3 className="text-sm font-semibold mb-1">{a.title}</h3>
            <p className="text-xs text-[var(--t-3)] leading-snug flex-1">
              {a.description}
            </p>
            <div className="mt-3">
              {a.isUnlocked ? (
                <span className="inline-flex items-center gap-1 text-xs text-[var(--green)] font-semibold">
                  <CheckCircle2 size={12} /> Получено
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs text-[var(--t-3)]">
                  <Lock size={12} /> Заблокировано
                </span>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
