/**
 * /api/admin/signals/bulk — DEPRECATED.
 *
 * Bulk signal generation is no longer used in the on-demand signal model.
 * Signals are now generated per-user request via POST /api/signals/request.
 */
import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Bulk signal generation is deprecated. Signals are now on-demand." },
    { status: 410 },
  );
}
