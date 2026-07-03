/**
 * PUT /api/account/preferences — partial update of user preferences.
 *
 * Body: Partial<UserPreferences>. Only known keys are persisted; unknown
 * fields are silently dropped by `setPreferences` through parsing.
 */
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { setPreferences } from "@/lib/user-preferences";

export async function PUT(req: Request): Promise<Response> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = (await req.json().catch(() => null)) as
    | Record<string, unknown>
    | null;
  if (!body) {
    return NextResponse.json({ error: "bad_body" }, { status: 400 });
  }
  const next = await setPreferences(session.user.id, body);
  const res = NextResponse.json({ ok: true, preferences: next });
  if (typeof body.language === "string" && (body.language === "ru" || body.language === "uk")) {
    res.cookies.set("locale", body.language, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  }
  return res;
}
