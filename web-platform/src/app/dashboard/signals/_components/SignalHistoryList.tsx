"use client";

import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  ChevronDown,
} from "lucide-react";
import { MiniChart, type ChartCandle } from "./MiniChart";
import { useI18n } from "@/lib/i18n/context";

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

const STOCK_ICON: Record<string, string> = {
  AAPL: "https://cdn.simpleicons.org/apple/ffffff",
  Apple: "https://cdn.simpleicons.org/apple/ffffff",
  TSLA: "https://cdn.simpleicons.org/tesla/ffffff",
  Tesla: "https://cdn.simpleicons.org/tesla/ffffff",
  AMZN: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M13.958 10.09c0 1.232.029 2.256-.591 3.351-.502.891-1.301 1.44-2.186 1.44-1.214 0-1.922-.924-1.922-2.292 0-2.692 2.415-3.182 4.7-3.182v.683zm3.186 7.705a.66.66 0 0 1-.753.077c-1.06-.876-1.25-1.281-1.829-2.115-1.748 1.784-2.985 2.318-5.249 2.318-2.68 0-4.764-1.653-4.764-4.96 0-2.582 1.399-4.34 3.392-5.2 1.727-.753 4.139-.889 5.982-1.098v-.41c0-.753.058-1.643-.384-2.293-.384-.578-1.118-.816-1.766-.816-1.2 0-2.268.616-2.53 1.89a.67.67 0 0 1-.578.578l-3.186-.345a.57.57 0 0 1-.48-.672C5.753 1.593 8.894.3 11.717.3c1.44 0 3.325.384 4.462 1.476 1.44 1.344 1.302 3.139 1.302 5.094v4.613c0 1.387.576 1.995 1.118 2.745a.67.67 0 0 1-.02.95c-.71.593-1.97 1.696-2.662 2.315l-.773.001zM21.475 21.15c-2.797 1.89-6.849 2.892-10.336 2.892C5.524 24.042.705 22.083.705 17.46c0-.832.096-1.708.48-2.531.168-.346.48-.327.696-.173 2.265 1.71 6.46 2.97 10.164 2.97 2.493 0 5.237-.519 7.76-1.584.384-.163.706.25.37.509l-.7.499z'/%3E%3C/svg%3E",
  Amazon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M13.958 10.09c0 1.232.029 2.256-.591 3.351-.502.891-1.301 1.44-2.186 1.44-1.214 0-1.922-.924-1.922-2.292 0-2.692 2.415-3.182 4.7-3.182v.683zm3.186 7.705a.66.66 0 0 1-.753.077c-1.06-.876-1.25-1.281-1.829-2.115-1.748 1.784-2.985 2.318-5.249 2.318-2.68 0-4.764-1.653-4.764-4.96 0-2.582 1.399-4.34 3.392-5.2 1.727-.753 4.139-.889 5.982-1.098v-.41c0-.753.058-1.643-.384-2.293-.384-.578-1.118-.816-1.766-.816-1.2 0-2.268.616-2.53 1.89a.67.67 0 0 1-.578.578l-3.186-.345a.57.57 0 0 1-.48-.672C5.753 1.593 8.894.3 11.717.3c1.44 0 3.325.384 4.462 1.476 1.44 1.344 1.302 3.139 1.302 5.094v4.613c0 1.387.576 1.995 1.118 2.745a.67.67 0 0 1-.02.95c-.71.593-1.97 1.696-2.662 2.315l-.773.001zM21.475 21.15c-2.797 1.89-6.849 2.892-10.336 2.892C5.524 24.042.705 22.083.705 17.46c0-.832.096-1.708.48-2.531.168-.346.48-.327.696-.173 2.265 1.71 6.46 2.97 10.164 2.97 2.493 0 5.237-.519 7.76-1.584.384-.163.706.25.37.509l-.7.499z'/%3E%3C/svg%3E",
  MSFT: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 23 23' fill='white'%3E%3Cpath d='M0 0h11v11H0zm12 0h11v11H12zM0 12h11v11H0zm12 0h11v11H12z'/%3E%3C/svg%3E",
  Microsoft: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 23 23' fill='white'%3E%3Cpath d='M0 0h11v11H0zm12 0h11v11H12zM0 12h11v11H0zm12 0h11v11H12z'/%3E%3C/svg%3E",
  META: "https://cdn.simpleicons.org/meta/ffffff",
  Meta: "https://cdn.simpleicons.org/meta/ffffff",
  NFLX: "https://cdn.simpleicons.org/netflix/ffffff",
  Netflix: "https://cdn.simpleicons.org/netflix/ffffff",
  NVDA: "https://cdn.simpleicons.org/nvidia/ffffff",
  NVIDIA: "https://cdn.simpleicons.org/nvidia/ffffff",
};

