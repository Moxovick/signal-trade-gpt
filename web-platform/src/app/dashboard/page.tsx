/**
 * Dashboard — v3 home (signals-first).
 *
 * Layout:
 *   1. Greeting + tier strip (compact)
 *   2. Onboarding checklist (auto-hides when complete)
 *   3. **Live signals feed** (the headline — what the user is here for)
 *   4. Tier-progress detail card (deposit / next tier)
 *   5. Stats row
 *   6. Perks (split: unlocked + roadmap)
 *   7. CTA row
 */
import Link from "next/link";
import {
  ArrowRight,
  ExternalLink,
  Lock,
  CheckCircle2,
  TrendingUp,
  Zap,
  Send,
  Trophy,
  Target,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAccessReport } from "@/lib/access";
import {
  distanceToNextTier,
  DEFAULT_TIER_THRESHOLDS,
  SITE_SETTING_TIER_THRESHOLDS,
  TIER_LABELS,
  type TierThresholds,
} from "@/lib/tier";
import { Card } from "@/components/ui/Card";
import { TierBadge } from "@/components/ui/TierBadge";
import { Stat } from "@/components/ui/Stat";
import { ButtonLink } from "@/components/ui/Button";
import { ReferralWidget } from "./_components/ReferralWidget";
import {
  LiveSignalsFeed,
  type Signal as LiveSignal,
} from "@/components/dashboard/LiveSignalsFeed";
import {
  OnboardingChecklist,
  type ChecklistStep,
} from "@/components/dashboard/OnboardingChecklist";
import { getPoReferralUrl } from "@/lib/pocketoption";
import { touchStreak } from "@/lib/streak";
import { checkAndUnlockAchievements, seedAchievementsIfMissing } from "@/lib/achievements";

const BOT_URL =
  process.env["NEXT_PUBLIC_BOT_URL"] ?? "https://t.me/traitsignaltsest_bot";
const SITE_URL =
  process.env["NEXT_PUBLIC_SITE_URL"] ?? "http://localhost:3000";

