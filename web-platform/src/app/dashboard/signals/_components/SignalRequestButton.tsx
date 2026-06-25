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
import { useI18n } from "@/lib/i18n/context";

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
  entryTime: string | null;
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
  { name: "AED/CNY (OTC)", display: "AED/CNY", flag: "OTC", band: "otc", minTier: 0 },
  { name: "AUD/CAD (OTC)", display: "AUD/CAD", flag: "OTC", band: "otc", minTier: 0 },
  { name: "CAD/JPY (OTC)", display: "CAD/JPY", flag: "OTC", band: "otc", minTier: 0 },
  { name: "EUR/GBP (OTC)", display: "EUR/GBP", flag: "OTC", band: "otc", minTier: 0 },
  { name: "EUR/JPY (OTC)", display: "EUR/JPY", flag: "OTC", band: "otc", minTier: 0 },
  { name: "GBP/JPY (OTC)", display: "GBP/JPY", flag: "OTC", band: "otc", minTier: 0 },
  { name: "NZD/USD (OTC)", display: "NZD/USD", flag: "OTC", band: "otc", minTier: 0 },
  { name: "OMR/CNY (OTC)", display: "OMR/CNY", flag: "OTC", band: "otc", minTier: 0 },
  { name: "USD/CNH (OTC)", display: "USD/CNH", flag: "OTC", band: "otc", minTier: 0 },
  { name: "USD/MYR (OTC)", display: "USD/MYR", flag: "OTC", band: "otc", minTier: 0 },
  { name: "USD/PHP (OTC)", display: "USD/PHP", flag: "OTC", band: "otc", minTier: 0 },
  { name: "USD/SGD (OTC)", display: "USD/SGD", flag: "OTC", band: "otc", minTier: 0 },
  { name: "YER/USD (OTC)", display: "YER/USD", flag: "OTC", band: "otc", minTier: 0 },
  { name: "USD/ARS (OTC)", display: "USD/ARS", flag: "OTC", band: "otc", minTier: 0 },
  { name: "USD/PKR (OTC)", display: "USD/PKR", flag: "OTC", band: "otc", minTier: 0 },
  { name: "EUR/NZD (OTC)", display: "EUR/NZD", flag: "OTC", band: "otc", minTier: 0 },
  { name: "AUD/NZD (OTC)", display: "AUD/NZD", flag: "OTC", band: "otc", minTier: 0 },
  { name: "USD/CLP (OTC)", display: "USD/CLP", flag: "OTC", band: "otc", minTier: 0 },
  { name: "CHF/JPY (OTC)", display: "CHF/JPY", flag: "OTC", band: "otc", minTier: 0 },
  { name: "LBP/USD (OTC)", display: "LBP/USD", flag: "OTC", band: "otc", minTier: 0 },
  { name: "USD/THB (OTC)", display: "USD/THB", flag: "OTC", band: "otc", minTier: 0 },
  { name: "AUD/USD (OTC)", display: "AUD/USD", flag: "OTC", band: "otc", minTier: 0 },
  { name: "AUD/JPY (OTC)", display: "AUD/JPY", flag: "OTC", band: "otc", minTier: 0 },
  { name: "NGN/USD (OTC)", display: "NGN/USD", flag: "OTC", band: "otc", minTier: 0 },
  { name: "QAR/CNY (OTC)", display: "QAR/CNY", flag: "OTC", band: "otc", minTier: 0 },
  { name: "BHD/CNY (OTC)", display: "BHD/CNY", flag: "OTC", band: "otc", minTier: 0 },
  { name: "USD/JPY (OTC)", display: "USD/JPY", flag: "OTC", band: "otc", minTier: 0 },
  { name: "NZD/JPY (OTC)", display: "NZD/JPY", flag: "OTC", band: "otc", minTier: 0 },
  { name: "USD/INR (OTC)", display: "USD/INR", flag: "OTC", band: "otc", minTier: 0 },
  { name: "EUR/HUF (OTC)", display: "EUR/HUF", flag: "OTC", band: "otc", minTier: 0 },
  { name: "MAD/USD (OTC)", display: "MAD/USD", flag: "OTC", band: "otc", minTier: 0 },
  { name: "CAD/CHF (OTC)", display: "CAD/CHF", flag: "OTC", band: "otc", minTier: 0 },
  { name: "USD/EGP (OTC)", display: "USD/EGP", flag: "OTC", band: "otc", minTier: 0 },
  { name: "ZAR/USD (OTC)", display: "ZAR/USD", flag: "OTC", band: "otc", minTier: 0 },
  { name: "EUR/USD (OTC)", display: "EUR/USD", flag: "OTC", band: "otc", minTier: 0 },
  { name: "GBP/USD (OTC)", display: "GBP/USD", flag: "OTC", band: "otc", minTier: 0 },
  { name: "AUD/CHF (OTC)", display: "AUD/CHF", flag: "OTC", band: "otc", minTier: 0 },
  { name: "USD/BRL (OTC)", display: "USD/BRL", flag: "OTC", band: "otc", minTier: 0 },
  { name: "USD/BDT (OTC)", display: "USD/BDT", flag: "OTC", band: "otc", minTier: 0 },
  { name: "EUR/CHF (OTC)", display: "EUR/CHF", flag: "OTC", band: "otc", minTier: 0 },
  { name: "KES/USD (OTC)", display: "KES/USD", flag: "OTC", band: "otc", minTier: 0 },
  { name: "USD/COP (OTC)", display: "USD/COP", flag: "OTC", band: "otc", minTier: 0 },
  { name: "CHF/NOK (OTC)", display: "CHF/NOK", flag: "OTC", band: "otc", minTier: 0 },
  { name: "USD/VND (OTC)", display: "USD/VND", flag: "OTC", band: "otc", minTier: 0 },
  { name: "JOD/CNY (OTC)", display: "JOD/CNY", flag: "OTC", band: "otc", minTier: 0 },
  { name: "TND/USD (OTC)", display: "TND/USD", flag: "OTC", band: "otc", minTier: 0 },
  { name: "USD/IDR (OTC)", display: "USD/IDR", flag: "OTC", band: "otc", minTier: 0 },
  { name: "USD/DZD (OTC)", display: "USD/DZD", flag: "OTC", band: "otc", minTier: 0 },
  { name: "UAH/USD (OTC)", display: "UAH/USD", flag: "OTC", band: "otc", minTier: 0 },
  { name: "USD/MXN (OTC)", display: "USD/MXN", flag: "OTC", band: "otc", minTier: 0 },
  { name: "GBP/AUD (OTC)", display: "GBP/AUD", flag: "OTC", band: "otc", minTier: 0 },
  { name: "USD/CHF (OTC)", display: "USD/CHF", flag: "OTC", band: "otc", minTier: 0 },
  { name: "EUR/TRY (OTC)", display: "EUR/TRY", flag: "OTC", band: "otc", minTier: 0 },
  { name: "USD/CAD (OTC)", display: "USD/CAD", flag: "OTC", band: "otc", minTier: 0 },
  { name: "SAR/CNY (OTC)", display: "SAR/CNY", flag: "OTC", band: "otc", minTier: 0 },
  // OTC Crypto
  { name: "Bitcoin ETF (OTC)", display: "Bitcoin ETF", flag: "Crypto", band: "otc", minTier: 0 },
  { name: "BNB (OTC)", display: "BNB", flag: "Crypto", band: "otc", minTier: 0 },
  { name: "Polkadot (OTC)", display: "DOT", flag: "Crypto", band: "otc", minTier: 0 },
  { name: "Litecoin (OTC)", display: "LTC", flag: "Crypto", band: "otc", minTier: 0 },
  { name: "Toncoin (OTC)", display: "TON", flag: "Crypto", band: "otc", minTier: 0 },
  { name: "Ethereum (OTC)", display: "ETH", flag: "Crypto", band: "otc", minTier: 0 },
  { name: "Avalanche (OTC)", display: "AVAX", flag: "Crypto", band: "otc", minTier: 0 },
  { name: "Chainlink (OTC)", display: "LINK", flag: "Crypto", band: "otc", minTier: 0 },
  { name: "Polygon (OTC)", display: "MATIC", flag: "Crypto", band: "otc", minTier: 0 },
  { name: "Bitcoin (OTC)", display: "BTC", flag: "Crypto", band: "otc", minTier: 0 },
  { name: "Cardano (OTC)", display: "ADA", flag: "Crypto", band: "otc", minTier: 0 },
  { name: "TRON (OTC)", display: "TRX", flag: "Crypto", band: "otc", minTier: 0 },
  { name: "Solana (OTC)", display: "SOL", flag: "Crypto", band: "otc", minTier: 0 },
  { name: "Dogecoin (OTC)", display: "DOGE", flag: "Crypto", band: "otc", minTier: 0 },
  // OTC Commodities
  { name: "Brent Oil (OTC)", display: "Brent Oil", flag: "Commodity", band: "otc", minTier: 0 },
  { name: "WTI Oil (OTC)", display: "WTI Oil", flag: "Commodity", band: "otc", minTier: 0 },
  { name: "Silver (OTC)", display: "Silver", flag: "Commodity", band: "otc", minTier: 0 },
  { name: "Gold (OTC)", display: "Gold", flag: "Commodity", band: "otc", minTier: 0 },
  { name: "Natural Gas (OTC)", display: "Natural Gas", flag: "Commodity", band: "otc", minTier: 0 },
  { name: "Palladium (OTC)", display: "Palladium", flag: "Commodity", band: "otc", minTier: 0 },
  { name: "Platinum (OTC)", display: "Platinum", flag: "Commodity", band: "otc", minTier: 0 },
  // OTC Stocks
  { name: "Apple (OTC)", display: "Apple", flag: "Stock", band: "otc", minTier: 0 },
  { name: "GameStop (OTC)", display: "GameStop", flag: "Stock", band: "otc", minTier: 0 },
  { name: "VISA (OTC)", display: "Visa", flag: "Stock", band: "otc", minTier: 0 },
  { name: "American Express (OTC)", display: "AmEx", flag: "Stock", band: "otc", minTier: 0 },
  { name: "VIX (OTC)", display: "VIX", flag: "Stock", band: "otc", minTier: 0 },
  { name: "Pfizer (OTC)", display: "Pfizer", flag: "Stock", band: "otc", minTier: 0 },
  { name: "AMD (OTC)", display: "AMD", flag: "Stock", band: "otc", minTier: 0 },
  { name: "Johnson & Johnson (OTC)", display: "J&J", flag: "Stock", band: "otc", minTier: 0 },
  { name: "Marathon Digital (OTC)", display: "MARA", flag: "Stock", band: "otc", minTier: 0 },
  { name: "Amazon (OTC)", display: "Amazon", flag: "Stock", band: "otc", minTier: 0 },
  { name: "Netflix (OTC)", display: "Netflix", flag: "Stock", band: "otc", minTier: 0 },
  { name: "ExxonMobil (OTC)", display: "Exxon", flag: "Stock", band: "otc", minTier: 0 },
  { name: "Coinbase (OTC)", display: "Coinbase", flag: "Stock", band: "otc", minTier: 0 },
  { name: "Cisco (OTC)", display: "Cisco", flag: "Stock", band: "otc", minTier: 0 },
  { name: "Alibaba (OTC)", display: "Alibaba", flag: "Stock", band: "otc", minTier: 0 },
  { name: "Citigroup (OTC)", display: "Citigroup", flag: "Stock", band: "otc", minTier: 0 },
  { name: "FedEx (OTC)", display: "FedEx", flag: "Stock", band: "otc", minTier: 0 },
  { name: "Meta (OTC)", display: "Meta", flag: "Stock", band: "otc", minTier: 0 },
  { name: "Intel (OTC)", display: "Intel", flag: "Stock", band: "otc", minTier: 0 },
  { name: "Palantir (OTC)", display: "Palantir", flag: "Stock", band: "otc", minTier: 0 },
  { name: "McDonald's (OTC)", display: "McDonald's", flag: "Stock", band: "otc", minTier: 0 },
  { name: "Tesla (OTC)", display: "Tesla", flag: "Stock", band: "otc", minTier: 0 },
  { name: "Microsoft (OTC)", display: "Microsoft", flag: "Stock", band: "otc", minTier: 0 },
  // OTC Indices
  { name: "AUS 200 (OTC)", display: "AUS 200", flag: "Index", band: "otc", minTier: 0 },
  { name: "FTSE 100 (OTC)", display: "FTSE 100", flag: "Index", band: "otc", minTier: 0 },
  { name: "DAX 30 (OTC)", display: "DAX 30", flag: "Index", band: "otc", minTier: 0 },
  { name: "Dow Jones (OTC)", display: "Dow Jones", flag: "Index", band: "otc", minTier: 0 },
  { name: "E35EUR (OTC)", display: "Euro Stoxx 35", flag: "Index", band: "otc", minTier: 0 },
  { name: "E50EUR (OTC)", display: "Euro Stoxx 50", flag: "Index", band: "otc", minTier: 0 },
  { name: "CAC 40 (OTC)", display: "CAC 40", flag: "Index", band: "otc", minTier: 0 },
  { name: "Nikkei 225 (OTC)", display: "Nikkei 225", flag: "Index", band: "otc", minTier: 0 },
  { name: "NASDAQ 100 (OTC)", display: "NASDAQ", flag: "Index", band: "otc", minTier: 0 },
  { name: "S&P 500 (OTC)", display: "S&P 500", flag: "Index", band: "otc", minTier: 0 },

  // ── Exchange (tier 1) ──
  { name: "CHF/JPY", display: "CHF/JPY", flag: "", band: "exchange", minTier: 1 },
  { name: "EUR/CAD", display: "EUR/CAD", flag: "", band: "exchange", minTier: 1 },
  { name: "AUD/JPY", display: "AUD/JPY", flag: "", band: "exchange", minTier: 1 },
  { name: "CAD/JPY", display: "CAD/JPY", flag: "", band: "exchange", minTier: 1 },
  { name: "AUD/CHF", display: "AUD/CHF", flag: "", band: "exchange", minTier: 1 },
  { name: "EUR/USD", display: "EUR/USD", flag: "", band: "exchange", minTier: 1 },
  { name: "EUR/CHF", display: "EUR/CHF", flag: "", band: "exchange", minTier: 1 },
  { name: "AUD/CAD", display: "AUD/CAD", flag: "", band: "exchange", minTier: 1 },
  { name: "EUR/AUD", display: "EUR/AUD", flag: "", band: "exchange", minTier: 1 },
  { name: "GBP/JPY", display: "GBP/JPY", flag: "", band: "exchange", minTier: 1 },
  { name: "USD/JPY", display: "USD/JPY", flag: "", band: "exchange", minTier: 1 },
  { name: "EUR/JPY", display: "EUR/JPY", flag: "", band: "exchange", minTier: 1 },
  { name: "EUR/GBP", display: "EUR/GBP", flag: "", band: "exchange", minTier: 1 },
  { name: "GBP/USD", display: "GBP/USD", flag: "", band: "exchange", minTier: 1 },
  { name: "GBP/CAD", display: "GBP/CAD", flag: "", band: "exchange", minTier: 1 },
  { name: "USD/CAD", display: "USD/CAD", flag: "", band: "exchange", minTier: 1 },
  { name: "GBP/CHF", display: "GBP/CHF", flag: "", band: "exchange", minTier: 1 },
  { name: "AUD/USD", display: "AUD/USD", flag: "", band: "exchange", minTier: 1 },
  { name: "USD/CHF", display: "USD/CHF", flag: "", band: "exchange", minTier: 1 },
  { name: "CAD/CHF", display: "CAD/CHF", flag: "", band: "exchange", minTier: 1 },
  { name: "GBP/AUD", display: "GBP/AUD", flag: "", band: "exchange", minTier: 1 },
  // Exchange Crypto
  { name: "BTC/USD", display: "Bitcoin", flag: "Crypto", band: "exchange", minTier: 1 },
];

