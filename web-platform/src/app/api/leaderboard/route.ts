/**
 * GET /api/leaderboard — top 10 traders from SiteSettings (fake data).
 * Used by TMA leaders page and bot leaderboard command.
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type LeaderboardEntry = {
  nickname: string;
  earnings: number;
  signals: number;
};

const RUSSIAN_NICKNAMES = [
  "d1mkas", "kapital_andrey", "alex_t92", "olgaprofit",
  "nik_winner", "ann_signals", "elena_top1", "sergmaster",
  "vika_fx", "maxpro_trade",
];

function generateDefaults(): LeaderboardEntry[] {
  return RUSSIAN_NICKNAMES.map((nickname) => ({
    nickname,
    earnings: Math.floor(Math.random() * 49500) + 500,
    signals: Math.floor(Math.random() * 481) + 20,
  })).sort((a, b) => b.earnings - a.earnings);
}

export async function GET() {
  const setting = await prisma.siteSettings.findUnique({
    where: { key: "leaderboard_top10" },
  });

  let raw: LeaderboardEntry[];
  if (setting) {
    raw = setting.value as LeaderboardEntry[];
  } else {
    // Generate once and persist so numbers stay consistent across loads
    raw = generateDefaults();
    await prisma.siteSettings.create({
      data: { key: "leaderboard_top10", value: raw as never },
    }).catch(() => { /* race condition — another request may have created it */ });
  }

  const entries = raw.slice(0, 10).map((e, i) => ({
    rank: i + 1,
    user: { firstName: e.nickname, email: null },
    tier: 2,
    signalsReceived: e.signals,
    earnings: e.earnings,
  }));

  return NextResponse.json({ entries });
}
