"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  ArrowUpRight,
  ArrowLeft,
  RefreshCw,
  Lock,
  ChevronRight,
  Search,
  BarChart3,
  Shield,
  Target,
  Activity,
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
  display: string;
  flag: string;
  band: PairBand;
  minTier: number;
};

const ALL_PAIRS: PairInfo[] = [
  // ── OTC Currencies (tier 0) ──
  { name: "EUR/USD (OTC)", display: "EUR/USD", flag: "OTC", band: "otc", minTier: 0 },
  { name: "GBP/USD (OTC)", display: "GBP/USD", flag: "OTC", band: "otc", minTier: 0 },
  { name: "USD/JPY (OTC)", display: "USD/JPY", flag: "OTC", band: "otc", minTier: 0 },
  { name: "AUD/USD (OTC)", display: "AUD/USD", flag: "OTC", band: "otc", minTier: 0 },
  { name: "EUR/GBP (OTC)", display: "EUR/GBP", flag: "OTC", band: "otc", minTier: 0 },
  { name: "USD/CHF (OTC)", display: "USD/CHF", flag: "OTC", band: "otc", minTier: 0 },
  { name: "NZD/USD (OTC)", display: "NZD/USD", flag: "OTC", band: "otc", minTier: 0 },
  { name: "EUR/JPY (OTC)", display: "EUR/JPY", flag: "OTC", band: "otc", minTier: 0 },
  { name: "AUD/CHF (OTC)", display: "AUD/CHF", flag: "OTC", band: "otc", minTier: 0 },
  { name: "AUD/NZD (OTC)", display: "AUD/NZD", flag: "OTC", band: "otc", minTier: 0 },
  { name: "EUR/CHF (OTC)", display: "EUR/CHF", flag: "OTC", band: "otc", minTier: 0 },
  { name: "GBP/JPY (OTC)", display: "GBP/JPY", flag: "OTC", band: "otc", minTier: 0 },
  { name: "USD/CAD (OTC)", display: "USD/CAD", flag: "OTC", band: "otc", minTier: 0 },
  { name: "CAD/JPY (OTC)", display: "CAD/JPY", flag: "OTC", band: "otc", minTier: 0 },
  { name: "GBP/AUD (OTC)", display: "GBP/AUD", flag: "OTC", band: "otc", minTier: 0 },
  { name: "EUR/NZD (OTC)", display: "EUR/NZD", flag: "OTC", band: "otc", minTier: 0 },
  // OTC Crypto
  { name: "Bitcoin (OTC)", display: "BTC", flag: "Crypto", band: "otc", minTier: 0 },
  { name: "Ethereum (OTC)", display: "ETH", flag: "Crypto", band: "otc", minTier: 0 },
  { name: "Solana (OTC)", display: "SOL", flag: "Crypto", band: "otc", minTier: 0 },
  { name: "Dogecoin (OTC)", display: "DOGE", flag: "Crypto", band: "otc", minTier: 0 },
  { name: "Cardano (OTC)", display: "ADA", flag: "Crypto", band: "otc", minTier: 0 },
  { name: "Toncoin (OTC)", display: "TON", flag: "Crypto", band: "otc", minTier: 0 },
  { name: "BNB (OTC)", display: "BNB", flag: "Crypto", band: "otc", minTier: 0 },
  { name: "Litecoin (OTC)", display: "LTC", flag: "Crypto", band: "otc", minTier: 0 },
  // OTC Commodities
  { name: "Gold (OTC)", display: "Gold", flag: "Commodity", band: "otc", minTier: 0 },
  { name: "Silver (OTC)", display: "Silver", flag: "Commodity", band: "otc", minTier: 0 },
  { name: "Brent Oil (OTC)", display: "Brent Oil", flag: "Commodity", band: "otc", minTier: 0 },
  { name: "WTI Oil (OTC)", display: "WTI Oil", flag: "Commodity", band: "otc", minTier: 0 },
  // OTC Stocks
  { name: "Apple (OTC)", display: "AAPL", flag: "Stock", band: "otc", minTier: 0 },
  { name: "Tesla (OTC)", display: "TSLA", flag: "Stock", band: "otc", minTier: 0 },
  { name: "Amazon (OTC)", display: "AMZN", flag: "Stock", band: "otc", minTier: 0 },
  { name: "Microsoft (OTC)", display: "MSFT", flag: "Stock", band: "otc", minTier: 0 },
  { name: "Meta (OTC)", display: "META", flag: "Stock", band: "otc", minTier: 0 },
  { name: "Netflix (OTC)", display: "NFLX", flag: "Stock", band: "otc", minTier: 0 },
  // OTC Indices
  { name: "S&P 500 (OTC)", display: "S&P 500", flag: "Index", band: "otc", minTier: 0 },
  { name: "NASDAQ 100 (OTC)", display: "NASDAQ", flag: "Index", band: "otc", minTier: 0 },
  { name: "Dow Jones (OTC)", display: "Dow Jones", flag: "Index", band: "otc", minTier: 0 },

  // ── Exchange (tier 1) ──
  { name: "EUR/USD", display: "EUR/USD", flag: "", band: "exchange", minTier: 1 },
  { name: "GBP/USD", display: "GBP/USD", flag: "", band: "exchange", minTier: 1 },
  { name: "USD/JPY", display: "USD/JPY", flag: "", band: "exchange", minTier: 1 },
  { name: "AUD/USD", display: "AUD/USD", flag: "", band: "exchange", minTier: 1 },
  { name: "EUR/GBP", display: "EUR/GBP", flag: "", band: "exchange", minTier: 1 },
  { name: "USD/CHF", display: "USD/CHF", flag: "", band: "exchange", minTier: 1 },
  { name: "USD/CAD", display: "USD/CAD", flag: "", band: "exchange", minTier: 1 },
  { name: "EUR/JPY", display: "EUR/JPY", flag: "", band: "exchange", minTier: 1 },
  { name: "GBP/JPY", display: "GBP/JPY", flag: "", band: "exchange", minTier: 1 },
  { name: "EUR/CHF", display: "EUR/CHF", flag: "", band: "exchange", minTier: 1 },
  { name: "AUD/CAD", display: "AUD/CAD", flag: "", band: "exchange", minTier: 1 },
  { name: "EUR/AUD", display: "EUR/AUD", flag: "", band: "exchange", minTier: 1 },
  { name: "GBP/AUD", display: "GBP/AUD", flag: "", band: "exchange", minTier: 1 },
  { name: "AUD/JPY", display: "AUD/JPY", flag: "", band: "exchange", minTier: 1 },
  { name: "CAD/JPY", display: "CAD/JPY", flag: "", band: "exchange", minTier: 1 },
  { name: "CHF/JPY", display: "CHF/JPY", flag: "", band: "exchange", minTier: 1 },

  // ── Elite (tier 2) — Stocks, Crypto, Commodities, Indices ──
  { name: "AAPL", display: "Apple", flag: "Stock", band: "elite", minTier: 2 },
  { name: "TSLA", display: "Tesla", flag: "Stock", band: "elite", minTier: 2 },
  { name: "AMZN", display: "Amazon", flag: "Stock", band: "elite", minTier: 2 },
  { name: "MSFT", display: "Microsoft", flag: "Stock", band: "elite", minTier: 2 },
  { name: "META", display: "Meta", flag: "Stock", band: "elite", minTier: 2 },
  { name: "NFLX", display: "Netflix", flag: "Stock", band: "elite", minTier: 2 },
  { name: "NVDA", display: "NVIDIA", flag: "Stock", band: "elite", minTier: 2 },
  { name: "GOLD", display: "Gold", flag: "Commodity", band: "elite", minTier: 2 },
  { name: "SILVER", display: "Silver", flag: "Commodity", band: "elite", minTier: 2 },
  { name: "BTC/USD", display: "Bitcoin", flag: "Crypto", band: "elite", minTier: 2 },
  { name: "ETH/USD", display: "Ethereum", flag: "Crypto", band: "elite", minTier: 2 },
  { name: "SOL/USD", display: "Solana", flag: "Crypto", band: "elite", minTier: 2 },
  { name: "SP500", display: "S&P 500", flag: "Index", band: "elite", minTier: 2 },
  { name: "US100", display: "NASDAQ", flag: "Index", band: "elite", minTier: 2 },
];

