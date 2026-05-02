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
import { TIER_LABELS } from "@/lib/tier";
import { Card } from "@/components/ui/Card";
import { Stat } from "@/components/ui/Stat";
import { TierBadge } from "@/components/ui/TierBadge";
import {
  TrendingUp,
  TrendingDown,
  CircleDot,
  Send,
  Lock,
  ExternalLink,
  Activity,
} from "lucide-react";
import { LiveSignalHero, type LiveSignal } from "./_components/LiveSignalHero";

const BOT_URL =
  process.env["NEXT_PUBLIC_BOT_URL"] ?? "https://t.me/traitsignaltsest_bot";

const TIER_ACCESS: Record<number, ("otc" | "exchange" | "elite")[]> = {
  0: ["otc"],
  1: ["otc"],
  2: ["otc", "exchange"],
  3: ["otc", "exchange", "elite"],
  4: ["otc", "exchange", "elite"],
};

const TIER_BAND_LABELS: Record<string, { label: string; color: string }> = {
  otc: { label: "OTC", color: "#8888ff" },
  exchange: { label: "Биржа", color: "#00e5a0" },
  elite: { label: "Elite", color: "#f5c518" },
};

export default async function SignalsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const userId = session.user.id;

  const report = await getAccessReport(userId);
  if (!report) return null;
  const tier = report.tier;
  const allowedBands = TIER_ACCESS[tier] ?? ["otc"];

  const signals = await prisma.signal.findMany({
    where: { tier: { in: allowedBands }, isActive: true },
    orderBy: { createdAt: "desc" },
    take: 60,
  });

  const liveSignal: LiveSignal | null = (() => {
    const pending = signals.find((s) => s.result === "pending");
    if (!pending) return null;
    return {
      id: pending.id,
      pair: pending.pair,
      direction: pending.direction,
      expiration: pending.expiration,
      confidence: pending.confidence,
      tier: pending.tier,
      entryPrice:
        pending.entryPrice == null ? null : Number(pending.entryPrice),
      analysis: pending.analysis,
      createdAtIso: pending.createdAt.toISOString(),
    };
  })();

  const wins = signals.filter((s) => s.result === "win").length;
  const losses = signals.filter((s) => s.result === "loss").length;
  const completed = wins + losses;
  const winrate = completed > 0 ? Math.round((wins / completed) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-widest text-[var(--brand-gold)] mb-1">
            Лента сигналов
          </p>
          <h1 className="text-3xl md:text-4xl font-bold">Сигналы</h1>
          <p className="text-[var(--t-2)] mt-2 max-w-xl">
            Доступ зависит от твоего тира. Открыто на твоём уровне:{" "}
            {allowedBands
              .map((b) => TIER_BAND_LABELS[b]?.label ?? b)
              .join(" · ")}
            .
          </p>
        </div>
        <div className="flex items-center gap-2">
          <TierBadge tier={tier} size="md" />
          <span className="text-sm text-[var(--t-2)]">{TIER_LABELS[tier]}</span>
        </div>
      </div>

      {/* Live signal hero */}
      <LiveSignalHero signal={liveSignal} />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat
          icon={<Activity size={18} />}
          label="Сегодня получено"
          value={
            report.dailySignalLimit == null
              ? `${report.signalsTodayUsed}`
              : `${report.signalsTodayUsed} / ${report.dailySignalLimit}`
          }
        />
        <Stat
          icon={<TrendingUp size={18} />}
          label="Винрейт"
          value={completed > 0 ? `${winrate}%` : "—"}
          delta={
            completed > 0
              ? { value: `${wins}W / ${losses}L`, positive: winrate >= 60 }
              : undefined
          }
        />
        <Stat
          icon={<Send size={18} />}
          label="Всего в ленте"
          value={signals.length.toString()}
        />
        <Stat
          icon={<CircleDot size={18} />}
          label="В работе"
          value={signals.filter((s) => s.result === "pending").length.toString()}
        />
      </div>

      {/* Tier upsell if T0/T1 */}
      {tier < 2 && (
        <Card padding="md" className="border-[var(--brand-gold)]/40">
          <div className="flex items-center gap-3">
            <Lock size={18} className="text-[var(--brand-gold)] shrink-0" />
            <div className="flex-1 text-sm">
              <span className="text-[var(--t-1)] font-semibold">
                Биржевые и Elite-сигналы
              </span>{" "}
              <span className="text-[var(--t-2)]">
                открываются с T2 ($500) и T3 ($2 000) соответственно. Внеси
                депозит на PocketOption — тир пересчитается автоматически.
              </span>
            </div>
            <Link
              href="/po/refer"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-[var(--brand-gold)] hover:text-[var(--brand-gold-bright)] inline-flex items-center gap-1 shrink-0"
            >
              Открыть PO <ExternalLink size={12} />
            </Link>
          </div>
        </Card>
      )}

      {/* Feed */}
      <Card padding="lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Последние 60</h2>
          <Link
            href={BOT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[var(--brand-gold)] hover:text-[var(--brand-gold-bright)] inline-flex items-center gap-1"
          >
            Получать в Telegram <ExternalLink size={12} />
          </Link>
        </div>
        {signals.length === 0 ? (
          <p className="text-[var(--t-2)] text-center py-12">
            На твоём тире пока нет активных сигналов. Скоро будут!
          </p>
        ) : (
          <div className="divide-y divide-[var(--b-soft)]">
            {signals.map((s) => {
              const isCall = s.direction === "CALL";
              const conf = Number(s.confidence ?? 0);
              const resultColor =
                s.result === "win"
                  ? "var(--green)"
                  : s.result === "loss"
                  ? "var(--red)"
                  : "var(--t-3)";
              const resultLabel =
                s.result === "win"
                  ? "WIN"
                  : s.result === "loss"
                  ? "LOSS"
                  : "...";
              const band = TIER_BAND_LABELS[s.tier];
              return (
                <div
                  key={s.id}
                  className="grid grid-cols-12 items-center gap-3 py-3"
                >
                  {/* Direction */}
                  <div className="col-span-1">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{
                        background: isCall
                          ? "rgba(0, 229, 160, 0.12)"
                          : "rgba(255, 107, 61, 0.12)",
                        color: isCall ? "var(--green)" : "var(--red)",
                      }}
                    >
                      {isCall ? (
                        <TrendingUp size={16} />
                      ) : (
                        <TrendingDown size={16} />
                      )}
                    </div>
                  </div>
                  {/* Pair + tier band */}
                  <div className="col-span-4 min-w-0">
                    <div
                      className="text-sm font-semibold truncate"
                      style={{ fontFamily: "var(--font-jetbrains)" }}
                    >
                      {s.pair}
                    </div>
                    {band && (
                      <div
                        className="text-xs"
                        style={{ color: band.color }}
                      >
                        {band.label}
                      </div>
                    )}
                  </div>
                  {/* Confidence bar */}
                  <div className="col-span-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-[var(--bg-2)]">
                        <div
                          className="h-full"
                          style={{
                            width: `${conf}%`,
                            background:
                              conf >= 90
                                ? "var(--brand-gold)"
                                : conf >= 80
                                ? "var(--green)"
                                : "var(--t-2)",
                          }}
                        />
                      </div>
                      <span
                        className="text-xs font-mono w-9 text-right"
                        style={{ fontFamily: "var(--font-jetbrains)" }}
                      >
                        {conf}%
                      </span>
                    </div>
                  </div>
                  {/* Result */}
                  <div className="col-span-2 text-right">
                    <span
                      className="text-xs font-semibold"
                      style={{ color: resultColor }}
                    >
                      {resultLabel}
                    </span>
                  </div>
                  {/* Time */}
                  <div className="col-span-1 text-right text-xs text-[var(--t-3)]">
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
      </Card>
    </div>
  );
}
