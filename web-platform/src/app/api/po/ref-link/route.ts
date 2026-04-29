import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { buildReferralLink } from "@/lib/pocketoption";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, reason: "unauthorized" }, { status: 401 });
  }
  const url = await buildReferralLink(session.user.id);
  return NextResponse.json({ ok: true, url });
}
