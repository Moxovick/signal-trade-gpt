/**
 * GET /api/account/telegram/link-status?token=...
 *
 * Polled by the web client during deep-link Telegram linking. Returns:
 *   - linked: true if the bot has consumed the token AND the current user's
 *     telegramId now matches the consumed value.
 *   - expired: true if the token has passed its expiresAt without consumption.
 *   - pending: otherwise (waiting for the user to tap Start in Telegram).
 */
import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, reason: "unauthorized" }, { status: 401 });
  }

  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ ok: false, reason: "missing_token" }, { status: 400 });
  }

  const record = await prisma.telegramLinkToken.findUnique({ where: { token } });
  if (!record || record.userId !== session.user.id) {
    return NextResponse.json({ ok: false, reason: "not_found" }, { status: 404 });
  }

  if (record.consumedAt) {
    return NextResponse.json({
      ok: true,
      status: "linked",
      telegramId: record.telegramId?.toString() ?? null,
    });
  }

  if (record.expiresAt.getTime() < Date.now()) {
    return NextResponse.json({ ok: true, status: "expired" });
  }

  return NextResponse.json({ ok: true, status: "pending" });
}
