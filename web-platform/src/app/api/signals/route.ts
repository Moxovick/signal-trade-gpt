import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") ?? 1);
  const limit = Number(searchParams.get("limit") ?? 20);
  const isPremium = ((session.user as Record<string, unknown>).subscriptionPlan as string) !== "free";

  const where = isPremium ? {} : { isPremium: false };

  const [signals, total] = await Promise.all([
    prisma.signal.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.signal.count({ where }),
  ]);

  return NextResponse.json({ signals, total, page, limit });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const signal = await prisma.signal.create({
    data: {
      pair: body.pair,
      direction: body.direction,
      expiration: body.expiration,
      confidence: body.confidence,
      type: body.type ?? "ai",
      isPremium: body.isPremium ?? false,
      createdById: (session.user as { id: string }).id,
    },
  });

  return NextResponse.json({ signal }, { status: 201 });
}
