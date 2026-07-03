/**
 * /api/cron/auto-publish-signals — DEPRECATED.
 *
 * Auto-publishing is no longer used in the on-demand signal model.
 * Signals are generated per-user request via POST /api/signals/request.
 *
 * This endpoint returns a no-op success to avoid cron failures if the
 * Vercel cron schedule hasn't been removed yet.
 */
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ok: true,
    skipped: "deprecated_on_demand_model",
    message: "Auto-publish is deprecated. Signals are now on-demand.",
  });
}
