/**
 * GET /api/signals/recent?after=<iso>&limit=<n>
 *
 * Returns active signals in the user's tier-allowed bands, newer than `after`
 * (if provided). Designed for client-side polling so the dashboard feed feels
 * realtime without a long-lived connection (Vercel-friendly).
 */
import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAccessReport } from "@/lib/access";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const TIER_ACCESS: Record<number, ("otc" | "exchange" | "elite")[]> = {
  0: ["otc"],
  1: ["otc"],
  2: ["otc", "exchange"],
  3: ["otc", "exchange", "elite"],
  4: ["otc", "exchange", "elite"],
};

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const afterRaw = url.searchParams.get("after");
  const limit = Math.min(50, Math.max(1, Number(url.searchParams.get("limit") ?? "20")));

  const report = await getAccessReport(session.user.id);
  const tier = report?.tier ?? 0;
  const allowedBands = TIER_ACCESS[tier] ?? ["otc"];

  const where: Record<string, unknown> = {
    tier: { in: allowedBands },
    isActive: true,
  };
  if (afterRaw) {
    const afterDate = new Date(afterRaw);
    if (!Number.isNaN(afterDate.getTime())) {
      where["createdAt"] = { gt: afterDate };
    }
  }

  const signals = await prisma.signal.findMany({
    where,
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
    serverTime: new Date().toISOString(),
    tier,
    allowedBands,
  });
}
