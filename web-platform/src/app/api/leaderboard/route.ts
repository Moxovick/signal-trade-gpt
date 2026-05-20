/**
 * GET /api/leaderboard — top traders by tier + signals received.
 * Matches bot and dashboard ranking formula.
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const users = await prisma.user.findMany({
    where: { role: { not: "admin" }, signalsReceived: { gt: 0 } },
    orderBy: [{ tier: "desc" }, { signalsReceived: "desc" }],
    take: 20,
    select: {
      id: true,
      firstName: true,
      username: true,
      tier: true,
      signalsReceived: true,
    },
  });

  const entries = users.map((u, i) => ({
    rank: i + 1,
    user: {
      firstName: u.firstName ?? u.username ?? null,
      email: null,
    },
    tier: u.tier,
    signalsReceived: u.signalsReceived,
  }));

  return NextResponse.json({ entries });
}
