/**
 * /api/cron/auto-publish-signals — Vercel-cron-driven auto-publisher.
 *
 * For each band (otc / exchange / elite) whose interval has elapsed since the
 * last published signal, picks a random eligible template (autoPublish=true,
 * matching tier) and creates a Signal row. Idempotent within an interval —
 * running the cron more often than `intervalMinutes` is harmless.
 *
 * Auth: Vercel cron requests carry an `Authorization: Bearer <CRON_SECRET>`
 * header. We accept both that and a header `x-cron-secret` for local cURL
 * testing.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  isWithinWorkingHours,
  loadSchedule,
  loadTemplates,
  pickWeighted,
  type SignalBand,
} from "@/lib/signal-config";
import type { Prisma } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

const BANDS: SignalBand[] = ["otc", "exchange", "elite"];

function authorise(req: NextRequest): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected) return true; // unset → allow (dev convenience)
  const header =
    req.headers.get("authorization") ??
    req.headers.get("x-cron-secret") ??
    "";
  return (
    header === `Bearer ${expected}` ||
    header === expected
  );
}

export async function GET(req: NextRequest) {
  if (!authorise(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const [schedule, templates] = await Promise.all([
    loadSchedule(),
    loadTemplates(),
  ]);

  if (!schedule.enabled) {
    return NextResponse.json({ ok: true, skipped: "disabled" });
  }
  if (!isWithinWorkingHours(schedule)) {
    return NextResponse.json({ ok: true, skipped: "outside-working-hours" });
  }
  if (templates.length === 0) {
    return NextResponse.json({ ok: true, skipped: "no-templates" });
  }

  const published: Array<{ band: SignalBand; pair: string; id: string }> = [];

  for (const band of BANDS) {
    const intervalMin = schedule.intervalMinutes[band];
    if (intervalMin <= 0) continue;

    const last = await prisma.signal.findFirst({
      where: { tier: band },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    });

    if (last) {
      const ageMin = (Date.now() - last.createdAt.getTime()) / 60_000;
      if (ageMin < intervalMin) continue;
    }

    const pool = templates.filter((t) => t.autoPublish && t.tier === band);
    const tpl = pickWeighted(pool);
    if (!tpl) continue;

    const data: Prisma.SignalUncheckedCreateInput = {
      pair: tpl.pair.toUpperCase(),
      direction: tpl.direction,
      expiration: tpl.expiration,
      confidence: tpl.confidence,
      tier: tpl.tier,
      type: "ai",
      analysis: tpl.analysis,
      isActive: true,
    };
    const sig = await prisma.signal.create({ data });
    published.push({ band, pair: sig.pair, id: sig.id });
  }

  return NextResponse.json({ ok: true, published });
}
