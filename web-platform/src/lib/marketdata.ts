/**
 * Market-data adapter for NON-OTC assets only.
 *
 * Resolution order, per Asset.provider:
 *   • binance     → public REST klines (no key, crypto)
 *   • twelvedata  → with TWELVEDATA_API_KEY (FX, commodities, indices, stocks)
 *   • yahoo       → not yet implemented
 *   • none / OTC  → caller MUST not call this; OTC has no chart data
 *
 * Falls back to a deterministic synthetic series so the UI never hard-fails.
 *
 * The shape we expose is OHLC + epoch-second timestamp.
 */

import { findAssetBySymbol } from "@/lib/assets";

export type Candle = {
  /** Unix epoch seconds. */
  t: number;
  o: number;
  h: number;
  l: number;
  c: number;
};

// ───────────────────────────────────────
// Binance public (no key)
// ───────────────────────────────────────
async function fetchBinance(
  providerSymbol: string,
  count: number,
  periodSec: number,
): Promise<Candle[] | null> {
  // Map periodSec → Binance interval strings.
  const interval =
    periodSec <= 60
      ? "1m"
      : periodSec <= 300
        ? "5m"
        : periodSec <= 900
          ? "15m"
          : periodSec <= 1800
            ? "30m"
            : "1h";
  try {
    const url = `https://api.binance.com/api/v3/klines?symbol=${encodeURIComponent(providerSymbol)}&interval=${interval}&limit=${Math.min(count, 200)}`;
    const r = await fetch(url, { next: { revalidate: 30 } });
    if (!r.ok) return null;
    const j = (await r.json()) as Array<
      [number, string, string, string, string, string, number, string, number, string, string, string]
    >;
    return j.map((row) => ({
      t: Math.floor(row[0] / 1000),
      o: Number(row[1]),
      h: Number(row[2]),
      l: Number(row[3]),
      c: Number(row[4]),
    }));
  } catch {
    return null;
  }
}

// ───────────────────────────────────────
// TwelveData (key required)
// ───────────────────────────────────────
async function fetchTwelveData(
  providerSymbol: string,
  count: number,
  periodSec: number,
): Promise<Candle[] | null> {
  const apiKey = process.env["TWELVEDATA_API_KEY"];
  if (!apiKey) return null;
  const interval =
    periodSec <= 60
      ? "1min"
      : periodSec <= 300
        ? "5min"
        : periodSec <= 900
          ? "15min"
          : periodSec <= 1800
            ? "30min"
            : "1h";
  try {
    const url = `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(providerSymbol)}&interval=${interval}&outputsize=${Math.min(count, 200)}&apikey=${apiKey}`;
    const r = await fetch(url, { next: { revalidate: 30 } });
    if (!r.ok) return null;
    const j = (await r.json()) as {
      values?: Array<{
        datetime: string;
        open: string;
        high: string;
        low: string;
        close: string;
      }>;
      status?: string;
    };
    if (!Array.isArray(j.values)) return null;
    return j.values
      .map((row) => ({
        t: Math.floor(new Date(row.datetime + "Z").getTime() / 1000),
        o: Number(row.open),
        h: Number(row.high),
        l: Number(row.low),
        c: Number(row.close),
      }))
      .reverse(); // TwelveData returns newest-first; we want oldest-first.
  } catch {
    return null;
  }
}

// ───────────────────────────────────────
// Synthetic fallback (deterministic)
// ───────────────────────────────────────
function syntheticSeries(pair: string, count: number, periodSec: number): Candle[] {
  const anchors: Record<string, number> = {
    "EUR/USD": 1.0856,
    "GBP/USD": 1.2685,
    "USD/JPY": 152.34,
    "AUD/USD": 0.6628,
    "EUR/GBP": 0.8553,
    "USD/CHF": 0.8784,
    BTCUSDT: 67500,
  };
  const base = anchors[pair] ?? 1;
  const now = Math.floor(Date.now() / 1000);
  let price = base;
  let seed = 0;
  for (const ch of pair) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
  function rand(): number {
    seed = (seed + 0x6d2b79f5) >>> 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  const out: Candle[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const t = now - i * periodSec;
    const o = price;
    const h = o * (1 + rand() * 0.0009);
    const l = o * (1 - rand() * 0.0009);
    const c = l + (h - l) * rand();
    price = c;
    out.push({ t, o, h, l, c });
  }
  return out;
}

export async function getCandles(
  pair: string,
  options: { count?: number; periodSec?: number } = {},
): Promise<{
  pair: string;
  source: "binance" | "twelvedata" | "synthetic";
  candles: Candle[];
}> {
  const count = options.count ?? 60;
  const periodSec = options.periodSec ?? 60;

  // Look up provider from Asset whitelist.
  const asset = await findAssetBySymbol(pair).catch(() => null);
  if (asset && !asset.isOtc && asset.provider !== "none") {
    const providerSymbol = asset.providerSymbol ?? pair;
    if (asset.provider === "binance") {
      const real = await fetchBinance(providerSymbol, count, periodSec);
      if (real && real.length > 0) return { pair, source: "binance", candles: real };
    } else if (asset.provider === "twelvedata") {
      const real = await fetchTwelveData(providerSymbol, count, periodSec);
      if (real && real.length > 0) return { pair, source: "twelvedata", candles: real };
    }
  }

  return { pair, source: "synthetic", candles: syntheticSeries(pair, count, periodSec) };
}

/** Legacy export — replaced by Asset whitelist; kept for the static landing chart. */
export const SUPPORTED_PAIRS = [
  "EUR/USD",
  "GBP/USD",
  "USD/JPY",
  "AUD/USD",
  "EUR/GBP",
  "USD/CHF",
] as const;
