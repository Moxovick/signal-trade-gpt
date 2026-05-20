/**
 * GET /api/tma/me — current Mini App user (or onboarding hint).
 *
 * Requires `X-Telegram-Init-Data` header. Returns:
 *   200 → { user: { ... } }
 *   401 → { error: "no_account", registerUrl }   not registered / not linked
 *   401 → { error: "invalid_init_data" | "no_init_data" }
 *
 * Registration requires going through the PocketOption referral link on the
 * website — the Mini App intentionally does not auto-create accounts.
 */
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

const SITE_URL = process.env["NEXTAUTH_URL"] ?? process.env["NEXT_PUBLIC_BASE_URL"] ?? "";

export async function GET(req: NextRequest) {
  const session = await authTmaRequest(req);

  if (!session.ok) {
    if (session.reason === "no_account") {
      return NextResponse.json(
        {
          error: "no_account",
          // Send them to the site login page — if they registered via
          // Telegram Login Widget their telegramId will be set automatically.
          registerUrl: `${SITE_URL}/login?from=tma`,
        },
        { status: 401 },
      );
    }
    return NextResponse.json({ error: session.reason }, { status: 401 });
  }

  const [user, referralsCount] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.userId }, select: USER_SELECT }),
    prisma.user.count({ where: { referredById: session.userId } }),
  ]);
  if (!user) {
    return NextResponse.json({ error: "no_account" }, { status: 401 });
  }
  return NextResponse.json({ user: { ...user, referralsCount } });
}
