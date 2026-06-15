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

// ─── Payout percentages ───

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

// ─── Pair icons ───

const CURRENCY_FLAG: Record<string, string> = {
  EUR: "eu", USD: "us", GBP: "gb", JPY: "jp", AUD: "au",
  CAD: "ca", CHF: "ch", NZD: "nz",
};

const CRYPTO_IMG: Record<string, string> = {
  BTC: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
  ETH: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
  SOL: "https://assets.coingecko.com/coins/images/4128/small/solana.png",
  DOGE: "https://assets.coingecko.com/coins/images/5/small/dogecoin.png",
  ADA: "https://assets.coingecko.com/coins/images/975/small/cardano.png",
  TON: "https://assets.coingecko.com/coins/images/17980/small/ton_symbol.png",
  BNB: "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png",
  LTC: "https://assets.coingecko.com/coins/images/2/small/litecoin.png",
  Bitcoin: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
  Ethereum: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
  Solana: "https://assets.coingecko.com/coins/images/4128/small/solana.png",
};

// Stock icons via Simple Icons CDN
const STOCK_ICON: Record<string, string> = {
  AAPL: "https://cdn.simpleicons.org/apple/white",
  Apple: "https://cdn.simpleicons.org/apple/white",
  TSLA: "https://cdn.simpleicons.org/tesla/white",
  Tesla: "https://cdn.simpleicons.org/tesla/white",
  AMZN: "https://cdn.simpleicons.org/amazon/white",
  Amazon: "https://cdn.simpleicons.org/amazon/white",
  MSFT: "https://cdn.simpleicons.org/microsoft/white",
  Microsoft: "https://cdn.simpleicons.org/microsoft/white",
  META: "https://cdn.simpleicons.org/meta/white",
  Meta: "https://cdn.simpleicons.org/meta/white",
  NFLX: "https://cdn.simpleicons.org/netflix/white",
  Netflix: "https://cdn.simpleicons.org/netflix/white",
  NVDA: "https://cdn.simpleicons.org/nvidia/white",
  NVIDIA: "https://cdn.simpleicons.org/nvidia/white",
};

// Inline SVG icons for commodities & indices (24x24)
const ASSET_SVG: Record<string, React.ReactElement> = {
  Gold: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M6 18L3 10H21L18 18H6Z" fill="#d4a017" />
      <path d="M6 18L3 10H21L18 18H6Z" stroke="#b8860b" strokeWidth="0.5" />
      <path d="M8 14L5.5 10H18.5L16 14H8Z" fill="#e6b840" opacity="0.5" />
      <path d="M9 7L7 10H17L15 7H9Z" fill="#d4a017" />
      <path d="M9 7L7 10H17L15 7H9Z" stroke="#b8860b" strokeWidth="0.5" />
      <path d="M10.5 8L9.5 10H14.5L13.5 8H10.5Z" fill="#e6b840" opacity="0.4" />
    </svg>
  ),
  Silver: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" fill="#a0a0a0" stroke="#808080" strokeWidth="0.5" />
      <circle cx="12" cy="12" r="7" fill="none" stroke="#c0c0c0" strokeWidth="0.5" />
      <text x="12" y="15" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#4a4a4a" fontFamily="sans-serif">Ag</text>
    </svg>
  ),
  "Brent Oil": (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 3C12 3 6 10 6 15C6 18.3 8.7 21 12 21C15.3 21 18 18.3 18 15C18 10 12 3 12 3Z" fill="#3a6b35" />
      <path d="M12 5C12 5 8 10.5 8 14.5C8 17.1 9.8 19 12 19C14.2 19 16 17.1 16 14.5C16 10.5 12 5 12 5Z" fill="#4a8b45" opacity="0.4" />
    </svg>
  ),
  "WTI Oil": (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 3C12 3 6 10 6 15C6 18.3 8.7 21 12 21C15.3 21 18 18.3 18 15C18 10 12 3 12 3Z" fill="#4a7b45" />
      <path d="M12 5C12 5 8 10.5 8 14.5C8 17.1 9.8 19 12 19C14.2 19 16 17.1 16 14.5C16 10.5 12 5 12 5Z" fill="#5a9b55" opacity="0.4" />
    </svg>
  ),
  "S&P 500": (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="20" height="20" rx="4" fill="#1a3c6e" />
      <polyline points="4,16 8,14 12,10 16,12 20,6" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="20" cy="6" r="1.5" fill="#00e5a0" />
    </svg>
  ),
  NASDAQ: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="20" height="20" rx="4" fill="#0096d6" />
      <polyline points="4,17 8,12 12,15 16,8 20,5" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="20" cy="5" r="1.5" fill="#00e5a0" />
    </svg>
  ),
  "Dow Jones": (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="20" height="20" rx="4" fill="#1a3c6e" />
      <polyline points="4,15 8,13 11,16 15,9 20,7" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="20" cy="7" r="1.5" fill="#00e5a0" />
    </svg>
  ),
};

