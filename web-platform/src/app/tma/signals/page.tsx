"use client";

import { useState, useMemo, useCallback } from "react";
import {
  ArrowUpRight,
  ArrowDownRight,
  Lock,
  Clock,
  RefreshCw,
  Target,
} from "lucide-react";
import { TmaShell, type TmaUser } from "../_components/TmaShell";
import { useTma } from "../_components/TmaProvider";

// ─── Types ───

type PairBand = "otc" | "exchange" | "elite";
type PairCategory = "forex" | "crypto" | "stocks" | "commodities" | "indices";

type PairInfo = {
  name: string;
  display: string;
  category: PairCategory;
  band: PairBand;
  payout: number;
  minTier: number;
};

type Step = "pick" | "analyzing" | "result";

type SignalResult = {
  pair: string;
  direction: "CALL" | "PUT";
  confidence: number;
  expiration: string;
  payout: number;
  entryPrice: number;
  entryTime: string | null;
  analysis: string | null;
};

// ─── Pair data ───

const ALL_PAIRS: PairInfo[] = [
  // OTC Forex (16)
  { name: "EUR/USD (OTC)", display: "EUR/USD", category: "forex", band: "otc", payout: 76, minTier: 0 },
  { name: "GBP/USD (OTC)", display: "GBP/USD", category: "forex", band: "otc", payout: 92, minTier: 0 },
  { name: "USD/JPY (OTC)", display: "USD/JPY", category: "forex", band: "otc", payout: 33, minTier: 0 },
  { name: "AUD/USD (OTC)", display: "AUD/USD", category: "forex", band: "otc", payout: 56, minTier: 0 },
  { name: "EUR/GBP (OTC)", display: "EUR/GBP", category: "forex", band: "otc", payout: 32, minTier: 0 },
  { name: "USD/CHF (OTC)", display: "USD/CHF", category: "forex", band: "otc", payout: 85, minTier: 0 },
  { name: "NZD/USD (OTC)", display: "NZD/USD", category: "forex", band: "otc", payout: 92, minTier: 0 },
  { name: "EUR/JPY (OTC)", display: "EUR/JPY", category: "forex", band: "otc", payout: 49, minTier: 0 },
  { name: "AUD/CHF (OTC)", display: "AUD/CHF", category: "forex", band: "otc", payout: 72, minTier: 0 },
  { name: "AUD/NZD (OTC)", display: "AUD/NZD", category: "forex", band: "otc", payout: 69, minTier: 0 },
  { name: "EUR/CHF (OTC)", display: "EUR/CHF", category: "forex", band: "otc", payout: 57, minTier: 0 },
  { name: "GBP/JPY (OTC)", display: "GBP/JPY", category: "forex", band: "otc", payout: 49, minTier: 0 },
  { name: "USD/CAD (OTC)", display: "USD/CAD", category: "forex", band: "otc", payout: 82, minTier: 0 },
  { name: "CAD/JPY (OTC)", display: "CAD/JPY", category: "forex", band: "otc", payout: 65, minTier: 0 },
  { name: "GBP/AUD (OTC)", display: "GBP/AUD", category: "forex", band: "otc", payout: 92, minTier: 0 },
  { name: "EUR/NZD (OTC)", display: "EUR/NZD", category: "forex", band: "otc", payout: 47, minTier: 0 },
  // OTC Crypto (14)
  { name: "Bitcoin ETF (OTC)", display: "Bitcoin ETF", category: "crypto", band: "otc", payout: 92, minTier: 0 },
  { name: "Bitcoin (OTC)", display: "BTC", category: "crypto", band: "otc", payout: 92, minTier: 0 },
  { name: "Litecoin (OTC)", display: "LTC", category: "crypto", band: "otc", payout: 92, minTier: 0 },
  { name: "Dogecoin (OTC)", display: "DOGE", category: "crypto", band: "otc", payout: 83, minTier: 0 },
  { name: "Polygon (OTC)", display: "MATIC", category: "crypto", band: "otc", payout: 83, minTier: 0 },
  { name: "Cardano (OTC)", display: "ADA", category: "crypto", band: "otc", payout: 74, minTier: 0 },
  { name: "Polkadot (OTC)", display: "DOT", category: "crypto", band: "otc", payout: 74, minTier: 0 },
  { name: "Chainlink (OTC)", display: "LINK", category: "crypto", band: "otc", payout: 71, minTier: 0 },
  { name: "BNB (OTC)", display: "BNB", category: "crypto", band: "otc", payout: 69, minTier: 0 },
  { name: "Avalanche (OTC)", display: "AVAX", category: "crypto", band: "otc", payout: 53, minTier: 0 },
  { name: "Solana (OTC)", display: "SOL", category: "crypto", band: "otc", payout: 49, minTier: 0 },
  { name: "TRON (OTC)", display: "TRX", category: "crypto", band: "otc", payout: 44, minTier: 0 },
  { name: "Ethereum (OTC)", display: "ETH", category: "crypto", band: "otc", payout: 37, minTier: 0 },
  { name: "Toncoin (OTC)", display: "TON", category: "crypto", band: "otc", payout: 20, minTier: 0 },
  // OTC Commodities (4)
  { name: "Gold (OTC)", display: "Gold", category: "commodities", band: "otc", payout: 80, minTier: 0 },
  { name: "Silver (OTC)", display: "Silver", category: "commodities", band: "otc", payout: 80, minTier: 0 },
  { name: "Brent Oil (OTC)", display: "Brent Oil", category: "commodities", band: "otc", payout: 80, minTier: 0 },
  { name: "WTI Oil (OTC)", display: "WTI Oil", category: "commodities", band: "otc", payout: 80, minTier: 0 },
  // OTC Stocks (6)
  { name: "Apple (OTC)", display: "AAPL", category: "stocks", band: "otc", payout: 92, minTier: 0 },
  { name: "Tesla (OTC)", display: "TSLA", category: "stocks", band: "otc", payout: 88, minTier: 0 },
  { name: "Amazon (OTC)", display: "AMZN", category: "stocks", band: "otc", payout: 84, minTier: 0 },
  { name: "Microsoft (OTC)", display: "MSFT", category: "stocks", band: "otc", payout: 55, minTier: 0 },
  { name: "Meta (OTC)", display: "META", category: "stocks", band: "otc", payout: 66, minTier: 0 },
  { name: "Netflix (OTC)", display: "NFLX", category: "stocks", band: "otc", payout: 62, minTier: 0 },
  // OTC Indices (3)
  { name: "S&P 500 (OTC)", display: "S&P 500", category: "indices", band: "otc", payout: 45, minTier: 0 },
  { name: "NASDAQ 100 (OTC)", display: "NASDAQ", category: "indices", band: "otc", payout: 45, minTier: 0 },
  { name: "Dow Jones (OTC)", display: "Dow Jones", category: "indices", band: "otc", payout: 45, minTier: 0 },

  // Exchange Forex (16)
  { name: "EUR/USD", display: "EUR/USD", category: "forex", band: "exchange", payout: 82, minTier: 1 },
  { name: "GBP/USD", display: "GBP/USD", category: "forex", band: "exchange", payout: 85, minTier: 1 },
  { name: "USD/JPY", display: "USD/JPY", category: "forex", band: "exchange", payout: 43, minTier: 1 },
  { name: "AUD/USD", display: "AUD/USD", category: "forex", band: "exchange", payout: 38, minTier: 1 },
  { name: "EUR/GBP", display: "EUR/GBP", category: "forex", band: "exchange", payout: 58, minTier: 1 },
  { name: "USD/CHF", display: "USD/CHF", category: "forex", band: "exchange", payout: 75, minTier: 1 },
  { name: "USD/CAD", display: "USD/CAD", category: "forex", band: "exchange", payout: 87, minTier: 1 },
  { name: "EUR/JPY", display: "EUR/JPY", category: "forex", band: "exchange", payout: 77, minTier: 1 },
  { name: "GBP/JPY", display: "GBP/JPY", category: "forex", band: "exchange", payout: 83, minTier: 1 },
  { name: "EUR/CHF", display: "EUR/CHF", category: "forex", band: "exchange", payout: 85, minTier: 1 },
  { name: "AUD/CAD", display: "AUD/CAD", category: "forex", band: "exchange", payout: 62, minTier: 1 },
  { name: "EUR/AUD", display: "EUR/AUD", category: "forex", band: "exchange", payout: 32, minTier: 1 },
  { name: "GBP/AUD", display: "GBP/AUD", category: "forex", band: "exchange", payout: 77, minTier: 1 },
  { name: "AUD/JPY", display: "AUD/JPY", category: "forex", band: "exchange", payout: 45, minTier: 1 },
  { name: "CAD/JPY", display: "CAD/JPY", category: "forex", band: "exchange", payout: 72, minTier: 1 },
  { name: "CHF/JPY", display: "CHF/JPY", category: "forex", band: "exchange", payout: 76, minTier: 1 },

  // Elite (7 stocks, 2 commodities, 3 crypto, 2 indices)
  { name: "AAPL", display: "Apple", category: "stocks", band: "elite", payout: 92, minTier: 2 },
  { name: "TSLA", display: "Tesla", category: "stocks", band: "elite", payout: 88, minTier: 2 },
  { name: "AMZN", display: "Amazon", category: "stocks", band: "elite", payout: 84, minTier: 2 },
  { name: "MSFT", display: "Microsoft", category: "stocks", band: "elite", payout: 55, minTier: 2 },
  { name: "META", display: "Meta", category: "stocks", band: "elite", payout: 66, minTier: 2 },
  { name: "NFLX", display: "Netflix", category: "stocks", band: "elite", payout: 62, minTier: 2 },
  { name: "NVDA", display: "NVIDIA", category: "stocks", band: "elite", payout: 80, minTier: 2 },
  { name: "GOLD", display: "Gold", category: "commodities", band: "elite", payout: 80, minTier: 2 },
  { name: "SILVER", display: "Silver", category: "commodities", band: "elite", payout: 80, minTier: 2 },
  { name: "BTC/USD", display: "Bitcoin", category: "crypto", band: "elite", payout: 15, minTier: 2 },
  { name: "ETH/USD", display: "Ethereum", category: "crypto", band: "elite", payout: 80, minTier: 2 },
  { name: "SOL/USD", display: "Solana", category: "crypto", band: "elite", payout: 80, minTier: 2 },
  { name: "SP500", display: "S&P 500", category: "indices", band: "elite", payout: 45, minTier: 2 },
  { name: "US100", display: "NASDAQ", category: "indices", band: "elite", payout: 45, minTier: 2 },
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

const BANDS: { key: PairBand; label: string; minTier: number; color: string }[] = [
  { key: "otc", label: "OTC", minTier: 0, color: "#8888ff" },
  { key: "exchange", label: "Биржевые", minTier: 1, color: "#8ee06b" },
  { key: "elite", label: "Elite", minTier: 2, color: "#d4a017" },
];

const CATEGORIES: { key: PairCategory | "all"; label: string }[] = [
  { key: "all", label: "Все" },
  { key: "forex", label: "Форекс" },
  { key: "crypto", label: "Крипто" },
  { key: "stocks", label: "Акции" },
  { key: "commodities", label: "Товары" },
  { key: "indices", label: "Индексы" },
];

// ─── Pair icons ───

const CURRENCY_FLAG: Record<string, string> = {
  EUR: "eu", USD: "us", GBP: "gb", JPY: "jp", AUD: "au",
  CAD: "ca", CHF: "ch", NZD: "nz",
};

const CRYPTO_IMG: Record<string, string> = {
  "Bitcoin ETF": "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
  BTC: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
  ETH: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
  SOL: "https://assets.coingecko.com/coins/images/4128/small/solana.png",
  DOGE: "https://assets.coingecko.com/coins/images/5/small/dogecoin.png",
  MATIC: "https://assets.coingecko.com/coins/images/4713/small/polygon.png",
  ADA: "https://assets.coingecko.com/coins/images/975/small/cardano.png",
  DOT: "https://assets.coingecko.com/coins/images/12171/small/polkadot.png",
  LINK: "https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png",
  TON: "https://assets.coingecko.com/coins/images/17980/small/ton_symbol.png",
  BNB: "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png",
  LTC: "https://assets.coingecko.com/coins/images/2/small/litecoin.png",
  AVAX: "https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png",
  TRX: "https://assets.coingecko.com/coins/images/1094/small/tron-logo.png",
};

const STOCK_ICON: Record<string, string> = {
  AAPL: "https://cdn.simpleicons.org/apple/ffffff",
  Apple: "https://cdn.simpleicons.org/apple/ffffff",
  TSLA: "https://cdn.simpleicons.org/tesla/ffffff",
  Tesla: "https://cdn.simpleicons.org/tesla/ffffff",
  AMZN: "https://cdn.simpleicons.org/amazon/ffffff",
  Amazon: "https://cdn.simpleicons.org/amazon/ffffff",
  MSFT: "https://cdn.simpleicons.org/microsoft/ffffff",
  Microsoft: "https://cdn.simpleicons.org/microsoft/ffffff",
  META: "https://cdn.simpleicons.org/meta/ffffff",
  Meta: "https://cdn.simpleicons.org/meta/ffffff",
  NFLX: "https://cdn.simpleicons.org/netflix/ffffff",
  Netflix: "https://cdn.simpleicons.org/netflix/ffffff",
  NVDA: "https://cdn.simpleicons.org/nvidia/ffffff",
  NVIDIA: "https://cdn.simpleicons.org/nvidia/ffffff",
};

const COMMODITY_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  Gold: { bg: "#d4a017", color: "#1a1a1a", label: "AU" },
  Silver: { bg: "#a0a0a0", color: "#1a1a1a", label: "AG" },
  "Brent Oil": { bg: "#3a6b35", color: "#fff", label: "OIL" },
  "WTI Oil": { bg: "#4a7b45", color: "#fff", label: "WTI" },
};

