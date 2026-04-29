/**
 * Market-data adapter.
 *
 * Resolution order:
 *   1. If `CHIPA_API_KEY` is configured, hit Chipa's unofficial PocketOption
 *      candle endpoint.
 *   2. Otherwise, generate a deterministic synthetic series so the UI is
 *      always populated locally and during build.
 *
 * Chipa API reference: https://pocketoption-api.readme.io/
 *   GET https://api.chipa.tech/po/api/v1/candles?symbol=EURUSD&period=60&count=200
 *   Header: Authorization: Bearer <CHIPA_API_KEY>
 *
 * The shape we expose is OHLC + epoch-second timestamp, which works directly
 * with the recharts ComposedChart we render on the landing page.
 */

export type Candle = {
  /** Unix epoch seconds. */
  t: number;
  o: number;
  h: number;
  l: number;
  c: number;
};

const CHIPA_BASE = "https://api.chipa.tech/po/api/v1";

/**
 * Convert "EUR/USD" → "EURUSD". Chipa wants the bare symbol.
 */
function chipaSymbol(pair: string): string {
  return pair.replace(/[/\s]/g, "").toUpperCase();
}

/**
 * Try fetching real candles from Chipa. Returns null on any failure (caller
 * falls back to synthetic data so the UI never hard-fails).
 */
async function fetchChipa(pair: string, count: number, periodSec: number): Promise<Candle[] | null> {
  const apiKey = process.env["CHIPA_API_KEY"];
  if (!apiKey) return null;
  try {
    const url = `${CHIPA_BASE}/candles?symbol=${chipaSymbol(pair)}&period=${periodSec}&count=${count}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
      next: { revalidate: 30 },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { candles?: Array<{ t: number; o: number; h: number; l: number; c: number }> };
    if (!Array.isArray(json.candles)) return null;
    return json.candles.map((c) => ({ t: c.t, o: c.o, h: c.h, l: c.l, c: c.c }));
  } catch {
    return null;
  }
}

/**
 * Deterministic-ish random walk seeded by the pair name. Good enough for
 * "the chart is moving" UX without leaking that the data is fake (we always
 * label it synthetic in the response).
 */
function syntheticSeries(pair: string, count: number, periodSec: number): Candle[] {
  // Anchor pricing per pair — purely cosmetic.
  const anchors: Record<string, number> = {
    "EUR/USD": 1.0856,
    "GBP/USD": 1.2685,
    "USD/JPY": 152.34,
    "AUD/USD": 0.6628,
    "EUR/GBP": 0.8553,
    "USD/CHF": 0.8784,
  };
  const base = anchors[pair] ?? 1;
  const now = Math.floor(Date.now() / 1000);
  let price = base;

  // Mulberry32 hash from the symbol so different pairs walk differently.
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
): Promise<{ pair: string; source: "chipa" | "synthetic"; candles: Candle[] }> {
  const count = options.count ?? 60;
  const periodSec = options.periodSec ?? 60;
  const real = await fetchChipa(pair, count, periodSec);
  if (real && real.length > 0) {
    return { pair, source: "chipa", candles: real };
  }
  return { pair, source: "synthetic", candles: syntheticSeries(pair, count, periodSec) };
}

export const SUPPORTED_PAIRS = [
  "EUR/USD",
  "GBP/USD",
  "USD/JPY",
  "AUD/USD",
  "EUR/GBP",
  "USD/CHF",
] as const;
