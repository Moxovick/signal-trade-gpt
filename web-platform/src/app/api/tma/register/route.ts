/**
 * POST /api/tma/register — auto-register or return existing Mini App user.
 *
 * If no User row matches the Telegram ID, creates one from the verified
 * Telegram profile so the Mini App works immediately without a separate
 * website registration step.
 *
 * Returns:
 *   200 → { ok: true, userId, isNew?: true }
 *   401 → { error: "invalid_init_data" | "no_init_data" | "not_configured" }
 */
import { randomBytes } from "crypto";
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
    return NextResponse.json({ ok: true, userId: existing.id, alreadyExisted: true });
  }

  // Auto-create from Telegram identity.
  const referralCode = randomBytes(6).toString("base64url");
  const tgUser = verified.user;
  try {
    const newUser = await prisma.user.create({
      data: {
        telegramId: tgId,
        firstName: tgUser.first_name,
        lastName: tgUser.last_name ?? null,
        username: tgUser.username ?? null,
        referralCode,
        tier: 0,
      },
      select: { id: true },
    });
    return NextResponse.json({ ok: true, userId: newUser.id, isNew: true });
  } catch {
    const race = await prisma.user.findUnique({ where: { telegramId: tgId } });
    if (race) return NextResponse.json({ ok: true, userId: race.id });
    return NextResponse.json({ error: "create_failed" }, { status: 500 });
  }
}
