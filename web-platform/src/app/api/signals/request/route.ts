/**
 * POST /api/signals/request — on-demand signal generation.
 *
 * User presses "Получить сигнал" and gets ONE signal:
 *  1. Check auth
 *  2. Check tier and daily limit
 *  3. Generate signal based on tier (OTC = random for MVP)
 *  4. Save to DB
 *  5. Log activity, increment counter
 *  6. Return signal
 *
 * 3-tier model:
 *   T0 (Free):  3/day, OTC only
 *   T1 (Basic): 10/day (configurable), OTC + exchange
 *   T2 (Pro):   unlimited, all types
 */
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { canReceiveSignal } from "@/lib/access";
import { TIER_ACCESS, type SignalBand } from "@/lib/tier";

export const dynamic = "force-dynamic";

const PAIRS: Record<SignalBand, string[]> = {
  otc: [
    "EUR/USD (OTC)", "GBP/USD (OTC)", "USD/JPY (OTC)", "AUD/USD (OTC)",
    "EUR/GBP (OTC)", "USD/CHF (OTC)", "NZD/USD (OTC)", "EUR/JPY (OTC)",
  ],
  exchange: [
    "EUR/USD", "GBP/USD", "USD/JPY", "AUD/USD",
    "EUR/GBP", "USD/CHF", "BTC/USD", "ETH/USD",
  ],
  elite: [
    "AAPL", "TSLA", "GOLD", "BTC/USD", "ETH/USD",
  ],
};

const EXPIRATIONS: Record<SignalBand, readonly string[]> = {
  otc: ["30s", "60s", "2m"],
  exchange: ["60s", "2m", "5m"],
  elite: ["60s", "2m", "5m", "15m"],
};

const CONFIDENCE_RANGE: Record<SignalBand, [number, number]> = {
  otc: [73, 88],
  exchange: [80, 92],
  elite: [88, 96],
};

const DIRECTIONS = ["CALL", "PUT"] as const;

function randomItem<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Simulated key levels for analysis (non-OTC signals). */
function generateAnalysis(pair: string, direction: string, band: SignalBand): string {
  const dir = direction === "CALL" ? "восходящее" : "нисходящее";
  const basePrice = (1 + Math.random() * 2).toFixed(4);

  if (band === "exchange") {
    const analyses = [
      `Пара ${pair} демонстрирует ${dir} движение. RSI(14) = ${randomInt(25, 75)}, MACD пересечение ${direction === "CALL" ? "бычье" : "медвежье"}. Ключевой уровень ${direction === "CALL" ? "поддержки" : "сопротивления"}: ${basePrice}. Объёмы ${direction === "CALL" ? "растут" : "снижаются"}, подтверждая текущий тренд.`,
      `Анализ ${pair}: ${direction === "CALL" ? "Бычья" : "Медвежья"} дивергенция на RSI. Цена ${direction === "CALL" ? "отбилась от" : "пробила"} уровень ${basePrice}. Stochastic в зоне ${direction === "CALL" ? "перепроданности" : "перекупленности"}. EMA(20) ${direction === "CALL" ? "выше" : "ниже"} EMA(50) — тренд ${dir}.`,
      `${pair}: Формация «${direction === "CALL" ? "двойное дно" : "двойная вершина"}» на H1. Bollinger Bands сужаются, ожидается ${dir} импульс. Фибо-уровень 61.8% на ${basePrice} ${direction === "CALL" ? "удержан" : "пробит"}. Volume Profile подтверждает.`,
    ];
    return randomItem(analyses);
  }

  // Elite — multi-timeframe analysis
  const analyses = [
    `Мультитаймфреймовый анализ ${pair}:\n• H4: ${dir} тренд, Smart Money ${direction === "CALL" ? "накапливают" : "распределяют"}\n• H1: Order Block на ${basePrice}, FVG ${direction === "CALL" ? "заполнен" : "открыт"}\n• M15: BOS (Break of Structure) ${direction === "CALL" ? "вверх" : "вниз"}, вход от OTE\n\nRisk/Reward: 1:${randomInt(2, 4)}`,
    `${pair} — институциональный разбор:\n• Ликвидность ${direction === "CALL" ? "ниже" : "выше"} ${basePrice} собрана\n• ICT Premium/Discount: цена в ${direction === "CALL" ? "дискаунте" : "премиуме"}\n• Killzone ${direction === "CALL" ? "London Open" : "NY Session"}: высокая вероятность импульса\n• Корреляция DXY: ${direction === "CALL" ? "медвежья" : "бычья"} (подтверждает)`,
  ];
  return randomItem(analyses);
}

/** Simulated chart data for non-OTC signals. */
function generateChartData(pair: string, direction: string): Record<string, unknown> {
  const now = Date.now();
  const base = 1 + Math.random() * 0.5;
  const candles = Array.from({ length: 30 }, (_, i) => {
    const open = base + (Math.random() - 0.5) * 0.01;
    const close = open + (Math.random() - 0.5) * 0.008;
    const high = Math.max(open, close) + Math.random() * 0.003;
    const low = Math.min(open, close) - Math.random() * 0.003;
    return {
      time: now - (30 - i) * 60_000,
      open: +open.toFixed(5),
      high: +high.toFixed(5),
      low: +low.toFixed(5),
      close: +close.toFixed(5),
      volume: randomInt(800, 5000),
    };
  });

  const lastClose = candles[candles.length - 1].close;
  const support = +(lastClose - Math.random() * 0.005).toFixed(5);
  const resistance = +(lastClose + Math.random() * 0.005).toFixed(5);

  return {
    pair,
    direction,
    candles,
    indicators: {
      rsi: randomInt(25, 75),
      macd: { signal: +(Math.random() * 0.002 - 0.001).toFixed(5), histogram: +(Math.random() * 0.001).toFixed(5) },
      ema20: +(lastClose + (Math.random() - 0.5) * 0.003).toFixed(5),
      ema50: +(lastClose + (Math.random() - 0.5) * 0.006).toFixed(5),
    },
    levels: { support, resistance },
    entryPrice: lastClose,
  };
}

function generateSignal(allowedBands: SignalBand[]) {
  const band = randomItem(allowedBands);
  const pool = PAIRS[band];
  const pair = randomItem(pool);
  const direction = randomItem(DIRECTIONS);
  const expiration = randomItem(EXPIRATIONS[band]);
  const [minConf, maxConf] = CONFIDENCE_RANGE[band];
  const confidence = randomInt(minConf, maxConf);

  const isOtc = band === "otc";

  const analysis = isOtc ? null : generateAnalysis(pair, direction, band);
  const rawChart = isOtc ? null : generateChartData(pair, direction);
  const entryPrice = rawChart
    ? (rawChart as { entryPrice: number }).entryPrice
    : null;

  return {
    pair,
    direction: direction as "CALL" | "PUT",
    expiration,
    confidence,
    tier: band as "otc" | "exchange" | "elite",
    type: "ai" as const,
    analysis,
    chartData: rawChart ? (rawChart as Prisma.InputJsonValue) : Prisma.JsonNull,
    entryPrice: entryPrice ? new Prisma.Decimal(entryPrice) : null,
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

  // Generate signal
  const signalData = generateSignal(allowedBands as SignalBand[]);

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
