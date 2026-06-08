/**
 * POST /api/tma/signal-request — TMA (Telegram Mini App) signal generation.
 *
 * Auth: `X-Telegram-Init-Data` header via `authTmaRequest`.
 * Uses the shared signal generator pipeline.
 */
import { NextRequest, NextResponse } from "next/server";
import { authTmaRequest } from "@/lib/tma-auth";
import { generateSignalForUser } from "@/lib/signal-generator";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const session = await authTmaRequest(req);
  if (!session.ok) {
    return NextResponse.json({ error: session.reason }, { status: 401 });
  }

  let pair: string | undefined;
  let expiration: string | undefined;
  try {
    const body = (await req.json()) as { pair?: string; expiration?: string };
    pair = typeof body.pair === "string" ? body.pair : undefined;
    expiration = typeof body.expiration === "string" ? body.expiration : undefined;
  } catch {
    // No body or invalid JSON — use defaults (backward compat)
  }

  const result = await generateSignalForUser(session.userId, { pair, expiration });
  if (!result.ok) {
    return NextResponse.json(result.data, { status: result.statusCode });
  }
  return NextResponse.json(result.data);
}
