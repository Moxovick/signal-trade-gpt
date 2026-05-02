/**
 * Dashboard — v2 home (sidebar-less rework).
 *
 * Layout: hero tier card → stats row → split (perks + referral) → recent signals → next-tier roadmap.
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
  Activity,
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
import { LinkPoAccountForm } from "./_components/LinkPoAccountForm";
import { ReferralWidget } from "./_components/ReferralWidget";

const BOT_URL =
  process.env["NEXT_PUBLIC_BOT_URL"] ?? "https://t.me/traitsignaltsest_bot";
const SITE_URL =
  process.env["NEXT_PUBLIC_SITE_URL"] ?? "http://localhost:3000";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const userId = session.user.id;

  const [user, account, settings, report, recentSignals] = await Promise.all([
    
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
    prisma.signal.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        pair: true,
        direction: true,
        confidence: true,
        result: true,
        tier: true,
        createdAt: true,
      },
    }),
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

  const greeting =
    user.firstName ?? user.username ?? user.email?.split("@")[0] ?? "Трейдер";
  const unlockedPerks = report.perks.filter((p) => p.unlocked);
  const lockedPerks = report.perks.filter((p) => !p.unlocked);

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <p className="text-xs uppercase tracking-widest text-[var(--brand-gold)] mb-1">
          Личный кабинет
        </p>
        <h1 className="text-3xl md:text-4xl font-bold">Привет, {greeting}</h1>
      </div>

      {/* Hero tier card */}
      <Card variant="highlight" padding="lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-6">
          <div className="flex items-center gap-4">
            <TierBadge tier={tier} size="lg" />
            <div>
              <div className="text-xs uppercase tracking-widest text-[var(--t-3)] mb-1">
                Текущий тир
              </div>
              <div className="text-2xl font-bold">{TIER_LABELS[tier]}</div>
            </div>
          </div>
          <div className="md:text-right">
            <div className="text-xs uppercase tracking-widest text-[var(--t-3)] mb-1">
              Депозит на PocketOption
            </div>
            <div
              className="text-4xl font-bold text-[var(--brand-gold)]"
              style={{ fontFamily: "var(--font-jetbrains)" }}
            >
              ${totalDeposit.toLocaleString("en-US")}
            </div>
          </div>
        </div>

        {!account ? (
          <div className="border-t border-[var(--b-soft)] pt-5">
            <h3 className="font-semibold mb-2">Подключи PocketOption</h3>
            <p className="text-sm text-[var(--t-2)] mb-5">
              У тебя пока нет привязанного счёта. Открой счёт по нашей ссылке — tier
              откроется автоматически после первого депозита. Или вручную привяжи
              существующий PO ID.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/po/refer"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 h-11 px-6 rounded-full bg-[var(--brand-gold)] text-[#1a1208] font-semibold text-sm hover:bg-[var(--brand-gold-bright)] transition-colors"
              >
                Открыть PocketOption
                <ExternalLink size={14} />
              </Link>
              <span className="text-[var(--t-3)] text-sm flex items-center">или</span>
              <LinkPoAccountForm />
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between text-xs text-[var(--t-2)] mb-2">
              <span>
                <span className="text-[var(--t-3)]">PO ID:</span>{" "}
                <code
                  className="text-[var(--t-1)]"
                  style={{ fontFamily: "var(--font-jetbrains)" }}
                >
                  #{account.poTraderId}
                </code>
                <span
                  className="ml-3 inline-block w-1.5 h-1.5 rounded-full"
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
              </span>
              {nextTier && (
                <span className="text-[var(--brand-gold)] font-semibold">
                  +${nextTier.needed.toLocaleString()} → {TIER_LABELS[nextTier.nextTier]}
                </span>
              )}
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
            {!nextTier && (
              <div className="mt-3 text-sm text-[var(--brand-gold)] flex items-center gap-2">
                <Trophy size={14} /> Достигнут максимальный уровень — VIP. Все перки
                открыты.
              </div>
            )}
          </>
        )}
      </Card>

      {/* Stats row */}
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

      {/* Two-column: perks + referral */}
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
                Пока нет открытых перков. Внеси депозит на PocketOption чтобы открыть
                Starter (T1).
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

        {user.referralCode && (
          <ReferralWidget
            code={user.referralCode}
            count={user._count.referrals}
            baseUrl={SITE_URL}
          />
        )}
      </div>

      {/* Recent signals feed */}
      <Card padding="lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Activity size={18} className="text-[var(--brand-gold)]" /> Последние сигналы
          </h2>
          <Link
            href="/dashboard/signals"
            className="text-xs text-[var(--brand-gold)] hover:text-[var(--brand-gold-bright)] flex items-center gap-1"
          >
            Все сигналы <ArrowRight size={12} />
          </Link>
        </div>
        {recentSignals.length === 0 ? (
          <p className="text-sm text-[var(--t-2)] py-4">
            Сигналов пока нет. Они появятся здесь по мере публикации в канале.
          </p>
        ) : (
          <div className="space-y-1.5">
            {recentSignals.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[var(--bg-2)] hover:bg-[var(--bg-3)] transition-colors text-sm"
              >
                <div
                  className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold shrink-0 ${
                    s.direction === "CALL"
                      ? "bg-[rgba(142,224,107,0.12)] text-[#8ee06b]"
                      : "bg-[rgba(255,107,61,0.12)] text-[#ff6b3d]"
                  }`}
                >
                  {s.direction === "CALL" ? "▲" : "▼"}
                </div>
                <div
                  className="font-semibold tracking-wider"
                  style={{ fontFamily: "var(--font-jetbrains)" }}
                >
                  {s.pair}
                </div>
                <div
                  className="text-xs text-[var(--brand-gold)] font-bold"
                  style={{ fontFamily: "var(--font-jetbrains)" }}
                >
                  {s.confidence}%
                </div>
                <div className="text-xs uppercase tracking-widest text-[var(--t-3)]">
                  {s.tier}
                </div>
                <div className="ml-auto flex items-center gap-3">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      s.result === "win"
                        ? "bg-[rgba(142,224,107,0.12)] text-[#8ee06b]"
                        : s.result === "loss"
                        ? "bg-[rgba(255,107,61,0.12)] text-[#ff6b3d]"
                        : "bg-[var(--bg-3)] text-[var(--t-3)]"
                    }`}
                  >
                    {s.result === "win"
                      ? "Win"
                      : s.result === "loss"
                      ? "Loss"
                      : "Pending"}
                  </span>
                  <span className="text-xs text-[var(--t-3)] hidden sm:inline">
                    {s.createdAt.toLocaleTimeString("ru", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Locked perks roadmap */}
      {lockedPerks.length > 0 && (
        <Card padding="lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Target size={18} className="text-[var(--brand-gold)]" /> Откроется на
              следующих тирах
            </h2>
            {nextTier && (
              <span className="text-xs text-[var(--t-3)]">
                ещё ${nextTier.needed.toLocaleString()} до {TIER_LABELS[nextTier.nextTier]}
              </span>
            )}
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
                  <div className="text-xs text-[var(--t-2)] mt-1">{p.description}</div>
                </div>
                <TierBadge tier={p.minTier} size="sm" showLabel={false} />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* CTA row */}
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
        Signal Trade GPT не является финансовым советником. Сигналы предоставляются в
        информационных целях. Торговля бинарными опционами сопряжена с высоким риском
        потери средств.
      </p>
    </div>
  );
}
