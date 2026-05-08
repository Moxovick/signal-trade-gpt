/**
 * POST /api/account/telegram/start-link
 *
 * Issues a one-shot token used by the bot deep-link flow:
 *   1. Web calls this endpoint → gets `{ token, deepLink, expiresAt }`.
 *   2. Web redirects user to `t.me/<bot>?start=link_<token>`.
 *   3. User taps Start → bot reads payload → calls
 *      `/api/bot/telegram-link` to consume the token + write telegramId.
 *   4. Web polls `/api/account/telegram/link-status?token=...` to detect
 *      completion and refresh the UI.
 *
 * Tokens are valid for 10 minutes and single-use.
 */
import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const TTL_MS = 10 * 60 * 1000;

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, reason: "unauthorized" }, { status: 401 });
  }

  const botUsername = (process.env["NEXT_PUBLIC_TELEGRAM_LOGIN_BOT"] ?? "").trim();
  if (!botUsername) {
    return NextResponse.json({ ok: false, reason: "bot_not_configured" }, { status: 500 });
  }

  const token = randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + TTL_MS);

  await prisma.telegramLinkToken.create({
    data: {
      token,
      userId: session.user.id,
      expiresAt,
    },
  });

  return NextResponse.json({
    ok: true,
    token,
    deepLink: `https://t.me/${botUsername}?start=link_${token}`,
    expiresAt: expiresAt.toISOString(),
  });
}
