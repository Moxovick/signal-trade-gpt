/**
 * Shared signal generation pipeline.
 *
 * Used by:
 *   - POST /api/signals/request       (web session auth)
 *   - POST /api/bot/signal-request     (bot secret auth)
 *   - POST /api/tma/signal-request     (TMA initData auth)
 *
 * All signals (web, bot, TMA) go through the same generation + storage pipeline.
 */
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { canReceiveSignal } from "@/lib/access";
import { TIER_ACCESS, type SignalBand } from "@/lib/tier";
import { getCandles, type Candle } from "@/lib/marketdata";

// ─── Constants ───

const PAIRS: Record<SignalBand, string[]> = {
  otc: [
    "EUR/USD (OTC)", "GBP/USD (OTC)", "USD/JPY (OTC)", "AUD/USD (OTC)",
    "EUR/GBP (OTC)", "USD/CHF (OTC)", "NZD/USD (OTC)", "EUR/JPY (OTC)",
    "AUD/CHF (OTC)", "AUD/NZD (OTC)", "EUR/CHF (OTC)", "GBP/JPY (OTC)",
    "USD/CAD (OTC)", "CAD/JPY (OTC)", "GBP/AUD (OTC)", "EUR/NZD (OTC)",
    "Bitcoin ETF (OTC)", "Bitcoin (OTC)", "Litecoin (OTC)", "Dogecoin (OTC)",
    "Polygon (OTC)", "Cardano (OTC)", "Polkadot (OTC)", "Chainlink (OTC)",
    "BNB (OTC)", "Avalanche (OTC)", "Solana (OTC)", "TRON (OTC)",
    "Ethereum (OTC)", "Toncoin (OTC)",
    "Gold (OTC)", "Silver (OTC)", "Brent Oil (OTC)", "WTI Oil (OTC)",
    "Apple (OTC)", "Tesla (OTC)", "Amazon (OTC)", "Microsoft (OTC)",
    "Meta (OTC)", "Netflix (OTC)",
    "S&P 500 (OTC)", "NASDAQ 100 (OTC)", "Dow Jones (OTC)",
  ],
  exchange: [
    "EUR/USD", "GBP/USD", "USD/JPY", "AUD/USD",
    "EUR/GBP", "USD/CHF", "USD/CAD", "EUR/JPY",
    "GBP/JPY", "EUR/CHF", "AUD/CAD", "EUR/AUD",
    "GBP/AUD", "AUD/JPY", "CAD/JPY", "CHF/JPY",
    "BTC/USD",
  ],
  elite: [
    "AAPL", "TSLA", "AMZN", "MSFT", "META", "NFLX", "NVDA",
    "GOLD", "SILVER", "BTC/USD", "ETH/USD", "SOL/USD",
    "SP500", "US100",
  ],
};

const EXPIRATIONS: Record<SignalBand, readonly string[]> = {
  otc: ["30s", "60s", "2m"],
  exchange: ["60s", "2m", "5m"],
  elite: ["60s", "2m", "5m", "15m"],
};

const DIRECTIONS = ["CALL", "PUT"] as const;

const ELITE_PAIRS = PAIRS.elite;

// ─── Helpers ───

function randomItem<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Calculate entry time: current time + random 1-4 minutes, formatted as HH:MM.
 * Uses Moscow timezone (UTC+3).
 */
function calcEntryTime(): string {
  const offsetMin = randomInt(1, 4);
  const entry = new Date(Date.now() + offsetMin * 60_000);
  // Format in Moscow timezone
  return entry.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Moscow",
  });
}

/**
 * Determine which signal band a pair belongs to.
 */
function bandFromPair(pair: string): SignalBand {
  if (pair.includes("(OTC)")) return "otc";
  if (ELITE_PAIRS.includes(pair)) return "elite";
  return "exchange";
}

/**
 * Generate synthetic candles for OTC pairs — a gentle trend matching the direction.
 */
