/**
 * /api/admin/signal-schedule — admin GET/PUT for the auto-publish schedule.
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  loadSchedule,
  parseSchedule,
  saveSchedule,
} from "@/lib/signal-config";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "admin") return null;
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const schedule = await loadSchedule();
  return NextResponse.json({ schedule });
}

export async function PUT(req: NextRequest) {
  const session = await requireAdmin();
  if (!session)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json().catch(() => null);
  const parsed = parseSchedule(body?.schedule);
  await saveSchedule(parsed);
  return NextResponse.json({ ok: true, schedule: parsed });
}
