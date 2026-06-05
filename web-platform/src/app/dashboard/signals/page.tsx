/**
 * Dashboard — Signals page (rework v2).
 *
 * Tier-aware signal feed: filter by direction (CALL/PUT/all), color-coded
 * by result (win/loss/pending), inline confidence meter. Header shows
 * winrate and tier-based daily limit.
 */
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAccessReport } from "@/lib/access";
import { TIER_ACCESS } from "@/lib/tier";
import { Card } from "@/components/ui/Card";
import { Stat } from "@/components/ui/Stat";
import { buildReferralLink } from "@/lib/pocketoption";
import {
  TrendingUp,
  TrendingDown,
  CircleDot,
  Send,
  Lock,
  ExternalLink,
  Activity,
  Clock,
} from "lucide-react";
import { LiveSignalHero, type LiveSignal } from "./_components/LiveSignalHero";
import { TierStrip } from "./_components/TierStrip";

const TIER_BAND_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  otc:      { label: "OTC",   color: "#8888ff", bg: "rgba(136,136,255,0.10)" },
  exchange: { label: "Биржа", color: "#8ee06b", bg: "rgba(142,224,107,0.10)" },
  elite:    { label: "Elite", color: "#d4a017", bg: "rgba(212,160,23,0.10)"  },
};

const PRO_THRESHOLD = 20;

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
  const allowedBands = TIER_ACCESS[tier] ?? ["otc"];

  const signals = await prisma.signal.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    take: 60,
  });

  const liveSignal: LiveSignal | null = (() => {
    const pending = signals.find(
      (s) =>
        s.result === "pending" &&
        allowedBands.includes(s.tier as "otc" | "exchange" | "elite"),
    );
    if (!pending) return null;
    return {
      id: pending.id,
      pair: pending.pair,
      direction: pending.direction,
      expiration: pending.expiration,
      confidence: pending.confidence,
      tier: pending.tier,
      entryPrice: pending.entryPrice == null ? null : Number(pending.entryPrice),
      analysis: pending.analysis,
      createdAtIso: pending.createdAt.toISOString(),
    };
  })();

  const visibleSignals = signals.filter((s) =>
    allowedBands.includes(s.tier as "otc" | "exchange" | "elite"),
  );
  const wins = visibleSignals.filter((s) => s.result === "win").length;
  const losses = visibleSignals.filter((s) => s.result === "loss").length;
  const completed = wins + losses;
  const winrate = completed > 0 ? Math.round((wins / completed) * 100) : 0;

  const depositTotal = poAccount?.totalDeposit
    ? Number(poAccount.totalDeposit)
    : 0;

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div>
        <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--brand-gold)] mb-1">
          Торговые сигналы
        </p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Лента</h1>
      </div>

      {/* Tier strip */}
      <TierStrip
        tier={tier}
        depositTotal={depositTotal}
        proThreshold={PRO_THRESHOLD}
      />

      {/* Live signal */}
      <LiveSignalHero signal={liveSignal} />

      {/* Signal feed */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-[var(--t-1)]">
            Последние сигналы
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
                Как только появится новый сигнал — он сразу отобразится здесь.
                Обычно сигналы приходят каждые 5–15 минут.
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-2">
            {signals.map((s, idx) => {
              const locked = !allowedBands.includes(
                s.tier as "otc" | "exchange" | "elite",
              );
              const isCall = s.direction === "CALL";
              const conf = Number(s.confidence ?? 0);
              const band = TIER_BAND_LABELS[s.tier];
              const isPending = s.result === "pending";
              const isNewest = idx === 0 && isPending && !locked;

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

              const directionColor = locked
                ? "var(--t-3)"
                : isCall
                ? "var(--green)"
                : "var(--red)";

              const directionBg = locked
                ? "var(--bg-2)"
                : isCall
                ? "rgba(142,224,107,0.10)"
                : "rgba(255,107,61,0.10)";

              const confColor = locked
                ? "var(--bg-3)"
                : conf >= 90
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
                    opacity: locked ? 0.6 : 1,
                    borderLeft: `3px solid ${locked ? "transparent" : directionColor}`,
                  }}
                  title={locked ? "Открой Pro — депозит от $20 на PocketOption" : undefined}
                >
                  {/* Direction icon */}
                  <div
                    className={[
                      "rounded-lg flex items-center justify-center shrink-0",
                      isNewest ? "w-11 h-11" : "w-9 h-9",
                    ].join(" ")}
                    style={{ background: directionBg, color: directionColor }}
                  >
                    {locked ? (
                      <Lock size={14} />
                    ) : isCall ? (
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
                        style={{
                          fontFamily: "var(--font-jetbrains)",
                          filter: locked ? "blur(4px)" : undefined,
                          userSelect: locked ? "none" : undefined,
                        }}
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
                      {!locked && isPending && (
                        <span className="text-[10px] text-[var(--t-3)] flex items-center gap-1">
                          <Clock size={9} />
                          {s.expiration}
                        </span>
                      )}
                      {locked && (
                        <span className="text-[10px] uppercase tracking-wider text-[var(--brand-gold)]">
                          Pro
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Confidence — bigger bar */}
                  <div className="hidden sm:flex flex-col gap-1 w-28 shrink-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-[var(--t-3)]">Сила</span>
                      <span
                        className="text-[12px] font-bold tabular-nums"
                        style={{
                          fontFamily: "var(--font-jetbrains)",
                          filter: locked ? "blur(4px)" : undefined,
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
                          width: locked ? "100%" : `${conf}%`,
                          background: locked ? "var(--bg-3)" : confColor,
                        }}
                      />
                    </div>
                  </div>

                  {/* Result / lock CTA */}
                  <div className="shrink-0 w-16 text-right">
                    {locked ? (
                      <Link
                        href={referralUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] uppercase tracking-wider text-[var(--brand-gold)] hover:text-[var(--brand-gold-bright)] inline-flex items-center gap-0.5 transition-colors"
                      >
                        Открыть <ExternalLink size={9} />
                      </Link>
                    ) : (
                      <span
                        className="text-xs font-bold"
                        style={{ color: resultColor }}
                      >
                        {resultLabel}
                      </span>
                    )}
                  </div>

                  {/* Time */}
                  <div className="shrink-0 w-10 text-right text-[11px] text-[var(--t-3)] tabular-nums hidden md:block"
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

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat
          icon={<Activity size={16} />}
          label="Сегодня"
          value={
            report.dailySignalLimit == null
              ? `${report.signalsTodayUsed}`
              : `${report.signalsTodayUsed} / ${report.dailySignalLimit}`
          }
        />
        <Stat
          icon={<TrendingUp size={16} />}
          label="Винрейт"
          value={completed > 0 ? `${winrate}%` : "—"}
          delta={
            completed > 0
              ? { value: `${wins}W / ${losses}L`, positive: winrate >= 60 }
              : undefined
          }
        />
        <Stat
          icon={<Send size={16} />}
          label="Всего в ленте"
          value={signals.length.toString()}
        />
        <Stat
          icon={<CircleDot size={16} />}
          label="В работе"
          value={signals.filter((s) => s.result === "pending").length.toString()}
        />
      </div>
    </div>
  );
}
