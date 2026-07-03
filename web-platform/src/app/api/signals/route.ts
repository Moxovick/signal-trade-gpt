/**
 * GET /api/signals — list signals visible to the caller, filtered by tier.
 *
 * On-demand 3-tier access model:
 *  - T0 (Free):  OTC only, 3/day.
 *  - T1 (Basic): OTC + exchange, 10/day.
 *  - T2 (Pro):   all bands, unlimited.
 *
 * Signal creation moved to POST /api/signals/request.
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canReceiveSignal } from "@/lib/access";

type SignalTier = "otc" | "exchange" | "elite";

function tiersForUser(tier: number): SignalTier[] {
  if (tier <= 0) return ["otc"];
  if (tier === 1) return ["otc", "exchange"];
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
  const myOnly = searchParams.get("my") === "true";

  const access = await canReceiveSignal(session.user.id);
  const tier = access.report?.tier ?? 0;
  const allowedTiers = tiersForUser(tier);

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
      access: { tier, dailyLimit: access.report?.dailySignalLimit, used: access.report?.signalsTodayUsed ?? 0 },
    });
  }

  const where: Record<string, unknown> = {
    tier: { in: tiersForQuery },
    isActive: true,
  };
  if (myOnly) {
    where["createdById"] = session.user.id;
  }

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
        createdById: true,
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
      tier,
      dailyLimit: access.report?.dailySignalLimit,
      used: access.report?.signalsTodayUsed ?? 0,
      remaining: access.report?.dailySignalLimit != null
        ? Math.max(0, access.report.dailySignalLimit - access.report.signalsTodayUsed)
        : null,
    },
  });
}
