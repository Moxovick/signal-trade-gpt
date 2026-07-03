/**
 * PUT /api/tma/preferences — update preferences from Mini App.
 */
import { NextRequest, NextResponse } from "next/server";
import { authTmaRequest } from "@/lib/tma-auth";
import { setPreferences } from "@/lib/user-preferences";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function PUT(req: NextRequest) {
  const session = await authTmaRequest(req);
  if (!session.ok) {
    return NextResponse.json({ error: session.reason }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) {
    return NextResponse.json({ error: "bad_body" }, { status: 400 });
  }

  const next = await setPreferences(session.userId, body);
  const res = NextResponse.json({ ok: true, preferences: next });
  // Also set locale cookie so TMA layout (server component) can read it
  if (typeof body.language === "string" && (body.language === "ru" || body.language === "uk")) {
    res.cookies.set("locale", body.language, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  }
  return res;
}