function generateSyntheticCandles(
  direction: "CALL" | "PUT",
  count = 30,
): { candles: Candle[]; lastClose: number } {
  const basePrice = 1.0 + Math.random() * 0.5; // e.g. 1.0–1.5
  const trend = direction === "CALL" ? 0.0003 : -0.0003;
  const candles: Candle[] = [];
  let price = basePrice;
  const now = Math.floor(Date.now() / 1000);

  for (let i = 0; i < count; i++) {
    const noise = (Math.random() - 0.5) * 0.001;
    const open = price;
    const close = price + trend + noise;
    const high = Math.max(open, close) + Math.random() * 0.0005;
    const low = Math.min(open, close) - Math.random() * 0.0005;
    candles.push({
      t: now - (count - i) * 60,
      o: +open.toFixed(5),
      h: +high.toFixed(5),
      l: +low.toFixed(5),
      c: +close.toFixed(5),
    });
    price = close;
  }

  return { candles, lastClose: candles[candles.length - 1].c };
}

// ─── Technical indicators ───

function calcEMA(closes: number[], period: number): number {
  if (closes.length === 0) return 0;
  const k = 2 / (period + 1);
  let ema = closes[0];
  for (let i = 1; i < closes.length; i++) {
    ema = closes[i] * k + ema * (1 - k);
  }
  return ema;
}

function calcRSI(closes: number[], period = 14): number {
  if (closes.length < period + 1) return 50;
  let gains = 0;
  let losses = 0;
  for (let i = closes.length - period; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff > 0) gains += diff;
    else losses -= diff;
  }
  if (losses === 0) return 100;
  const rs = gains / losses;
  return +(100 - 100 / (1 + rs)).toFixed(1);
}

function findLevels(candles: Candle[]): { support: number; resistance: number } {
  const lows = candles.map((c) => c.l);
  const highs = candles.map((c) => c.h);
  return {
    support: Math.min(...lows),
    resistance: Math.max(...highs),
  };
}

function directionFromIndicators(rsi: number, ema20: number, ema50: number, lastClose: number): "CALL" | "PUT" {
  let score = 0;
  if (rsi < 40) score += 1;
  else if (rsi > 60) score -= 1;
  if (ema20 > ema50) score += 1;
  else score -= 1;
  if (lastClose > ema20) score += 1;
  else score -= 1;
  return score >= 0 ? "CALL" : "PUT";
}

function confidenceFromIndicators(
  rsi: number,
  ema20: number,
  ema50: number,
  lastClose: number,
  band: SignalBand,
): number {
  const base = band === "elite" ? 88 : 80;
  let bonus = 0;
  if ((ema20 > ema50 && lastClose > ema20) || (ema20 < ema50 && lastClose < ema20)) bonus += 4;
  if (rsi < 30 || rsi > 70) bonus += 3;
  if ((rsi < 45 && ema20 > ema50) || (rsi > 55 && ema20 < ema50)) bonus += 2;
  return Math.min(base + bonus + randomInt(0, 3), 96);
}

