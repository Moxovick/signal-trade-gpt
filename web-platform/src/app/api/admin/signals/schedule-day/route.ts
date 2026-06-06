/**
 * /api/admin/signals/schedule-day — DEPRECATED.
 *
 * Day-plan scheduling is no longer used in the on-demand signal model.
 * Signals are now generated per-user request via POST /api/signals/request.
 */
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { error: "Day-plan scheduling is deprecated. Signals are now on-demand.", signals: [] },
    { status: 410 },
  );
}

export async function POST() {
  return NextResponse.json(
    { error: "Day-plan scheduling is deprecated. Signals are now on-demand." },
    { status: 410 },
  );
}
