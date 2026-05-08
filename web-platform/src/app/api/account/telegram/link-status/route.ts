/**
 * GET /api/account/telegram/link-status?token=...
 *
 * Polled by the web client during deep-link Telegram flow.
 *
 * For purpose="link" tokens, requires the current session to own the token.
 * For purpose="login" tokens, anonymous polling is allowed (no session yet).
 *
 * Returns:
 *   - status: "linked" | "pending" | "expired"
 *   - telegramId: bot-confirmed id (when linked)
 *   - userId: when login token consumed, the resolved user.id (used by web
 *     to call signIn("tg-deeplink", { token })).
 */
import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ ok: false, reason: "missing_token" }, { status: 400 });
  }

  const record = await prisma.telegramLinkToken.findUnique({ where: { token } });
  if (!record) {
    return NextResponse.json({ ok: false, reason: "not_found" }, { status: 404 });
  }

  if (record.purpose === "link") {
    const session = await auth();
    if (!session?.user?.id || record.userId !== session.user.id) {
      return NextResponse.json({ ok: false, reason: "not_found" }, { status: 404 });
    }
  }

  if (record.consumedAt) {
    return NextResponse.json({
      ok: true,
      status: "linked",
      telegramId: record.telegramId?.toString() ?? null,
      userId: record.userId,
    });
  }

  if (record.expiresAt.getTime() < Date.now()) {
    return NextResponse.json({ ok: true, status: "expired" });
  }

  return NextResponse.json({ ok: true, status: "pending" });
}
