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
import { useI18n } from "@/lib/i18n/context";

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
  // OTC Forex
  { name: "AED/CNY (OTC)", display: "AED/CNY", category: "forex", band: "otc", payout: 92, minTier: 0 },
  { name: "AUD/CAD (OTC)", display: "AUD/CAD", category: "forex", band: "otc", payout: 92, minTier: 0 },
  { name: "CAD/JPY (OTC)", display: "CAD/JPY", category: "forex", band: "otc", payout: 92, minTier: 0 },
  { name: "EUR/GBP (OTC)", display: "EUR/GBP", category: "forex", band: "otc", payout: 92, minTier: 0 },
  { name: "EUR/JPY (OTC)", display: "EUR/JPY", category: "forex", band: "otc", payout: 92, minTier: 0 },
  { name: "GBP/JPY (OTC)", display: "GBP/JPY", category: "forex", band: "otc", payout: 92, minTier: 0 },
  { name: "NZD/USD (OTC)", display: "NZD/USD", category: "forex", band: "otc", payout: 92, minTier: 0 },
  { name: "OMR/CNY (OTC)", display: "OMR/CNY", category: "forex", band: "otc", payout: 92, minTier: 0 },
  { name: "USD/CNH (OTC)", display: "USD/CNH", category: "forex", band: "otc", payout: 92, minTier: 0 },
  { name: "USD/MYR (OTC)", display: "USD/MYR", category: "forex", band: "otc", payout: 92, minTier: 0 },
  { name: "USD/PHP (OTC)", display: "USD/PHP", category: "forex", band: "otc", payout: 92, minTier: 0 },
  { name: "USD/SGD (OTC)", display: "USD/SGD", category: "forex", band: "otc", payout: 92, minTier: 0 },
  { name: "YER/USD (OTC)", display: "YER/USD", category: "forex", band: "otc", payout: 92, minTier: 0 },
  { name: "USD/ARS (OTC)", display: "USD/ARS", category: "forex", band: "otc", payout: 91, minTier: 0 },
  { name: "USD/PKR (OTC)", display: "USD/PKR", category: "forex", band: "otc", payout: 91, minTier: 0 },
  { name: "EUR/NZD (OTC)", display: "EUR/NZD", category: "forex", band: "otc", payout: 90, minTier: 0 },
  { name: "AUD/NZD (OTC)", display: "AUD/NZD", category: "forex", band: "otc", payout: 89, minTier: 0 },
  { name: "USD/CLP (OTC)", display: "USD/CLP", category: "forex", band: "otc", payout: 88, minTier: 0 },
  { name: "CHF/JPY (OTC)", display: "CHF/JPY", category: "forex", band: "otc", payout: 87, minTier: 0 },
  { name: "LBP/USD (OTC)", display: "LBP/USD", category: "forex", band: "otc", payout: 86, minTier: 0 },
  { name: "USD/THB (OTC)", display: "USD/THB", category: "forex", band: "otc", payout: 86, minTier: 0 },
  { name: "AUD/USD (OTC)", display: "AUD/USD", category: "forex", band: "otc", payout: 83, minTier: 0 },
  { name: "AUD/JPY (OTC)", display: "AUD/JPY", category: "forex", band: "otc", payout: 82, minTier: 0 },
  { name: "NGN/USD (OTC)", display: "NGN/USD", category: "forex", band: "otc", payout: 81, minTier: 0 },
  { name: "QAR/CNY (OTC)", display: "QAR/CNY", category: "forex", band: "otc", payout: 74, minTier: 0 },
  { name: "BHD/CNY (OTC)", display: "BHD/CNY", category: "forex", band: "otc", payout: 71, minTier: 0 },
  { name: "USD/JPY (OTC)", display: "USD/JPY", category: "forex", band: "otc", payout: 70, minTier: 0 },
  { name: "NZD/JPY (OTC)", display: "NZD/JPY", category: "forex", band: "otc", payout: 68, minTier: 0 },
  { name: "USD/INR (OTC)", display: "USD/INR", category: "forex", band: "otc", payout: 67, minTier: 0 },
  { name: "EUR/HUF (OTC)", display: "EUR/HUF", category: "forex", band: "otc", payout: 65, minTier: 0 },
  { name: "MAD/USD (OTC)", display: "MAD/USD", category: "forex", band: "otc", payout: 65, minTier: 0 },
  { name: "CAD/CHF (OTC)", display: "CAD/CHF", category: "forex", band: "otc", payout: 64, minTier: 0 },
  { name: "USD/EGP (OTC)", display: "USD/EGP", category: "forex", band: "otc", payout: 63, minTier: 0 },
  { name: "ZAR/USD (OTC)", display: "ZAR/USD", category: "forex", band: "otc", payout: 63, minTier: 0 },
  { name: "EUR/USD (OTC)", display: "EUR/USD", category: "forex", band: "otc", payout: 61, minTier: 0 },
  { name: "GBP/USD (OTC)", display: "GBP/USD", category: "forex", band: "otc", payout: 59, minTier: 0 },
  { name: "AUD/CHF (OTC)", display: "AUD/CHF", category: "forex", band: "otc", payout: 58, minTier: 0 },
  { name: "USD/BRL (OTC)", display: "USD/BRL", category: "forex", band: "otc", payout: 58, minTier: 0 },
  { name: "USD/BDT (OTC)", display: "USD/BDT", category: "forex", band: "otc", payout: 57, minTier: 0 },
  { name: "EUR/CHF (OTC)", display: "EUR/CHF", category: "forex", band: "otc", payout: 52, minTier: 0 },
  { name: "KES/USD (OTC)", display: "KES/USD", category: "forex", band: "otc", payout: 52, minTier: 0 },
  { name: "USD/COP (OTC)", display: "USD/COP", category: "forex", band: "otc", payout: 51, minTier: 0 },
  { name: "CHF/NOK (OTC)", display: "CHF/NOK", category: "forex", band: "otc", payout: 50, minTier: 0 },
  { name: "USD/VND (OTC)", display: "USD/VND", category: "forex", band: "otc", payout: 50, minTier: 0 },
  { name: "JOD/CNY (OTC)", display: "JOD/CNY", category: "forex", band: "otc", payout: 46, minTier: 0 },
  { name: "TND/USD (OTC)", display: "TND/USD", category: "forex", band: "otc", payout: 45, minTier: 0 },
  { name: "USD/IDR (OTC)", display: "USD/IDR", category: "forex", band: "otc", payout: 43, minTier: 0 },
  { name: "USD/DZD (OTC)", display: "USD/DZD", category: "forex", band: "otc", payout: 36, minTier: 0 },
  { name: "UAH/USD (OTC)", display: "UAH/USD", category: "forex", band: "otc", payout: 33, minTier: 0 },
  { name: "USD/MXN (OTC)", display: "USD/MXN", category: "forex", band: "otc", payout: 32, minTier: 0 },
  { name: "GBP/AUD (OTC)", display: "GBP/AUD", category: "forex", band: "otc", payout: 30, minTier: 0 },
  { name: "USD/CHF (OTC)", display: "USD/CHF", category: "forex", band: "otc", payout: 30, minTier: 0 },
  { name: "EUR/TRY (OTC)", display: "EUR/TRY", category: "forex", band: "otc", payout: 29, minTier: 0 },
  { name: "USD/CAD (OTC)", display: "USD/CAD", category: "forex", band: "otc", payout: 24, minTier: 0 },
  { name: "SAR/CNY (OTC)", display: "SAR/CNY", category: "forex", band: "otc", payout: 20, minTier: 0 },
  // OTC Crypto
  { name: "Bitcoin ETF (OTC)", display: "Bitcoin ETF", category: "crypto", band: "otc", payout: 92, minTier: 0 },
  { name: "BNB (OTC)", display: "BNB", category: "crypto", band: "otc", payout: 92, minTier: 0 },
  { name: "Polkadot (OTC)", display: "DOT", category: "crypto", band: "otc", payout: 92, minTier: 0 },
  { name: "Litecoin (OTC)", display: "LTC", category: "crypto", band: "otc", payout: 92, minTier: 0 },
  { name: "Toncoin (OTC)", display: "TON", category: "crypto", band: "otc", payout: 92, minTier: 0 },
  { name: "Ethereum (OTC)", display: "ETH", category: "crypto", band: "otc", payout: 86, minTier: 0 },
  { name: "Avalanche (OTC)", display: "AVAX", category: "crypto", band: "otc", payout: 80, minTier: 0 },
  { name: "Chainlink (OTC)", display: "LINK", category: "crypto", band: "otc", payout: 77, minTier: 0 },
  { name: "Polygon (OTC)", display: "MATIC", category: "crypto", band: "otc", payout: 73, minTier: 0 },
  { name: "Bitcoin (OTC)", display: "BTC", category: "crypto", band: "otc", payout: 68, minTier: 0 },
  { name: "Cardano (OTC)", display: "ADA", category: "crypto", band: "otc", payout: 67, minTier: 0 },
  { name: "TRON (OTC)", display: "TRX", category: "crypto", band: "otc", payout: 50, minTier: 0 },
  { name: "Solana (OTC)", display: "SOL", category: "crypto", band: "otc", payout: 48, minTier: 0 },
  { name: "Dogecoin (OTC)", display: "DOGE", category: "crypto", band: "otc", payout: 38, minTier: 0 },
  // OTC Commodities
  { name: "Brent Oil (OTC)", display: "Brent Oil", category: "commodities", band: "otc", payout: 80, minTier: 0 },
  { name: "WTI Oil (OTC)", display: "WTI Oil", category: "commodities", band: "otc", payout: 80, minTier: 0 },
  { name: "Silver (OTC)", display: "Silver", category: "commodities", band: "otc", payout: 80, minTier: 0 },
  { name: "Gold (OTC)", display: "Gold", category: "commodities", band: "otc", payout: 80, minTier: 0 },
  { name: "Natural Gas (OTC)", display: "Natural Gas", category: "commodities", band: "otc", payout: 45, minTier: 0 },
  { name: "Palladium (OTC)", display: "Palladium", category: "commodities", band: "otc", payout: 45, minTier: 0 },
  { name: "Platinum (OTC)", display: "Platinum", category: "commodities", band: "otc", payout: 45, minTier: 0 },
  // OTC Stocks
  { name: "Apple (OTC)", display: "Apple", category: "stocks", band: "otc", payout: 92, minTier: 0 },
  { name: "GameStop (OTC)", display: "GameStop", category: "stocks", band: "otc", payout: 92, minTier: 0 },
  { name: "VISA (OTC)", display: "Visa", category: "stocks", band: "otc", payout: 92, minTier: 0 },
  { name: "American Express (OTC)", display: "AmEx", category: "stocks", band: "otc", payout: 90, minTier: 0 },
  { name: "VIX (OTC)", display: "VIX", category: "stocks", band: "otc", payout: 90, minTier: 0 },
  { name: "Pfizer (OTC)", display: "Pfizer", category: "stocks", band: "otc", payout: 87, minTier: 0 },
  { name: "AMD (OTC)", display: "AMD", category: "stocks", band: "otc", payout: 83, minTier: 0 },
  { name: "Johnson & Johnson (OTC)", display: "J&J", category: "stocks", band: "otc", payout: 81, minTier: 0 },
  { name: "Marathon Digital (OTC)", display: "MARA", category: "stocks", band: "otc", payout: 73, minTier: 0 },
  { name: "Amazon (OTC)", display: "Amazon", category: "stocks", band: "otc", payout: 69, minTier: 0 },
  { name: "Netflix (OTC)", display: "Netflix", category: "stocks", band: "otc", payout: 63, minTier: 0 },
  { name: "ExxonMobil (OTC)", display: "Exxon", category: "stocks", band: "otc", payout: 60, minTier: 0 },
  { name: "Coinbase (OTC)", display: "Coinbase", category: "stocks", band: "otc", payout: 59, minTier: 0 },
  { name: "Cisco (OTC)", display: "Cisco", category: "stocks", band: "otc", payout: 57, minTier: 0 },
  { name: "Alibaba (OTC)", display: "Alibaba", category: "stocks", band: "otc", payout: 52, minTier: 0 },
  { name: "Citigroup (OTC)", display: "Citigroup", category: "stocks", band: "otc", payout: 50, minTier: 0 },
  { name: "FedEx (OTC)", display: "FedEx", category: "stocks", band: "otc", payout: 50, minTier: 0 },
  { name: "Meta (OTC)", display: "Meta", category: "stocks", band: "otc", payout: 45, minTier: 0 },
  { name: "Intel (OTC)", display: "Intel", category: "stocks", band: "otc", payout: 36, minTier: 0 },
  { name: "Palantir (OTC)", display: "Palantir", category: "stocks", band: "otc", payout: 34, minTier: 0 },
  { name: "McDonald's (OTC)", display: "McDonald's", category: "stocks", band: "otc", payout: 33, minTier: 0 },
  { name: "Tesla (OTC)", display: "Tesla", category: "stocks", band: "otc", payout: 33, minTier: 0 },
  { name: "Microsoft (OTC)", display: "Microsoft", category: "stocks", band: "otc", payout: 31, minTier: 0 },
  // OTC Indices
  { name: "AUS 200 (OTC)", display: "AUS 200", category: "indices", band: "otc", payout: 67, minTier: 0 },
  { name: "FTSE 100 (OTC)", display: "FTSE 100", category: "indices", band: "otc", payout: 45, minTier: 0 },
  { name: "DAX 30 (OTC)", display: "DAX 30", category: "indices", band: "otc", payout: 45, minTier: 0 },
  { name: "Dow Jones (OTC)", display: "Dow Jones", category: "indices", band: "otc", payout: 45, minTier: 0 },
  { name: "E35EUR (OTC)", display: "Euro Stoxx 35", category: "indices", band: "otc", payout: 45, minTier: 0 },
  { name: "E50EUR (OTC)", display: "Euro Stoxx 50", category: "indices", band: "otc", payout: 45, minTier: 0 },
  { name: "CAC 40 (OTC)", display: "CAC 40", category: "indices", band: "otc", payout: 45, minTier: 0 },
  { name: "Nikkei 225 (OTC)", display: "Nikkei 225", category: "indices", band: "otc", payout: 45, minTier: 0 },
  { name: "NASDAQ 100 (OTC)", display: "NASDAQ", category: "indices", band: "otc", payout: 45, minTier: 0 },
  { name: "S&P 500 (OTC)", display: "S&P 500", category: "indices", band: "otc", payout: 45, minTier: 0 },

  // Exchange Forex
  { name: "CHF/JPY", display: "CHF/JPY", category: "forex", band: "exchange", payout: 88, minTier: 1 },
  { name: "EUR/CAD", display: "EUR/CAD", category: "forex", band: "exchange", payout: 88, minTier: 1 },
  { name: "AUD/JPY", display: "AUD/JPY", category: "forex", band: "exchange", payout: 86, minTier: 1 },
  { name: "CAD/JPY", display: "CAD/JPY", category: "forex", band: "exchange", payout: 80, minTier: 1 },
  { name: "AUD/CHF", display: "AUD/CHF", category: "forex", band: "exchange", payout: 78, minTier: 1 },
  { name: "EUR/USD", display: "EUR/USD", category: "forex", band: "exchange", payout: 78, minTier: 1 },
  { name: "EUR/CHF", display: "EUR/CHF", category: "forex", band: "exchange", payout: 75, minTier: 1 },
  { name: "AUD/CAD", display: "AUD/CAD", category: "forex", band: "exchange", payout: 74, minTier: 1 },
  { name: "EUR/AUD", display: "EUR/AUD", category: "forex", band: "exchange", payout: 73, minTier: 1 },
  { name: "GBP/JPY", display: "GBP/JPY", category: "forex", band: "exchange", payout: 72, minTier: 1 },
  { name: "USD/JPY", display: "USD/JPY", category: "forex", band: "exchange", payout: 68, minTier: 1 },
  { name: "EUR/JPY", display: "EUR/JPY", category: "forex", band: "exchange", payout: 61, minTier: 1 },
  { name: "EUR/GBP", display: "EUR/GBP", category: "forex", band: "exchange", payout: 60, minTier: 1 },
  { name: "GBP/USD", display: "GBP/USD", category: "forex", band: "exchange", payout: 55, minTier: 1 },
  { name: "GBP/CAD", display: "GBP/CAD", category: "forex", band: "exchange", payout: 48, minTier: 1 },
  { name: "USD/CAD", display: "USD/CAD", category: "forex", band: "exchange", payout: 44, minTier: 1 },
  { name: "GBP/CHF", display: "GBP/CHF", category: "forex", band: "exchange", payout: 42, minTier: 1 },
  { name: "AUD/USD", display: "AUD/USD", category: "forex", band: "exchange", payout: 40, minTier: 1 },
  { name: "USD/CHF", display: "USD/CHF", category: "forex", band: "exchange", payout: 35, minTier: 1 },
  { name: "CAD/CHF", display: "CAD/CHF", category: "forex", band: "exchange", payout: 26, minTier: 1 },
  { name: "GBP/AUD", display: "GBP/AUD", category: "forex", band: "exchange", payout: 24, minTier: 1 },

  // Exchange Crypto
  { name: "BTC/USD", display: "Bitcoin", category: "crypto", band: "exchange", payout: 15, minTier: 1 },
];

