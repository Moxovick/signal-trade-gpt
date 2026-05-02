import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "admin") return null;
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const prizes = await prisma.prize.findMany({
    orderBy: [{ tier: "asc" }, { position: "asc" }],
  });
  return NextResponse.json({ prizes });
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const b = await req.json();
  const prize = await prisma.prize.create({
    data: {
      tier: b.tier ?? 1,
      position: b.position ?? 0,
      minDeposit: b.minDeposit,
      title: b.title,
      description: b.description,
      valueLabel: b.valueLabel,
      imageUrl: b.imageUrl ?? null,
      isActive: b.isActive ?? true,
    },
  });
  return NextResponse.json({ prize }, { status: 201 });
}
