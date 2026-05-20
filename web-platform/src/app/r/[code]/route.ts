/**
 * /r/[code] — referral short-link handler.
 *
 * Sets a 30-day cookie so the attribution survives even if the user
 * closes the browser and returns to /register later without the ?ref= param.
 * Then redirects to /register?ref={code}.
 */
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "stg_ref";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;

  // Validate the code exists (so we don't set cookies for garbage URLs)
  const referrer = await prisma.user.findUnique({
    where: { referralCode: code },
    select: { id: true },
  });

  const registerUrl = new URL("/register", request.url);
  if (referrer) {
    registerUrl.searchParams.set("ref", code);
  }

  const response = NextResponse.redirect(registerUrl);

  if (referrer) {
    response.cookies.set(COOKIE_NAME, code, {
      maxAge: COOKIE_MAX_AGE,
      path: "/",
      httpOnly: false, // Readable by JS so RegisterForm can pre-fill
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }

  return response;
}
