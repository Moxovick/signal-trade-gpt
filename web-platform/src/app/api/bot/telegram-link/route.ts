/**
 * POST /api/bot/telegram-link
 *
 * Consumed by the bot when a user taps Start with payload `link_<token>`.
 *
 * Auth: shared secret header `X-Bot-Secret` must equal env BOT_SYNC_SECRET.
 *
 * Body: { token: string, telegramId: string|number, username?, firstName?, lastName?, photoUrl? }
 *
 * Effect:
 *   - Validates the token (exists, not consumed, not expired, belongs to a real user).
 *   - Refuses if the telegramId is already linked to a different user.
 *   - Sets User.telegramId on the linked account, updates profile fields.
 *   - Marks the token as consumed.
 */
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const secret = process.env["BOT_SYNC_SECRET"];
  if (!secret) {
    return NextResponse.json({ ok: false, reason: "not_configured" }, { status: 503 });
  }
  const provided = req.headers.get("x-bot-secret");
  if (provided !== secret) {
    return NextResponse.json({ ok: false, reason: "bad_secret" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as
    | {
        token?: string;
        telegramId?: string | number;
        username?: string | null;
        firstName?: string | null;
        lastName?: string | null;
        photoUrl?: string | null;
      }
    | null;
  if (!body?.token || body.telegramId == null) {
    return NextResponse.json({ ok: false, reason: "invalid_payload" }, { status: 400 });
  }

  const token = String(body.token);
  let tgId: bigint;
  try {
    tgId = BigInt(body.telegramId);
  } catch {
    return NextResponse.json({ ok: false, reason: "invalid_telegram_id" }, { status: 400 });
  }

  const record = await prisma.telegramLinkToken.findUnique({ where: { token } });
  if (!record) {
    return NextResponse.json({ ok: false, reason: "unknown_token" }, { status: 404 });
  }
  if (record.consumedAt) {
    return NextResponse.json({ ok: false, reason: "already_used" }, { status: 409 });
  }
  if (record.expiresAt.getTime() < Date.now()) {
    return NextResponse.json({ ok: false, reason: "expired" }, { status: 410 });
  }

  const conflict = await prisma.user.findUnique({ where: { telegramId: tgId } });
  if (conflict && conflict.id !== record.userId) {
    return NextResponse.json({ ok: false, reason: "telegram_taken" }, { status: 409 });
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: {
        telegramId: tgId,
        username: body.username ?? undefined,
        firstName: body.firstName ?? undefined,
        lastName: body.lastName ?? undefined,
        avatar: body.photoUrl ?? undefined,
      },
    }),
    prisma.telegramLinkToken.update({
      where: { token },
      data: { consumedAt: new Date(), telegramId: tgId },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
