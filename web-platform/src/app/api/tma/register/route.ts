/**
 * POST /api/tma/register — auto-register the current Mini App user.
 *
 * If the caller's verified initData yields a telegramId that has no `User`
 * row yet, create one (with referral code, default tier=0). The Mini App
 * onboarding screen calls this to remove the "go to the website to register"
 * dead-end.
 *
 * Returns:
 *   200 → { ok: true, userId }
 *   401 → { error: "invalid_init_data" | "no_init_data" | "not_configured" }
 *   409 → { error: "already_registered" }
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyInitData } from "@/lib/telegram-initdata";
import { generateReferralCode } from "@/lib/utils";

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

  const user = await prisma.user.create({
    data: {
      telegramId: tgId,
      username: verified.user.username ?? null,
      firstName: verified.user.first_name ?? null,
      lastName: verified.user.last_name ?? null,
      avatar: verified.user.photo_url ?? null,
      referralCode: generateReferralCode(),
    },
  });

  return NextResponse.json({ ok: true, userId: user.id });
}