// ─── Payout percentages ───

const PAIR_PAYOUTS: Record<string, number> = {
  // OTC Currencies
  "AED/CNY (OTC)": 92, "AUD/CAD (OTC)": 92, "CAD/JPY (OTC)": 92,
  "EUR/GBP (OTC)": 92, "EUR/JPY (OTC)": 92, "GBP/JPY (OTC)": 92,
  "NZD/USD (OTC)": 92, "OMR/CNY (OTC)": 92, "USD/CNH (OTC)": 92,
  "USD/MYR (OTC)": 92, "USD/PHP (OTC)": 92, "USD/SGD (OTC)": 92,
  "YER/USD (OTC)": 92, "USD/ARS (OTC)": 91, "USD/PKR (OTC)": 91,
  "EUR/NZD (OTC)": 90, "AUD/NZD (OTC)": 89, "USD/CLP (OTC)": 88,
  "CHF/JPY (OTC)": 87, "LBP/USD (OTC)": 86, "USD/THB (OTC)": 86,
  "AUD/USD (OTC)": 83, "AUD/JPY (OTC)": 82, "NGN/USD (OTC)": 81,
  "QAR/CNY (OTC)": 74, "BHD/CNY (OTC)": 71, "USD/JPY (OTC)": 70,
  "NZD/JPY (OTC)": 68, "USD/INR (OTC)": 67, "EUR/HUF (OTC)": 65,
  "MAD/USD (OTC)": 65, "CAD/CHF (OTC)": 64, "USD/EGP (OTC)": 63,
  "ZAR/USD (OTC)": 63, "EUR/USD (OTC)": 61, "GBP/USD (OTC)": 59,
  "AUD/CHF (OTC)": 58, "USD/BRL (OTC)": 58, "USD/BDT (OTC)": 57,
  "EUR/CHF (OTC)": 52, "KES/USD (OTC)": 52, "USD/COP (OTC)": 51,
  "CHF/NOK (OTC)": 50, "USD/VND (OTC)": 50, "JOD/CNY (OTC)": 46,
  "TND/USD (OTC)": 45, "USD/IDR (OTC)": 43, "USD/DZD (OTC)": 36,
  "UAH/USD (OTC)": 33, "USD/MXN (OTC)": 32, "GBP/AUD (OTC)": 30,
  "USD/CHF (OTC)": 30, "EUR/TRY (OTC)": 29, "USD/CAD (OTC)": 24,
  "SAR/CNY (OTC)": 20,
  // OTC Crypto
  "Bitcoin ETF (OTC)": 92, "Bitcoin (OTC)": 68, "Litecoin (OTC)": 92,
  "Dogecoin (OTC)": 38, "Polygon (OTC)": 73,
  "Cardano (OTC)": 67, "Polkadot (OTC)": 92,
  "Chainlink (OTC)": 77, "BNB (OTC)": 92,
  "Avalanche (OTC)": 80, "Solana (OTC)": 48,
  "TRON (OTC)": 50, "Ethereum (OTC)": 86, "Toncoin (OTC)": 92,
  // OTC Commodities
  "Gold (OTC)": 80, "Silver (OTC)": 80, "Brent Oil (OTC)": 80, "WTI Oil (OTC)": 80,
  "Natural Gas (OTC)": 45, "Palladium (OTC)": 45, "Platinum (OTC)": 45,
  // OTC Stocks
  "Apple (OTC)": 92, "Tesla (OTC)": 33, "Amazon (OTC)": 69,
  "Microsoft (OTC)": 31, "Meta (OTC)": 45, "Netflix (OTC)": 63,
  "GameStop (OTC)": 92, "VISA (OTC)": 92, "American Express (OTC)": 90,
  "VIX (OTC)": 90, "Pfizer (OTC)": 87, "AMD (OTC)": 83,
  "Johnson & Johnson (OTC)": 81, "Marathon Digital (OTC)": 73,
  "ExxonMobil (OTC)": 60, "Coinbase (OTC)": 59, "Cisco (OTC)": 57,
  "Alibaba (OTC)": 52, "Citigroup (OTC)": 50, "FedEx (OTC)": 50,
  "Intel (OTC)": 36, "Palantir (OTC)": 34, "McDonald's (OTC)": 33,
  // OTC Indices
  "S&P 500 (OTC)": 45, "NASDAQ 100 (OTC)": 45, "Dow Jones (OTC)": 45,
  "AUS 200 (OTC)": 67, "FTSE 100 (OTC)": 45, "DAX 30 (OTC)": 45,
  "E35EUR (OTC)": 45, "E50EUR (OTC)": 45, "CAC 40 (OTC)": 45,
  "Nikkei 225 (OTC)": 45,
  // Exchange currencies
  "CHF/JPY": 88, "EUR/CAD": 88, "AUD/JPY": 86, "CAD/JPY": 80,
  "AUD/CHF": 78, "EUR/USD": 78, "EUR/CHF": 75, "AUD/CAD": 74,
  "EUR/AUD": 73, "GBP/JPY": 72, "USD/JPY": 68, "EUR/JPY": 61,
  "EUR/GBP": 60, "GBP/USD": 55, "GBP/CAD": 48, "USD/CAD": 44,
  "GBP/CHF": 42, "AUD/USD": 40, "USD/CHF": 35, "CAD/CHF": 26,
  "GBP/AUD": 24,
  // Exchange crypto
  "BTC/USD": 15,
  // Indices
  "SP500": 45, "US100": 45,
};

