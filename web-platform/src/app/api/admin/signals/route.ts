/**
 * /api/admin/signals — full CRUD for admin signal control.
 *
 * GET    list (paginated)
 * POST   create
 * PUT    update (mark result, edit confidence/analysis, toggle isActive)
 * DELETE delete by id
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "admin") return null;
  return session;
}

const VALID_DIRECTIONS = ["CALL", "PUT"] as const;
const VALID_TIERS = ["otc", "exchange", "elite"] as const;
const VALID_TYPES = ["ai", "expert", "manual"] as const;
const VALID_RESULTS = ["pending", "win", "loss"] as const;

export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

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

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json();
    const {
      pair,
      direction,
      expiration,
      confidence,
      tier,
      type,
      entryPrice,
      analysis,
      reasoning,
      isActive,
    } = body as {
      pair?: string;
      direction?: string;
      expiration?: string;
      confidence?: number;
      tier?: string;
      type?: string;
      entryPrice?: number | null;
      analysis?: string | null;
      reasoning?: string | null;
      isActive?: boolean;
    };

    if (!pair || pair.trim().length < 3)
      return NextResponse.json(
        { error: "Поле 'pair' обязательно (например, EUR/USD)" },
        { status: 400 },
      );
    if (!direction || !VALID_DIRECTIONS.includes(direction as "CALL" | "PUT"))
      return NextResponse.json(
        { error: "direction должно быть CALL или PUT" },
        { status: 400 },
      );
    if (!expiration || !/^\d+m$|^\d+s$/.test(expiration))
      return NextResponse.json(
        { error: "expiration должна быть, например, '60s' или '5m'" },
        { status: 400 },
      );
    if (confidence == null || confidence < 0 || confidence > 100)
      return NextResponse.json(
        { error: "confidence в диапазоне 0..100" },
        { status: 400 },
      );

    const data: Prisma.SignalUncheckedCreateInput = {
      pair: pair.trim().toUpperCase(),
      direction: direction as "CALL" | "PUT",
      expiration,
      confidence: Math.round(confidence),
      tier:
        tier && (VALID_TIERS as readonly string[]).includes(tier)
          ? (tier as "otc" | "exchange" | "elite")
          : "otc",
      type:
        type && (VALID_TYPES as readonly string[]).includes(type)
          ? (type as "ai" | "expert" | "manual")
          : "manual",
      entryPrice: entryPrice ?? null,
      analysis: analysis ?? null,
      reasoning: reasoning ?? null,
      isActive: isActive ?? true,
      createdById: session.user.id,
    };

    const signal = await prisma.signal.create({ data });
    return NextResponse.json({ signal }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[admin/signals POST]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await requireAdmin();
  if (!session)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json();
    const {
      id,
      result,
      isActive,
      confidence,
      analysis,
      reasoning,
      exitPrice,
    } = body as {
      id?: string;
      result?: string;
      isActive?: boolean;
      confidence?: number;
      analysis?: string | null;
      reasoning?: string | null;
      exitPrice?: number | null;
    };

    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const data: Prisma.SignalUpdateInput = {};
    if (result && (VALID_RESULTS as readonly string[]).includes(result)) {
      data.result = result as "pending" | "win" | "loss";
      data.closedAt = result === "pending" ? null : new Date();
    }
    if (typeof isActive === "boolean") data.isActive = isActive;
    if (confidence != null) data.confidence = Math.round(confidence);
    if (analysis !== undefined) data.analysis = analysis;
    if (reasoning !== undefined) data.reasoning = reasoning;
    if (exitPrice !== undefined) data.exitPrice = exitPrice;

    const signal = await prisma.signal.update({ where: { id }, data });
    return NextResponse.json({ signal });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[admin/signals PUT]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await requireAdmin();
  if (!session)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    await prisma.signal.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[admin/signals DELETE]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
