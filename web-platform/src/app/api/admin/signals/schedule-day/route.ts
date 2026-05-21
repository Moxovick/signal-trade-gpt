/**
 * GET  /api/admin/signals/schedule-day?date=YYYY-MM-DD
 *   Returns all signals scheduled for the given UTC date.
 *
 * POST /api/admin/signals/schedule-day
 *   Body: { slots: SlotInput[] }
 *   Creates signals with isActive=false and scheduledAt set.
 *   Existing scheduled-but-unpublished signals for the same date are deleted first
 *   so you can regenerate the plan freely.
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type SlotInput = {
  scheduledAt: string; // ISO string
  pair: string;
  direction: "CALL" | "PUT";
  expiration: string;
  confidence: number;
  tier: "otc" | "exchange" | "elite";
  type?: "ai" | "expert" | "manual";
  analysis?: string | null;
};

async function requireAdmin(_req: NextRequest) {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user || role !== "admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  return null;
}

export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  const url = new URL(req.url);
  const dateStr = url.searchParams.get("date"); // YYYY-MM-DD
  const date = dateStr ? new Date(dateStr) : new Date();

  const start = new Date(date);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  const signals = await prisma.signal.findMany({
    where: {
      scheduledAt: { gte: start, lt: end },
    },
    orderBy: { scheduledAt: "asc" },
  });

  return NextResponse.json({
    signals: signals.map((s) => ({
      id: s.id,
      pair: s.pair,
      direction: s.direction,
      expiration: s.expiration,
      confidence: s.confidence,
      tier: s.tier,
      analysis: s.analysis,
      isActive: s.isActive,
      scheduledAt: s.scheduledAt?.toISOString() ?? null,
    })),
  });
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  const body = (await req.json().catch(() => null)) as { slots?: SlotInput[] } | null;
  const slots = body?.slots;
  if (!Array.isArray(slots) || slots.length === 0) {
    return NextResponse.json({ error: "slots required" }, { status: 400 });
  }

  // Validate that all scheduledAt parse correctly.
  const parsed = slots.map((s) => {
    const dt = new Date(s.scheduledAt);
    if (isNaN(dt.getTime())) throw new Error(`Invalid scheduledAt: ${s.scheduledAt}`);
    return { ...s, scheduledAt: dt };
  });

  // Delete existing unactivated signals scheduled on the same dates.
  const dates = [...new Set(parsed.map((s) => {
    const d = new Date(s.scheduledAt);
    d.setUTCHours(0, 0, 0, 0);
    return d.toISOString();
  }))];

  for (const dateIso of dates) {
    const start = new Date(dateIso);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1);
    await prisma.signal.deleteMany({
      where: {
        isActive: false,
        scheduledAt: { gte: start, lt: end, not: null },
      },
    });
  }

  const session = await auth();
  const userId = session?.user?.id;

  const created = await prisma.signal.createMany({
    data: parsed.map((s) => ({
      pair: s.pair,
      direction: s.direction,
      expiration: s.expiration,
      confidence: s.confidence,
      tier: s.tier,
      type: s.type ?? "manual",
      analysis: s.analysis ?? null,
      isActive: false,
      scheduledAt: s.scheduledAt,
      ...(userId ? { createdById: userId } : {}),
    })),
  });

  return NextResponse.json({ ok: true, created: created.count });
}
