/**
 * GET /api/cron/seed-content — idempotent content seeding.
 *
 * Intended to be called once after deploy (or on a very low cadence).
 * Currently seeds the achievement catalogue from the code definition.
 * Admins can also call this on-demand.
 */
import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { seedAchievementsIfMissing } from "@/lib/achievements";
import { seedAssetsIfMissing } from "@/lib/assets";

function authorise(req: NextRequest): boolean {
  const expected = process.env["CRON_SECRET"];
  if (!expected) {
    if (process.env["NODE_ENV"] === "production") {
      console.warn("[cron/seed-content] CRON_SECRET is not set — rejecting request in production.");
      return false;
    }
    return true;
  }
  const header =
    req.headers.get("authorization") ??
    req.headers.get("x-cron-secret") ??
    "";
  const provided = header.startsWith("Bearer ") ? header.slice(7) : header;
  if (!provided) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(provided);
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
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
