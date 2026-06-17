import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type LeaderboardEntry = {
  nickname: string;
  earnings: number;
  signals: number;
};

const RUSSIAN_NICKNAMES = [
  "Алексей_Трейдер",
  "МаксимPRO",
  "Виктория_FX",
  "Дмитрий_Gold",
  "Анна_Сигнал",
  "Сергей_Мастер",
  "Елена_Топ",
  "Николай_Win",
  "Ольга_Профит",
  "Андрей_Капитал",
];

function generateDefaults(): LeaderboardEntry[] {
  return RUSSIAN_NICKNAMES.map((nickname) => ({
    nickname,
    earnings: Math.floor(Math.random() * 49500) + 500,
    signals: Math.floor(Math.random() * 481) + 20,
  })).sort((a, b) => b.earnings - a.earnings);
}

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "admin") return null;
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const setting = await prisma.siteSettings.findUnique({
    where: { key: "leaderboard_top10" },
  });

  const entries: LeaderboardEntry[] = setting
    ? (setting.value as LeaderboardEntry[])
    : generateDefaults();

  return NextResponse.json({ entries });
}

export async function PUT(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const entries = body.entries as LeaderboardEntry[];

  if (!Array.isArray(entries) || entries.length === 0) {
    return NextResponse.json({ error: "entries must be a non-empty array" }, { status: 400 });
  }

  for (const e of entries) {
    if (typeof e.nickname !== "string" || typeof e.earnings !== "number" || typeof e.signals !== "number") {
      return NextResponse.json({ error: "Each entry must have nickname (string), earnings (number), signals (number)" }, { status: 400 });
    }
  }

  await prisma.siteSettings.upsert({
    where: { key: "leaderboard_top10" },
    update: { value: entries, label: "Leaderboard Top 10" },
    create: { key: "leaderboard_top10", value: entries, label: "Leaderboard Top 10" },
  });

  return NextResponse.json({ ok: true, entries });
}
