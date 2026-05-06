/**
 * /api/admin/signal-templates — admin CRUD over the SiteSettings-backed
 * template catalogue used by bulk-publish and the auto-publish cron.
 *
 * GET  → returns the current array.
 * PUT  → overwrites the array with the validated payload.
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  loadTemplates,
  parseTemplates,
  saveTemplates,
} from "@/lib/signal-config";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "admin") return null;
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const templates = await loadTemplates();
  return NextResponse.json({ templates });
}

export async function PUT(req: NextRequest) {
  const session = await requireAdmin();
  if (!session)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json().catch(() => null);
  const arr = Array.isArray(body?.templates) ? body.templates : null;
  if (!arr)
    return NextResponse.json(
      { error: "Body must be { templates: [...] }" },
      { status: 400 },
    );
  const parsed = parseTemplates(arr);
  await saveTemplates(parsed);
  return NextResponse.json({ ok: true, templates: parsed });
}
