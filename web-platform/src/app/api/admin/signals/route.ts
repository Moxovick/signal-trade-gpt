import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (!session || (session.user as any).role !== "admin") return null;
  return session;
}

export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") ?? 1);
  const limit = Number(searchParams.get("limit") ?? 50);

  const [signals, total] = await Promise.all([
    prisma.signal.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.signal.count(),
  ]);

  return NextResponse.json({ signals, total, page, limit });
}

export async function PUT(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id, result } = await req.json();
  if (!id || !result) {
    return NextResponse.json({ error: "id and result required" }, { status: 400 });
  }

  const signal = await prisma.signal.update({
    where: { id },
    data: {
      result,
      closedAt: result !== "pending" ? new Date() : null,
    },
  });

  return NextResponse.json({ signal });
}