function buildAnalysis(
  pair: string,
  direction: "CALL" | "PUT",
  band: SignalBand,
  rsi: number,
  ema20: number,
  ema50: number,
  support: number,
  resistance: number,
  entryPrice: number,
): string {
  const dir = direction === "CALL" ? "восходящее" : "нисходящее";
  const emaSignal = ema20 > ema50 ? "бычье" : "медвежье";
  const rsiZone =
    rsi < 30 ? "перепроданности" : rsi > 70 ? "перекупленности" : "нейтральной зоне";
  const prec = entryPrice > 100 ? 2 : entryPrice > 10 ? 4 : 5;

  if (band === "exchange") {
    return [
      `Пара ${pair} демонстрирует ${dir} движение.`,
      `RSI(14) = ${rsi} (${rsiZone}).`,
      `EMA(20) = ${ema20.toFixed(prec)}, EMA(50) = ${ema50.toFixed(prec)} — пересечение ${emaSignal}.`,
      `Поддержка: ${support.toFixed(prec)}, сопротивление: ${resistance.toFixed(prec)}.`,
      `Цена входа: ${entryPrice.toFixed(prec)}.`,
      direction === "CALL"
        ? `Ожидается отбой от поддержки с продолжением роста.`
        : `Ожидается откат от сопротивления с продолжением снижения.`,
    ].join(" ");
  }

  return [
    `Мультитаймфреймовый анализ ${pair}:`,
    `\n• M1: RSI = ${rsi} (${rsiZone}), ${dir} импульс`,
    `\n• EMA(20) ${ema20 > ema50 ? "выше" : "ниже"} EMA(50) — тренд ${emaSignal}`,
    `\n• Ключевые уровни: поддержка ${support.toFixed(prec)}, сопротивление ${resistance.toFixed(prec)}`,
    `\n• Вход: ${entryPrice.toFixed(prec)}`,
    `\n\nСигнал ${direction}: ${direction === "CALL" ? "цена у поддержки, RSI подтверждает разворот вверх" : "цена у сопротивления, RSI подтверждает разворот вниз"}.`,
    `\nRisk/Reward: 1:${randomInt(2, 4)}`,
  ].join("");
}

// ─── OTC signal (with synthetic chart data) ───

/** Generate dynamic OTC analysis with random indicator values. */
function generateOtcAnalysis(direction: "CALL" | "PUT"): string {
  const rsiVal = +(Math.random() * 64 + 18).toFixed(1);
  const stochK = +(Math.random() * 80 + 10).toFixed(1);
  const stochD = +(stochK + (Math.random() * 16 - 8)).toFixed(1);
  const bbPos = randomItem(["у нижней границы", "у верхней границы", "в середине канала", "пробой верхней границы", "пробой нижней границы"]);
  const maFast = randomItem(["EMA(9)", "EMA(12)", "SMA(10)"]);
  const maSlow = randomItem(["EMA(21)", "SMA(20)", "EMA(26)"]);
  const volumePct = randomInt(5, 45);
  const fibLevel = randomItem(["23.6%", "38.2%", "50.0%", "61.8%", "78.6%"]);
  const rsiZone = rsiVal > 70 ? "перекупленность" : rsiVal < 30 ? "перепроданность" : "нейтральная зона";
  const isCall = direction === "CALL";

  const templates = [
    `RSI(14): ${rsiVal} — ${rsiZone}\nStochastic: %K=${stochK}, %D=${stochD}\nBollinger: цена ${bbPos}\nОбъём: ${isCall ? "выше" : "ниже"} среднего на ${volumePct}%`,
    `RSI(14): ${rsiVal} — ${rsiZone}\n${maFast} ${isCall ? "выше" : "ниже"} ${maSlow} — ${isCall ? "бычий" : "медвежий"} тренд\nMACD: ${isCall ? "бычье" : "медвежье"} пересечение на M1\nFibonacci: отработка уровня ${fibLevel}`,
    `RSI(14): ${rsiVal} (${rsiZone})\nStochastic: %K=${stochK} ${isCall ? "↑" : "↓"} %D=${stochD}\nПаттерн: ${isCall ? "двойное дно" : "двойная вершина"} подтверждён\nОбъём: всплеск +${volumePct}% при формировании свечи`,
    `Bollinger Bands: цена ${bbPos}\nRSI(14): ${rsiVal} — ${rsiZone}\n${maFast}/${maSlow}: ${isCall ? "золотой крест" : "мёртвый крест"}\nATR: волатильность ${volumePct > 25 ? "повышенная" : "умеренная"}`,
    `RSI(14): ${rsiVal} → ${rsiVal < 40 ? "отскок от перепроданности" : "подтверждение импульса"}\nMACD гистограмма: ${isCall ? "растёт" : "снижается"}\nFibonacci ${fibLevel}: ${isCall ? "удержание поддержки" : "отбой от сопротивления"}\nОбъём: +${volumePct}% от среднего`,
    `Stochastic(%K=${stochK}, %D=${stochD}): ${stochK < 30 ? "выход из перепроданности" : "зона импульса"}\nRSI(14): ${rsiVal}\nBollinger: ${volumePct > 20 ? "сужение канала → пробой" : "цена " + bbPos}\nПаттерн: ${isCall ? "пин-бар" : "поглощение"} на ключевом уровне`,
  ];
  return randomItem(templates);
}

