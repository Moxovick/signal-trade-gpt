import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type GiveawayPrize = {
  place: number;
  title: string;
};

const DEFAULTS: GiveawayPrize[] = [
  { place: 1, title: "MacBook Pro" },
  { place: 2, title: "iPhone 17 Pro Max" },
  { place: 3, title: "AirPods 3 Pro" },
];

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "admin") return null;
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const setting = await prisma.siteSettings.findUnique({
    where: { key: "giveaway_prizes" },
  });

  const prizes: GiveawayPrize[] = setting
    ? (setting.value as GiveawayPrize[])
    : DEFAULTS;

  return NextResponse.json({ prizes });
}

export async function PUT(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const prizes = body.prizes as GiveawayPrize[];

  if (!Array.isArray(prizes) || prizes.length !== 3) {
    return NextResponse.json({ error: "prizes must be an array of 3 items" }, { status: 400 });
  }

  for (const p of prizes) {
    if (typeof p.place !== "number" || typeof p.title !== "string" || !p.title.trim()) {
      return NextResponse.json({ error: "Each prize must have place (number) and title (string)" }, { status: 400 });
    }
  }

  await prisma.siteSettings.upsert({
    where: { key: "giveaway_prizes" },
    update: { value: prizes, label: "Giveaway Prizes" },
    create: { key: "giveaway_prizes", value: prizes, label: "Giveaway Prizes" },
  });

  return NextResponse.json({ ok: true, prizes });
}
