/**
 * Dashboard — Signals page (on-demand model).
 *
 * Users press "Получить сигнал" to request a signal on-demand.
 * Shows daily limit usage, signal history, and tier info.
 */
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAccessReport } from "@/lib/access";
import { TIER_LABELS } from "@/lib/tier";
import { Card } from "@/components/ui/Card";
import { Stat } from "@/components/ui/Stat";
import { buildReferralLink } from "@/lib/pocketoption";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  Send,
  CircleDot,
} from "lucide-react";
import { TierStrip } from "./_components/TierStrip";
import { SignalRequestButton } from "./_components/SignalRequestButton";

const TIER_BAND_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  otc:      { label: "OTC",   color: "#8888ff", bg: "rgba(136,136,255,0.10)" },
  exchange: { label: "Биржа", color: "#8ee06b", bg: "rgba(142,224,107,0.10)" },
  elite:    { label: "Elite", color: "#d4a017", bg: "rgba(212,160,23,0.10)"  },
};

const BASIC_THRESHOLD = 20;
const PRO_THRESHOLD = 100;

export default async function SignalsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const userId = session.user.id;

  const [report, poAccount, referralUrl] = await Promise.all([
    getAccessReport(userId),
    prisma.pocketOptionAccount.findUnique({ where: { userId } }),
    buildReferralLink(userId),
  ]);
  if (!report) return null;
  const tier = report.tier;
  // Fetch user's own signals (on-demand model: each user sees their own)
  const signals = await prisma.signal.findMany({
    where: {
      createdById: userId,
      isActive: true,
    },
    orderBy: { createdAt: "desc" },
    take: 60,
  });

  const wins = signals.filter((s) => s.result === "win").length;
  const losses = signals.filter((s) => s.result === "loss").length;
  const completed = wins + losses;
  const winrate = completed > 0 ? Math.round((wins / completed) * 100) : 0;

  const depositTotal = poAccount?.totalDeposit
    ? Number(poAccount.totalDeposit)
    : 0;

  const dailyLimit = report.dailySignalLimit;
  const used = report.signalsTodayUsed;
  const remaining = dailyLimit != null ? Math.max(0, dailyLimit - used) : null;
  const limitReached = dailyLimit != null && used >= dailyLimit;

  const tierLabel = TIER_LABELS[tier] ?? `T${tier}`;

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div>
        <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--brand-gold)] mb-1">
          Торговые сигналы
        </p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Сигналы</h1>
      </div>

      {/* Tier strip */}
      <TierStrip
        tier={tier}
        depositTotal={depositTotal}
        nextThreshold={tier === 0 ? BASIC_THRESHOLD : tier === 1 ? PRO_THRESHOLD : null}
        dailyLimit={dailyLimit}
        signalsRemaining={remaining}
      />

      {/* Signal request CTA */}
      <Card padding="lg">
        <div className="flex flex-col items-center text-center py-4">
          {/* Daily limit indicator */}
          <div className="mb-4">
            {dailyLimit != null ? (
              <div className="flex items-center gap-2 text-sm text-[var(--t-2)]">
                <Activity size={16} className="text-[var(--brand-gold)]" />
                <span>
                  Использовано{" "}
                  <span className="font-bold text-[var(--t-1)]">{used}</span>
                  {" "}из{" "}
                  <span className="font-bold text-[var(--t-1)]">{dailyLimit}</span>
                  {" "}сигналов сегодня
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-2 text-sm text-[var(--t-2)]">
                  <Activity size={16} className="text-[var(--brand-gold)]" />
                  <span>
                    Получено сегодня:{" "}
                    <span className="font-bold text-[var(--t-1)]">{used}</span>
                  </span>
                </div>
                <span
                  className="text-[10px] font-semibold uppercase tracking-widest px-2.5 py-0.5 rounded-full"
                  style={{
                    background: "rgba(212,160,23,0.12)",
                    color: "var(--brand-gold)",
                  }}
                >
                  Безлимитный доступ
                </span>
              </div>
            )}
          </div>

          {/* Progress bar for daily limit */}
          {dailyLimit != null && (
            <div className="w-full max-w-xs mb-4">
              <div className="h-2 rounded-full bg-[var(--bg-2)] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (used / dailyLimit) * 100)}%`,
                    background: limitReached
                      ? "var(--red)"
                      : "linear-gradient(90deg, var(--brand-gold-deep), var(--brand-gold-bright))",
                  }}
                />
              </div>
            </div>
          )}

          <SignalRequestButton
            limitReached={limitReached}
            remaining={remaining}
            tierLabel={tierLabel}
            referralUrl={referralUrl}
          />

          {limitReached && (
            <div className="mt-3 space-y-1">
              <p className="text-sm text-[var(--red)]">
                Лимит исчерпан
              </p>
              <p className="text-xs text-[var(--t-3)]">
                Лимит обновится в 00:00 UTC.
                {tier < 2 && (
                  <>{" "}Или повысьте уровень для увеличения лимита.</>
                )}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat
          icon={<Activity size={16} />}
          label="Сегодня"
          value={
            dailyLimit == null
              ? `${used}`
              : `${used} / ${dailyLimit}`
          }
        />
        <Stat
          icon={<TrendingUp size={16} />}
          label="Винрейт"
          value={completed > 0 ? `${winrate}%` : "--"}
          delta={
            completed > 0
              ? { value: `${wins}W / ${losses}L`, positive: winrate >= 60 }
              : undefined
          }
        />
        <Stat
          icon={<Send size={16} />}
          label="Всего получено"
          value={signals.length.toString()}
        />
        <Stat
          icon={<CircleDot size={16} />}
          label="В работе"
          value={signals.filter((s) => s.result === "pending").length.toString()}
        />
      </div>

      {/* Signal history */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-[var(--t-1)]">
            Ваши сигналы
          </h2>
          <span className="text-xs text-[var(--t-3)]">
            {signals.length} записей
          </span>
        </div>

        {signals.length === 0 ? (
          <Card padding="lg">
            <div className="flex flex-col items-center py-12 text-center">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: "rgba(212,160,23,0.08)", border: "1px solid var(--b-soft)" }}
              >
                <Activity size={28} className="text-[var(--brand-gold)] opacity-60" />
              </div>
              <h3 className="text-lg font-semibold mb-1">Сигналов пока нет</h3>
              <p className="text-sm text-[var(--t-2)] max-w-xs">
                Нажмите кнопку выше, чтобы получить ваш первый торговый сигнал.
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-2">
            {signals.map((s, idx) => {
              const isCall = s.direction === "CALL";
              const conf = Number(s.confidence ?? 0);
              const band = TIER_BAND_LABELS[s.tier];
              const isPending = s.result === "pending";
              const isNewest = idx === 0 && isPending;

              const resultLabel =
                s.result === "win"
                  ? "WIN"
                  : s.result === "loss"
                  ? "LOSS"
                  : s.expiration;

              const resultColor =
                s.result === "win"
                  ? "var(--green)"
                  : s.result === "loss"
                  ? "var(--red)"
                  : "var(--t-3)";

              const directionColor = isCall ? "var(--green)" : "var(--red)";
              const directionBg = isCall
                ? "rgba(142,224,107,0.10)"
                : "rgba(255,107,61,0.10)";

              const confColor =
                conf >= 90
                  ? "var(--brand-gold)"
                  : conf >= 80
                  ? "var(--green)"
                  : "var(--t-2)";

              return (
                <div
                  key={s.id}
                  className={[
                    "flex items-center gap-3 rounded-xl border bg-[var(--bg-1)] px-4 transition-colors hover:bg-[var(--bg-2)]",
                    isNewest
                      ? "py-4 border-[var(--b-hard)] shadow-[var(--glow-gold-soft)]"
                      : "py-3 border-[var(--b-soft)] hover:border-[var(--b-hard)]",
                  ].join(" ")}
                  style={{
                    borderLeft: `3px solid ${directionColor}`,
                  }}
                >
                  {/* Direction icon */}
                  <div
                    className={[
                      "rounded-lg flex items-center justify-center shrink-0",
                      isNewest ? "w-11 h-11" : "w-9 h-9",
                    ].join(" ")}
                    style={{ background: directionBg, color: directionColor }}
                  >
                    {isCall ? (
                      <TrendingUp size={isNewest ? 20 : 16} />
                    ) : (
                      <TrendingDown size={isNewest ? 20 : 16} />
                    )}
                  </div>

                  {/* Pair + band + expiration */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={[
                          "font-semibold truncate",
                          isNewest ? "text-base" : "text-sm",
                        ].join(" ")}
                        style={{ fontFamily: "var(--font-jetbrains)" }}
                      >
                        {s.pair}
                      </span>
                      {isNewest && (
                        <span className="text-[9px] uppercase tracking-widest text-[var(--brand-gold)] font-bold animate-pulse">
                          new
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {band && (
                        <span
                          className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md uppercase tracking-wide"
                          style={{ color: band.color, background: band.bg }}
                        >
                          {band.label}
                        </span>
                      )}
                      {isPending && (
                        <span className="text-[10px] text-[var(--t-3)] flex items-center gap-1">
                          <Clock size={9} />
                          {s.expiration}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Confidence */}
                  <div className="hidden sm:flex flex-col gap-1 w-28 shrink-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-[var(--t-3)]">Сила</span>
                      <span
                        className="text-[12px] font-bold tabular-nums"
                        style={{
                          fontFamily: "var(--font-jetbrains)",
                          color: confColor,
                        }}
                      >
                        {conf}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-[var(--bg-3)] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${conf}%`,
                          background: confColor,
                        }}
                      />
                    </div>
                  </div>

                  {/* Result */}
                  <div className="shrink-0 w-16 text-right">
                    <span
                      className="text-xs font-bold"
                      style={{ color: resultColor }}
                    >
                      {resultLabel}
                    </span>
                  </div>

                  {/* Time */}
                  <div
                    className="shrink-0 w-10 text-right text-[11px] text-[var(--t-3)] tabular-nums hidden md:block"
                    style={{ fontFamily: "var(--font-jetbrains)" }}
                  >
                    {new Date(s.createdAt).toLocaleTimeString("ru", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
