/**
 * GET /api/assets — list active assets (public to authenticated users).
 *
 * Used by the live signal feed, signal cards, and the Telegram Mini App
 * to look up payout %, OTC flag, and provider for a given symbol.
 */
import { NextResponse } from "next/server";
import { listActiveAssets } from "@/lib/assets";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const assets = await listActiveAssets();
  return NextResponse.json({
    assets: assets.map((a) => ({
      id: a.id,
      symbol: a.symbol,
      displaySymbol: a.displaySymbol,
      category: a.category,
      isOtc: a.isOtc,
      payoutPct: a.payoutPct,
      signalTier: a.signalTier,
      provider: a.provider,
      providerSymbol: a.providerSymbol,
    })),
  });
}