const INDEX_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  "S&P 500": { bg: "#1a3c6e", color: "#fff", label: "S&P" },
  NASDAQ: { bg: "#0096d6", color: "#fff", label: "NDQ" },
  "Dow Jones": { bg: "#1a3c6e", color: "#fff", label: "DJI" },
};

function PairIconSmall({ display, size = 32 }: { display: string; size?: number }) {
  const parts = display.split("/");
  // Currency pair flags
  if (parts.length === 2 && CURRENCY_FLAG[parts[0]!] && CURRENCY_FLAG[parts[1]!]) {
    return (
      <div style={{ position: "relative", width: size + 8, height: size, flexShrink: 0 }}>
        <img src={`https://hatscripts.github.io/circle-flags/flags/${CURRENCY_FLAG[parts[0]!]}.svg`}
          alt={parts[0]} width={size} height={size}
          style={{ position: "absolute", left: 0, top: 0, borderRadius: "50%", border: "2px solid var(--bg-2)", zIndex: 2 }} />
        <img src={`https://hatscripts.github.io/circle-flags/flags/${CURRENCY_FLAG[parts[1]!]}.svg`}
          alt={parts[1]} width={size} height={size}
          style={{ position: "absolute", left: size * 0.35, top: 0, borderRadius: "50%", border: "2px solid var(--bg-2)", zIndex: 1 }} />
      </div>
    );
  }
  // Crypto
  const cryptoUrl = CRYPTO_IMG[display];
  if (cryptoUrl) {
    return <img src={cryptoUrl} alt={display} width={size} height={size} style={{ borderRadius: "50%", flexShrink: 0, background: "#222" }} />;
  }
  // Stock icon (Simple Icons CDN)
  const stockUrl = STOCK_ICON[display];
  if (stockUrl) {
    return (
      <div style={{ width: size, height: size, flexShrink: 0, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", background: "#222" }}>
        <img src={stockUrl} alt={display} width={size * 0.65} height={size * 0.65} style={{ objectFit: "contain" }} />
      </div>
    );
  }
  // Commodity
  const commodity = COMMODITY_COLORS[display];
  if (commodity) {
    return (
      <div style={{ width: size, height: size, borderRadius: 6, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 900, background: commodity.bg, color: commodity.color, border: "1px solid rgba(255,255,255,0.12)" }}>
        {commodity.label}
      </div>
    );
  }
  // Index
  const index = INDEX_COLORS[display];
  if (index) {
    return (
      <div style={{ width: size, height: size, borderRadius: 6, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 900, background: index.bg, color: index.color, border: "1px solid rgba(255,255,255,0.12)" }}>
        {index.label}
      </div>
    );
  }
  // Fallback
  return (
    <div style={{ width: size, height: size, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, background: "var(--bg-3)", color: "var(--t-2)", flexShrink: 0 }}>
      {display.slice(0, 3)}
    </div>
  );
}

// ─── Helpers ───

const ANALYSIS_STEPS = [
  "Подключение к рынку...",
  "Анализ графика...",
  "RSI + MACD проверка...",
  "Расчёт точки входа...",
  "Оценка уровней поддержки...",
  "Формирование сигнала...",
];

function getPayoutColor(pct: number): string {
  if (pct >= 80) return "#8ee06b";
  if (pct >= 60) return "#e6b840";
  if (pct >= 40) return "#c4b496";
  return "#ff6b3d";
}

// ─── Page ───

export default function TmaSignalsPage() {
  return <TmaShell>{(user) => <SignalsPicker user={user} />}</TmaShell>;
}

function SignalsPicker({ user }: { user: TmaUser }) {
  const { tmaFetch } = useTma();
  const [step, setStep] = useState<Step>("pick");
  const [activeTab, setActiveTab] = useState<PairBand>("otc");
  const [categoryFilter, setCategoryFilter] = useState<PairCategory | "all">("all");
  const [selectedPair, setSelectedPair] = useState<PairInfo | null>(null);
  const [selectedExpiration, setSelectedExpiration] = useState<string | null>(null);
  const [result, setResult] = useState<SignalResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);

  // remaining and limitReached are updated by the API response; user.tier is used for band lock UI

  const filteredPairs = useMemo(() => {
    return ALL_PAIRS
      .filter((p) => p.band === activeTab)
      .filter((p) => categoryFilter === "all" || p.category === categoryFilter)
      .sort((a, b) => b.payout - a.payout);
  }, [activeTab, categoryFilter]);

  const availableCategories = useMemo(() => {
    const cats = new Set(ALL_PAIRS.filter((p) => p.band === activeTab).map((p) => p.category));
    return CATEGORIES.filter((c) => c.key === "all" || cats.has(c.key as PairCategory));
  }, [activeTab]);

  const handleTabChange = useCallback((band: PairBand) => {
    setActiveTab(band);
    setCategoryFilter("all");
    setSelectedPair(null);
    setSelectedExpiration(null);
  }, []);

  const handlePairSelect = useCallback((pair: PairInfo) => {
    if (selectedPair?.name === pair.name) {
      setSelectedPair(null);
      setSelectedExpiration(null);
    } else {
      setSelectedPair(pair);
      setSelectedExpiration(null);
    }
  }, [selectedPair]);

  const handleGenerate = useCallback(async () => {
    if (!selectedPair || !selectedExpiration) return;
    setLoading(true);
    setErrorMsg(null);
    setStep("analyzing");
    setAnalysisStep(0);

    // Start analysis animation in parallel with API call
    const animationPromise = new Promise<void>((resolve) => {
      let step = 0;
      const interval = setInterval(() => {
        step++;
        setAnalysisStep(step);
        if (step >= ANALYSIS_STEPS.length - 1) {
          clearInterval(interval);
          resolve();
        }
      }, 500);
    });

    try {
      const [res] = await Promise.all([
        tmaFetch("/api/tma/signal-request", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ pair: selectedPair.name, tier: selectedPair.band, expiration: selectedExpiration }),
        }),
        animationPromise,
      ]);

      if (res.status === 429) {
        setLimitReached(true);
        setRemaining(0);
        setErrorMsg("Дневной лимит сигналов исчерпан");
        setStep("pick");
        return;
      }

      if (!res.ok) {
        const err = await res.json() as { error?: string };
        setErrorMsg(err.error ?? "Ошибка генерации сигнала");
        setStep("pick");
        return;
      }

      const data = await res.json() as {
        signal: {
          pair: string;
          direction: string;
          confidence: number;
          expiration: string;
          entryPrice: number | null;
        };
        access: {
          dailyLimit: number | null;
          remaining: number | null;
        };
      };

      const sig: SignalResult = {
        pair: data.signal.pair,
        direction: data.signal.direction === "PUT" ? "PUT" : "CALL",
        confidence: data.signal.confidence,
        expiration: data.signal.expiration,
        payout: selectedPair.payout,
        entryPrice: data.signal.entryPrice ?? 0,
        entryTime: (data.signal as Record<string, unknown>).entryTime as string | null ?? null,
        analysis: (data.signal as Record<string, unknown>).analysis as string | null ?? null,
      };

      setRemaining(data.access.remaining);
      if (data.access.remaining !== null && data.access.remaining <= 0) {
        setLimitReached(true);
      }
      setResult(sig);
      setStep("result");
    } catch {
      setErrorMsg("Ошибка сети. Попробуйте снова.");
      setStep("pick");
    } finally {
      setLoading(false);
    }
  }, [selectedPair, selectedExpiration, tmaFetch]);

  const handleReset = useCallback(() => {
    setStep("pick");
    setSelectedPair(null);
    setSelectedExpiration(null);
    setResult(null);
  }, []);

  // ─── Analyzing step ───
  if (step === "analyzing") {
    const progress = Math.min(100, ((analysisStep + 1) / ANALYSIS_STEPS.length) * 100);
    return (
      <main className="max-w-md mx-auto p-4 flex flex-col items-center justify-center" style={{ minHeight: "60vh" }}>
        <div className="rounded-2xl border border-[var(--b-soft)] bg-[var(--bg-1)] p-8 w-full text-center space-y-5">
          <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(212,160,23,0.1)", border: "1px solid rgba(212,160,23,0.2)" }}>
            <RefreshCw size={28} className="text-[var(--brand-gold)] animate-spin" />
          </div>
          <div>
            <div className="text-sm font-semibold text-[var(--t-1)] mb-1">Анализируем рынок</div>
            <div className="text-xs text-[var(--brand-gold)] h-4 transition-all duration-300">
              {ANALYSIS_STEPS[Math.min(analysisStep, ANALYSIS_STEPS.length - 1)]}
            </div>
          </div>
          <div className="h-1.5 rounded-full bg-[var(--bg-2)] overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progress}%`,
                background: "linear-gradient(90deg, var(--brand-gold-deep), var(--brand-gold-bright))",
              }}
            />
          </div>
        </div>
      </main>
    );
  }

  // ─── Result step ───
  if (step === "result" && result) {
    const isCall = result.direction === "CALL";
    return (
      <main className="max-w-md mx-auto p-4 space-y-4">
        <div className="rounded-2xl border border-[var(--b-soft)] bg-[var(--bg-1)] p-5">
          <div className="flex items-center gap-3 mb-4">
            <PairIconSmall display={ALL_PAIRS.find((p) => p.name === result.pair)?.display ?? result.pair} size={36} />
            <div className="flex-1 min-w-0">
              <div className="text-lg font-bold text-[var(--t-1)]">{result.pair}</div>
              <span
                className="text-xs font-semibold"
                style={{ color: isCall ? "var(--green)" : "var(--red)" }}
              >
                {result.direction}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="rounded-xl bg-[var(--bg-2)] p-3 text-center">
              <div className="text-[10px] uppercase tracking-wider text-[var(--t-3)] mb-1">Точность</div>
              <div className="text-xl font-bold text-[var(--brand-gold)]">{result.confidence}%</div>
            </div>
            <div className="rounded-xl bg-[var(--bg-2)] p-3 text-center">
              <div className="text-[10px] uppercase tracking-wider text-[var(--t-3)] mb-1">Экспирация</div>
              <div className="text-sm font-semibold text-[var(--t-1)]">{result.expiration}</div>
            </div>
            <div className="rounded-xl bg-[var(--bg-2)] p-3 text-center">
              <div className="text-[10px] uppercase tracking-wider text-[var(--t-3)] mb-1">Выплата</div>
              <div className="text-sm font-semibold" style={{ color: getPayoutColor(result.payout) }}>
                +{result.payout}%
              </div>
            </div>
          </div>

          {result.entryPrice > 0 && (
            <div className="flex items-center gap-2 text-xs text-[var(--t-2)] px-3 py-2 rounded-lg bg-[rgba(212,160,23,0.06)]">
              <Target size={12} className="text-[var(--brand-gold)]" />
              Вход: <span className="text-[var(--brand-gold)] font-semibold">{result.entryPrice.toFixed(5)}</span>
            </div>
          )}

          {result.entryTime && (
            <div className="flex items-center gap-2 text-xs text-[var(--t-2)] px-3 py-2 rounded-lg bg-[rgba(212,160,23,0.06)]">
              <Clock size={12} className="text-[var(--brand-gold)]" />
              Время входа: <span className="text-[var(--brand-gold)] font-semibold">{result.entryTime}</span>
            </div>
          )}

          {result.analysis && (
            <div className="rounded-xl px-4 py-3 text-[12px] leading-relaxed text-[var(--t-2)] mt-3"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--b-soft)" }}
            >
              <div className="text-[10px] uppercase tracking-wider text-[var(--brand-gold)] font-semibold mb-1.5">
                Аналитика
              </div>
              {result.analysis}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="w-full h-12 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          style={{
            background: "linear-gradient(135deg, var(--brand-gold-deep), var(--brand-gold-bright))",
            color: "#1a1208",
          }}
        >
          <RefreshCw size={15} />
          Ещё сигнал
        </button>
      </main>
    );
  }

  // ─── Pick step ───
  return (
    <main className="max-w-md mx-auto p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-[var(--t-1)]">Сигналы</h1>
        {remaining !== null ? (
          <span className="text-xs text-[var(--t-3)]">
            Осталось: <span className="text-[var(--brand-gold)] font-semibold">{remaining}</span>
          </span>
        ) : (
          <span className="text-xs text-[var(--brand-gold)]">Безлимит</span>
        )}
      </div>

      {errorMsg && (
        <div className="rounded-xl bg-[var(--red)]/10 border border-[var(--red)]/30 px-4 py-2.5 text-sm text-[var(--red)]">
          {errorMsg}
        </div>
      )}

      {/* Band tabs */}
      <div className="flex rounded-xl overflow-hidden border border-[var(--b-soft)]">
        {BANDS.map((b) => {
          const locked = b.minTier > user.tier;
          const active = activeTab === b.key;
          return (
            <button
              key={b.key}
              type="button"
              onClick={() => !locked && handleTabChange(b.key)}
              disabled={locked}
              className={`flex-1 py-2.5 text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
                active ? "text-[#1a1208]" : locked ? "text-[var(--t-3)] opacity-40" : "text-[var(--t-2)]"
              }`}
              style={{
                background: active ? b.color : "var(--bg-1)",
                cursor: locked ? "not-allowed" : "pointer",
              }}
            >
              {locked && <Lock size={10} />}
              {b.label}
            </button>
          );
        })}
      </div>

      {/* Category chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {availableCategories.map((c) => {
          const active = categoryFilter === c.key;
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => setCategoryFilter(c.key)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                active
                  ? "bg-[var(--brand-gold)] text-[#1a1208]"
                  : "bg-[var(--bg-2)] text-[var(--t-2)]"
              }`}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Pair list */}
      <div className="rounded-2xl border border-[var(--b-soft)] bg-[var(--bg-1)] overflow-hidden divide-y divide-[var(--b-soft)]">
        {filteredPairs.length === 0 && (
          <div className="py-8 text-center text-sm text-[var(--t-3)]">Нет пар в этой категории</div>
        )}
        {filteredPairs.map((p) => {
          const isSelected = selectedPair?.name === p.name;
          return (
            <div key={p.name}>
              <button
                type="button"
                onClick={() => handlePairSelect(p)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all active:scale-[0.99] ${
                  isSelected ? "bg-[var(--bg-2)]" : ""
                }`}
              >
                <PairIconSmall display={p.display} size={24} />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold text-[var(--t-1)] truncate block">
                    {p.display}
                  </span>
                </div>
                <span
                  className="text-xs font-bold shrink-0"
                  style={{ color: getPayoutColor(p.payout) }}
                >
                  +{p.payout}%
                </span>
              </button>

              {isSelected && (
                <div className="px-4 pb-3 space-y-2">
                  <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-[var(--t-3)]">
                    <Clock size={10} />
                    Экспирация
                  </div>
                  <div className="flex gap-2">
                    {EXPIRATIONS[p.band].map((exp) => {
                      const expActive = selectedExpiration === exp.value;
                      return (
                        <button
                          key={exp.value}
                          type="button"
                          onClick={() => setSelectedExpiration(exp.value)}
                          className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                            expActive
                              ? "bg-[var(--brand-gold)] text-[#1a1208]"
                              : "bg-[var(--bg-2)] text-[var(--t-2)]"
                          }`}
                        >
                          {exp.label}
                        </button>
                      );
                    })}
                  </div>

                  {selectedExpiration && (
                    <button
                      type="button"
                      onClick={() => { void handleGenerate(); }}
                      disabled={limitReached || loading}
                      className="w-full h-11 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
                      style={{
                        background: limitReached
                          ? "var(--bg-3)"
                          : "linear-gradient(135deg, var(--brand-gold-deep), var(--brand-gold-bright))",
                        color: limitReached ? "var(--t-3)" : "#1a1208",
                      }}
                    >
                      {loading ? (
                        <RefreshCw size={15} className="animate-spin" />
                      ) : limitReached ? (
                        "Лимит исчерпан"
                      ) : (
                        "Получить сигнал"
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