const EXPIRATIONS: Record<PairBand, { value: string; labelKey: keyof { sec30: string; min1: string; min2: string; min3: string; min5: string; min30: string } }[]> = {
  otc: [
    { value: "30s", labelKey: "sec30" },
    { value: "60s", labelKey: "min1" },
    { value: "2m", labelKey: "min2" },
    { value: "3m", labelKey: "min3" },
    { value: "5m", labelKey: "min5" },
    { value: "30m", labelKey: "min30" },
  ],
  exchange: [
    { value: "2m", labelKey: "min2" },
    { value: "3m", labelKey: "min3" },
    { value: "5m", labelKey: "min5" },
    { value: "30m", labelKey: "min30" },
  ],
  elite: [
    { value: "2m", labelKey: "min2" },
    { value: "3m", labelKey: "min3" },
    { value: "5m", labelKey: "min5" },
    { value: "30m", labelKey: "min30" },
  ],
};

const BANDS: { key: PairBand; bandKey: "otc" | "exchange" | "elite"; minTier: number; color: string }[] = [
  { key: "otc", bandKey: "otc", minTier: 0, color: "#8888ff" },
  { key: "exchange", bandKey: "exchange", minTier: 1, color: "#8ee06b" },
  { key: "elite", bandKey: "elite", minTier: 2, color: "#d4a017" },
];

