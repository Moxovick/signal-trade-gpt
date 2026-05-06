/**
 * /api/admin/signals/bulk — generate N signals at once from selected templates.
 *
 * Body: { count: number, templateIds: string[], spacingMinutes: number }
 *
 * `spacingMinutes === 0` publishes everything immediately (createdAt = now).
 * Otherwise the createdAt timestamp is offset back by N×spacing so the feed
 * shows them as if they had been created over time. We don't actually delay
 * publication — bulk-publish is for filling a quiet feed, not for real future
 * scheduling (use the auto-publish cron for that).
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { loadTemplates, pickWeighted } from "@/lib/signal-config";
import type { Prisma } from "@/generated/prisma/client";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "admin") return null;
  return session;
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const count = Math.max(1, Math.min(50, Number(body?.count) || 0));
  const templateIds: string[] = Array.isArray(body?.templateIds)
    ? body.templateIds.filter((s: unknown): s is string => typeof s === "string")
    : [];
  const spacingMinutes = Math.max(
    0,
    Math.min(240, Number(body?.spacingMinutes) || 0),
  );
  const back = body?.backfill === true;

  const all = await loadTemplates();
  const pool = templateIds.length
    ? all.filter((t) => templateIds.includes(t.id))
    : all;

  if (pool.length === 0) {
    return NextResponse.json(
      { error: "Нет шаблонов для генерации" },
      { status: 400 },
    );
  }

  const created: { id: string; pair: string; direction: string }[] = [];
  const now = Date.now();

  for (let i = 0; i < count; i += 1) {
    const tpl = pickWeighted(pool);
    if (!tpl) continue;
    const offset = back ? -i * spacingMinutes * 60_000 : 0;
    const data: Prisma.SignalUncheckedCreateInput = {
      pair: tpl.pair.toUpperCase(),
      direction: tpl.direction,
      expiration: tpl.expiration,
      confidence: tpl.confidence,
      tier: tpl.tier,
      type: "manual",
      analysis: tpl.analysis,
      isActive: true,
      createdById: session.user.id,
      createdAt: new Date(now + offset),
    };
    const sig = await prisma.signal.create({ data });
    created.push({ id: sig.id, pair: sig.pair, direction: sig.direction });
  }

  return NextResponse.json({ ok: true, created });
}
