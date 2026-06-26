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
import { getDictionaryForUser } from "@/lib/i18n";

type AchievementDef = {
  id: string;
  icon: LucideIcon;
  titleKey: string;
  descKey: string;
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
    titleKey: "firstSignalTitle",
    descKey: "firstSignalDesc",
    unlocked: (s) => s.signalsReceived >= 1,
  },
  {
    id: "ten_signals",
    icon: BarChart3,
    titleKey: "tenSignalsTitle",
    descKey: "tenSignalsDesc",
    unlocked: (s) => s.signalsReceived >= 10,
  },
  {
    id: "fifty_signals",
    icon: Flame,
    titleKey: "fiftySignalsTitle",
    descKey: "fiftySignalsDesc",
    unlocked: (s) => s.signalsReceived >= 50,
  },
  {
    id: "hundred_signals",
    icon: Award,
    titleKey: "hundredSignalsTitle",
    descKey: "hundredSignalsDesc",
    unlocked: (s) => s.signalsReceived >= 100,
  },
  {
    id: "first_deposit",
    icon: Coins,
    titleKey: "firstDepositTitle",
    descKey: "firstDepositDesc",
    unlocked: (s) => s.totalDeposit > 0,
  },
  {
    id: "tier_1",
    icon: Rocket,
    titleKey: "tier1Title",
    descKey: "tier1Desc",
    unlocked: (s) => s.tier >= 1,
  },
  {
    id: "first_referral",
    icon: Handshake,
    titleKey: "firstReferralTitle",
    descKey: "firstReferralDesc",
    unlocked: (s) => s.referrals >= 1,
  },
  {
    id: "five_referrals",
    icon: Users,
    titleKey: "fiveReferralsTitle",
    descKey: "fiveReferralsDesc",
    unlocked: (s) => s.referrals >= 5,
  },
  {
    id: "ten_referrals",
    icon: Star,
    titleKey: "tenReferralsTitle",
    descKey: "tenReferralsDesc",
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
  if (!user || !report) redirect("/login");

  const t = await getDictionaryForUser(userId);

  const stats: Stats = {
    signalsReceived: user.signalsReceived,
    referrals: user._count.referrals,
    totalDeposit: account?.totalDeposit ? Number(account.totalDeposit) : 0,
    tier: report.tier,
  };

  const items = CATALOG.map((a) => ({
    ...a,
    title: (t.achievements[a.titleKey] as string) ?? a.titleKey,
    description: (t.achievements[a.descKey] as string) ?? a.descKey,
    isUnlocked: a.unlocked(stats),
  }));
  const unlockedCount = items.filter((i) => i.isUnlocked).length;
  const progressPct = (unlockedCount / items.length) * 100;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-[var(--brand-gold)] mb-1">
          {t.achievements.progressLabel}
        </p>
        <h1 className="text-3xl md:text-4xl font-bold">{t.achievements.title}</h1>
        <p className="text-[var(--t-2)] mt-2">
          {t.achievements.desc}
        </p>
      </div>

      <Card padding="lg" variant="highlight">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Trophy size={24} className="text-[var(--brand-gold)]" />
            <div>
              <div className="text-xs uppercase tracking-widest text-[var(--t-3)]">
                {t.achievements.unlocked}
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
                  <CheckCircle2 size={12} /> {t.achievements.earned}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs text-[var(--t-3)]">
                  <Lock size={12} /> {t.achievements.locked}
                </span>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
