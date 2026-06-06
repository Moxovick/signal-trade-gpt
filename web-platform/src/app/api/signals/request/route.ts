/**
 * POST /api/signals/request — on-demand signal generation.
 *
 * OTC  → random (no real market data).
 * Exchange / Elite → real OHLC from Twelve Data / Binance via getCandles(),
 *   RSI + EMA calculated from actual candles, analysis based on real indicators.
 *
 * 3-tier model:
 *   T0 (Free):  3/day, OTC only
 *   T1 (Basic): 10/day, OTC + exchange
 *   T2 (Pro):   unlimited, all types
 */
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { canReceiveSignal } from "@/lib/access";
import { TIER_ACCESS, type SignalBand } from "@/lib/tier";
import { getCandles, type Candle } from "@/lib/marketdata";

export const dynamic = "force-dynamic";

const PAIRS: Record<SignalBand, string[]> = {
  otc: [
    "EUR/USD (OTC)", "GBP/USD (OTC)", "USD/JPY (OTC)", "AUD/USD (OTC)",
    "EUR/GBP (OTC)", "USD/CHF (OTC)", "NZD/USD (OTC)", "EUR/JPY (OTC)",
  ],
  exchange: [
    "EUR/USD", "GBP/USD", "USD/JPY", "AUD/USD",
    "EUR/GBP", "USD/CHF",
  ],
  elite: [
    "EUR/USD", "GBP/USD", "USD/JPY", "AAPL", "TSLA", "GOLD",
  ],
};

const EXPIRATIONS: Record<SignalBand, readonly string[]> = {
  otc: ["30s", "60s", "2m"],
  exchange: ["60s", "2m", "5m"],
  elite: ["60s", "2m", "5m", "15m"],
};

const DIRECTIONS = ["CALL", "PUT"] as const;

function randomItem<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ─── Technical indicators from real candles ───

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

/** Determine direction from real data. */
function directionFromIndicators(rsi: number, ema20: number, ema50: number, lastClose: number): "CALL" | "PUT" {
  let score = 0;
  if (rsi < 40) score += 1;       // oversold → CALL
  else if (rsi > 60) score -= 1;  // overbought → PUT
  if (ema20 > ema50) score += 1;  // bullish cross
  else score -= 1;
  if (lastClose > ema20) score += 1;
  else score -= 1;
  return score >= 0 ? "CALL" : "PUT";
}

/** Confidence based on indicator agreement. */
function confidenceFromIndicators(
  rsi: number,
  ema20: number,
  ema50: number,
  lastClose: number,
  band: SignalBand,
): number {
  const base = band === "elite" ? 88 : 80;
  let bonus = 0;
  // Strong trend agreement
  if ((ema20 > ema50 && lastClose > ema20) || (ema20 < ema50 && lastClose < ema20)) bonus += 4;
  // RSI in extreme zone
  if (rsi < 30 || rsi > 70) bonus += 3;
  // RSI confirming direction
  if ((rsi < 45 && ema20 > ema50) || (rsi > 55 && ema20 < ema50)) bonus += 2;
  return Math.min(base + bonus + randomInt(0, 3), 96);
}

/** Build analysis text from real indicators. */
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

  // Elite — multi-timeframe style
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

// ─── OTC random signal (no market data) ───

function generateOtcSignal() {
  const pair = randomItem(PAIRS.otc);
  const direction = randomItem(DIRECTIONS);
  const expiration = randomItem(EXPIRATIONS.otc);
  const confidence = randomInt(73, 88);

  return {
    pair,
    direction: direction as "CALL" | "PUT",
    expiration,
    confidence,
    tier: "otc" as const,
    type: "ai" as const,
    analysis: null,
    chartData: Prisma.JsonNull,
    entryPrice: null,
    isActive: true,
  };
}

// ─── Non-OTC signal with real market data ───

async function generateRealSignal(band: "exchange" | "elite") {
  const pair = randomItem(PAIRS[band]);
  const expiration = randomItem(EXPIRATIONS[band]);

  // Fetch real candles
  const { candles, source } = await getCandles(pair, { count: 60, periodSec: 60 });

  const closes = candles.map((c) => c.c);
  const lastClose = closes[closes.length - 1] ?? 1;

  // Real indicators
  const rsi = calcRSI(closes);
  const ema20 = calcEMA(closes, 20);
  const ema50 = calcEMA(closes, 50);
  const { support, resistance } = findLevels(candles.slice(-30));

  // Direction from real indicators (not random)
  const direction = directionFromIndicators(rsi, ema20, ema50, lastClose);
  const confidence = confidenceFromIndicators(rsi, ema20, ema50, lastClose, band);

  const analysis = buildAnalysis(pair, direction, band, rsi, ema20, ema50, support, resistance, lastClose);

  // Chart data for frontend
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

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  // Check daily limit
  const access = await canReceiveSignal(userId);
  if (!access.allowed) {
    const report = access.report;
    return NextResponse.json(
      {
        error: access.reason === "daily_limit"
          ? "Дневной лимит сигналов исчерпан"
          : "Пользователь не найден",
        code: access.reason,
        dailyLimit: report?.dailySignalLimit ?? null,
        used: report?.signalsTodayUsed ?? 0,
      },
      { status: 429 },
    );
  }

  const tier = access.report?.tier ?? 0;
  const allowedBands = TIER_ACCESS[tier] ?? ["otc"];
  const band = randomItem(allowedBands) as SignalBand;

  // Generate signal — OTC is random, non-OTC uses real market data
  const signalData = band === "otc"
    ? generateOtcSignal()
    : await generateRealSignal(band as "exchange" | "elite");

  // Save to DB
  const signal = await prisma.signal.create({
    data: {
      ...signalData,
      createdById: userId,
    },
  });

  // Log activity for daily limit tracking
  await prisma.activityLog.create({
    data: {
      userId,
      action: "signal_received",
      details: {
        signalId: signal.id,
        pair: signal.pair,
        direction: signal.direction,
        tier: signal.tier,
      },
    },
  });

  // Update user stats
  await prisma.user.update({
    where: { id: userId },
    data: {
      signalsReceived: { increment: 1 },
      lastSignalAt: new Date(),
    },
  });

  return NextResponse.json({
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
      createdAt: signal.createdAt.toISOString(),
    },
    access: {
      tier,
      dailyLimit: access.report?.dailySignalLimit ?? null,
      used: (access.report?.signalsTodayUsed ?? 0) + 1,
      remaining: access.report?.dailySignalLimit != null
        ? Math.max(0, access.report.dailySignalLimit - (access.report.signalsTodayUsed + 1))
        : null,
    },
  });
}
