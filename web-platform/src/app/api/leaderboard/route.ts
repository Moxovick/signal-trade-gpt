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
  "Алексей_Трейдер", "МаксимPRO", "Виктория_FX", "Дмитрий_Gold",
  "Анна_Сигнал", "Сергей_Мастер", "Елена_Топ", "Николай_Win",
  "Ольга_Профит", "Андрей_Капитал",
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

  const raw: LeaderboardEntry[] = setting
    ? (setting.value as LeaderboardEntry[])
    : generateDefaults();

  const entries = raw.slice(0, 10).map((e, i) => ({
    rank: i + 1,
    user: { firstName: e.nickname, email: null },
    tier: 2,
    signalsReceived: e.signals,
    earnings: e.earnings,
  }));

  return NextResponse.json({ entries });
}
