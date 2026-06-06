"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Zap,
  Loader2,
  TrendingUp,
  TrendingDown,
  Clock,
  ArrowUpRight,
} from "lucide-react";

type ChartCandle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
};

type ChartData = {
  candles: ChartCandle[];
  indicators: { rsi: number; ema20: number; ema50: number };
  levels: { support: number; resistance: number };
  entryPrice: number;
};

type GeneratedSignal = {
  id: string;
  pair: string;
  direction: "CALL" | "PUT";
  expiration: string;
  confidence: number;
  tier: string;
  analysis: string | null;
  chartData: ChartData | null;
  entryPrice: number | null;
  createdAt: string;
};

type Props = {
  limitReached: boolean;
  remaining: number | null;
  tierLabel: string;
  referralUrl: string;
};

export function SignalRequestButton({
  limitReached,
  remaining,
  tierLabel,
  referralUrl,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [lastSignal, setLastSignal] = useState<GeneratedSignal | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function requestSignal() {
    setLoading(true);
    setError(null);
    setLastSignal(null);

    try {
      const res = await fetch("/api/signals/request", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? `Ошибка ${res.status}`);
        return;
      }

      setLastSignal(data.signal);
      router.refresh();
    } catch {
      setError("Не удалось получить сигнал. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md space-y-4">
      {/* Main button */}
      <button
        onClick={requestSignal}
        disabled={limitReached || loading}
        className="w-full h-14 rounded-2xl font-bold text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        style={{
          background: limitReached
            ? "var(--bg-2)"
            : "linear-gradient(135deg, var(--brand-gold-deep), var(--brand-gold-bright))",
          color: limitReached ? "var(--t-3)" : "#1a1208",
          boxShadow: limitReached ? "none" : "0 0 30px rgba(212,160,23,0.2)",
        }}
      >
        {loading ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            Генерируем...
          </>
        ) : limitReached ? (
          "Лимит исчерпан"
        ) : (
          <>
            <Zap size={20} />
            Получить сигнал
            {remaining != null && (
              <span className="text-sm opacity-70 ml-1">
                ({remaining} осталось)
              </span>
            )}
          </>
        )}
      </button>

      {/* Upgrade CTA for limited tiers */}
      {limitReached && (
        <Link
          href={referralUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 text-sm text-[var(--brand-gold)] hover:text-[var(--brand-gold-bright)] transition-colors"
        >
          Повысить уровень ({tierLabel})
          <ArrowUpRight size={14} />
        </Link>
      )}

      {/* Error message */}
      {error && (
        <div className="px-4 py-3 rounded-xl text-sm border border-red-500/30 bg-red-500/10 text-red-400 text-center">
          {error}
        </div>
      )}

      {/* Generated signal card */}
      {lastSignal && (
        <div
          className="rounded-2xl border-2 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300 w-full"
          style={{
            borderColor: lastSignal.direction === "CALL" ? "var(--green)" : "var(--red)",
            background: lastSignal.direction === "CALL"
              ? "rgba(0,229,160,0.05)"
              : "rgba(255,107,61,0.05)",
          }}
        >
          <div className="px-5 py-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: lastSignal.direction === "CALL"
                      ? "rgba(0,229,160,0.15)"
                      : "rgba(255,107,61,0.15)",
                    color: lastSignal.direction === "CALL" ? "var(--green)" : "var(--red)",
                  }}
                >
                  {lastSignal.direction === "CALL" ? (
                    <TrendingUp size={22} />
                  ) : (
                    <TrendingDown size={22} />
                  )}
                </div>
                <div>
                  <div
                    className="text-lg font-bold"
                    style={{ fontFamily: "var(--font-jetbrains)" }}
                  >
                    {lastSignal.pair}
                  </div>
                  <div className="text-xs text-[var(--t-3)]">
                    {lastSignal.direction === "CALL" ? "CALL (Вверх)" : "PUT (Вниз)"}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div
                  className="text-2xl font-bold"
                  style={{ color: "var(--brand-gold)", fontFamily: "var(--font-jetbrains)" }}
                >
                  {lastSignal.confidence}%
                </div>
                <div className="text-[10px] text-[var(--t-3)] uppercase tracking-wider">
                  Уверенность
                </div>
              </div>
            </div>

            {/* Meta row */}
            <div className="flex items-center gap-3 text-xs text-[var(--t-2)] mb-3">
              <span className="flex items-center gap-1">
                <Clock size={11} />
                {lastSignal.expiration}
              </span>
              <span
                className="uppercase text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
                style={{
                  background: lastSignal.tier === "otc" ? "rgba(136,136,255,0.12)"
                    : lastSignal.tier === "exchange" ? "rgba(142,224,107,0.12)"
                    : "rgba(212,160,23,0.12)",
                  color: lastSignal.tier === "otc" ? "#8888ff"
                    : lastSignal.tier === "exchange" ? "#8ee06b"
                    : "#d4a017",
                }}
              >
                {lastSignal.tier === "otc" ? "OTC" : lastSignal.tier === "exchange" ? "Биржа" : "Elite"}
              </span>
              {lastSignal.entryPrice != null && (
                <span style={{ fontFamily: "var(--font-jetbrains)" }}>
                  Вход: {lastSignal.entryPrice.toFixed(5)}
                </span>
              )}
            </div>

            {/* Mini chart for non-OTC */}
            {lastSignal.chartData && lastSignal.chartData.candles.length > 0 && (
              <div className="mb-3">
                <MiniChart
                  candles={lastSignal.chartData.candles}
                  direction={lastSignal.direction}
                  support={lastSignal.chartData.levels.support}
                  resistance={lastSignal.chartData.levels.resistance}
                />
                {/* Indicators row */}
                <div className="flex gap-3 mt-2 text-[10px] text-[var(--t-3)]" style={{ fontFamily: "var(--font-jetbrains)" }}>
                  <span>RSI: <span className="text-[var(--t-2)]">{lastSignal.chartData.indicators.rsi}</span></span>
                  <span>EMA20: <span className="text-[var(--t-2)]">{lastSignal.chartData.indicators.ema20.toFixed(4)}</span></span>
                  <span>EMA50: <span className="text-[var(--t-2)]">{lastSignal.chartData.indicators.ema50.toFixed(4)}</span></span>
                </div>
              </div>
            )}

            {/* Analysis for non-OTC */}
            {lastSignal.analysis && (
              <div
                className="rounded-xl px-4 py-3 text-[12px] leading-relaxed text-[var(--t-2)] whitespace-pre-line"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--b-soft)" }}
              >
                <div className="text-[10px] uppercase tracking-wider text-[var(--brand-gold)] font-semibold mb-1.5">
                  Разбор сигнала
                </div>
                {lastSignal.analysis}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Mini candlestick chart (SVG) ─── */

function MiniChart({
  candles,
  direction,
  support,
  resistance,
}: {
  candles: ChartCandle[];
  direction: "CALL" | "PUT";
  support: number;
  resistance: number;
}) {
  const W = 400;
  const H = 120;
  const PAD = 8;

  const prices = candles.flatMap((c) => [c.high, c.low, support, resistance]);
  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);
  const range = maxP - minP || 0.001;

  const yOf = (p: number) => PAD + (1 - (p - minP) / range) * (H - PAD * 2);
  const candleW = Math.max(2, (W - PAD * 2) / candles.length - 1);

  const supportY = yOf(support);
  const resistanceY = yOf(resistance);

  const accentColor = direction === "CALL" ? "#00e5a0" : "#ff6b3d";

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full rounded-lg overflow-hidden"
      style={{ background: "rgba(0,0,0,0.25)", height: 120 }}
    >
      {/* Support / resistance lines */}
      <line x1={0} y1={supportY} x2={W} y2={supportY} stroke="#8888ff" strokeWidth={0.5} strokeDasharray="4 3" opacity={0.5} />
      <line x1={0} y1={resistanceY} x2={W} y2={resistanceY} stroke="#ff6b3d" strokeWidth={0.5} strokeDasharray="4 3" opacity={0.5} />
      <text x={4} y={supportY - 3} fill="#8888ff" fontSize={7} opacity={0.6}>S {support.toFixed(4)}</text>
      <text x={4} y={resistanceY - 3} fill="#ff6b3d" fontSize={7} opacity={0.6}>R {resistance.toFixed(4)}</text>

      {/* Candles */}
      {candles.map((c, i) => {
        const x = PAD + i * (candleW + 1);
        const isGreen = c.close >= c.open;
        const color = isGreen ? "#00e5a0" : "#ff6b3d";
        const bodyTop = yOf(Math.max(c.open, c.close));
        const bodyBot = yOf(Math.min(c.open, c.close));
        const bodyH = Math.max(1, bodyBot - bodyTop);

        return (
          <g key={i}>
            {/* Wick */}
            <line
              x1={x + candleW / 2} y1={yOf(c.high)}
              x2={x + candleW / 2} y2={yOf(c.low)}
              stroke={color} strokeWidth={0.7} opacity={0.6}
            />
            {/* Body */}
            <rect
              x={x} y={bodyTop}
              width={candleW} height={bodyH}
              fill={color} rx={0.5} opacity={0.85}
            />
          </g>
        );
      })}

      {/* Direction arrow */}
      <text
        x={W - PAD - 10} y={direction === "CALL" ? PAD + 12 : H - PAD - 4}
        fill={accentColor} fontSize={16} fontWeight="bold" textAnchor="end"
      >
        {direction === "CALL" ? "\u25B2" : "\u25BC"}
      </text>
    </svg>
  );
}
