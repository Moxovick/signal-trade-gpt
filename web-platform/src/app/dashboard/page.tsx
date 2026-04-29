/**
 * Dashboard — v2 home.
 *
 * Replaces subscription-centric layout with PocketOption-tier model:
 *   - Header: Hi + tier badge.
 *   - PO account card: status (linked/pending/none) + total deposit + progress to next tier.
 *   - Daily / lifetime quota.
 *   - Active perks (unlocked) + upcoming perks (locked, with hint).
 *   - Quick actions: signals, referrals, Telegram bot.
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

const BOT_URL =
  process.env["NEXT_PUBLIC_BOT_URL"] ?? "https://t.me/traitsignaltsest_bot";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) return null; // middleware should redirect

  const userId = session.user.id;

  const [user, account, settings, report] = await Promise.all([
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
  ]);

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

  const greeting = user.firstName ?? user.username ?? user.email?.split("@")[0] ?? "Трейдер";
  const unlockedPerks = report.perks.filter((p) => p.unlocked);
  const lockedPerks = report.perks.filter((p) => !p.unlocked);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">Привет, {greeting}</h1>
          <p className="text-[var(--t-2)] text-sm mt-1">Твой текущий уровень доступа:</p>
        </div>
        <TierBadge tier={tier} size="lg" />
      </div>

      {/* PO Account / Tier progress */}
      <Card padding="lg">
        {!account ? (
          <div>
            <h2 className="text-xl font-semibold mb-2">
              Подключи PocketOption
            </h2>
            <p className="text-[var(--t-2)] mb-6">
              У тебя пока нет привязанного счёта. Открой счёт по нашей ссылке —
              tier откроется автоматически после первого депозита.
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
            <p className="text-xs text-[var(--t-3)] mt-4">
              T0 даёт <strong className="text-[var(--brand-gold)]">2 демо-сигнала</strong>{" "}
              за всё время — посмотреть как работает бот.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="text-xs uppercase tracking-wider text-[var(--t-3)] mb-1">
                  PocketOption ID
                </div>
                <div
                  className="text-xl font-semibold"
                  style={{ fontFamily: "var(--font-jetbrains)" }}
                >
                  #{account.poTraderId}
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs">
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full"
                    style={{
                      background: account.status === "verified" ? "var(--green)" : "var(--brand-gold)",
                    }}
                  />
                  <span className="text-[var(--t-2)]">
                    {account.status === "verified"
                      ? "Подтверждён через PocketOption"
                      : account.status === "pending"
                      ? "Ожидание первого депозита"
                      : "Не привязан"}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs uppercase tracking-wider text-[var(--t-3)] mb-1">
                  Депозит
                </div>
                <div
                  className="text-3xl font-bold text-[var(--brand-gold)]"
                  style={{ fontFamily: "var(--font-jetbrains)" }}
                >
                  ${totalDeposit.toLocaleString("en-US")}
                </div>
              </div>
            </div>

            {/* Progress bar */}
            {nextTier ? (
              <div>
                <div className="flex justify-between text-xs text-[var(--t-2)] mb-2">
                  <span>
                    Текущий: <strong>{TIER_LABELS[tier]}</strong>
                  </span>
                  <span>
                    Следующий: <strong>{TIER_LABELS[nextTier.nextTier]}</strong> · нужно ещё ${nextTier.needed.toLocaleString("en-US")}
                  </span>
                </div>
                <div className="h-2 rounded-full overflow-hidden bg-[var(--bg-2)]">
                  <div
                    className="h-full transition-all duration-700"
                    style={{
                      width: `${progressPct}%`,
                      background:
                        "linear-gradient(90deg, var(--brand-gold-deep), var(--brand-gold), var(--brand-gold-bright))",
                      boxShadow: "0 0 12px rgba(212, 160, 23, 0.5)",
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="text-sm text-[var(--brand-gold)]">
                Достигнут максимальный уровень — VIP. Все перки открыты.
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Quotas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Stat
          icon={<Zap size={18} />}
          label="Сигналов сегодня"
          value={
            report.dailySignalLimit == null
              ? `${report.signalsTodayUsed}`
              : `${report.signalsTodayUsed} / ${report.dailySignalLimit}`
          }
        />
        {tier === 0 ? (
          <Stat
            icon={<TrendingUp size={18} />}
            label="Демо-сигналы (lifetime)"
            value={`${report.demoSignalsRemaining ?? 0} / 2`}
          />
        ) : (
          <Stat
            icon={<TrendingUp size={18} />}
            label="Всего получено"
            value={user.signalsReceived.toString()}
          />
        )}
        <Stat
          icon={<Send size={18} />}
          label="Рефералов"
          value={user._count.referrals.toString()}
        />
      </div>

      {/* Perks */}
      <Card padding="lg">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          Активные перки
          <span className="text-sm font-normal text-[var(--t-3)]">
            · {unlockedPerks.length} из {report.perks.length}
          </span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {unlockedPerks.length === 0 ? (
            <p className="text-sm text-[var(--t-2)] col-span-2">
              Пока нет открытых перков. Внеси депозит на PocketOption чтобы открыть Starter (T1).
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
                  <div className="text-xs text-[var(--t-2)] mt-1">{p.description}</div>
                </div>
                <TierBadge tier={p.minTier} size="sm" showLabel={false} />
              </div>
            ))
          )}
        </div>

        {lockedPerks.length > 0 && (
          <>
            <h3 className="text-sm font-semibold mt-6 mb-3 text-[var(--t-2)]">
              Откроется на следующих тирах:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {lockedPerks.map((p) => (
                <div
                  key={p.code}
                  className="flex items-start gap-3 p-3 rounded-xl border border-dashed border-[var(--b-soft)] opacity-60"
                >
                  <Lock size={18} className="text-[var(--t-3)] shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{p.name}</div>
                    <div className="text-xs text-[var(--t-2)] mt-1">{p.description}</div>
                  </div>
                  <TierBadge tier={p.minTier} size="sm" showLabel={false} />
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <ButtonLink href="/dashboard/signals" variant="secondary" iconRight={<ArrowRight size={16} />}>
          Сигналы
        </ButtonLink>
        <ButtonLink href="/dashboard/referrals" variant="secondary" iconRight={<ArrowRight size={16} />}>
          Реферальная программа
        </ButtonLink>
        <ButtonLink href={BOT_URL} external variant="primary" iconRight={<ExternalLink size={16} />}>
          Открыть Telegram-бот
        </ButtonLink>
      </div>

      <p className="text-xs text-[var(--t-3)] border-t border-[var(--b-soft)] pt-6 leading-relaxed">
        Signal Trade GPT не является финансовым советником. Сигналы предоставляются в информационных
        целях. Торговля бинарными опционами сопряжена с высоким риском потери средств.
      </p>
    </div>
  );
}
