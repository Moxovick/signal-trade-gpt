/**
 * POST /api/bot/signal-request — Bot-facing signal generation endpoint.
 *
 * Auth: `X-Bot-Secret` header must match `BOT_SYNC_SECRET` env var.
 * Body: `{ telegramId: number }`
 *
 * Looks up user by telegramId, then delegates to the shared signal generator.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateSignalForUser } from "@/lib/signal-generator";
import { verifyBotSecret } from "@/lib/bot-secret";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const check = verifyBotSecret(req.headers.get("x-bot-secret"));
  if (!check.ok) {
    const status = check.reason === "not_configured" ? 503 : 401;
    return NextResponse.json(
      { ok: false, error: check.reason === "not_configured" ? "sync_disabled" : "bad_secret" },
      { status },
    );
  }

  let body: { telegramId?: number; pair?: string; expiration?: string };
  try {
    body = (await req.json()) as { telegramId?: number; pair?: string; expiration?: string };
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_json" },
      { status: 400 },
    );
  }

  if (!body.telegramId || typeof body.telegramId !== "number") {
    return NextResponse.json(
      { ok: false, error: "telegramId is required (number)" },
      { status: 400 },
    );
  }

  // Find user by telegram ID
  const user = await prisma.user.findUnique({
    where: { telegramId: BigInt(body.telegramId) },
    select: { id: true },
  });
  if (!user) {
    return NextResponse.json(
      { ok: false, error: "user_not_found", code: "no_user" },
      { status: 404 },
    );
  }

  const pair = typeof body.pair === "string" ? body.pair : undefined;
  const expiration = typeof body.expiration === "string" ? body.expiration : undefined;

  const result = await generateSignalForUser(user.id, { pair, expiration });
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, ...result.data },
      { status: result.statusCode },
    );
  }
  return NextResponse.json({ ok: true, ...result.data });
}
