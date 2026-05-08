import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { AssetCategory, SignalTier } from "@/generated/prisma/enums";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "admin") return null;
  return session;
}

const CATEGORIES: AssetCategory[] = ["currency", "crypto", "commodity", "stock", "index"];
const TIERS: SignalTier[] = ["otc", "exchange", "elite"];
const PROVIDERS = ["none", "twelvedata", "binance", "yahoo"] as const;

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await ctx.params;
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

  const data: Record<string, unknown> = {};
  if (body["symbol"] !== undefined) data["symbol"] = String(body["symbol"]).trim();
  if (body["displaySymbol"] !== undefined) data["displaySymbol"] = String(body["displaySymbol"]).trim();
  if (body["category"] !== undefined) {
    const c = String(body["category"]);
    if (!CATEGORIES.includes(c as AssetCategory)) {
      return NextResponse.json({ error: "invalid category" }, { status: 400 });
    }
    data["category"] = c;
  }
  if (body["isOtc"] !== undefined) data["isOtc"] = Boolean(body["isOtc"]);
  if (body["payoutPct"] !== undefined) {
    data["payoutPct"] = Math.max(0, Math.min(200, Number(body["payoutPct"])));
  }
  if (body["signalTier"] !== undefined) {
    const t = String(body["signalTier"]);
    if (!TIERS.includes(t as SignalTier)) {
      return NextResponse.json({ error: "invalid signalTier" }, { status: 400 });
    }
    data["signalTier"] = t;
  }
  if (body["provider"] !== undefined) {
    const p = String(body["provider"]);
    data["provider"] = (PROVIDERS as readonly string[]).includes(p) ? p : "none";
  }
  if (body["providerSymbol"] !== undefined) {
    const v = body["providerSymbol"];
    data["providerSymbol"] = v ? String(v).trim() : null;
  }
  if (body["position"] !== undefined) data["position"] = Number(body["position"]) | 0;
  if (body["isActive"] !== undefined) data["isActive"] = Boolean(body["isActive"]);

  try {
    const asset = await prisma.asset.update({ where: { id }, data });
    return NextResponse.json({ asset });
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code === "P2002") {
      return NextResponse.json({ error: "symbol already exists" }, { status: 409 });
    }
    if (code === "P2025") {
      return NextResponse.json({ error: "asset not found" }, { status: 404 });
    }
    throw err;
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await ctx.params;
  try {
    await prisma.asset.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code === "P2025") {
      return NextResponse.json({ error: "asset not found" }, { status: 404 });
    }
    throw err;
  }
}
