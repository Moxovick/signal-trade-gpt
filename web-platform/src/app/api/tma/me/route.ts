/**
 * GET /api/tma/me — current Mini App user (or onboarding hint).
 *
 * Requires `X-Telegram-Init-Data` header. Returns:
 *   200 → { user: { ... } }                                         normal
 *   401 → { error: "no_account",   onboardUrl: "/register?from=tg" }  unregistered
 *   401 → { error: "invalid" }                                       bad initData
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authTmaRequest } from "@/lib/tma-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const session = await authTmaRequest(req);
  if (!session.ok) {
    if (session.reason === "no_account") {
      return NextResponse.json(
        {
          error: "no_account",
          onboardUrl: "/register?from=tg",
          tgId: session.tgId,
        },
        { status: 401 },
      );
    }
    return NextResponse.json({ error: session.reason }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
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
    },
  });
  if (!user) {
    return NextResponse.json({ error: "no_account" }, { status: 401 });
  }
  return NextResponse.json({ user });
}
