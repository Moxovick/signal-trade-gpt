/**
 * GET /api/cron/cleanup — periodic DB cleanup.
 *
 * Purges expired rows that accumulate over time:
 *   - TelegramLinkToken: expired + older than 1 hour
 *   - EmailOtp: expired + older than 1 hour
 *
 * Safe to run frequently (idempotent deletes).
 * Recommended cadence: once per hour via Vercel Cron.
 */
import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function authorise(req: NextRequest): boolean {
  const expected = process.env["CRON_SECRET"];
  if (!expected) {
    if (process.env["NODE_ENV"] === "production") {
      console.warn("[cron/cleanup] CRON_SECRET is not set — rejecting request in production.");
      return false;
    }
    return true;
  }
  const header =
    req.headers.get("authorization") ??
    req.headers.get("x-cron-secret") ??
    "";
  // Normalise to compare the bare secret value.
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

export async function GET(req: NextRequest) {
  if (!authorise(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  const [tokens, otps] = await Promise.all([
    prisma.telegramLinkToken.deleteMany({
      where: { expiresAt: { lt: oneHourAgo } },
    }),
    prisma.emailOtp.deleteMany({
      where: { expiresAt: { lt: oneHourAgo } },
    }),
  ]);

  return NextResponse.json({
    ok: true,
    deleted: {
      telegramLinkTokens: tokens.count,
      emailOtps: otps.count,
    },
  });
}
