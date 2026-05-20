/**
 * POST /api/tma/register — surface the current Mini App user.
 *
 * Returns the existing user if they already registered on the website and
 * linked their Telegram. Returns `no_account` if not — users must register
 * on the website first (via PocketOption referral link) so RevShare is
 * properly attributed.
 *
 * Returns:
 *   200 → { ok: true, userId }
 *   401 → { error: "invalid_init_data" | "no_init_data" | "not_configured" }
 *   403 → { error: "no_account" }
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyInitData } from "@/lib/telegram-initdata";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const botToken = process.env["TELEGRAM_LOGIN_BOT_TOKEN"];
  if (!botToken) {
    return NextResponse.json({ error: "not_configured" }, { status: 401 });
  }

  let initData = req.headers.get("x-telegram-init-data") ?? "";
  if (!initData) {
    const body = (await req.json().catch(() => null)) as { initData?: string } | null;
    initData = body?.initData ?? "";
  }
  if (!initData) {
    return NextResponse.json({ error: "no_init_data" }, { status: 401 });
  }

  const verified = verifyInitData(initData, botToken);
  if (!verified) {
    return NextResponse.json({ error: "invalid_init_data" }, { status: 401 });
  }

  const tgId = BigInt(verified.user.id);
  const existing = await prisma.user.findUnique({ where: { telegramId: tgId } });
  if (existing) {
    return NextResponse.json({ ok: true, userId: existing.id });
  }

  return NextResponse.json({ error: "no_account" }, { status: 403 });
}
