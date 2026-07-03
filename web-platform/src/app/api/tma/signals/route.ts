/**
 * GET /api/tma/signals — Mini-App version of /api/signals/recent.
 *
 * Auth: `X-Telegram-Init-Data` header (initData) instead of NextAuth session.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authTmaRequest } from "@/lib/tma-auth";
import { getAccessReport } from "@/lib/access";
import { TIER_ACCESS } from "@/lib/tier";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const session = await authTmaRequest(req);
  if (!session.ok) {
    return NextResponse.json({ error: session.reason }, { status: 401 });
  }

  const url = new URL(req.url);
  const limit = Math.min(50, Math.max(1, Number(url.searchParams.get("limit") ?? "20")));

  const report = await getAccessReport(session.userId);
  const tier = report?.tier ?? 0;
  const allowedBands = TIER_ACCESS[tier] ?? ["otc"];

  const signals = await prisma.signal.findMany({
    where: { createdById: session.userId, tier: { in: allowedBands }, isActive: true },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      pair: true,
      direction: true,
      expiration: true,
      confidence: true,
      tier: true,
      result: true,
      entryPrice: true,
      exitPrice: true,
      analysis: true,
      createdAt: true,
      closedAt: true,
    },
  });

  return NextResponse.json({
    signals: signals.map((s) => ({
      ...s,
      entryPrice: s.entryPrice == null ? null : Number(s.entryPrice),
      exitPrice: s.exitPrice == null ? null : Number(s.exitPrice),
      createdAt: s.createdAt.toISOString(),
      closedAt: s.closedAt?.toISOString() ?? null,
    })),
    tier,
    allowedBands,
  });
}