function generateOtcSignal(overridePair?: string, overrideExpiration?: string) {
  const pair = overridePair ?? randomItem(PAIRS.otc);
  const direction = randomItem(DIRECTIONS);
  const expiration = overrideExpiration ?? randomItem(EXPIRATIONS.otc);
  const confidence = randomInt(73, 88);

  const analysis = generateOtcAnalysis(direction);

  return {
    pair,
    direction: direction as "CALL" | "PUT",
    expiration,
    confidence,
    tier: "otc" as const,
    type: "ai" as const,
    analysis,
    chartData: Prisma.JsonNull,
    entryPrice: null,
    isActive: true,
  };
}

// ─── Non-OTC signal with real market data ───

async function generateRealSignal(band: "exchange" | "elite", overridePair?: string, overrideExpiration?: string) {
  const pair = overridePair ?? randomItem(PAIRS[band]);
  const expiration = overrideExpiration ?? randomItem(EXPIRATIONS[band]);

  const { candles, source } = await getCandles(pair, { count: 60, periodSec: 60 });

  const closes = candles.map((c) => c.c);
  const lastClose = closes[closes.length - 1] ?? 1;

  const rsi = calcRSI(closes);
  const ema20 = calcEMA(closes, 20);
  const ema50 = calcEMA(closes, 50);
  const { support, resistance } = findLevels(candles.slice(-30));

  const direction = directionFromIndicators(rsi, ema20, ema50, lastClose);
  const confidence = confidenceFromIndicators(rsi, ema20, ema50, lastClose, band);

  const analysis = buildAnalysis(pair, direction, band, rsi, ema20, ema50, support, resistance, lastClose);

  const chartPayload = {
    pair,
    direction,
    source,
    candles: candles.slice(-30).map((c) => ({
      time: c.t * 1000,
      open: c.o,
      high: c.h,
      low: c.l,
      close: c.c,
    })),
    indicators: {
      rsi,
      ema20: +ema20.toFixed(5),
      ema50: +ema50.toFixed(5),
    },
    levels: {
      support: +support.toFixed(5),
      resistance: +resistance.toFixed(5),
    },
    entryPrice: lastClose,
  };

  return {
    pair,
    direction,
    expiration,
    confidence,
    tier: band as "otc" | "exchange" | "elite",
    type: "ai" as const,
    analysis,
    chartData: chartPayload as unknown as Prisma.InputJsonValue,
    entryPrice: new Prisma.Decimal(lastClose),
    isActive: true,
  };
}

// ─── Public API ───

export type SignalResult = {
  signal: {
    id: string;
    pair: string;
    direction: string;
    expiration: string;
    confidence: number;
    tier: string;
    type: string;
    analysis: string | null;
    chartData: unknown;
    entryPrice: number | null;
    entryTime: string;
    createdAt: string;
  };
  access: {
    tier: number;
    dailyLimit: number | null;
    used: number;
    remaining: number | null;
  };
};

export type SignalError = {
  error: string;
  code: "daily_limit" | "no_user" | "band_not_allowed";
  dailyLimit: number | null;
  used: number;
};

/**
 * Generate a signal for a user: check limits, pick band, generate, save, log.
 *
 * Returns either `{ signal, access }` on success or `{ error, code, ... }` on failure.
 */
