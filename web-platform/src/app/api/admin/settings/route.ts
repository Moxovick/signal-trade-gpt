/**
 * POST /api/admin/settings — bulk-upsert SiteSettings keys.
 */
import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Update = { key: string; value: unknown };

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ ok: false, reason: "forbidden" }, { status: 403 });
  }

  const body = (await req.json().catch(() => null)) as { updates?: Update[] } | null;
  if (!body?.updates || !Array.isArray(body.updates)) {
    return NextResponse.json({ ok: false, reason: "bad_payload" }, { status: 400 });
  }

  for (const u of body.updates) {
    if (typeof u.key !== "string" || u.key.length === 0) continue;
    await prisma.siteSettings.upsert({
      where: { key: u.key },
      create: { key: u.key, value: u.value as object },
      update: { value: u.value as object },
    });
  }

  return NextResponse.json({ ok: true });
}
