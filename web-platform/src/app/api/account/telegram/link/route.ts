/**
 * POST /api/account/telegram/link
 *
 * Links the current authenticated user to a Telegram account by verifying a
 * Telegram Login Widget payload against `TELEGRAM_LOGIN_BOT_TOKEN`.
 *
 * Refuses if the same telegramId is already linked to a different user.
 */
import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyTelegramPayload } from "@/lib/telegram";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, reason: "unauthorized" }, { status: 401 });
  }

  const botToken = process.env["TELEGRAM_LOGIN_BOT_TOKEN"];
  if (!botToken) {
    return NextResponse.json({ ok: false, reason: "not_configured" }, { status: 500 });
  }

  const body = (await req.json().catch(() => null)) as Record<string, string> | null;
  if (!body) {
    return NextResponse.json({ ok: false, reason: "invalid_payload" }, { status: 400 });
  }

  const verified = verifyTelegramPayload(body, botToken);
  if (!verified) {
    return NextResponse.json({ ok: false, reason: "verification_failed" }, { status: 400 });
  }

  const tgId = BigInt(verified.id);

  const conflict = await prisma.user.findUnique({ where: { telegramId: tgId } });
  if (conflict && conflict.id !== session.user.id) {
    return NextResponse.json({ ok: false, reason: "telegram_taken" }, { status: 409 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      telegramId: tgId,
      username: verified.username ?? undefined,
      firstName: verified.first_name ?? undefined,
      lastName: verified.last_name ?? undefined,
      avatar: verified.photo_url ?? undefined,
    },
  });

  return NextResponse.json({
    ok: true,
    telegram: {
      id: verified.id,
      username: verified.username ?? null,
      firstName: verified.first_name ?? null,
    },
  });
}
