/**
 * GET   /api/admin/assets       — list all (admin)
 * POST  /api/admin/assets       — create
 * POST  /api/admin/assets/seed  — re-run seed (idempotent)
 */
import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { listAllAssets, seedAssetsIfMissing } from "@/lib/assets";
import type { AssetCategory, SignalTier } from "@/generated/prisma/enums";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "admin") return null;
  return session;
}

const CATEGORIES: AssetCategory[] = ["currency", "crypto", "commodity", "stock", "index"];
const TIERS: SignalTier[] = ["otc", "exchange", "elite"];
const PROVIDERS = ["none", "twelvedata", "binance", "yahoo"] as const;

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const assets = await listAllAssets();
  return NextResponse.json({ assets });
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const url = new URL(req.url);
  if (url.searchParams.get("action") === "seed") {
    const r = await seedAssetsIfMissing();
    return NextResponse.json({ ok: true, inserted: r.inserted });
  }

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const symbol = String(body["symbol"] ?? "").trim();
  const displaySymbol = String(body["displaySymbol"] ?? "").trim();
  const category = String(body["category"] ?? "");
  if (!symbol || !displaySymbol) {
    return NextResponse.json({ error: "symbol and displaySymbol are required" }, { status: 400 });
  }
  if (!CATEGORIES.includes(category as AssetCategory)) {
    return NextResponse.json({ error: "invalid category" }, { status: 400 });
  }
  const isOtc = Boolean(body["isOtc"]);
  const payoutPct = Math.max(0, Math.min(200, Number(body["payoutPct"] ?? 0)));
  const signalTier = TIERS.includes(body["signalTier"] as SignalTier)
    ? (body["signalTier"] as SignalTier)
    : ("otc" as SignalTier);
  const providerRaw = String(body["provider"] ?? "none");
  const provider = (PROVIDERS as readonly string[]).includes(providerRaw) ? providerRaw : "none";
  const providerSymbol = body["providerSymbol"] ? String(body["providerSymbol"]).trim() : null;
  const position = Number(body["position"] ?? 0) | 0;
  const isActive = body["isActive"] === undefined ? true : Boolean(body["isActive"]);

  try {
    const asset = await prisma.asset.create({
      data: {
        symbol,
        displaySymbol,
        category: category as AssetCategory,
        isOtc,
        payoutPct,
        signalTier,
        provider,
        providerSymbol,
        position,
        isActive,
      },
    });
    return NextResponse.json({ asset });
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code === "P2002") {
      return NextResponse.json({ error: "symbol already exists" }, { status: 409 });
    }
    throw err;
  }
}