const EXPIRATIONS: Record<PairBand, { value: string; label: string }[]> = {
  otc: [
    { value: "30s", label: "30 сек" },
    { value: "60s", label: "1 мин" },
    { value: "2m", label: "2 мин" },
  ],
  exchange: [
    { value: "60s", label: "1 мин" },
    { value: "2m", label: "2 мин" },
    { value: "5m", label: "5 мин" },
  ],
  elite: [
    { value: "60s", label: "1 мин" },
    { value: "2m", label: "2 мин" },
    { value: "5m", label: "5 мин" },
    { value: "15m", label: "15 мин" },
  ],
};

const BAND_META: Record<PairBand, { label: string; color: string; bg: string; desc: string }> = {
  otc: { label: "OTC", color: "#8888ff", bg: "rgba(136,136,255,0.08)", desc: "Внебиржевые пары" },
  exchange: { label: "Биржа", color: "#8ee06b", bg: "rgba(142,224,107,0.08)", desc: "Реальные котировки" },
  elite: { label: "Elite", color: "#d4a017", bg: "rgba(212,160,23,0.08)", desc: "Акции, крипто, сырьё" },
};

// ─── Analysis animation ───

const ANALYSIS_STEPS = [
  { icon: Search, text: "Сканируем рынок" },
  { icon: BarChart3, text: "Анализируем индикаторы" },
  { icon: Target, text: "Определяем точку входа" },
  { icon: Shield, text: "Оценка рисков" },
  { icon: Activity, text: "Формируем сигнал" },
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
  const [activeTab, setActiveTab] = useState<PairBand>("otc");

  // Analysis animation state
  const [analysisStep, setAnalysisStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [delayConfig, setDelayConfig] = useState({ min: 5, max: 12 });
  const completedStepsRef = useRef<Set<number>>(new Set());

  // Fetch analysis delay config on mount
  useEffect(() => {
    fetch("/api/signals/config")
      .then((res) => res.json())
      .then((data: { analysisDelayMin: number; analysisDelayMax: number }) => {
        setDelayConfig({
          min: data.analysisDelayMin,
          max: data.analysisDelayMax,
        });
      })
      .catch(() => {
        // keep defaults
      });
  }, []);

  const reset = useCallback(() => {
    setStep("pair");
    setSelectedPair(null);
    setSelectedExpiration(null);
    setLastSignal(null);
    setError(null);
    setProgress(0);
    setAnalysisStep(0);
    completedStepsRef.current = new Set();
  }, []);

  function handlePairSelect(p: PairInfo) {
    if (p.minTier > tier) return;
    setSelectedPair(p);
    setStep("expiration");
  }

  function handleExpirationSelect(exp: string) {
    if (!selectedPair) return;
    setSelectedExpiration(exp);
    setStep("analysis");
  }

  // Analysis step: animate + fetch
  useEffect(() => {
    if (step !== "analysis" || !selectedPair || !selectedExpiration) return;

    const totalMs = (delayConfig.min + Math.random() * (delayConfig.max - delayConfig.min)) * 1000;
    const startTime = Date.now();
    let cancelled = false;
    completedStepsRef.current = new Set();

    const stepDuration = totalMs / ANALYSIS_STEPS.length;

    // Progress + step advancement
    const progressInterval = setInterval(() => {
      if (cancelled) return;
      const elapsed = Date.now() - startTime;
      const pct = Math.min(97, (elapsed / totalMs) * 100);
      setProgress(pct);

      const currentStep = Math.min(
        ANALYSIS_STEPS.length - 1,
        Math.floor(elapsed / stepDuration),
      );
      setAnalysisStep(currentStep);

      // Mark previous steps as completed
      for (let i = 0; i < currentStep; i++) {
        completedStepsRef.current.add(i);
      }
    }, 60);

    // Fire API call immediately
    const fetchPromise = fetch("/api/signals/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pair: selectedPair.name, expiration: selectedExpiration }),
    }).then((res) => res.json().then((data) => ({ ok: res.ok, status: res.status, data })));

    const timerPromise = new Promise<void>((resolve) => setTimeout(resolve, totalMs));

    Promise.all([fetchPromise, timerPromise]).then(([res]) => {
      if (cancelled) return;
      clearInterval(progressInterval);
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
      setError("Не удалось получить сигнал. Попробуйте позже.");
      setStep("pair");
    });

    return () => {
      cancelled = true;
      clearInterval(progressInterval);
    };
  }, [step, selectedPair, selectedExpiration, router, delayConfig]);

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
          Лимит исчерпан на сегодня
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
    const tabs: PairBand[] = ["otc", "exchange", "elite"];
    const activePairs = ALL_PAIRS.filter((p) => p.band === activeTab);

    return (
      <div className="w-full max-w-2xl space-y-5">
        {error && (
          <div className="px-4 py-3 rounded-xl text-sm border border-red-500/20 bg-red-500/5 text-red-400 text-center">
            {error}
          </div>
        )}

        {/* Tab navigation — underline style */}
        <div className="flex border-b border-[var(--b-soft)]">
          {tabs.map((band) => {
            const meta = BAND_META[band];
            const locked = (ALL_PAIRS.find((p) => p.band === band)?.minTier ?? 0) > tier;
            const active = activeTab === band;

            return (
              <button
                key={band}
                onClick={() => !locked && setActiveTab(band)}
                disabled={locked}
                className="relative flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-all"
                style={{
                  color: active ? meta.color : locked ? "var(--t-3)" : "var(--t-2)",
                  cursor: locked ? "not-allowed" : "pointer",
                  opacity: locked ? 0.35 : 1,
                }}
              >
                {locked && <Lock size={12} />}
                <span>{meta.label}</span>
                <span className="text-[10px] opacity-60">
                  ({ALL_PAIRS.filter((p) => p.band === band).length})
                </span>
                {active && (
                  <span
                    className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full"
                    style={{ background: meta.color }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Header row */}
        <div className="flex items-center justify-between px-1">
          <span className="text-xs text-[var(--t-3)]">
            {BAND_META[activeTab].desc}
          </span>
          {remaining != null && (
            <span className="text-xs text-[var(--t-3)]">
              {remaining} {remaining === 1 ? "сигнал" : remaining < 5 ? "сигнала" : "сигналов"} осталось
            </span>
          )}
        </div>

        {/* Pair grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {activePairs.map((p) => {
            const locked = p.minTier > tier;
            const meta = BAND_META[p.band];
            const shortCode = p.display.split("/")[0] ?? p.display.slice(0, 3);
            return (
              <button
                key={p.name}
                onClick={() => handlePairSelect(p)}
                disabled={locked}
                className="relative group rounded-xl overflow-hidden"
                style={{
                  cursor: locked ? "not-allowed" : "pointer",
                  opacity: locked ? 0.3 : 1,
                }}
              >
                <div
                  className="flex items-center gap-3 px-3.5 py-3.5 rounded-xl border transition-all duration-200"
                  style={{
                    background: `linear-gradient(135deg, ${meta.color}0a 0%, rgba(16,12,16,0.85) 60%, ${meta.color}06 100%)`,
                    borderColor: `${meta.color}15`,
                  }}
                  onMouseEnter={(e) => {
                    if (locked) return;
                    e.currentTarget.style.borderColor = `${meta.color}45`;
                    e.currentTarget.style.background = `linear-gradient(135deg, ${meta.color}14 0%, rgba(20,16,24,0.9) 50%, ${meta.color}0c 100%)`;
                    e.currentTarget.style.boxShadow = `0 4px 24px ${meta.color}12`;
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = `${meta.color}15`;
                    e.currentTarget.style.background = `linear-gradient(135deg, ${meta.color}0a 0%, rgba(16,12,16,0.85) 60%, ${meta.color}06 100%)`;
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  {/* Pair icon — placeholder for future pair images */}
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0 relative overflow-hidden"
                    style={{
                      background: `linear-gradient(145deg, ${meta.color}25, ${meta.color}10)`,
                      color: meta.color,
                      fontFamily: "var(--font-jetbrains)",
                      boxShadow: `inset 0 1px 0 ${meta.color}20, 0 0 12px ${meta.color}08`,
                    }}
                  >
                    {/* Decorative corner shine */}
                    <div
                      className="absolute -top-2 -right-2 w-5 h-5 rounded-full opacity-40"
                      style={{ background: `radial-gradient(circle, ${meta.color}40, transparent 70%)` }}
                    />
                    {shortCode}
                  </div>

                  {/* Text */}
                  <div className="flex flex-col items-start min-w-0 flex-1">
                    <span
                      className="font-semibold text-[13px] text-[var(--t-1)] truncate w-full group-hover:text-[var(--brand-gold-bright)] transition-colors"
                      style={{ fontFamily: "var(--font-jetbrains)" }}
                    >
                      {p.display}
                    </span>
                    {p.flag && (
                      <span className="text-[9px] font-medium uppercase tracking-wider mt-0.5" style={{ color: `${meta.color}99` }}>
                        {p.flag}
                      </span>
                    )}
                  </div>

                  <ChevronRight
                    size={14}
                    className="ml-auto shrink-0 opacity-0 group-hover:opacity-50 transition-opacity"
                    style={{ color: meta.color }}
                  />
                </div>

                {locked && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-[var(--bg-0)]/50 backdrop-blur-[2px]">
                    <Lock size={15} className="text-[var(--t-3)]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ─── Render: Step 2 — Select expiration ───
  if (step === "expiration" && selectedPair) {
    const exps = EXPIRATIONS[selectedPair.band];
    const bandMeta = BAND_META[selectedPair.band];

    return (
      <div className="w-full max-w-2xl space-y-5">
        {/* Header with back + selected pair */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors hover:bg-[var(--bg-2)]"
            style={{ color: "var(--t-2)" }}
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
              style={{ background: bandMeta.bg, color: bandMeta.color, fontFamily: "var(--font-jetbrains)" }}
            >
              {selectedPair.display.slice(0, 2)}
            </div>
            <div>
              <span className="font-semibold text-sm" style={{ fontFamily: "var(--font-jetbrains)" }}>
                {selectedPair.display}
              </span>
              {selectedPair.flag && (
                <span
                  className="ml-2 text-[9px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wider"
                  style={{ color: bandMeta.color, background: bandMeta.bg }}
                >
                  {selectedPair.flag}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Expiration heading */}
        <p className="text-sm text-[var(--t-2)]">Выберите время экспирации</p>

        {/* Expiration cards */}
        <div className="grid grid-cols-2 gap-3">
          {exps.map((exp) => (
            <button
              key={exp.value}
              onClick={() => handleExpirationSelect(exp.value)}
              className="group relative rounded-xl border px-5 py-5 text-center transition-all hover:border-[var(--brand-gold)]/50 hover:shadow-[0_0_24px_rgba(212,160,23,0.08)]"
              style={{
                background: "var(--bg-1)",
                borderColor: "var(--b-soft)",
              }}
            >
              <div className="flex items-center justify-center gap-2 mb-1">
                <Clock size={16} className="text-[var(--brand-gold)] opacity-60 group-hover:opacity-100 transition-opacity" />
              </div>
              <div
                className="text-xl font-bold group-hover:text-[var(--brand-gold)] transition-colors"
                style={{ fontFamily: "var(--font-jetbrains)" }}
              >
                {exp.label}
              </div>
              <div className="text-[10px] text-[var(--t-3)] mt-0.5 uppercase tracking-wider">
                экспирация
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ─── Render: Step 3 — Analysis animation ───
  if (step === "analysis") {
    return (
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div
            className="text-sm text-[var(--t-2)] mb-1"
            style={{ fontFamily: "var(--font-jetbrains)" }}
          >
            {selectedPair?.display}
            {selectedPair?.flag ? ` (${selectedPair.flag})` : ""}
            {" / "}
            {selectedExpiration}
          </div>
          <h3 className="text-lg font-semibold text-[var(--t-1)]">
            Анализ в процессе
          </h3>
        </div>

        {/* Steps list */}
        <div
          className="rounded-2xl border p-5 space-y-3 mb-4"
          style={{ background: "var(--bg-1)", borderColor: "var(--b-soft)" }}
        >
          {ANALYSIS_STEPS.map((s, i) => {
            const isActive = i === analysisStep;
            const isDone = i < analysisStep || progress >= 100;
            const Icon = s.icon;

            return (
              <div
                key={i}
                className="flex items-center gap-3 py-1 transition-all duration-300"
                style={{ opacity: isDone ? 0.5 : isActive ? 1 : 0.25 }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300"
                  style={{
                    background: isActive
                      ? "rgba(212,160,23,0.15)"
                      : isDone
                        ? "rgba(142,224,107,0.10)"
                        : "var(--bg-2)",
                    color: isActive
                      ? "var(--brand-gold)"
                      : isDone
                        ? "var(--green)"
                        : "var(--t-3)",
                  }}
                >
                  {isDone ? (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2.5 7L5.5 10L11.5 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <Icon size={15} className={isActive ? "animate-pulse" : ""} />
                  )}
                </div>
                <span
                  className="text-sm transition-colors duration-300"
                  style={{
                    color: isActive ? "var(--t-1)" : isDone ? "var(--t-2)" : "var(--t-3)",
                    fontWeight: isActive ? 600 : 400,
                  }}
                >
                  {s.text}
                </span>
                {isActive && (
                  <div className="ml-auto flex gap-0.5">
                    <div className="w-1 h-1 rounded-full bg-[var(--brand-gold)] animate-pulse" />
                    <div className="w-1 h-1 rounded-full bg-[var(--brand-gold)] animate-pulse" style={{ animationDelay: "0.2s" }} />
                    <div className="w-1 h-1 rounded-full bg-[var(--brand-gold)] animate-pulse" style={{ animationDelay: "0.4s" }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="w-full">
          <div className="h-1.5 rounded-full bg-[var(--bg-2)] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-200 ease-out"
              style={{
                width: `${progress}%`,
                background: progress >= 100
                  ? "var(--green)"
                  : "linear-gradient(90deg, var(--brand-gold-deep), var(--brand-gold-bright))",
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  // ─── Render: Step 4 — Show signal result ───
  if (step === "result" && lastSignal) {
    const isOtc = lastSignal.tier === "otc";
    const hasChart = !isOtc && lastSignal.chartData && lastSignal.chartData.candles.length > 0;

    return (
      <div className="w-full max-w-2xl space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
        {/* OTC → decorative visual, non-OTC → chart card */}
        {isOtc ? (
          <OtcSignalVisual
            pair={lastSignal.pair}
            direction={lastSignal.direction}
            confidence={lastSignal.confidence}
            expiration={lastSignal.expiration}
          />
        ) : (
          <div
            className="rounded-2xl border overflow-hidden w-full"
            style={{
              borderColor: `color-mix(in srgb, ${lastSignal.direction === "CALL" ? "#00e5a0" : "#ff6b3d"} 40%, transparent)`,
              background: lastSignal.direction === "CALL"
                ? "rgba(0,229,160,0.03)"
                : "rgba(255,107,61,0.03)",
            }}
          >
            <div className="px-5 py-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{
                      background: lastSignal.direction === "CALL"
                        ? "rgba(0,229,160,0.12)"
                        : "rgba(255,107,61,0.12)",
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
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className="text-xs font-semibold"
                        style={{ color: lastSignal.direction === "CALL" ? "var(--green)" : "var(--red)" }}
                      >
                        {lastSignal.direction === "CALL" ? "CALL" : "PUT"}
                      </span>
                      <span className="text-[10px] text-[var(--t-3)]">
                        {lastSignal.expiration}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Confidence */}
                <div className="text-right">
                  <div
                    className="text-2xl font-bold tabular-nums"
                    style={{ color: "var(--brand-gold)", fontFamily: "var(--font-jetbrains)" }}
                  >
                    {lastSignal.confidence}%
                  </div>
                  <div className="text-[10px] text-[var(--t-3)] uppercase tracking-wider">
                    Точность
                  </div>
                </div>
              </div>

              {/* Chart */}
              {hasChart && lastSignal.chartData && (
                <div className="mb-3">
                  <MiniChart
                    candles={lastSignal.chartData.candles}
                    direction={lastSignal.direction}
                    support={lastSignal.chartData.levels.support}
                    resistance={lastSignal.chartData.levels.resistance}
                  />
                  <div className="flex gap-4 mt-2 text-[10px] text-[var(--t-3)]" style={{ fontFamily: "var(--font-jetbrains)" }}>
                    <span>RSI <span className="text-[var(--t-2)]">{lastSignal.chartData.indicators.rsi}</span></span>
                    <span>EMA20 <span className="text-[var(--t-2)]">{lastSignal.chartData.indicators.ema20.toFixed(4)}</span></span>
                    <span>EMA50 <span className="text-[var(--t-2)]">{lastSignal.chartData.indicators.ema50.toFixed(4)}</span></span>
                  </div>
                </div>
              )}

              {/* Entry price for non-OTC */}
              {lastSignal.entryPrice != null && (
                <div
                  className="flex items-center gap-2 text-xs text-[var(--t-2)] mb-3 px-3 py-2 rounded-lg"
                  style={{ background: "rgba(212,160,23,0.06)", fontFamily: "var(--font-jetbrains)" }}
                >
                  <Target size={12} className="text-[var(--brand-gold)]" />
                  Вход: <span className="text-[var(--brand-gold)] font-semibold">{lastSignal.entryPrice.toFixed(5)}</span>
                </div>
              )}

              {/* Analysis */}
              {lastSignal.analysis && (
                <div
                  className="rounded-xl px-4 py-3 text-[12px] leading-relaxed text-[var(--t-2)] whitespace-pre-line"
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--b-soft)" }}
                >
                  <div className="text-[10px] uppercase tracking-wider text-[var(--t-3)] font-semibold mb-1.5">
                    Аналитика
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
          className="w-full h-12 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90"
          style={{
            background: "linear-gradient(135deg, var(--brand-gold-deep), var(--brand-gold-bright))",
            color: "#1a1208",
          }}
        >
          <RefreshCw size={15} />
          Получить новый сигнал
        </button>
      </div>
    );
  }

  return null;
}
