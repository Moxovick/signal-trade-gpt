/**
 * Admin endpoints for PocketOption integration config.
 *
 *  GET  /api/admin/po-config            — return current effective values +
 *                                         per-field source (db / env / unset).
 *  POST /api/admin/po-config            — upsert one or more values into
 *                                         SiteSettings. Body:
 *                                         { apiToken?, partnerId?, postbackSecret? }
 *                                         Empty string deletes the DB row,
 *                                         falling back to the env value.
 *  POST /api/admin/po-config/rotate-secret
 *                                      — generate and persist a fresh random
 *                                        postback secret, returning it.
 *  GET  /api/admin/po-config/test-trader?id=12345
 *                                      — hit the PO Affiliate API with
 *                                        the configured creds.
 *
 * Sub-routes are implemented as separate route files in subfolders.
 */
import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  SITE_SETTING_PO_API_TOKEN,
  SITE_SETTING_PO_PARTNER_ID,
  SITE_SETTING_PO_POSTBACK_SECRET,
  getPoConfigSnapshot,
} from "@/lib/po-config";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "admin") {
    return null;
  }
  return session;
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, reason: "forbidden" }, { status: 403 });
  }
  const snap = await getPoConfigSnapshot();
  // Don't leak any secrets over the API — only show whether they exist and
  // where they came from. Admin can rotate the postback secret to re-read it,
  // and re-enter the API token if lost.
  const mask = (v: string) =>
    v.length > 0 ? `${v.slice(0, 4)}…${v.slice(-4)}` : "";
  return NextResponse.json({
    ok: true,
    apiTokenSet: snap.apiToken.length > 0,
    apiTokenMasked: mask(snap.apiToken),
    partnerId: snap.partnerId,
    postbackSecretSet: snap.postbackSecret.length > 0,
    postbackSecretMasked: mask(snap.postbackSecret),
    source: snap.source,
  });
}

const KEY_BY_FIELD: Record<string, string> = {
  apiToken: SITE_SETTING_PO_API_TOKEN,
  partnerId: SITE_SETTING_PO_PARTNER_ID,
  postbackSecret: SITE_SETTING_PO_POSTBACK_SECRET,
};

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, reason: "forbidden" }, { status: 403 });
  }
  const body = (await req.json().catch(() => null)) as
    | Record<string, unknown>
    | null;
  if (!body) {
    return NextResponse.json(
      { ok: false, reason: "bad_payload" },
      { status: 400 },
    );
  }

  const updates: Array<[string, string]> = [];
  for (const [field, key] of Object.entries(KEY_BY_FIELD)) {
    if (!(field in body)) continue;
    const raw = body[field];
    if (typeof raw !== "string") {
      return NextResponse.json(
        { ok: false, reason: `bad_${field}` },
        { status: 400 },
      );
    }
    updates.push([key, raw.trim()]);
  }

  for (const [key, value] of updates) {
    if (value === "") {
      // Empty string = delete the DB row, fall back to env.
      await prisma.siteSettings.delete({ where: { key } }).catch(() => undefined);
    } else {
      await prisma.siteSettings.upsert({
        where: { key },
        create: { key, value },
        update: { value },
      });
    }
  }

  return NextResponse.json({ ok: true, updated: updates.length });
}
