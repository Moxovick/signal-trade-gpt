/**
 * GET /po/refer — 302 to the user's PocketOption referral URL.
 *
 * Convenient for "Open PocketOption" buttons on the dashboard.
 */
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { buildReferralLink } from "@/lib/pocketoption";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", process.env["NEXTAUTH_URL"] ?? "http://localhost:3000"));
  }
  const url = await buildReferralLink(session.user.id);
  return NextResponse.redirect(url);
}