// Commodities + indices get colored text badges
const BADGE_ICON: Record<string, { bg: string; color: string; label: string }> = {
  Gold:   { bg: "#d4a017", color: "#1a1a1a", label: "GOLD" },
  Silver: { bg: "#a0a0a0", color: "#1a1a1a", label: "SLVR" },
  "Brent Oil": { bg: "#3a6b35", color: "#fff", label: "BRENT" },
  "WTI Oil":   { bg: "#3a6b35", color: "#fff", label: "WTI" },
  "S&P 500":   { bg: "#1a3c6e", color: "#fff", label: "S&P" },
  NASDAQ:      { bg: "#0096d6", color: "#fff", label: "NDQ" },
  "Dow Jones": { bg: "#1a3c6e", color: "#fff", label: "DJI" },
};

function PairIcon({ pair, size = 28 }: { pair: PairInfo; size?: number }) {
  const parts = pair.display.split("/");
  const px = `${size}px`;

  // Currency pair → two overlapping flags
  if (parts.length === 2 && CURRENCY_FLAG[parts[0]!] && CURRENCY_FLAG[parts[1]!]) {
    return (
      <div style={{ position: "relative", width: size + 10, height: size, flexShrink: 0 }}>
        <img
          src={`https://hatscripts.github.io/circle-flags/flags/${CURRENCY_FLAG[parts[0]!]}.svg`}
          alt={parts[0]} width={size} height={size}
          style={{ position: "absolute", left: 0, top: 0, borderRadius: "50%", border: "2px solid var(--bg-2)", zIndex: 2 }}
        />
        <img
          src={`https://hatscripts.github.io/circle-flags/flags/${CURRENCY_FLAG[parts[1]!]}.svg`}
          alt={parts[1]} width={size} height={size}
          style={{ position: "absolute", left: size * 0.4, top: 0, borderRadius: "50%", border: "2px solid var(--bg-2)", zIndex: 1 }}
        />
      </div>
    );
  }

  // Crypto icon
  const cryptoUrl = CRYPTO_IMG[pair.display];
  if (cryptoUrl) {
    return <img src={cryptoUrl} alt={pair.display} width={size} height={size} style={{ borderRadius: "50%", flexShrink: 0, background: "#222" }} />;
  }

  // Stock icon (SVG from Simple Icons CDN)
  const stockUrl = STOCK_ICON[pair.display];
  if (stockUrl) {
    return (
      <div style={{
        width: px, height: px, flexShrink: 0,
        borderRadius: 4,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "#222",
      }}>
        <img src={stockUrl} alt={pair.display} width={size * 0.65} height={size * 0.65} style={{ objectFit: "contain" }} />
      </div>
    );
  }

  // SVG icon (commodities, indices)
  const svgIcon = ASSET_SVG[pair.display];
  if (svgIcon) {
    return (
      <div style={{ width: size, height: size, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {svgIcon}
      </div>
    );
  }

  // Badge icon fallback (commodities, indices)
  const badge = BADGE_ICON[pair.display];
  if (badge) {
    const fontSize = badge.label.length > 4 ? 8 : 9;
    return (
      <div style={{
        width: px, height: px, flexShrink: 0,
        borderRadius: 4,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize, fontWeight: 900, letterSpacing: "0.02em",
        background: badge.bg, color: badge.color,
        border: "1px solid rgba(255,255,255,0.12)",
      }}>
        {badge.label}
      </div>
    );
  }

  // Generic fallback
  return (
    <div style={{
      width: px, height: px, flexShrink: 0,
      borderRadius: 4,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 8, fontWeight: 700,
      background: "var(--bg-3)", color: "var(--t-2)",
    }}>
      {pair.display.slice(0, 3)}
    </div>
  );
}

function getPayoutColor(pct: number): string {
  if (pct >= 80) return "#8ee06b";
  if (pct >= 60) return "#e6b840";
  if (pct >= 40) return "#c4b496";
  return "#ff6b3d";
}

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

// Sub-group labels for visual grouping
const FLAG_LABELS: Record<string, string> = {
  OTC: "Валюты",
  Crypto: "Криптовалюты",
  Commodity: "Сырьё",
  Stock: "Акции",
  Index: "Индексы",
  "": "Валютные пары",
};

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
    window.scrollTo({ top: 0, behavior: "smooth" });
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
      <div style={{ width: "100%", maxWidth: 560, margin: "0 auto" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            className="w-full h-14 font-bold text-base flex items-center justify-center"
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
      </div>
    );
  }

  // ─── Render: Step 1 — Select pair ───
  if (step === "pair") {
    const tabs: PairBand[] = ["otc", "exchange", "elite"];
    const activePairs = ALL_PAIRS
      .filter((p) => p.band === activeTab)
      .sort((a, b) => (PAIR_PAYOUTS[b.name] ?? 0) - (PAIR_PAYOUTS[a.name] ?? 0));
    const groups = groupByFlag(activePairs);

    return (
      <div className="w-full" style={{ minWidth: 0 }}>
        {error && (
          <div
            style={{
              padding: "10px 16px",
              fontSize: 13,
              border: "1px solid rgba(239,68,68,0.2)",
              background: "rgba(239,68,68,0.05)",
              color: "#f87171",
              textAlign: "center",
              marginBottom: 12,
            }}
          >
            {error}
          </div>
        )}

        {/* Tabs — underline style */}
        <div style={{ display: "flex", borderBottom: "1px solid var(--b-soft)", gap: 0 }}>
          {tabs.map((band) => {
            const bm = BAND_META[band];
            const locked = (ALL_PAIRS.find((p) => p.band === band)?.minTier ?? 0) > tier;
            const active = activeTab === band;
            const count = ALL_PAIRS.filter((p) => p.band === band).length;
            return (
              <button
                key={band}
                onClick={() => !locked && setActiveTab(band)}
                disabled={locked}
                style={{
                  flex: 1,
                  padding: "12px 0 10px",
                  fontSize: 14,
                  fontWeight: active ? 700 : 500,
                  color: active ? bm.color : locked ? "var(--t-3)" : "var(--t-2)",
                  background: "transparent",
                  border: "none",
                  borderBottom: active ? `2px solid ${bm.color}` : "2px solid transparent",
                  cursor: locked ? "not-allowed" : "pointer",
                  opacity: locked ? 0.35 : 1,
                  transition: "all 0.15s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                {locked && <Lock size={12} />}
                {bm.label}
                <span style={{ fontSize: 11, opacity: 0.4 }}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* Column header row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "8px 8px 6px",
            fontSize: 10,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "var(--t-3)",
            borderBottom: "1px solid var(--b-soft)",
          }}
        >
          <span style={{ flex: 1 }}>Актив</span>
          <span style={{ width: 56, textAlign: "right" }}>Выплата</span>
          {remaining != null && (
            <span style={{ marginLeft: 12, fontSize: 10, color: "var(--t-3)" }}>
              {remaining} осталось
            </span>
          )}
        </div>

        {/* Pair grid — multi-column, compact, data-dense */}
        {groups.map((group) => (
          <div key={group.flag}>
            {/* Subtle group divider */}
            <div
              style={{
                fontSize: 10,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "var(--t-3)",
                padding: "10px 8px 4px",
                borderBottom: "1px solid var(--b-soft)",
              }}
            >
              {group.label}
            </div>

            {/* Grid: 2 cols on small, 3 cols on wider */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: 0,
              }}
            >
              {group.items.map((p) => {
                const locked = p.minTier > tier;
                const payout = PAIR_PAYOUTS[p.name];
                const payoutColor = payout ? getPayoutColor(payout) : "var(--t-3)";

                return (
                  <button
                    key={p.name}
                    onClick={() => handlePairSelect(p)}
                    disabled={locked}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      width: "100%",
                      textAlign: "left",
                      padding: "8px 8px",
                      borderBottom: "1px solid var(--b-soft)",
                      borderRight: "1px solid var(--b-soft)",
                      background: "transparent",
                      cursor: locked ? "not-allowed" : "pointer",
                      opacity: locked ? 0.35 : 1,
                      transition: "background 0.08s",
                      position: "relative",
                    }}
                    onMouseEnter={(e) => {
                      if (!locked) e.currentTarget.style.background = "var(--bg-2)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <PairIcon pair={p} size={24} />
                    <span
                      style={{
                        flex: 1,
                        fontWeight: 600,
                        fontSize: 13,
                        color: "var(--t-1)",
                        fontFamily: "var(--font-jetbrains)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {p.display}
                    </span>
                    {payout != null && (
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: payoutColor,
                          fontFamily: "var(--font-jetbrains)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        +{payout}%
                      </span>
                    )}
                    {locked && (
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "rgba(0,0,0,0.55)",
                          backdropFilter: "blur(2px)",
                        }}
                      >
                        <Lock size={13} style={{ color: "var(--t-3)" }} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ─── Render: Step 2 — Select expiration ───
  if (step === "expiration" && selectedPair) {
    const exps = EXPIRATIONS[selectedPair.band];
    const bandMeta = BAND_META[selectedPair.band];

    return (
      <div style={{ width: "100%", maxWidth: 480, margin: "0 auto" }}>
        {/* Header with back + selected pair */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <button
            onClick={handleBack}
            style={{
              width: 36,
              height: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "transparent",
              border: "1px solid var(--b-soft)",
              borderRadius: 4,
              color: "var(--t-2)",
              cursor: "pointer",
            }}
          >
            <ArrowLeft size={18} />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 700,
                background: bandMeta.bg,
                color: bandMeta.color,
                fontFamily: "var(--font-jetbrains)",
              }}
            >
              {selectedPair.display.slice(0, 2)}
            </div>
            <div>
              <span style={{ fontWeight: 600, fontSize: 14, fontFamily: "var(--font-jetbrains)" }}>
                {selectedPair.display}
              </span>
              {selectedPair.flag && (
                <span
                  style={{
                    marginLeft: 8,
                    fontSize: 9,
                    fontWeight: 600,
                    padding: "2px 6px",
                    borderRadius: 2,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: bandMeta.color,
                    background: bandMeta.bg,
                  }}
                >
                  {selectedPair.flag}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Expiration heading */}
        <p style={{ fontSize: 14, color: "var(--t-2)", marginBottom: 12 }}>Выберите время экспирации</p>

        {/* Expiration buttons — flat, terminal-style with left border accent */}
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {exps.map((exp) => (
            <button
              key={exp.value}
              onClick={() => handleExpirationSelect(exp.value)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                width: "100%",
                padding: "14px 16px",
                background: "var(--bg-1)",
                border: "1px solid var(--b-soft)",
                borderRadius: 4,
                marginBottom: -1,
                cursor: "pointer",
                textAlign: "left",
                borderLeft: "3px solid transparent",
                transition: "border-color 0.1s, background 0.1s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderLeftColor = "var(--brand-gold)";
                e.currentTarget.style.background = "var(--bg-2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderLeftColor = "transparent";
                e.currentTarget.style.background = "var(--bg-1)";
              }}
            >
              <Clock size={15} style={{ color: "var(--t-3)", flexShrink: 0 }} />
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "var(--t-1)",
                  fontFamily: "var(--font-jetbrains)",
                }}
              >
                {exp.label}
              </span>
              <span
                style={{
                  fontSize: 10,
                  color: "var(--t-3)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginLeft: "auto",
                }}
              >
                экспирация
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ─── Render: Step 3 — Analysis animation ───
  if (step === "analysis") {
    return (
      <div className="w-full" style={{ maxWidth: 400, margin: "0 auto", textAlign: "center" }}>
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
          style={{ background: "var(--bg-1)", borderColor: "var(--b-soft)", textAlign: "left" }}
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
      <div style={{ width: "100%", maxWidth: 560, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
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
