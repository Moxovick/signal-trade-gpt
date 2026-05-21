/**
 * POST /api/bot/activate-signal
 *
 * Called by the Telegram bot when it publishes a scheduled signal.
 * Sets isActive = true so the signal becomes visible on the website and Mini App.
 *
 * Auth: X-Bot-Secret header (same shared secret as /api/bot/sync).
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const secret = process.env["BOT_SYNC_SECRET"];
  if (!secret || req.headers.get("x-bot-secret") !== secret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as { signalId?: string } | null;
  const signalId = body?.signalId;
  if (!signalId) {
    return NextResponse.json({ error: "missing signalId" }, { status: 400 });
  }

  const signal = await prisma.signal.findUnique({ where: { id: signalId } });
  if (!signal) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  await prisma.signal.update({
    where: { id: signalId },
    data: { isActive: true },
  });

  return NextResponse.json({ ok: true, signalId });
}
