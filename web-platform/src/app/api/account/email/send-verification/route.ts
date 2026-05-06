/**
 * POST /api/account/email/send-verification — email a fresh OTP to the user's
 * current email address for email verification.
 */
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { issueOtp } from "@/lib/otp";

export async function POST(): Promise<Response> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true },
  });
  if (!user?.email) {
    return NextResponse.json({ error: "no_email" }, { status: 400 });
  }
  const res = await issueOtp({
    userId: session.user.id,
    email: user.email,
    purpose: "email_verify",
  });
  if (!res.ok) {
    return NextResponse.json({ error: res.error }, { status: 500 });
  }
  await prisma.loginEvent.create({
    data: {
      userId: session.user.id,
      kind: "otp_sent",
      details: { purpose: "email_verify" },
    },
  });
  return NextResponse.json({ ok: true, stub: res.stub ?? false });
}
