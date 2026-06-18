"use client";

import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  ChevronDown,
} from "lucide-react";
import { MiniChart, type ChartCandle } from "./MiniChart";

// ── Pair icon helpers ──

const CURRENCY_FLAG: Record<string, string> = {
  EUR: "eu", USD: "us", GBP: "gb", JPY: "jp", AUD: "au",
  CAD: "ca", CHF: "ch", NZD: "nz",
};

const CRYPTO_IMG: Record<string, string> = {
  Bitcoin: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
  Ethereum: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
  Solana: "https://assets.coingecko.com/coins/images/4128/small/solana.png",
  Dogecoin: "https://assets.coingecko.com/coins/images/5/small/dogecoin.png",
  Cardano: "https://assets.coingecko.com/coins/images/975/small/cardano.png",
  Toncoin: "https://assets.coingecko.com/coins/images/17980/small/ton_symbol.png",
  BNB: "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png",
  Litecoin: "https://assets.coingecko.com/coins/images/2/small/litecoin.png",
  BTC: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
  ETH: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
  SOL: "https://assets.coingecko.com/coins/images/4128/small/solana.png",
};

const STOCK_COLORS: Record<string, string> = {
  AAPL: "#a2aaad", Apple: "#a2aaad", TSLA: "#cc0000", Tesla: "#cc0000",
  AMZN: "#ff9900", Amazon: "#ff9900", MSFT: "#00a4ef", Microsoft: "#00a4ef",
  META: "#0081fb", Meta: "#0081fb", NFLX: "#e50914", Netflix: "#e50914",
  NVDA: "#76b900", NVIDIA: "#76b900",
};

/** Extract a display name from a full pair name. */
function pairDisplay(pair: string): string {
  return pair.replace(" (OTC)", "");
}

/** Extract currency codes from pair name like "EUR/USD (OTC)" → ["EUR","USD"]. */
function pairCurrencies(pair: string): [string, string] | null {
  const clean = pair.replace(" (OTC)", "");
  const parts = clean.split("/");
  if (parts.length === 2 && CURRENCY_FLAG[parts[0]!] && CURRENCY_FLAG[parts[1]!]) {
    return [parts[0]!, parts[1]!];
  }
  return null;
}

function HistoryPairIcon({ pair, size = 28 }: { pair: string; size?: number }) {
  // Currency pair → overlapping flags
  const currencies = pairCurrencies(pair);
  if (currencies) {
    return (
      <div style={{ position: "relative", width: size + 8, height: size, flexShrink: 0 }}>
        <img src={`https://hatscripts.github.io/circle-flags/flags/${CURRENCY_FLAG[currencies[0]]}.svg`}
          alt={currencies[0]} width={size} height={size}
          style={{ position: "absolute", left: 0, top: 0, borderRadius: "50%", border: "2px solid var(--bg-2)", zIndex: 2 }} />
        <img src={`https://hatscripts.github.io/circle-flags/flags/${CURRENCY_FLAG[currencies[1]]}.svg`}
          alt={currencies[1]} width={size} height={size}
          style={{ position: "absolute", left: size * 0.35, top: 0, borderRadius: "50%", border: "2px solid var(--bg-2)", zIndex: 1 }} />
      </div>
    );
  }

  // Crypto
  const name = pair.replace(" (OTC)", "").split("/")[0]!;
  const cryptoUrl = CRYPTO_IMG[name];
  if (cryptoUrl) {
    return <img src={cryptoUrl} alt={name} width={size} height={size} style={{ borderRadius: "50%", flexShrink: 0, background: "#222" }} />;
  }

  // Stock — colored letter badge
  const stockColor = STOCK_COLORS[name];
  if (stockColor) {
    return (
      <div style={{
        width: size, height: size, borderRadius: 6, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 10, fontWeight: 800, background: `${stockColor}20`, color: stockColor,
        border: `1px solid ${stockColor}40`,
      }}>
        {name.slice(0, 2)}
      </div>
    );
  }

  // Fallback
  return (
    <div style={{
      width: size, height: size, borderRadius: 6, flexShrink: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 9, fontWeight: 700, background: "var(--bg-3)", color: "var(--t-2)",
    }}>
      {pairDisplay(pair).slice(0, 3)}
    </div>
  );
}

type ChartData = {
  candles: ChartCandle[];
  indicators: { rsi: number; ema20: number; ema50: number };
  levels: { support: number; resistance: number };
  entryPrice: number;
  source?: string;
};

type SignalRow = {
  id: string;
  pair: string;
  direction: "CALL" | "PUT";
  confidence: number | null;
  tier: string;
  result: string;
  expiration: string;
  analysis: string | null;
  chartData: ChartData | null;
  createdAt: string;
};

type Props = {
  signals: SignalRow[];
};

const TIER_BAND_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  otc:      { label: "OTC",   color: "#8888ff", bg: "rgba(136,136,255,0.10)" },
  exchange: { label: "Биржа", color: "#8ee06b", bg: "rgba(142,224,107,0.10)" },
  elite:    { label: "Elite", color: "#d4a017", bg: "rgba(212,160,23,0.10)"  },
};


const PAGE_SIZE = 10;

