"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Zap,
  TrendingUp,
  TrendingDown,
  Clock,
  ArrowUpRight,
  ArrowLeft,
  RefreshCw,
  Lock,
} from "lucide-react";
import { MiniChart, type ChartCandle } from "./MiniChart";
import { OtcSignalVisual } from "./OtcSignalVisual";

// ─── Types ───

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
  tier: number;
};

// ─── Pair / expiration data ───

type PairBand = "otc" | "exchange" | "elite";

type PairInfo = {
  name: string;
  band: PairBand;
  minTier: number;
};

const ALL_PAIRS: PairInfo[] = [
  // OTC — tier 0
  { name: "EUR/USD (OTC)", band: "otc", minTier: 0 },
  { name: "GBP/USD (OTC)", band: "otc", minTier: 0 },
  { name: "USD/JPY (OTC)", band: "otc", minTier: 0 },
  { name: "AUD/USD (OTC)", band: "otc", minTier: 0 },
  { name: "EUR/GBP (OTC)", band: "otc", minTier: 0 },
  { name: "USD/CHF (OTC)", band: "otc", minTier: 0 },
  { name: "NZD/USD (OTC)", band: "otc", minTier: 0 },
  { name: "EUR/JPY (OTC)", band: "otc", minTier: 0 },
  // Exchange — tier 1
  { name: "EUR/USD", band: "exchange", minTier: 1 },
  { name: "GBP/USD", band: "exchange", minTier: 1 },
  { name: "USD/JPY", band: "exchange", minTier: 1 },
  { name: "AUD/USD", band: "exchange", minTier: 1 },
  { name: "EUR/GBP", band: "exchange", minTier: 1 },
  { name: "USD/CHF", band: "exchange", minTier: 1 },
  // Elite — tier 2
  { name: "AAPL", band: "elite", minTier: 2 },
  { name: "TSLA", band: "elite", minTier: 2 },
  { name: "GOLD", band: "elite", minTier: 2 },
  { name: "BTC/USD", band: "elite", minTier: 2 },
  { name: "ETH/USD", band: "elite", minTier: 2 },
];

const EXPIRATIONS: Record<PairBand, string[]> = {
  otc: ["30s", "60s", "2m"],
  exchange: ["60s", "2m", "5m"],
  elite: ["60s", "2m", "5m", "15m"],
};

const BAND_LABELS: Record<PairBand, string> = {
  otc: "OTC",
  exchange: "Биржа",
  elite: "Elite",
};

const BAND_COLORS: Record<PairBand, { color: string; bg: string }> = {
  otc: { color: "#8888ff", bg: "rgba(136,136,255,0.10)" },
  exchange: { color: "#8ee06b", bg: "rgba(142,224,107,0.10)" },
  elite: { color: "#d4a017", bg: "rgba(212,160,23,0.10)" },
};

const TIER_REQUIRED_LABELS: Record<number, string> = {
  1: "Basic",
  2: "Pro",
};

// ─── Analysis animation texts ───

const ANALYSIS_TEXTS = [
  "Анализируем рынок...",
  "Проверяем индикаторы...",
  "Оцениваем точку входа...",
  "Рассчитываем вероятность...",
];

type Step = "pair" | "expiration" | "analysis" | "result";

// ─── Component ───

