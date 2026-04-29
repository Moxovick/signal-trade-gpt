/**
 * POST /api/po/postback
 *
 * Server-to-server endpoint for PocketOption Postback 2.0.
 *
 * Behaviour:
 * 1. Read raw body (we need it for HMAC verification).
 * 2. Verify signature via HMAC-SHA256(POCKETOPTION_POSTBACK_SECRET, body).
 *    The signature can come from header `X-Signature` or `signature` field.
 * 3. Parse the payload, drop unknown event types.
 * 4. Apply via `applyPostback` which is idempotent on dedupeKey.
 *
 * We always return 200 with a JSON status so PO doesn't retry forever, even
 * for unmatched/duplicate events. Real failures (5xx) trigger PO's retry.
 */
import { NextResponse, type NextRequest } from "next/server";
import {
  applyPostback,
  parsePostback,
  verifyPostbackSignature,
} from "@/lib/pocketoption";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const sigHeader =
    req.headers.get("x-signature") ?? req.headers.get("x-po-signature");

  const parsed = parsePostback(raw);
  if (!parsed) {
    return NextResponse.json({ ok: false, reason: "bad_payload" }, { status: 400 });
  }

  if (!verifyPostbackSignature(raw, sigHeader ?? parsed.signature)) {
    return NextResponse.json({ ok: false, reason: "bad_signature" }, { status: 401 });
  }

  try {
    const result = await applyPostback(parsed);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("[postback] apply failed", err);
    return NextResponse.json({ ok: false, reason: "internal_error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, hint: "POST PocketOption postbacks here." });
}
