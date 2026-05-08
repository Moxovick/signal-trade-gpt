/**
 * POST /api/account/telegram/start-link
 *
 * Issues a one-shot token used by the bot deep-link flow.
 *
 * Two purposes:
 *   - "link"  (default, requires session): attach a Telegram account to the
 *             current authenticated user.
 *   - "login" (no session required):       sign in / register via Telegram
 *             without leaving the bot.
 *
 * Tokens are valid for 10 minutes and single-use.
 */
import { NextResponse, type NextRequest } from "next/server";
import { randomBytes } from "node:crypto";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const TTL_MS = 10 * 60 * 1000;

export async function POST(req: NextRequest) {
  const botUsername = (process.env["NEXT_PUBLIC_TELEGRAM_LOGIN_BOT"] ?? "").trim();
  if (!botUsername) {
    return NextResponse.json({ ok: false, reason: "bot_not_configured" }, { status: 500 });
  }

  const body = (await req.json().catch(() => ({}))) as { purpose?: "link" | "login" };
  const purpose: "link" | "login" = body?.purpose === "login" ? "login" : "link";

  let userId: string | null = null;
  if (purpose === "link") {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, reason: "unauthorized" }, { status: 401 });
    }
    userId = session.user.id;
  }

  const token = randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + TTL_MS);

  await prisma.telegramLinkToken.create({
    data: {
      token,
      purpose,
      userId,
      expiresAt,
    },
  });

  return NextResponse.json({
    ok: true,
    token,
    purpose,
    deepLink: `https://t.me/${botUsername}?start=link_${token}`,
    expiresAt: expiresAt.toISOString(),
  });
}
