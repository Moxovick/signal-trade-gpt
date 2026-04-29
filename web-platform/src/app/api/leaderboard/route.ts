import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const entries = await prisma.leaderboardEntry.findMany({
    include: {
      user: { select: { firstName: true, email: true, subscriptionPlan: true } },
    },
    orderBy: { rank: "asc" },
    take: 20,
  });

  return NextResponse.json({ entries });
}