export function SignalRequestButton({
  limitReached,
  remaining,
  tierLabel,
  referralUrl,
  tier,
}: Props) {
  const router = useRouter();

  const [step, setStep] = useState<Step>("pair");
  const [selectedPair, setSelectedPair] = useState<PairInfo | null>(null);
  const [selectedExpiration, setSelectedExpiration] = useState<string | null>(null);
  const [lastSignal, setLastSignal] = useState<GeneratedSignal | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Analysis animation state
  const [analysisTextIdx, setAnalysisTextIdx] = useState(0);
  const [progress, setProgress] = useState(0);

  const reset = useCallback(() => {
    setStep("pair");
    setSelectedPair(null);
    setSelectedExpiration(null);
    setLastSignal(null);
    setError(null);
    setProgress(0);
    setAnalysisTextIdx(0);
  }, []);

  // Select pair → go to expiration
  function handlePairSelect(p: PairInfo) {
    if (p.minTier > tier) return;
    setSelectedPair(p);
    setStep("expiration");
  }

  // Select expiration → start analysis
  function handleExpirationSelect(exp: string) {
    if (!selectedPair) return;
    setSelectedExpiration(exp);
    setStep("analysis");
  }

  // Analysis step: animate + fetch
  useEffect(() => {
    if (step !== "analysis" || !selectedPair || !selectedExpiration) return;

    const totalMs = 5000 + Math.random() * 7000; // 5-12s
    const startTime = Date.now();
    let cancelled = false;

    // Progress bar
    const progressInterval = setInterval(() => {
      if (cancelled) return;
      const elapsed = Date.now() - startTime;
      setProgress(Math.min(95, (elapsed / totalMs) * 100));
    }, 50);

    // Rotating text
    const textInterval = setInterval(() => {
      if (cancelled) return;
      setAnalysisTextIdx((prev) => (prev + 1) % ANALYSIS_TEXTS.length);
    }, 2000);

    // Fire API call immediately, but show result only after animation
    const fetchPromise = fetch("/api/signals/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pair: selectedPair.name, expiration: selectedExpiration }),
    }).then((res) => res.json().then((data) => ({ ok: res.ok, status: res.status, data })));

    const timerPromise = new Promise<void>((resolve) => setTimeout(resolve, totalMs));

    Promise.all([fetchPromise, timerPromise]).then(([res]) => {
      if (cancelled) return;
      clearInterval(progressInterval);
      clearInterval(textInterval);
      setProgress(100);

      if (!res.ok) {
        setError(res.data.error ?? `Ошибка ${res.status}`);
        setStep("pair");
      } else {
        setLastSignal(res.data.signal);
        setStep("result");
        router.refresh();
      }
    }).catch(() => {
      if (cancelled) return;
      clearInterval(progressInterval);
      clearInterval(textInterval);
      setError("Не удалось получить сигнал. Попробуйте ещё раз.");
      setStep("pair");
    });

    return () => {
      cancelled = true;
      clearInterval(progressInterval);
      clearInterval(textInterval);
    };
  }, [step, selectedPair, selectedExpiration, router]);

  // Back button handler
  function handleBack() {
    if (step === "expiration") {
      setSelectedPair(null);
      setStep("pair");
    } else if (step === "result") {
      reset();
    }
  }

  // ─── Render: limit reached ───
  if (limitReached) {
    return (
      <div className="w-full max-w-2xl space-y-4">
        <div
          className="w-full h-14 rounded-2xl font-bold text-base flex items-center justify-center"
          style={{ background: "var(--bg-2)", color: "var(--t-3)" }}
        >
          Лимит исчерпан
        </div>
        <Link
          href={referralUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 text-sm text-[var(--brand-gold)] hover:text-[var(--brand-gold-bright)] transition-colors"
        >
          Повысить уровень ({tierLabel})
          <ArrowUpRight size={14} />
        </Link>
      </div>
    );
  }

  // ─── Render: Step 1 — Select pair ───
  if (step === "pair") {
    const groups: { band: PairBand; pairs: PairInfo[] }[] = [
      { band: "otc", pairs: ALL_PAIRS.filter((p) => p.band === "otc") },
      { band: "exchange", pairs: ALL_PAIRS.filter((p) => p.band === "exchange") },
      { band: "elite", pairs: ALL_PAIRS.filter((p) => p.band === "elite") },
    ];

    return (
      <div className="w-full max-w-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Zap size={20} className="text-[var(--brand-gold)]" />
          <span className="font-semibold text-[var(--t-1)]">Выберите пару</span>
          {remaining != null && (
            <span className="text-xs text-[var(--t-3)] ml-auto">
              ({remaining} осталось)
            </span>
          )}
        </div>

        {error && (
          <div className="px-4 py-3 rounded-xl text-sm border border-red-500/30 bg-red-500/10 text-red-400 text-center">
            {error}
          </div>
        )}

        {groups.map(({ band, pairs }) => {
          const bc = BAND_COLORS[band];
          const locked = pairs[0]?.minTier > tier;

          return (
            <div key={band}>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide"
                  style={{ color: bc.color, background: bc.bg }}
                >
                  {BAND_LABELS[band]}
                </span>
                {locked && (
                  <span className="text-[10px] text-[var(--t-3)] flex items-center gap-1">
                    <Lock size={10} />
                    {TIER_REQUIRED_LABELS[pairs[0].minTier] ?? `T${pairs[0].minTier}`}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {pairs.map((p) => {
                  const isLocked = p.minTier > tier;
                  return (
                    <button
                      key={p.name}
                      onClick={() => handlePairSelect(p)}
                      disabled={isLocked}
                      className="relative rounded-xl border px-3 py-2.5 text-sm font-medium transition-all text-left"
                      style={{
                        background: isLocked ? "var(--bg-2)" : "var(--bg-1)",
                        borderColor: isLocked ? "var(--b-soft)" : "var(--b-hard)",
                        color: isLocked ? "var(--t-3)" : "var(--t-1)",
                        opacity: isLocked ? 0.5 : 1,
                        cursor: isLocked ? "not-allowed" : "pointer",
                        fontFamily: "var(--font-jetbrains)",
                      }}
                    >
                      {p.name}
                      {isLocked && (
                        <Lock
                          size={12}
                          className="absolute top-1.5 right-1.5 text-[var(--t-3)]"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // ─── Render: Step 2 — Select expiration ───
  if (step === "expiration" && selectedPair) {
    const exps = EXPIRATIONS[selectedPair.band];

    return (
      <div className="w-full max-w-2xl space-y-5">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-[var(--bg-2)]"
            style={{ color: "var(--t-2)" }}
          >
            <ArrowLeft size={18} />
          </button>
          <span className="font-semibold text-[var(--t-1)]">
            Экспирация для{" "}
            <span style={{ fontFamily: "var(--font-jetbrains)", color: "var(--brand-gold)" }}>
              {selectedPair.name}
            </span>
          </span>
        </div>

        <div className="flex flex-wrap gap-3">
          {exps.map((exp) => (
            <button
              key={exp}
              onClick={() => handleExpirationSelect(exp)}
              className="rounded-xl border px-6 py-3 text-base font-bold transition-all hover:border-[var(--brand-gold)] hover:shadow-[0_0_20px_rgba(212,160,23,0.15)]"
              style={{
                background: "var(--bg-1)",
                borderColor: "var(--b-hard)",
                color: "var(--t-1)",
                fontFamily: "var(--font-jetbrains)",
              }}
            >
              <Clock size={14} className="inline-block mr-1.5 text-[var(--brand-gold)]" />
              {exp}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ─── Render: Step 3 — Analysis animation ───
  if (step === "analysis") {
    return (
      <div className="w-full max-w-2xl space-y-6">
        <div className="flex flex-col items-center py-8">
          {/* Pulsing icon */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 animate-pulse"
            style={{
              background: "rgba(212,160,23,0.10)",
              border: "1px solid rgba(212,160,23,0.2)",
            }}
          >
            <Zap size={28} className="text-[var(--brand-gold)]" />
          </div>

          {/* Pair + expiration */}
          <div className="text-sm text-[var(--t-2)] mb-2" style={{ fontFamily: "var(--font-jetbrains)" }}>
            {selectedPair?.name} / {selectedExpiration}
          </div>

          {/* Rotating text */}
          <div
            className="text-lg font-semibold mb-6 transition-opacity duration-500"
            style={{ color: "var(--brand-gold)" }}
          >
            {ANALYSIS_TEXTS[analysisTextIdx]}
          </div>

          {/* Progress bar */}
          <div className="w-full max-w-sm">
            <div className="h-2 rounded-full bg-[var(--bg-2)] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-100"
                style={{
                  width: `${progress}%`,
                  background: "linear-gradient(90deg, var(--brand-gold-deep), var(--brand-gold-bright))",
                }}
              />
            </div>
            <div className="text-xs text-[var(--t-3)] text-center mt-2 tabular-nums" style={{ fontFamily: "var(--font-jetbrains)" }}>
              {Math.round(progress)}%
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Render: Step 4 — Show signal result ───
  if (step === "result" && lastSignal) {
    const isOtc = lastSignal.tier === "otc";

    return (
      <div className="w-full max-w-2xl space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
        {/* OTC visual or chart-based card */}
        {isOtc ? (
          <OtcSignalVisual
            pair={lastSignal.pair}
            direction={lastSignal.direction}
            confidence={lastSignal.confidence}
            expiration={lastSignal.expiration}
          />
        ) : (
          <div
            className="rounded-2xl border-2 overflow-hidden w-full"
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
                  <div className="flex gap-3 mt-2 text-[10px] text-[var(--t-3)]" style={{ fontFamily: "var(--font-jetbrains)" }}>
                    <span>RSI: <span className="text-[var(--t-2)]">{lastSignal.chartData.indicators.rsi}</span></span>
                    <span>EMA20: <span className="text-[var(--t-2)]">{lastSignal.chartData.indicators.ema20.toFixed(4)}</span></span>
                    <span>EMA50: <span className="text-[var(--t-2)]">{lastSignal.chartData.indicators.ema50.toFixed(4)}</span></span>
                  </div>
                </div>
              )}

              {/* Analysis */}
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

        {/* New signal button */}
        <button
          onClick={reset}
          className="w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90"
          style={{
            background: "linear-gradient(135deg, var(--brand-gold-deep), var(--brand-gold-bright))",
            color: "#1a1208",
          }}
        >
          <RefreshCw size={16} />
          Новый сигнал
        </button>
      </div>
    );
  }

  // Fallback (shouldn't happen)
  return null;
}
