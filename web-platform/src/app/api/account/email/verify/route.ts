/**
 * POST /api/account/email/verify — consume an OTP code and mark the email as
 * verified (User.emailVerifiedAt = now).
 */
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyOtp } from "@/lib/otp";

export async function POST(req: Request): Promise<Response> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = (await req.json().catch(() => null)) as
    | { code: string }
    | null;
  if (!body?.code) {
    return NextResponse.json({ error: "bad_body" }, { status: 400 });
  }
  const r = await verifyOtp({
    userId: session.user.id,
    purpose: "email_verify",
    code: body.code,
  });
  if (!r.ok) {
    return NextResponse.json({ error: r.reason }, { status: 400 });
  }
  await prisma.user.update({
    where: { id: session.user.id },
    data: { emailVerifiedAt: new Date() },
  });
  await prisma.loginEvent.create({
    data: {
      userId: session.user.id,
      kind: "otp_verified",
      details: { purpose: "email_verify" },
    },
  });
  return NextResponse.json({ ok: true });
}