export function SignalHistoryList({ signals }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const visibleSignals = signals.slice(0, visibleCount);
  const hasMore = visibleCount < signals.length;

  function toggle(id: string, hasContent: boolean) {
    if (!hasContent) return;
    setExpandedId((prev) => (prev === id ? null : id));
  }

  return (
    <div className="space-y-2">
      {visibleSignals.map((s, idx) => {
        const isCall = s.direction === "CALL";
        const conf = Number(s.confidence ?? 0);
        const band = TIER_BAND_LABELS[s.tier];
        const isPending = s.result === "pending";
        const isNewest = idx === 0 && isPending;
        const isExpandable = s.chartData !== null || !!s.analysis;
        const isExpanded = expandedId === s.id;

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

        const cd = s.chartData as ChartData | null;

        return (
          <div key={s.id}>
            {/* Row */}
            <div
              role={isExpandable ? "button" : undefined}
              tabIndex={isExpandable ? 0 : undefined}
              onClick={() => toggle(s.id, isExpandable)}
              onKeyDown={(e) => {
                if (isExpandable && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  toggle(s.id, isExpandable);
                }
              }}
              className={[
                "flex items-center gap-3 rounded-xl border bg-[var(--bg-1)] px-4 transition-colors hover:bg-[var(--bg-2)]",
                isExpandable ? "cursor-pointer" : "",
                isNewest
                  ? "py-4 border-[var(--b-hard)] shadow-[var(--glow-gold-soft)]"
                  : "py-3 border-[var(--b-soft)] hover:border-[var(--b-hard)]",
                isExpanded ? "rounded-b-none border-b-0" : "",
              ].join(" ")}
              style={{
                borderLeft: `3px solid ${directionColor}`,
              }}
            >
              {/* Pair icon + direction badge */}
              <div className="relative shrink-0" style={{ width: isNewest ? 44 : 36, height: isNewest ? 44 : 36 }}>
                <HistoryPairIcon pair={s.pair} size={isNewest ? 36 : 28} />
                <div
                  className="absolute flex items-center justify-center rounded-full"
                  style={{
                    width: isNewest ? 18 : 16,
                    height: isNewest ? 18 : 16,
                    bottom: -2,
                    right: -4,
                    background: directionColor,
                    border: "2px solid var(--bg-1)",
                  }}
                >
                  {isCall ? (
                    <TrendingUp size={isNewest ? 10 : 8} color="#fff" />
                  ) : (
                    <TrendingDown size={isNewest ? 10 : 8} color="#fff" />
                  )}
                </div>
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
                  <span className="text-[10px] text-[var(--t-3)]">Точность</span>
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

              {/* Expand chevron */}
              {isExpandable && (
                <ChevronDown
                  size={16}
                  className={[
                    "shrink-0 text-[var(--t-3)] transition-transform duration-200",
                    isExpanded ? "rotate-180" : "",
                  ].join(" ")}
                />
              )}
            </div>

            {/* Expanded details */}
            {isExpanded && (cd || s.analysis) && (
              <div
                className="rounded-b-xl border border-t-0 border-[var(--b-soft)] bg-[var(--bg-1)] px-5 py-4 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200"
                style={{ borderLeft: `3px solid ${directionColor}` }}
              >
                {/* Mini chart */}
                {cd && cd.candles.length > 0 && (
                  <MiniChart
                    candles={cd.candles}
                    direction={s.direction}
                    support={cd.levels.support}
                    resistance={cd.levels.resistance}
                  />
                )}

                {/* Indicators */}
                {cd && <div
                  className="flex flex-wrap gap-4 text-[11px] text-[var(--t-3)]"
                  style={{ fontFamily: "var(--font-jetbrains)" }}
                >
                  <span>
                    RSI:{" "}
                    <span className="text-[var(--t-2)] font-semibold">
                      {cd.indicators.rsi}
                    </span>
                  </span>
                  <span>
                    EMA20:{" "}
                    <span className="text-[var(--t-2)] font-semibold">
                      {cd.indicators.ema20.toFixed(4)}
                    </span>
                  </span>
                  <span>
                    EMA50:{" "}
                    <span className="text-[var(--t-2)] font-semibold">
                      {cd.indicators.ema50.toFixed(4)}
                    </span>
                  </span>
                </div>}

                {/* Levels + Entry */}
                {cd && <div
                  className="flex flex-wrap gap-4 text-[11px]"
                  style={{ fontFamily: "var(--font-jetbrains)" }}
                >
                  <span className="text-[var(--t-3)]">
                    Support:{" "}
                    <span style={{ color: "#8888ff" }}>
                      {cd.levels.support.toFixed(5)}
                    </span>
                  </span>
                  <span className="text-[var(--t-3)]">
                    Resistance:{" "}
                    <span style={{ color: "#ff6b3d" }}>
                      {cd.levels.resistance.toFixed(5)}
                    </span>
                  </span>
                  <span className="text-[var(--t-3)]">
                    Вход:{" "}
                    <span className="text-[var(--brand-gold)] font-semibold">
                      {cd.entryPrice.toFixed(5)}
                    </span>
                  </span>
                </div>}

                {/* Analysis */}
                {s.analysis && (
                  <div
                    className="rounded-xl px-4 py-3 text-[12px] leading-relaxed text-[var(--t-2)] whitespace-pre-line"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid var(--b-soft)",
                    }}
                  >
                    <div className="text-[10px] uppercase tracking-wider text-[var(--brand-gold)] font-semibold mb-1.5">
                      Разбор сигнала
                    </div>
                    {s.analysis}
                  </div>
                )}

                {/* Source badge removed — internal detail */}
              </div>
            )}
          </div>
        );
      })}

      {signals.length > PAGE_SIZE && (
        <div className="flex flex-col items-center gap-2 pt-3">
          <span className="text-[12px] text-[var(--t-3)]">
            Показано {Math.min(visibleCount, signals.length)} из {signals.length}
          </span>
          {hasMore && (
            <button
              onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
              className="text-[13px] text-[var(--t-2)] hover:text-[var(--t-1)] border border-[var(--b-soft)] hover:border-[var(--b-hard)] rounded-lg px-5 py-2 transition-colors bg-transparent"
            >
              Показать ещё
            </button>
          )}
        </div>
      )}
    </div>
  );
}