const COMMODITY_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  Gold: { bg: "#d4a017", color: "#1a1a1a", label: "AU" },
  Silver: { bg: "#a0a0a0", color: "#1a1a1a", label: "AG" },
  "Brent Oil": { bg: "#3a6b35", color: "#fff", label: "OIL" },
  "WTI Oil": { bg: "#4a7b45", color: "#fff", label: "WTI" },
};

const INDEX_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  "S&P 500": { bg: "#1a3c6e", color: "#fff", label: "S&P" },
  NASDAQ: { bg: "#0096d6", color: "#fff", label: "NDQ" },
  "Dow Jones": { bg: "#1a3c6e", color: "#fff", label: "DJI" },
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

  // Stock — CDN icon (Apple, Tesla, Meta, Netflix, NVIDIA)
  const stockUrl = STOCK_ICON[name];
  if (stockUrl) {
    return (
      <div style={{
        width: size, height: size, flexShrink: 0, borderRadius: 6,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "#222",
      }}>
        <img src={stockUrl} alt={name} width={size * 0.65} height={size * 0.65} style={{ objectFit: "contain" }} />
      </div>
    );
  }

  // Stock — colored letter badge (Amazon, Microsoft)
  const stockColor = STOCK_COLORS[name];
  if (stockColor) {
    return (
      <div style={{
        width: size, height: size, borderRadius: 6, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 10, fontWeight: 800, background: `${stockColor}20`, color: stockColor,
        border: `1px solid ${stockColor}40`,
      }}>
        {name.slice(0, 4)}
      </div>
    );
  }

  // Commodity
  const commodity = COMMODITY_BADGE[name];
  if (commodity) {
    return (
      <div style={{
        width: size, height: size, borderRadius: 6, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 9, fontWeight: 900, background: commodity.bg, color: commodity.color,
        border: "1px solid rgba(255,255,255,0.12)",
      }}>
        {commodity.label}
      </div>
    );
  }

  // Index
  const idx = INDEX_BADGE[name];
  if (idx) {
    return (
      <div style={{
        width: size, height: size, borderRadius: 6, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 8, fontWeight: 900, background: idx.bg, color: idx.color,
        border: "1px solid rgba(255,255,255,0.12)",
      }}>
        {idx.label}
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

// TIER_BAND_LABELS computed inside component using t
const TIER_BAND_COLORS: Record<string, { color: string; bg: string }> = {
  otc:      { color: "#8888ff", bg: "rgba(136,136,255,0.10)" },
  exchange: { color: "#8ee06b", bg: "rgba(142,224,107,0.10)" },
  elite:    { color: "#d4a017", bg: "rgba(212,160,23,0.10)"  },
};


const PAGE_SIZE = 10;

export function SignalHistoryList({ signals }: Props) {
  const { t } = useI18n();
  const TIER_BAND_LABELS: Record<string, { label: string; color: string; bg: string }> = {
    otc:      { label: "OTC",   ...TIER_BAND_COLORS.otc },
    exchange: { label: t.liveSignalHero.tierExchange, ...TIER_BAND_COLORS.exchange },
    elite:    { label: "Elite", ...TIER_BAND_COLORS.elite },
  };
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
                  <span className="text-[10px] text-[var(--t-3)]">{t.signalHistory.accuracy}</span>
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
                    {t.signalHistory.entry}{" "}
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
                      {t.signalHistory.signalBreakdown}
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
            {t.signalHistory.shown} {Math.min(visibleCount, signals.length)} {t.signalHistory.of} {signals.length}
          </span>
          {hasMore && (
            <button
              onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
              className="text-[13px] text-[var(--t-2)] hover:text-[var(--t-1)] border border-[var(--b-soft)] hover:border-[var(--b-hard)] rounded-lg px-5 py-2 transition-colors bg-transparent"
            >
              {t.signalHistory.showMore}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
