/**
 * POST /api/admin/po-config/rotate-secret
 *
 * Generates a fresh cryptographically random postback secret, persists it to
 * SiteSettings.po_postback_secret, and returns it to the caller exactly once.
 * The admin is expected to immediately paste it into PocketOption Partners.
 *
 * If `?reveal=1` is passed and a secret is already configured, the existing
 * value is returned WITHOUT rotating — useful when the admin lost the value
 * shown right after rotation. Admins are trusted; this is gated by role only.
 */
import { NextResponse, type NextRequest } from "next/server";
import { randomBytes } from "node:crypto";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  SITE_SETTING_PO_POSTBACK_SECRET,
  getPostbackSecret,
} from "@/lib/po-config";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json(
      { ok: false, reason: "forbidden" },
      { status: 403 },
    );
  }

  const url = new URL(req.url);
  if (url.searchParams.get("reveal") === "1") {
    const existing = await getPostbackSecret();
    if (existing) {
      return NextResponse.json({ ok: true, secret: existing, rotated: false });
    }
    // No secret yet — fall through to generate one.
  }

  // 32 bytes hex = 64 chars. Plenty for a shared secret, fits comfortably
  // into a URL query param.
  const fresh = randomBytes(32).toString("hex");
  await prisma.siteSettings.upsert({
    where: { key: SITE_SETTING_PO_POSTBACK_SECRET },
    create: { key: SITE_SETTING_PO_POSTBACK_SECRET, value: fresh },
    update: { value: fresh },
  });
  return NextResponse.json({ ok: true, secret: fresh, rotated: true });
}
