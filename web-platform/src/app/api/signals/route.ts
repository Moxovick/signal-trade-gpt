import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const TIER_ACCESS: Record<string, string[]> = {
  free: ["otc"],
  premium: ["otc", "exchange"],
  vip: ["otc", "exchange"],
  elite: ["otc", "exchange", "elite"],
};

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") ?? 1);
  const limit = Number(searchParams.get("limit") ?? 20);
  const tierFilter = searchParams.get("tier");

   
  const userPlan = (session.user.subscriptionPlan as string) ?? "free";
  const allowedTiers = TIER_ACCESS[userPlan] ?? ["otc"];

  const where = {
    tier: tierFilter
      ? { equals: tierFilter as "otc" | "exchange" | "elite" }
      : { in: allowedTiers as ("otc" | "exchange" | "elite")[] },
    isActive: true,
  };

  const [signals, total] = await Promise.all([
    prisma.signal.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        pair: true,
        direction: true,
        expiration: true,
        confidence: true,
        type: true,
        tier: true,
        entryPrice: true,
        exitPrice: true,
        result: true,
        analysis: true,
        reasoning: true,
        createdAt: true,
        closedAt: true,
      },
    }),
    prisma.signal.count({ where }),
  ]);

  return NextResponse.json({ signals, total, page, limit, allowedTiers });
}

export async function POST(req: NextRequest) {
  const session = await auth();
   
  if (!session || session.user.role !== "admin") {
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
      tier: body.tier ?? "otc",
      analysis: body.analysis ?? null,
      reasoning: body.reasoning ?? null,
      createdById: (session.user as { id: string }).id,
    },
  });

  return NextResponse.json({ signal }, { status: 201 });
}
