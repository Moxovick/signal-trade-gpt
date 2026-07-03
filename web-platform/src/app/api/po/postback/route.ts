/**
 * GET /api/po/postback (POST accepted for forward-compat)
 *
 * Server-to-server endpoint for PocketOption Partners postbacks.
 *
 * PocketOption Partners sends GET-postbacks with macro-substituted query
 * parameters and no body. They have **no per-request signature** — instead
 * the partner bakes a shared secret into the URL itself (`?...&secret=...`).
 * That is the only authentication path we can rely on, so this endpoint:
 *
 *   1. Parses the query string into a normalised ParsedPostback.
 *   2. Verifies `?secret=` against `po_postback_secret` (SiteSettings; env
 *      fallback POCKETOPTION_POSTBACK_SECRET).
 *   3. Applies the postback via `applyPostback`, which is idempotent on
 *      `dedupeKey`.
 *
 * Both GET and POST are accepted (POST falls back to query first, then a
 * `application/x-www-form-urlencoded` body) so the same URL works regardless
 * of how PO ends up calling it.
 *
 * Returns:
 *   200 — processed (including duplicates / unmatched leads).
 *   401 — bad/missing secret.
 *   400 — unknown / malformed event.
 *   500 — internal error (PO will retry).
 */
import { NextResponse, type NextRequest } from "next/server";
import {
  applyPostback,
  parsePostbackQuery,
  verifyPostbackSecret,
} from "@/lib/pocketoption";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function handle(req: NextRequest) {
  const url = new URL(req.url);
  const params: URLSearchParams = url.searchParams;

  // POST x-www-form-urlencoded: merge body params (URL params take priority).
  if (req.method === "POST") {
    const contentType = req.headers.get("content-type") ?? "";
    if (contentType.includes("application/x-www-form-urlencoded")) {
      const text = await req.text();
      const bodyParams = new URLSearchParams(text);
      for (const [k, v] of bodyParams.entries()) {
        if (!params.has(k)) params.append(k, v);
      }
    }
  }

  const providedSecret = params.get("secret");
  // Strip secret from the working copy before parsing/persisting.
  params.delete("secret");

  if (!(await verifyPostbackSecret(providedSecret))) {
    return NextResponse.json(
      { ok: false, reason: "bad_secret" },
      { status: 401 },
    );
  }

  const parsed = parsePostbackQuery(params);
  if (!parsed) {
    return NextResponse.json(
      { ok: false, reason: "bad_payload" },
      { status: 400 },
    );
  }

  try {
    const result = await applyPostback(parsed);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("[postback] apply failed", err);
    return NextResponse.json(
      { ok: false, reason: "internal_error" },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  return handle(req);
}

export async function POST(req: NextRequest) {
  return handle(req);
}
