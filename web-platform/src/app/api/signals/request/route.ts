/**
 * POST /api/signals/request — on-demand signal generation (web session auth).
 *
 * All signal generation logic lives in `@/lib/signal-generator.ts`.
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateSignalForUser } from "@/lib/signal-generator";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

  const result = await generateSignalForUser(session.user.id, { pair, expiration });
  if (!result.ok) {
    return NextResponse.json(result.data, { status: result.statusCode });
  }
  return NextResponse.json(result.data);
}
