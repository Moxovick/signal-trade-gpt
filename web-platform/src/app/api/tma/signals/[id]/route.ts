/**
 * GET /api/tma/signals/[id] — single signal for the Mini App.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authTmaRequest } from "@/lib/tma-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await authTmaRequest(req);
  if (!session.ok) {
    return NextResponse.json({ error: session.reason }, { status: 401 });
  }
  const { id } = await ctx.params;
  const signal = await prisma.signal.findUnique({
    where: { id },
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
  if (!signal) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({
    signal: {
      ...signal,
      entryPrice: signal.entryPrice == null ? null : Number(signal.entryPrice),
      exitPrice: signal.exitPrice == null ? null : Number(signal.exitPrice),
      createdAt: signal.createdAt.toISOString(),
      closedAt: signal.closedAt?.toISOString() ?? null,
    },
  });
}
