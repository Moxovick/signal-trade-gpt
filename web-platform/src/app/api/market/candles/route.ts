/**
 * GET /api/market/candles?pair=EUR/USD&period=60&count=60
 */
import { NextResponse, type NextRequest } from "next/server";
import { getCandles, SUPPORTED_PAIRS } from "@/lib/marketdata";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawPair = searchParams.get("pair") ?? "EUR/USD";
  const pair = (SUPPORTED_PAIRS as readonly string[]).includes(rawPair) ? rawPair : "EUR/USD";
  const period = Math.max(15, Math.min(3600, Number(searchParams.get("period") ?? 60)));
  const count = Math.max(20, Math.min(300, Number(searchParams.get("count") ?? 60)));
  const data = await getCandles(pair, { periodSec: period, count });
  return NextResponse.json(data, { headers: { "cache-control": "no-store" } });
}
