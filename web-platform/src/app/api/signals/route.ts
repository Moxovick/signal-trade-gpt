/**
 * GET /api/signals  — list signals visible to the caller, filtered by tier-based perks.
 * POST /api/signals — admin-only signal creation.
 *
 * v2 access model:
 *  - T0 (no PO account / not verified): tagged "demo" signals only, hard-capped
 *    by `T0_LIFETIME_DEMO_LIMIT`.
 *  - T1: OTC.
 *  - T2: OTC + exchange.
 *  - T3: OTC + exchange + elite.
 *  - T4: same as T3, but with early-access window (handled at delivery).
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canReceiveSignal } from "@/lib/access";

type SignalTier = "otc" | "exchange" | "elite";

function tiersForUser(tier: number): SignalTier[] {
  if (tier <= 0) return [];
  if (tier === 1) return ["otc"];
  if (tier === 2) return ["otc", "exchange"];
  return ["otc", "exchange", "elite"];
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") ?? 1);
  const limit = Math.min(50, Number(searchParams.get("limit") ?? 20));
  const tierFilter = searchParams.get("tier") as SignalTier | null;

  const access = await canReceiveSignal(session.user.id);
  const allowedTiers = tiersForUser(access.report?.tier ?? 0);

  // T0 path: demo signals only.
  if ((access.report?.tier ?? 0) === 0) {
    const remaining = access.report?.demoSignalsRemaining ?? 0;
    const demoSignals = await prisma.signal.findMany({
      where: { isActive: true, type: "demo" as never },
      orderBy: { createdAt: "desc" },
      take: Math.min(remaining, limit),
    });
    return NextResponse.json({
      signals: demoSignals,
      total: demoSignals.length,
      page: 1,
      limit,
      allowedTiers: ["demo"],
      access: { tier: 0, demoRemaining: remaining, dailyLimit: null, used: 0 },
    });
  }

  const tiersForQuery = tierFilter
    ? allowedTiers.filter((t) => t === tierFilter)
    : allowedTiers;

  if (tiersForQuery.length === 0) {
    return NextResponse.json({
      signals: [],
      total: 0,
      page,
      limit,
      allowedTiers,
      access: { tier: access.report?.tier ?? 0 },
    });
  }

  const where = {
    tier: { in: tiersForQuery },
    isActive: true,
  };

  const [signals, total] = await Promise.all([
    prisma.signal.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        pair: true,
        direction: true,
        expiration: true,
        confidence: true,
        type: true,
        tier: true,
        entryPrice: true,
        exitPrice: true,
        result: true,
        analysis: true,
        reasoning: true,
        createdAt: true,
        closedAt: true,
      },
    }),
    prisma.signal.count({ where }),
  ]);

  return NextResponse.json({
    signals,
    total,
    page,
    limit,
    allowedTiers,
    access: {
      tier: access.report?.tier ?? 0,
      demoRemaining: access.report?.demoSignalsRemaining,
      dailyLimit: access.report?.dailySignalLimit,
      used: access.report?.signalsTodayUsed ?? 0,
    },
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const signal = await prisma.signal.create({
    data: {
      pair: body.pair,
      direction: body.direction,
      expiration: body.expiration,
      confidence: body.confidence,
      type: body.type ?? "ai",
      tier: body.tier ?? "otc",
      analysis: body.analysis ?? null,
      reasoning: body.reasoning ?? null,
      createdById: session.user.id,
    },
  });

  return NextResponse.json({ signal }, { status: 201 });
}