const CATEGORIES: { key: PairCategory | "all"; catKey: "all" | "forex" | "crypto" | "stocks" | "commodities" | "indices" }[] = [
  { key: "all", catKey: "all" },
  { key: "forex", catKey: "forex" },
  { key: "crypto", catKey: "crypto" },
  { key: "stocks", catKey: "stocks" },
  { key: "commodities", catKey: "commodities" },
  { key: "indices", catKey: "indices" },
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
  const { t } = useI18n();
  const ANALYSIS_STEPS = [
    t.tma.signals.analysisSteps.connecting,
    t.tma.signals.analysisSteps.analyzingChart,
    t.tma.signals.analysisSteps.rsiMacd,
    t.tma.signals.analysisSteps.calcEntry,
    t.tma.signals.analysisSteps.supportLevels,
    t.tma.signals.analysisSteps.formingSignal,
  ];
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
        setErrorMsg(t.tma.signals.errors.dailyLimitExhausted);
        setStep("pick");
        return;
      }

      if (!res.ok) {
        const err = await res.json() as { error?: string };
        setErrorMsg(err.error ?? t.tma.signals.errors.generationError);
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
      setErrorMsg(t.tma.signals.errors.networkError);
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
            <div className="text-sm font-semibold text-[var(--t-1)] mb-1">{t.tma.signals.analyzing}</div>
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
              <div className="text-[10px] uppercase tracking-wider text-[var(--t-3)] mb-1">{t.tma.signals.result.accuracy}</div>
              <div className="text-xl font-bold text-[var(--brand-gold)]">{result.confidence}%</div>
            </div>
            <div className="rounded-xl bg-[var(--bg-2)] p-3 text-center">
              <div className="text-[10px] uppercase tracking-wider text-[var(--t-3)] mb-1">{t.tma.signals.result.expiration}</div>
              <div className="text-sm font-semibold text-[var(--t-1)]">{result.expiration}</div>
            </div>
            <div className="rounded-xl bg-[var(--bg-2)] p-3 text-center">
              <div className="text-[10px] uppercase tracking-wider text-[var(--t-3)] mb-1">{t.tma.signals.result.payout}</div>
              <div className="text-sm font-semibold" style={{ color: getPayoutColor(result.payout) }}>
                +{result.payout}%
              </div>
            </div>
          </div>

          {result.entryPrice > 0 && (
            <div className="flex items-center gap-2 text-xs text-[var(--t-2)] px-3 py-2 rounded-lg bg-[rgba(212,160,23,0.06)]">
              <Target size={12} className="text-[var(--brand-gold)]" />
              {t.tma.signals.result.entryAt} <span className="text-[var(--brand-gold)] font-semibold">{result.entryPrice.toFixed(5)}</span>
            </div>
          )}

          {result.entryTime && (
            <div className="flex items-center gap-2 text-xs text-[var(--t-2)] px-3 py-2 rounded-lg bg-[rgba(212,160,23,0.06)]">
              <Clock size={12} className="text-[var(--brand-gold)]" />
              {t.tma.signals.result.entryTime} <span className="text-[var(--brand-gold)] font-semibold">{result.entryTime}</span>
            </div>
          )}

          {result.analysis && (
            <div className="rounded-xl px-4 py-3 text-[12px] leading-relaxed text-[var(--t-2)] mt-3"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--b-soft)" }}
            >
              <div className="text-[10px] uppercase tracking-wider text-[var(--brand-gold)] font-semibold mb-1.5">
                {t.tma.signals.result.analysis}
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
          {t.tma.signals.result.nextSignal}
        </button>
      </main>
    );
  }

  // ─── Pick step ───
  return (
    <main className="max-w-md mx-auto p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-[var(--t-1)]">{t.tma.signals.picker.title}</h1>
        {remaining !== null ? (
          <span className="text-xs text-[var(--t-3)]">
            {t.tma.signals.picker.remaining} <span className="text-[var(--brand-gold)] font-semibold">{remaining}</span>
          </span>
        ) : (
          <span className="text-xs text-[var(--brand-gold)]">{t.tma.signals.picker.unlimited}</span>
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
              {t.tma.signals.bands[b.bandKey]}
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
              {t.tma.signals.categories[c.catKey]}
            </button>
          );
        })}
      </div>

      {/* Pair list */}
      <div className="rounded-2xl border border-[var(--b-soft)] bg-[var(--bg-1)] overflow-hidden divide-y divide-[var(--b-soft)]">
        {filteredPairs.length === 0 && (
          <div className="py-8 text-center text-sm text-[var(--t-3)]">{t.tma.signals.picker.noPairsInCategory}</div>
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
                    {t.tma.signals.picker.expiration}
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
                          {t.tma.signals.expirations[exp.labelKey]}
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
                        t.tma.signals.buttons.limitExhausted
                      ) : (
                        t.tma.signals.buttons.getSignal
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