export async function generateSignalForUser(
  userId: string,
  options?: { pair?: string; expiration?: string },
): Promise<{ ok: true; data: SignalResult } | { ok: false; data: SignalError; statusCode: number }> {
  // Check daily limit
  const access = await canReceiveSignal(userId);
  if (!access.allowed) {
    const report = access.report;
    return {
      ok: false,
      statusCode: 429,
      data: {
        error: access.reason === "daily_limit"
          ? "Дневной лимит сигналов исчерпан"
          : "Пользователь не найден",
        code: access.reason ?? "no_user",
        dailyLimit: report?.dailySignalLimit ?? null,
        used: report?.signalsTodayUsed ?? 0,
      },
    };
  }

  const tier = access.report?.tier ?? 0;
  const allowedBands = TIER_ACCESS[tier] ?? ["otc"];

  let band: SignalBand;
  if (options?.pair) {
    band = bandFromPair(options.pair);
    if (!allowedBands.includes(band)) {
      return {
        ok: false,
        statusCode: 403,
        data: {
          error: "Эта пара недоступна для вашего уровня",
          code: "band_not_allowed",
          dailyLimit: access.report?.dailySignalLimit ?? null,
          used: access.report?.signalsTodayUsed ?? 0,
        },
      };
    }
  } else {
    band = randomItem(allowedBands) as SignalBand;
  }

  // Generate signal
  const signalData = band === "otc"
    ? generateOtcSignal(options?.pair, options?.expiration)
    : await generateRealSignal(band as "exchange" | "elite", options?.pair, options?.expiration);

  // Atomic transaction: re-check daily limit + create signal + log activity
  // This prevents TOCTOU race where two concurrent requests both pass the limit check.
  const dailyLimit = access.report?.dailySignalLimit ?? null;

  const signal = await prisma.$transaction(async (tx) => {
    // Re-count usage inside the transaction to prevent race conditions
    if (dailyLimit != null) {
      const startOfDay = new Date();
      startOfDay.setUTCHours(0, 0, 0, 0);
      const currentUsed = await tx.activityLog.count({
        where: {
          userId,
          action: { in: ["signal_view", "signal_received"] },
          createdAt: { gte: startOfDay },
        },
      });
      if (currentUsed >= dailyLimit) {
        return null; // limit exceeded
      }
    }

    const created = await tx.signal.create({
      data: {
        ...signalData,
        createdById: userId,
      },
    });

    await tx.activityLog.create({
      data: {
        userId,
        action: "signal_received",
        details: {
          signalId: created.id,
          pair: created.pair,
          direction: created.direction,
          tier: created.tier,
        },
      },
    });

    await tx.user.update({
      where: { id: userId },
      data: {
        signalsReceived: { increment: 1 },
        lastSignalAt: new Date(),
      },
    });

    return created;
  });

  // If the transaction returned null, the limit was hit during the race window
  if (!signal) {
    return {
      ok: false as const,
      statusCode: 429,
      data: {
        error: "Дневной лимит сигналов исчерпан",
        code: "daily_limit" as const,
        dailyLimit,
        used: dailyLimit ?? 0,
      },
    };
  }

  const used = (access.report?.signalsTodayUsed ?? 0) + 1;

  return {
    ok: true,
    data: {
      signal: {
        id: signal.id,
        pair: signal.pair,
        direction: signal.direction,
        expiration: signal.expiration,
        confidence: signal.confidence,
        tier: signal.tier,
        type: signal.type,
        analysis: signal.analysis,
        chartData: signal.chartData,
        entryPrice: signal.entryPrice ? Number(signal.entryPrice) : null,
        entryTime: calcEntryTime(),
        createdAt: signal.createdAt.toISOString(),
      },
      access: {
        tier,
        dailyLimit,
        used,
        remaining: dailyLimit != null ? Math.max(0, dailyLimit - used) : null,
      },
    },
  };
}
