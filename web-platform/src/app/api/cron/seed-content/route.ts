/**
 * GET /api/cron/seed-content — idempotent content seeding.
 *
 * Intended to be called once after deploy (or on a very low cadence).
 * Currently seeds the achievement catalogue from the code definition.
 * Admins can also call this on-demand.
 */
import { NextRequest, NextResponse } from "next/server";
import { seedAchievementsIfMissing } from "@/lib/achievements";
import { seedAssetsIfMissing } from "@/lib/assets";

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

export async function GET(req: NextRequest): Promise<Response> {
  if (!authorise(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  await seedAchievementsIfMissing();
  const assets = await seedAssetsIfMissing();
  return NextResponse.json({
    ok: true,
    seeded: ["achievements", "assets"],
    insertedAssets: assets.inserted,
  });
}
