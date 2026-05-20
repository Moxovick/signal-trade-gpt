/**
 * GET /api/tma/me — current Mini App user.
 *
 * Requires `X-Telegram-Init-Data` header.
 *
 * If the Telegram user has no account yet we auto-create one from their
 * Telegram profile — no registration form needed. The returned payload
 * includes `isNew: true` so the Mini App can show the PO-link onboarding.
 *
 * Returns:
 *   200 → { user: { ... }, isNew?: true }   ok (or just created)
 *   401 → { error: "invalid_init_data" | "no_init_data" }
 */
import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authTmaRequest } from "@/lib/tma-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const USER_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  username: true,
  avatar: true,
  tier: true,
  role: true,
  depositTotal: true,
  signalsReceived: true,
  streakDays: true,
  referralCode: true,
  poAccount: { select: { poTraderId: true, status: true, totalDeposit: true } },
} as const;

export async function GET(req: NextRequest) {
  const session = await authTmaRequest(req);

  if (!session.ok) {
    if (session.reason === "no_account") {
      // Auto-create a user from their Telegram identity so the Mini App
      // works immediately without a separate website registration step.
      const { tgId, tgUser } = session;
      const referralCode = randomBytes(6).toString("base64url");
      try {
        const newUser = await prisma.user.create({
          data: {
            telegramId: BigInt(tgId),
            firstName: tgUser.first_name,
            lastName: tgUser.last_name ?? null,
            username: tgUser.username ?? null,
            referralCode,
            tier: 0,
          },
          select: USER_SELECT,
        });
        return NextResponse.json({ user: newUser, isNew: true });
      } catch {
        // If creation fails (e.g. unique constraint race), try fetching again.
        const existing = await prisma.user.findUnique({
          where: { telegramId: BigInt(tgId) },
          select: USER_SELECT,
        });
        if (existing) return NextResponse.json({ user: existing });
        return NextResponse.json({ error: "create_failed" }, { status: 500 });
      }
    }
    return NextResponse.json({ error: session.reason }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: USER_SELECT,
  });
  if (!user) {
    return NextResponse.json({ error: "no_account" }, { status: 401 });
  }
  return NextResponse.json({ user });
}