// ─── Pair icons ───

const CURRENCY_FLAG: Record<string, string> = {
  EUR: "eu", USD: "us", GBP: "gb", JPY: "jp", AUD: "au",
  CAD: "ca", CHF: "ch", NZD: "nz", AED: "ae", OMR: "om",
  CNY: "cn", CNH: "cn", MYR: "my", PHP: "ph", SGD: "sg",
  YER: "ye", ARS: "ar", PKR: "pk", CLP: "cl", LBP: "lb",
  THB: "th", NGN: "ng", QAR: "qa", BHD: "bh", INR: "in",
  HUF: "hu", MAD: "ma", EGP: "eg", ZAR: "za", BRL: "br",
  BDT: "bd", KES: "ke", COP: "co", NOK: "no", VND: "vn",
  JOD: "jo", TND: "tn", IDR: "id", DZD: "dz", UAH: "ua",
  MXN: "mx", TRY: "tr", SAR: "sa",
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
  Bitcoin: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
  Ethereum: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
  Solana: "https://assets.coingecko.com/coins/images/4128/small/solana.png",
};

// Stock icons via Simple Icons CDN
const STOCK_ICON: Record<string, string> = {
  Apple: "https://cdn.simpleicons.org/apple/ffffff",
  Tesla: "https://cdn.simpleicons.org/tesla/ffffff",
  Meta: "https://cdn.simpleicons.org/meta/ffffff",
  Netflix: "https://cdn.simpleicons.org/netflix/ffffff",
  Amazon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M13.958 10.09c0 1.232.029 2.256-.591 3.351-.502.891-1.301 1.44-2.186 1.44-1.214 0-1.922-.924-1.922-2.292 0-2.692 2.415-3.182 4.7-3.182v.683zm3.186 7.705a.66.66 0 0 1-.753.077c-1.06-.876-1.25-1.281-1.829-2.115-1.748 1.784-2.985 2.318-5.249 2.318-2.68 0-4.764-1.653-4.764-4.96 0-2.582 1.399-4.34 3.392-5.2 1.727-.753 4.139-.889 5.982-1.098v-.41c0-.753.058-1.643-.384-2.293-.384-.578-1.118-.816-1.766-.816-1.2 0-2.268.616-2.53 1.89a.67.67 0 0 1-.578.578l-3.186-.345a.57.57 0 0 1-.48-.672C5.753 1.593 8.894.3 11.717.3c1.44 0 3.325.384 4.462 1.476 1.44 1.344 1.302 3.139 1.302 5.094v4.613c0 1.387.576 1.995 1.118 2.745a.67.67 0 0 1-.02.95c-.71.593-1.97 1.696-2.662 2.315l-.773.001zM21.475 21.15c-2.797 1.89-6.849 2.892-10.336 2.892C5.524 24.042.705 22.083.705 17.46c0-.832.096-1.708.48-2.531.168-.346.48-.327.696-.173 2.265 1.71 6.46 2.97 10.164 2.97 2.493 0 5.237-.519 7.76-1.584.384-.163.706.25.37.509l-.7.499z'/%3E%3C/svg%3E",
  Microsoft: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 23 23' fill='white'%3E%3Cpath d='M0 0h11v11H0zm12 0h11v11H12zM0 12h11v11H0zm12 0h11v11H12z'/%3E%3C/svg%3E",
  Intel: "https://cdn.simpleicons.org/intel/ffffff",
  Cisco: "https://cdn.simpleicons.org/cisco/ffffff",
  Alibaba: "https://cdn.simpleicons.org/alibabadotcom/ffffff",
  Coinbase: "https://cdn.simpleicons.org/coinbase/ffffff",
  AMD: "https://cdn.simpleicons.org/amd/ffffff",
  "McDonald's": "https://cdn.simpleicons.org/mcdonalds/ffffff",
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
  "Natural Gas": { bg: "#5a8b55", color: "#fff", label: "NGAS" },
  Palladium: { bg: "#8a8a8a", color: "#1a1a1a", label: "PALL" },
  Platinum:  { bg: "#b0b0b0", color: "#1a1a1a", label: "PLAT" },
  "S&P 500":   { bg: "#1a3c6e", color: "#fff", label: "S&P" },
  NASDAQ:      { bg: "#0096d6", color: "#fff", label: "NDQ" },
  "Dow Jones": { bg: "#1a3c6e", color: "#fff", label: "DJI" },
  "AUS 200":   { bg: "#1a3c6e", color: "#fff", label: "AUS" },
  "FTSE 100":  { bg: "#1a3c6e", color: "#fff", label: "FTSE" },
  "DAX 30":    { bg: "#1a3c6e", color: "#fff", label: "DAX" },
  "Euro Stoxx 35": { bg: "#1a3c6e", color: "#fff", label: "E35" },
  "Euro Stoxx 50": { bg: "#1a3c6e", color: "#fff", label: "E50" },
  "CAC 40":    { bg: "#1a3c6e", color: "#fff", label: "CAC" },
  "Nikkei 225": { bg: "#1a3c6e", color: "#fff", label: "NKI" },
  GameStop:    { bg: "#e50914", color: "#fff", label: "GME" },
  Visa:        { bg: "#1a1f71", color: "#fff", label: "VISA" },
  AmEx:        { bg: "#006fcf", color: "#fff", label: "AMEX" },
  VIX:         { bg: "#5a3c6e", color: "#fff", label: "VIX" },
  Pfizer:      { bg: "#0093d0", color: "#fff", label: "PFE" },
  "J&J":       { bg: "#d51f26", color: "#fff", label: "JNJ" },
  MARA:        { bg: "#333", color: "#fff", label: "MARA" },
  Exxon:       { bg: "#e32636", color: "#fff", label: "XOM" },
  Citigroup:   { bg: "#003b70", color: "#fff", label: "CITI" },
  FedEx:       { bg: "#4d148c", color: "#fff", label: "FDX" },
  Palantir:    { bg: "#101820", color: "#fff", label: "PLTR" },
  Bitcoin:     { bg: "#f7931a", color: "#fff", label: "BTC" },
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

// EXPIRATIONS labels are computed inside component using t
const EXPIRATION_VALUES: Record<PairBand, string[]> = {
  otc: ["30s", "60s", "2m", "3m", "5m", "30m"],
  exchange: ["2m", "3m", "5m", "30m"],
  elite: ["2m", "3m", "5m", "30m"],
};

const BAND_META_BASE: Record<PairBand, { color: string; bg: string }> = {
  otc: { color: "#8888ff", bg: "rgba(136,136,255,0.08)" },
  exchange: { color: "#8ee06b", bg: "rgba(142,224,107,0.08)" },
  elite: { color: "#d4a017", bg: "rgba(212,160,23,0.08)" },
};

function groupByFlag(pairs: PairInfo[], flagLabels: Record<string, string>): { flag: string; label: string; items: PairInfo[] }[] {
  const map = new Map<string, PairInfo[]>();
  for (const p of pairs) {
    const key = p.flag;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(p);
  }
  return Array.from(map.entries()).map(([flag, items]) => ({
    flag,
    label: flagLabels[flag] ?? flag,
    items,
  }));
}

// ─── Analysis animation icons (labels computed inside component) ───

const ANALYSIS_STEP_ICONS = [Search, BarChart3, Target, Shield, Activity];

type Step = "pair" | "expiration" | "analysis" | "result";

// ─── Component ───

export function SignalRequestButton({
  limitReached,
  remaining,
  tierLabel,
  referralUrl,
  tier,
}: Props) {
  const { t } = useI18n();
  const router = useRouter();

  const BAND_META: Record<PairBand, { label: string; color: string; bg: string; desc: string }> = {
    otc: { label: t.signalRequest.bandOtcLabel, color: BAND_META_BASE.otc.color, bg: BAND_META_BASE.otc.bg, desc: t.signalRequest.bandOtcDesc },
    exchange: { label: t.signalRequest.bandExchangeLabel, color: BAND_META_BASE.exchange.color, bg: BAND_META_BASE.exchange.bg, desc: t.signalRequest.bandExchangeDesc },
    elite: { label: t.signalRequest.bandEliteLabel, color: BAND_META_BASE.elite.color, bg: BAND_META_BASE.elite.bg, desc: t.signalRequest.bandEliteDesc },
  };

  const FLAG_LABELS: Record<string, string> = {
    OTC: t.signalRequest.groupCurrencies,
    Crypto: t.signalRequest.groupCrypto,
    Commodity: t.signalRequest.groupCommodity,
    Stock: t.signalRequest.groupStocks,
    Index: t.signalRequest.groupIndices,
    "": t.signalRequest.groupForexPairs,
  };

  const ANALYSIS_STEPS = [
    { icon: ANALYSIS_STEP_ICONS[0]!, text: t.signalRequest.analysisScanning },
    { icon: ANALYSIS_STEP_ICONS[1]!, text: t.signalRequest.analysisIndicators },
    { icon: ANALYSIS_STEP_ICONS[2]!, text: t.signalRequest.analysisEntry },
    { icon: ANALYSIS_STEP_ICONS[3]!, text: t.signalRequest.analysisRisk },
    { icon: ANALYSIS_STEP_ICONS[4]!, text: t.signalRequest.analysisForming },
  ];

  const EXP_LABEL: Record<string, string> = {
    "30s": t.signalRequest.exp30s,
    "60s": t.signalRequest.exp1m,
    "2m": t.signalRequest.exp2m,
    "3m": t.signalRequest.exp3m ?? "3 мин",
    "5m": t.signalRequest.exp5m,
    "15m": t.signalRequest.exp15m,
    "30m": t.signalRequest.exp30m ?? "30 мин",
  };

  const EXPIRATIONS: Record<PairBand, { value: string; label: string }[]> = {
    otc: EXPIRATION_VALUES.otc.map((v) => ({ value: v, label: EXP_LABEL[v] ?? v })),
    exchange: EXPIRATION_VALUES.exchange.map((v) => ({ value: v, label: EXP_LABEL[v] ?? v })),
    elite: EXPIRATION_VALUES.elite.map((v) => ({ value: v, label: EXP_LABEL[v] ?? v })),
  };

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
      setError(t.signalRequest.errorFetch);
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
            {t.signalRequest.limitReachedToday}
          </div>
          <Link
            href={referralUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 text-sm text-[var(--brand-gold)] hover:text-[var(--brand-gold-bright)] transition-colors"
          >
            {t.signalRequest.upgradeLevel} ({tierLabel})
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
    const groups = groupByFlag(activePairs, FLAG_LABELS);

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
          <span style={{ flex: 1 }}>{t.signalRequest.colAsset}</span>
          <span style={{ width: 56, textAlign: "right" }}>{t.signalRequest.colPayout}</span>
          {remaining != null && (
            <span style={{ marginLeft: 12, fontSize: 10, color: "var(--t-3)" }}>
              {remaining} {t.signalRequest.remaining}
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
            <PairIcon pair={selectedPair} size={32} />
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
        <p style={{ fontSize: 14, color: "var(--t-2)", marginBottom: 12 }}>{t.signalRequest.selectExpiration}</p>

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
                {t.signalRequest.expirationLabel}
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
            {t.signalRequest.analysisInProgress}
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
        {/* OTC → decorative visual + analysis, non-OTC → chart card */}
        {isOtc ? (
          <div className="space-y-3">
            <OtcSignalVisual
              pair={lastSignal.pair}
              direction={lastSignal.direction}
              confidence={lastSignal.confidence}
              expiration={lastSignal.expiration}
            />
            {lastSignal.entryTime && (
              <div
                className="flex items-center gap-2 text-xs text-[var(--t-2)] px-3 py-2 rounded-lg"
                style={{ background: "rgba(212,160,23,0.06)", fontFamily: "var(--font-jetbrains)" }}
              >
                <Clock size={12} className="text-[var(--brand-gold)]" />
                {t.signalRequest.entryTime} <span className="text-[var(--brand-gold)] font-semibold">{lastSignal.entryTime}</span>
              </div>
            )}
            {lastSignal.analysis && (
              <div
                className="rounded-xl px-4 py-3 text-[12px] leading-relaxed text-[var(--t-2)] whitespace-pre-line"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--b-soft)" }}
              >
                <div className="text-[10px] uppercase tracking-wider text-[var(--brand-gold)] font-semibold mb-1.5">
                  {t.signalRequest.analytics}
                </div>
                {lastSignal.analysis}
              </div>
            )}
          </div>
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
                    {t.signalRequest.accuracy}
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
                  {t.signalRequest.entry} <span className="text-[var(--brand-gold)] font-semibold">{lastSignal.entryPrice.toFixed(5)}</span>
                </div>
              )}

              {/* Entry time */}
              {lastSignal.entryTime && (
                <div
                  className="flex items-center gap-2 text-xs text-[var(--t-2)] mb-3 px-3 py-2 rounded-lg"
                  style={{ background: "rgba(212,160,23,0.06)", fontFamily: "var(--font-jetbrains)" }}
                >
                  <Clock size={12} className="text-[var(--brand-gold)]" />
                  {t.signalRequest.entryTime} <span className="text-[var(--brand-gold)] font-semibold">{lastSignal.entryTime}</span>
                </div>
              )}

              {/* Analysis */}
              {lastSignal.analysis && (
                <div
                  className="rounded-xl px-4 py-3 text-[12px] leading-relaxed text-[var(--t-2)] whitespace-pre-line"
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--b-soft)" }}
                >
                  <div className="text-[10px] uppercase tracking-wider text-[var(--t-3)] font-semibold mb-1.5">
                    {t.signalRequest.analytics}
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
          {t.signalRequest.getNewSignal}
        </button>
      </div>
    );
  }

  return null;
}
