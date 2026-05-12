/**
 * POST /api/bot/telegram-link
 *
 * Consumed by the bot when a user taps Start with payload `link_<token>`.
 *
 * Auth: shared secret header `X-Bot-Secret` must equal env BOT_SYNC_SECRET.
 *
 * Body: { token, telegramId, username?, firstName?, lastName?, photoUrl? }
 *
 * Effect (depends on token.purpose):
 *
 *   purpose="link" (default):
 *     - Refuses if telegramId is already on a different user.
 *     - Updates User.telegramId on the token's owner; updates display fields.
 *
 *   purpose="login":
 *     - If telegramId already maps to a User → reuses it.
 *     - Otherwise: REFUSES with `po_required` (v6b). New users must complete
 *       the PO-gated /register flow on the site first; we no longer auto-
 *       create accounts purely from a Telegram tap because that bypasses the
 *       deposit gate.
 *     - Stores the resulting userId on the token so the web side can read it
 *       through link-status and start a NextAuth session.
 *
 * Both branches mark the token consumed.
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

  if (record.purpose === "link") {
    if (!record.userId) {
      return NextResponse.json({ ok: false, reason: "invalid_token" }, { status: 400 });
    }
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

  // purpose === "login"
  if (!conflict) {
    // v6b: Telegram-only signup is no longer allowed because it bypasses the
    // PocketOption deposit gate. Tell the bot to redirect the user to the
    // site's /register flow.
    await prisma.telegramLinkToken.update({
      where: { token },
      data: { consumedAt: new Date(), telegramId: tgId },
    });
    return NextResponse.json(
      { ok: false, reason: "po_required" },
      { status: 403 },
    );
  }

  await prisma.user.update({
    where: { id: conflict.id },
    data: {
      username: body.username ?? conflict.username,
      firstName: body.firstName ?? conflict.firstName,
      lastName: body.lastName ?? conflict.lastName,
      avatar: body.photoUrl ?? conflict.avatar,
      lastLogin: new Date(),
    },
  });

  await prisma.telegramLinkToken.update({
    where: { token },
    data: { consumedAt: new Date(), telegramId: tgId, userId: conflict.id },
  });

  return NextResponse.json({ ok: true, userId: conflict.id });
}
