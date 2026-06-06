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

const EXPIRATIONS = ["60s", "2m", "3m", "5m"] as const;
const DIRECTIONS = ["CALL", "PUT"] as const;

function randomItem<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateSignal(allowedBands: SignalBand[]) {
  const band = randomItem(allowedBands);
  const pool = PAIRS[band];
  const pair = randomItem(pool);
  const direction = randomItem(DIRECTIONS);
  const expiration = randomItem(EXPIRATIONS);
  const confidence = Math.floor(Math.random() * 16) + 80; // 80-95

  return {
    pair,
    direction: direction as "CALL" | "PUT",
    expiration,
    confidence,
    tier: band as "otc" | "exchange" | "elite",
    type: "ai" as const,
    analysis: null,
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
