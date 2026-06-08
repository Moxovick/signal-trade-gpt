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

  const result = await generateSignalForUser(session.userId);
  if (!result.ok) {
    return NextResponse.json(result.data, { status: result.statusCode });
  }
  return NextResponse.json(result.data);
}
