/**
 * POST /api/signals/request — on-demand signal generation (web session auth).
 *
 * All signal generation logic lives in `@/lib/signal-generator.ts`.
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateSignalForUser } from "@/lib/signal-generator";
import { rateLimit } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** 30 signal requests per user per minute (well above daily limits, catches abuse). */
const SIGNAL_RL_LIMIT = 30;
const SIGNAL_RL_WINDOW_MS = 60_000;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Enforce PocketOption registration for all tiers
  const poAccount = await prisma.pocketOptionAccount.findUnique({
    where: { userId: session.user.id },
  });
  if (!poAccount) {
    return NextResponse.json(
      { error: "Сначала привяжите PocketOption аккаунт. Зарегистрируйтесь по реферальной ссылке и привяжите Trader ID." },
      { status: 403 },
    );
  }

  const rl = rateLimit(`signal:${session.user.id}`, SIGNAL_RL_LIMIT, SIGNAL_RL_WINDOW_MS);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Слишком много запросов. Подождите." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) } },
    );
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
