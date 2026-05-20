/**
 * GET /api/admin/po-config/test-trader?id=12345
 *
 * Probe the PocketOption Affiliate API with the currently configured
 * `po_api_token` + `po_partner_id` (SiteSettings → env fallback). Returns
 * the raw outcome from `fetchTraderInfo` so the admin can debug
 * misconfigured creds without touching production users.
 *
 * Safe to call repeatedly; PO API has its own rate limits.
 */
import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { fetchTraderInfo, isValidTraderIdFormat } from "@/lib/po-api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json(
      { ok: false, reason: "forbidden" },
      { status: 403 },
    );
  }

  const url = new URL(req.url);
  const traderId = (url.searchParams.get("id") ?? "").trim();
  if (!traderId) {
    return NextResponse.json(
      { ok: false, reason: "missing_id" },
      { status: 400 },
    );
  }
  if (!isValidTraderIdFormat(traderId)) {
    return NextResponse.json(
      { ok: false, reason: "invalid_id_format" },
      { status: 400 },
    );
  }

  const outcome = await fetchTraderInfo(traderId);
  if (outcome.ok) {
    return NextResponse.json({
      ok: true,
      reason: "found",
      info: outcome.info,
    });
  }
  return NextResponse.json({ ok: false, reason: outcome.reason });
}
