"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowDownRight,
  Lock,
  Clock,
  Search,
  BarChart3,
  Shield,
  Target,
  Activity,
  RefreshCw,
} from "lucide-react";
import { TmaShell, type TmaUser } from "../_components/TmaShell";
import { useTma } from "../_components/TmaProvider";

// ─── Types ───

type PairBand = "otc" | "exchange" | "elite";

type PairInfo = {
  name: string;
  display: string;
  flag: string;
  band: PairBand;
  minTier: number;
};

type GeneratedSignal = {
  id: string;
  pair: string;
  direction: "CALL" | "PUT";
  expiration: string;
  confidence: number;
  tier: string;
  analysis: string | null;
  entryPrice: number | null;
  createdAt: string;
};

// ─── Pair data (same as website SignalRequestButton) ───

const ALL_PAIRS: PairInfo[] = [
  // OTC Currencies (tier 0)
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

  // Exchange (tier 1)
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

  // Elite (tier 2)
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

const PAIR_PAYOUTS: Record<string, number> = {
  "EUR/USD (OTC)": 76, "GBP/USD (OTC)": 92, "USD/JPY (OTC)": 33,
  "AUD/USD (OTC)": 56, "EUR/GBP (OTC)": 32, "USD/CHF (OTC)": 85,
  "NZD/USD (OTC)": 92, "EUR/JPY (OTC)": 49, "AUD/CHF (OTC)": 72,
  "AUD/NZD (OTC)": 69, "EUR/CHF (OTC)": 57, "GBP/JPY (OTC)": 49,
  "USD/CAD (OTC)": 82, "CAD/JPY (OTC)": 65, "GBP/AUD (OTC)": 92,
  "EUR/NZD (OTC)": 47,
  "Bitcoin (OTC)": 92, "Ethereum (OTC)": 92, "Solana (OTC)": 80,
  "Dogecoin (OTC)": 92, "Cardano (OTC)": 92, "Toncoin (OTC)": 66,
  "BNB (OTC)": 71, "Litecoin (OTC)": 92,
  "Gold (OTC)": 80, "Silver (OTC)": 80, "Brent Oil (OTC)": 80, "WTI Oil (OTC)": 80,
  "Apple (OTC)": 92, "Tesla (OTC)": 88, "Amazon (OTC)": 84,
  "Microsoft (OTC)": 55, "Meta (OTC)": 66, "Netflix (OTC)": 62,
  "S&P 500 (OTC)": 45, "NASDAQ 100 (OTC)": 45, "Dow Jones (OTC)": 45,
  "EUR/USD": 82, "GBP/USD": 85, "USD/JPY": 43, "AUD/USD": 38,
  "EUR/GBP": 58, "USD/CHF": 75, "USD/CAD": 87, "EUR/JPY": 77,
  "GBP/JPY": 83, "EUR/CHF": 85, "AUD/CAD": 62, "EUR/AUD": 32,
  "GBP/AUD": 77, "AUD/JPY": 45, "CAD/JPY": 72, "CHF/JPY": 76,
  "AAPL": 92, "TSLA": 88, "AMZN": 84, "MSFT": 55, "META": 66,
  "NFLX": 62, "NVDA": 80, "GOLD": 80, "SILVER": 80,
  "BTC/USD": 15, "ETH/USD": 80, "SOL/USD": 80, "SP500": 45, "US100": 45,
};

const EXPIRATIONS: Record<PairBand, { value: string; label: string }[]> = {
  otc: [
    { value: "30s", label: "30 сек" },
    { value: "60s", label: "1 мин" },
    { value: "5m", label: "5 мин" },
  ],
  exchange: [
    { value: "60s", label: "1 мин" },
    { value: "5m", label: "5 мин" },
    { value: "15m", label: "15 мин" },
    { value: "1h", label: "1 час" },
  ],
  elite: [
    { value: "60s", label: "1 мин" },
    { value: "5m", label: "5 мин" },
    { value: "15m", label: "15 мин" },
    { value: "1h", label: "1 час" },
  ],
};

const BAND_META: Record<PairBand, { label: string; color: string }> = {
  otc: { label: "OTC", color: "#8888ff" },
  exchange: { label: "Биржевые", color: "#8ee06b" },
  elite: { label: "Elite", color: "#d4a017" },
};

const FLAG_LABELS: Record<string, string> = {
  OTC: "Валюты",
  Crypto: "Крипто",
  Commodity: "Товары",
  Stock: "Акции",
  Index: "Индексы",
  "": "Форекс",
};

const ANALYSIS_STEPS = [
  { icon: Search, text: "Сканируем рынок" },
  { icon: BarChart3, text: "Анализ индикаторов" },
  { icon: Target, text: "Точка входа" },
  { icon: Shield, text: "Оценка рисков" },
  { icon: Activity, text: "Формируем сигнал" },
];

function getPayoutColor(pct: number): string {
  if (pct >= 80) return "#8ee06b";
  if (pct >= 60) return "#e6b840";
  if (pct >= 40) return "#c4b496";
  return "#ff6b3d";
}

function groupByFlag(pairs: PairInfo[]): { flag: string; label: string; items: PairInfo[] }[] {
  const map = new Map<string, PairInfo[]>();
  for (const p of pairs) {
    const key = p.flag;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(p);
  }
  return Array.from(map.entries()).map(([flag, items]) => ({
    flag,
    label: FLAG_LABELS[flag] ?? flag,
    items,
  }));
}

// ─── Steps ───

type Step = "pair" | "expiration" | "analysis" | "result";

// ─── Page ───

export default function TmaSignalsPage() {
  return <TmaShell>{(user) => <SignalsContent user={user} />}</TmaShell>;
}

function SignalsContent({ user }: { user: TmaUser }) {
  const { tmaFetch } = useTma();
  const tier = user.tier;

  const [step, setStep] = useState<Step>("pair");
  const [activeTab, setActiveTab] = useState<PairBand>("otc");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedPair, setSelectedPair] = useState<PairInfo | null>(null);
  const [selectedExpiration, setSelectedExpiration] = useState<string | null>(null);
  const [lastSignal, setLastSignal] = useState<GeneratedSignal | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const completedRef = useRef<Set<number>>(new Set());

  const reset = useCallback(() => {
    setStep("pair");
    setSelectedPair(null);
    setSelectedExpiration(null);
    setLastSignal(null);
    setError(null);
    setProgress(0);
    setAnalysisStep(0);
    completedRef.current = new Set();
  }, []);

  // Filtered pairs
  const tabPairs = ALL_PAIRS.filter((p) => p.band === activeTab);
  const categories = Array.from(new Set(tabPairs.map((p) => p.flag)));
  const filteredPairs = activeCategory !== null
    ? tabPairs.filter((p) => p.flag === activeCategory)
    : tabPairs;
  const groups = groupByFlag(filteredPairs);

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

  // Analysis: animate + fetch
  useEffect(() => {
    if (step !== "analysis" || !selectedPair || !selectedExpiration) return;

    const totalMs = (3 + Math.random() * 4) * 1000;
    const startTime = Date.now();
    let cancelled = false;
    completedRef.current = new Set();
    const stepDuration = totalMs / ANALYSIS_STEPS.length;

    const interval = setInterval(() => {
      if (cancelled) return;
      const elapsed = Date.now() - startTime;
      setProgress(Math.min(97, (elapsed / totalMs) * 100));
      const cs = Math.min(ANALYSIS_STEPS.length - 1, Math.floor(elapsed / stepDuration));
      setAnalysisStep(cs);
    }, 60);

    const fetchPromise = tmaFetch("/api/tma/signal-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pair: selectedPair.name, expiration: selectedExpiration }),
    }).then(async (res) => {
      const data = await res.json();
      return { ok: res.ok, status: res.status, data };
    });

    const timerPromise = new Promise<void>((r) => setTimeout(r, totalMs));

    Promise.all([fetchPromise, timerPromise])
      .then(([res]) => {
        if (cancelled) return;
        clearInterval(interval);
        setProgress(100);
        if (!res.ok) {
          setError(res.data.error ?? `Ошибка ${res.status}`);
          setStep("pair");
        } else {
          setLastSignal(res.data.signal ?? res.data);
          setStep("result");
        }
      })
      .catch(() => {
        if (cancelled) return;
        clearInterval(interval);
        setError("Не удалось получить сигнал");
        setStep("pair");
      });

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [step, selectedPair, selectedExpiration, tmaFetch]);

  // ─── ANALYSIS VIEW ───
  if (step === "analysis") {
    return (
      <main className="max-w-md mx-auto p-4 pt-6">
        <div className="text-center mb-4">
          <div className="text-xs text-[var(--t-3)]">
            {selectedPair?.display} / {selectedExpiration}
          </div>
          <h2 className="text-base font-bold text-[var(--t-1)] mt-1">Анализ</h2>
        </div>
        <div className="rounded-2xl border border-[var(--b-soft)] bg-[var(--bg-1)] p-4 space-y-2.5 mb-4">
          {ANALYSIS_STEPS.map((s, i) => {
            const isActive = i === analysisStep;
            const isDone = i < analysisStep || progress >= 100;
            const Icon = s.icon;
            return (
              <div
                key={i}
                className="flex items-center gap-2.5 transition-all"
                style={{ opacity: isDone ? 0.45 : isActive ? 1 : 0.2 }}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    background: isActive ? "rgba(212,160,23,0.15)" : isDone ? "rgba(142,224,107,0.10)" : "var(--bg-2)",
                    color: isActive ? "var(--brand-gold)" : isDone ? "var(--green)" : "var(--t-3)",
                  }}
                >
                  {isDone ? (
                    <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                      <path d="M2.5 7L5.5 10L11.5 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <Icon size={13} className={isActive ? "animate-pulse" : ""} />
                  )}
                </div>
                <span className="text-xs" style={{ color: isActive ? "var(--t-1)" : "var(--t-3)", fontWeight: isActive ? 600 : 400 }}>
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
        <div className="h-1 rounded-full bg-[var(--bg-2)] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-200"
            style={{
              width: `${progress}%`,
              background: progress >= 100 ? "var(--green)" : "linear-gradient(90deg, var(--brand-gold-deep), var(--brand-gold-bright))",
            }}
          />
        </div>
      </main>
    );
  }

  // ─── RESULT VIEW ───
  if (step === "result" && lastSignal) {
    const isCall = lastSignal.direction === "CALL";
    return (
      <main className="max-w-md mx-auto p-4 pt-6 space-y-3">
        <div
          className="rounded-2xl border overflow-hidden"
          style={{
            borderColor: isCall ? "rgba(0,229,160,0.3)" : "rgba(255,107,61,0.3)",
            background: isCall ? "rgba(0,229,160,0.04)" : "rgba(255,107,61,0.04)",
          }}
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: isCall ? "rgba(0,229,160,0.12)" : "rgba(255,107,61,0.12)",
                    color: isCall ? "var(--green)" : "var(--red)",
                  }}
                >
                  {isCall ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                </div>
                <div>
                  <div className="text-base font-bold text-[var(--t-1)]">{lastSignal.pair}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-semibold" style={{ color: isCall ? "var(--green)" : "var(--red)" }}>
                      {lastSignal.direction}
                    </span>
                    <span className="text-[10px] text-[var(--t-3)]">{lastSignal.expiration}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold tabular-nums" style={{ color: "var(--brand-gold)" }}>
                  {lastSignal.confidence}%
                </div>
                <div className="text-[9px] text-[var(--t-3)] uppercase tracking-wider">Точность</div>
              </div>
            </div>

            {lastSignal.entryPrice != null && (
              <div className="flex items-center gap-2 text-xs text-[var(--t-2)] px-3 py-2 rounded-lg" style={{ background: "rgba(212,160,23,0.06)" }}>
                <Target size={11} className="text-[var(--brand-gold)]" />
                Вход: <span className="text-[var(--brand-gold)] font-semibold">{lastSignal.entryPrice.toFixed(5)}</span>
              </div>
            )}

            {lastSignal.analysis && (
              <div className="mt-3 rounded-xl px-3 py-2.5 text-[11px] leading-relaxed text-[var(--t-2)]" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--b-soft)" }}>
                <div className="text-[9px] uppercase tracking-wider text-[var(--t-3)] font-semibold mb-1">Аналитика</div>
                {lastSignal.analysis}
              </div>
            )}
          </div>
        </div>

        <button
          onClick={reset}
          className="w-full h-11 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
          style={{ background: "linear-gradient(135deg, var(--brand-gold-deep), var(--brand-gold-bright))", color: "#1a1208" }}
        >
          <RefreshCw size={14} />
          Новый сигнал
        </button>
      </main>
    );
  }

  // ─── EXPIRATION VIEW ───
  if (step === "expiration" && selectedPair) {
    const exps = EXPIRATIONS[selectedPair.band];
    return (
      <main className="max-w-md mx-auto p-4 pt-6">
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={() => { setSelectedPair(null); setStep("pair"); }}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-[var(--b-soft)] text-[var(--t-2)]"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="text-sm font-bold text-[var(--t-1)]">{selectedPair.display}</div>
            {selectedPair.flag && (
              <span className="text-[9px] uppercase tracking-wider text-[var(--t-3)]">{selectedPair.flag}</span>
            )}
          </div>
        </div>

        <p className="text-xs text-[var(--t-3)] mb-3">Время экспирации</p>

        <div className="space-y-1.5">
          {exps.map((exp) => (
            <button
              key={exp.value}
              onClick={() => handleExpirationSelect(exp.value)}
              className="flex items-center gap-2.5 w-full px-4 py-3 rounded-xl border border-[var(--b-soft)] bg-[var(--bg-1)] active:bg-[var(--bg-2)] transition-colors text-left"
            >
              <Clock size={14} className="text-[var(--t-3)] shrink-0" />
              <span className="text-sm font-bold text-[var(--t-1)]">{exp.label}</span>
            </button>
          ))}
        </div>
      </main>
    );
  }

  // ─── PAIR SELECTION VIEW ───
  const tabs: PairBand[] = ["otc", "exchange", "elite"];

  return (
    <main className="max-w-md mx-auto p-4 pt-2 space-y-3">
      <h1 className="text-base font-bold text-[var(--t-1)]">Выбери пару</h1>

      {error && (
        <div className="text-xs text-center py-2 px-3 rounded-lg border border-[var(--red)]/20 bg-[var(--red)]/5 text-[var(--red)]">
          {error}
        </div>
      )}

      {/* Tab bar */}
      <div className="flex rounded-xl border border-[var(--b-soft)] overflow-hidden bg-[var(--bg-1)]">
        {tabs.map((band) => {
          const bm = BAND_META[band];
          const locked = (ALL_PAIRS.find((p) => p.band === band)?.minTier ?? 0) > tier;
          const active = activeTab === band;
          return (
            <button
              key={band}
              onClick={() => { if (!locked) { setActiveTab(band); setActiveCategory(null); } }}
              disabled={locked}
              className="flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-1 transition-all"
              style={{
                color: active ? bm.color : locked ? "var(--t-3)" : "var(--t-2)",
                background: active ? `${bm.color}12` : "transparent",
                opacity: locked ? 0.35 : 1,
                borderBottom: active ? `2px solid ${bm.color}` : "2px solid transparent",
              }}
            >
              {locked && <Lock size={10} />}
              {bm.label}
            </button>
          );
        })}
      </div>

      {/* Category chips */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveCategory(null)}
          className="shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors"
          style={{
            background: activeCategory === null ? "var(--brand-gold)" : "var(--bg-1)",
            color: activeCategory === null ? "#1a1208" : "var(--t-2)",
            border: activeCategory === null ? "none" : "1px solid var(--b-soft)",
          }}
        >
          Все
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
            className="shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors"
            style={{
              background: activeCategory === cat ? "var(--brand-gold)" : "var(--bg-1)",
              color: activeCategory === cat ? "#1a1208" : "var(--t-2)",
              border: activeCategory === cat ? "none" : "1px solid var(--b-soft)",
            }}
          >
            {FLAG_LABELS[cat] ?? cat}
          </button>
        ))}
      </div>

      {/* Pair grid */}
      {groups.map((group) => (
        <div key={group.flag}>
          {groups.length > 1 && (
            <div className="text-[10px] uppercase tracking-wider text-[var(--t-3)] font-semibold mb-1.5 mt-2">
              {group.label}
            </div>
          )}
          <div className="grid grid-cols-2 gap-1.5">
            {group.items.map((p) => {
              const locked = p.minTier > tier;
              const payout = PAIR_PAYOUTS[p.name];
              return (
                <button
                  key={p.name}
                  onClick={() => handlePairSelect(p)}
                  disabled={locked}
                  className="relative flex items-center gap-2 px-3 py-2.5 rounded-xl border border-[var(--b-soft)] bg-[var(--bg-1)] active:bg-[var(--bg-2)] transition-colors text-left"
                  style={{ opacity: locked ? 0.3 : 1 }}
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-[var(--t-1)] truncate">{p.display}</div>
                    {payout != null && (
                      <div className="text-[10px] font-semibold mt-0.5" style={{ color: getPayoutColor(payout) }}>
                        +{payout}%
                      </div>
                    )}
                  </div>
                  {locked && (
                    <div className="absolute inset-0 rounded-xl flex items-center justify-center bg-black/50 backdrop-blur-[1px]">
                      <Lock size={12} className="text-[var(--t-3)]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </main>
  );
}
