/**
 * GET /api/cron/seed-content — idempotent content seeding.
 *
 * Intended to be called once after deploy (or on a very low cadence).
 * Currently seeds the achievement catalogue from the code definition.
 * Admins can also call this on-demand.
 */
import { NextResponse } from "next/server";
import { seedAchievementsIfMissing } from "@/lib/achievements";

export async function GET(): Promise<Response> {
  await seedAchievementsIfMissing();
  return NextResponse.json({ ok: true, seeded: "achievements" });
}