const TIER_ACCESS: Record<number, ("otc" | "exchange" | "elite")[]> = {
  0: ["otc"],
  1: ["otc"],
  2: ["otc", "exchange"],
  3: ["otc", "exchange", "elite"],
  4: ["otc", "exchange", "elite"],
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const userId = session.user.id;

  // Background maintenance: bump streak + evaluate achievements (idempotent).
  // Errors are swallowed — nothing on the dashboard should fail because of
  // these side effects.
  await Promise.all([
    touchStreak(userId).catch(() => undefined),
    seedAchievementsIfMissing()
      .then(() => checkAndUnlockAchievements(userId))
      .catch(() => undefined),
  ]);

  const [user, account, settings, report, poReferralUrl] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        firstName: true,
        username: true,
        email: true,
        signalsReceived: true,
        referralCode: true,
        _count: { select: { referrals: true } },
      },
    }),
    prisma.pocketOptionAccount.findUnique({ where: { userId } }),
    prisma.siteSettings.findUnique({ where: { key: SITE_SETTING_TIER_THRESHOLDS } }),
    getAccessReport(userId),
    getPoReferralUrl(),
  ] as const);

  if (!user || !report) return null;

  const thresholds: TierThresholds =
    settings && typeof settings.value === "object" && settings.value !== null
      ? (settings.value as TierThresholds)
      : DEFAULT_TIER_THRESHOLDS;

  const tier = report.tier;
  const totalDeposit = account?.totalDeposit ? Number(account.totalDeposit) : 0;
  const nextTier = distanceToNextTier(totalDeposit, tier, thresholds);
  const lowerBound = tier === 0 ? 0 : thresholds[tier as 1 | 2 | 3 | 4];
  const upperBound = nextTier ? thresholds[nextTier.nextTier as 1 | 2 | 3 | 4] : lowerBound;
  const progressPct =
    nextTier && upperBound > lowerBound
      ? Math.min(100, ((totalDeposit - lowerBound) / (upperBound - lowerBound)) * 100)
      : 100;

  const allowedBands = TIER_ACCESS[tier] ?? ["otc"];
  const recentSignalsRaw = await prisma.signal.findMany({
    where: { tier: { in: allowedBands }, isActive: true },
    orderBy: { createdAt: "desc" },
    take: 12,
    select: {
      id: true,
      pair: true,
      direction: true,
      expiration: true,
      confidence: true,
      tier: true,
      result: true,
      entryPrice: true,
      exitPrice: true,
      analysis: true,
      createdAt: true,
      closedAt: true,
    },
  });
  const liveInitial: LiveSignal[] = recentSignalsRaw.map((s) => ({
    ...s,
    entryPrice: s.entryPrice == null ? null : Number(s.entryPrice),
    exitPrice: s.exitPrice == null ? null : Number(s.exitPrice),
    createdAt: s.createdAt.toISOString(),
    closedAt: s.closedAt?.toISOString() ?? null,
  }));

  const greeting =
    user.firstName ?? user.username ?? user.email?.split("@")[0] ?? "Трейдер";
  const unlockedPerks = report.perks.filter((p) => p.unlocked);
  const lockedPerks = report.perks.filter((p) => !p.unlocked);

  // Onboarding checklist — driven by real state.
  const checklistSteps: ChecklistStep[] = [
    {
      id: "po_verified",
      label: "Привязать PocketOption",
      description: "ID должен быть из нашей партнёрки.",
      done: account?.status === "verified",
      cta: { href: "/onboarding/po-id", label: "Привязать" },
    },
    {
      id: "first_deposit",
      label: "Сделать первый депозит ($100+)",
      description: "Открывает Tier 1 — безлимитные сигналы и базовый чарт.",
      done: totalDeposit >= 100,
      cta: { href: poReferralUrl, label: "Депнуть на PO", external: true },
    },
    {
      id: "telegram",
      label: "Подключить Telegram",
      description: "Получай сигналы в боте параллельно с сайтом.",
      done: !!user.username,
      cta: { href: BOT_URL, label: "Открыть бота", external: true },
    },
    {
      id: "first_signal",
      label: "Получить первый сигнал",
      description: "Сигналы появляются ниже сразу после публикации.",
      done: user.signalsReceived > 0,
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Greeting strip */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-widest text-[var(--brand-gold)] mb-1">
            Личный кабинет
          </p>
          <h1 className="text-3xl md:text-4xl font-bold">
            Привет, {greeting}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <TierBadge tier={tier} size="md" />
          <div>
            <div className="text-xs uppercase tracking-widest text-[var(--t-3)]">
              Текущий тир
            </div>
            <div className="text-base font-semibold">{TIER_LABELS[tier]}</div>
          </div>
        </div>
      </div>

      {/* 2. Onboarding checklist */}
      <OnboardingChecklist steps={checklistSteps} />

      {/* 3. LIVE SIGNALS — the hero */}
      <Card padding="lg" variant="highlight">
        <LiveSignalsFeed initial={liveInitial} />
        <div className="mt-4 pt-4 border-t border-[var(--b-soft)] flex items-center justify-between text-sm">
          <span className="text-[var(--t-3)]">
            Сигналы зеркалируются в Telegram-бот.
          </span>
          <Link
            href="/dashboard/signals"
            className="text-[var(--brand-gold)] hover:text-[var(--brand-gold-bright)] flex items-center gap-1"
          >
            Полная история <ArrowRight size={14} />
          </Link>
        </div>
      </Card>

      {/* 4. Tier-progress detail */}
      <Card padding="lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-[var(--t-3)] mb-1">
              Депозит на PocketOption
            </div>
            <div
              className="text-3xl font-bold text-[var(--brand-gold)]"
              style={{ fontFamily: "var(--font-jetbrains)" }}
            >
              ${totalDeposit.toLocaleString("en-US")}
            </div>
          </div>
          {account ? (
            <div className="text-sm text-[var(--t-2)]">
              <span className="text-[var(--t-3)]">PO ID:</span>{" "}
              <code
                className="text-[var(--t-1)]"
                style={{ fontFamily: "var(--font-jetbrains)" }}
              >
                #{account.poTraderId}
              </code>
              <span
                className="ml-3 inline-block w-1.5 h-1.5 rounded-full align-middle"
                style={{
                  background:
                    account.status === "verified"
                      ? "var(--green)"
                      : "var(--brand-gold)",
                }}
              />
              <span className="ml-1.5">
                {account.status === "verified"
                  ? "подтверждён"
                  : account.status === "pending"
                    ? "ожидание FTD"
                    : "не привязан"}
              </span>
            </div>
          ) : null}
        </div>
        {nextTier ? (
          <>
            <div className="flex items-center justify-between text-xs text-[var(--t-2)] mb-2">
              <span>До {TIER_LABELS[nextTier.nextTier]}</span>
              <span className="text-[var(--brand-gold)] font-semibold">
                +${nextTier.needed.toLocaleString()} нужно
              </span>
            </div>
            <div className="h-3 rounded-full overflow-hidden bg-[var(--bg-2)] border border-[var(--b-soft)]">
              <div
                className="h-full transition-all duration-700"
                style={{
                  width: `${progressPct}%`,
                  background:
                    "linear-gradient(90deg, var(--brand-gold-deep), var(--brand-gold), var(--brand-gold-bright))",
                  boxShadow: "0 0 16px rgba(212, 160, 23, 0.45)",
                }}
              />
            </div>
          </>
        ) : (
          <div className="text-sm text-[var(--brand-gold)] flex items-center gap-2">
            <Trophy size={14} /> Достигнут максимальный уровень — Elite. Все
            перки открыты.
          </div>
        )}
      </Card>

      {/* 5. Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat
          icon={<Zap size={18} />}
          label="Сигналов сегодня"
          value={
            report.dailySignalLimit == null
              ? `${report.signalsTodayUsed}`
              : `${report.signalsTodayUsed} / ${report.dailySignalLimit}`
          }
        />
        <Stat
          icon={<TrendingUp size={18} />}
          label="Получено всего"
          value={user.signalsReceived.toString()}
        />
        <Stat
          icon={<Send size={18} />}
          label="Рефералов"
          value={user._count.referrals.toString()}
        />
        <Stat
          icon={<Trophy size={18} />}
          label="Перков открыто"
          value={`${unlockedPerks.length} / ${report.perks.length}`}
        />
      </div>

      {/* 6. Perks (unlocked) */}
      <div className="grid lg:grid-cols-3 gap-5">
        <Card padding="lg" className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Активные перки</h2>
            <span className="text-xs text-[var(--t-3)]">
              {unlockedPerks.length} из {report.perks.length}
            </span>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {unlockedPerks.length === 0 ? (
              <p className="text-sm text-[var(--t-2)] sm:col-span-2">
                Пока нет открытых перков. Внеси депозит на PocketOption, чтобы
                открыть Базовый (T1).
              </p>
            ) : (
              unlockedPerks.map((p) => (
                <div
                  key={p.code}
                  className="flex items-start gap-3 p-3 rounded-xl border border-[var(--b-soft)] bg-[var(--bg-2)]"
                >
                  <CheckCircle2
                    size={18}
                    className="text-[var(--green)] shrink-0 mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{p.name}</div>
                    <div className="text-xs text-[var(--t-2)] mt-1">
                      {p.description}
                    </div>
                  </div>
                  <TierBadge tier={p.minTier} size="sm" showLabel={false} />
                </div>
              ))
            )}
          </div>
        </Card>

        {user.referralCode ? (
          <ReferralWidget
            code={user.referralCode}
            count={user._count.referrals}
            baseUrl={SITE_URL}
          />
        ) : null}
      </div>

      {/* Locked perks roadmap */}
      {lockedPerks.length > 0 ? (
        <Card padding="lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Target size={18} className="text-[var(--brand-gold)]" /> Откроется
              на следующих тирах
            </h2>
            {nextTier ? (
              <span className="text-xs text-[var(--t-3)]">
                ещё ${nextTier.needed.toLocaleString()} до{" "}
                {TIER_LABELS[nextTier.nextTier]}
              </span>
            ) : null}
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {lockedPerks.map((p) => (
              <div
                key={p.code}
                className="flex items-start gap-3 p-3 rounded-xl border border-dashed border-[var(--b-soft)] opacity-70"
              >
                <Lock size={16} className="text-[var(--t-3)] shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{p.name}</div>
                  <div className="text-xs text-[var(--t-2)] mt-1">
                    {p.description}
                  </div>
                </div>
                <TierBadge tier={p.minTier} size="sm" showLabel={false} />
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      {/* 7. CTA row */}
      <div className="grid sm:grid-cols-3 gap-3">
        <ButtonLink
          href={BOT_URL}
          external
          variant="primary"
          iconRight={<ExternalLink size={16} />}
        >
          Открыть Telegram-бот
        </ButtonLink>
        <ButtonLink
          href="/giveaway"
          variant="secondary"
          iconRight={<ArrowRight size={16} />}
        >
          Розыгрыш призов
        </ButtonLink>
        <ButtonLink
          href="/dashboard/leaderboard"
          variant="secondary"
          iconRight={<ArrowRight size={16} />}
        >
          Лидерборд
        </ButtonLink>
      </div>

      <p className="text-xs text-[var(--t-3)] border-t border-[var(--b-soft)] pt-6 leading-relaxed">
        Signal Trade GPT не является финансовым советником. Сигналы
        предоставляются в информационных целях. Торговля бинарными опционами
        сопряжена с высоким риском потери средств.
      </p>
    </div>
  );
}
