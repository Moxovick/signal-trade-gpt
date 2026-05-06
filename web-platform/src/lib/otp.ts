/**
 * OTP (one-time password) helper — issue / verify email codes.
 *
 * Generates a 6-digit numeric code, stores only its sha256 hash, expires in
 * 10 minutes, allows max 5 incorrect attempts before invalidating.
 */
import { createHash, randomInt } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { renderOtpEmail, sendEmail } from "@/lib/email";
import type { OtpPurpose } from "@/generated/prisma/enums";

const OTP_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function hash(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

function generateCode(): string {
  // 000000..999999, zero-padded
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

/**
 * Issue a fresh OTP for a user. Invalidates any still-active codes for the
 * same (userId, purpose) so the user can't be confused by multiple valid
 * codes at the same time. Sends the email.
 */
export async function issueOtp(params: {
  userId: string;
  email: string;
  purpose: OtpPurpose;
}): Promise<{ ok: true; id: string; stub?: boolean } | { ok: false; error: string }> {
  const { userId, email, purpose } = params;

  // Invalidate active codes of the same purpose.
  await prisma.emailOtp.updateMany({
    where: {
      userId,
      purpose,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    data: { expiresAt: new Date(0) },
  });

  const code = generateCode();
  const record = await prisma.emailOtp.create({
    data: {
      userId,
      email,
      codeHash: hash(code),
      purpose,
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
    },
  });

  const rendered = renderOtpEmail(code, purpose);
  const sent = await sendEmail({
    to: email,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
  });
  if (!sent.ok) {
    return { ok: false, error: sent.error };
  }
  return { ok: true, id: record.id, stub: sent.stub };
}

export type OtpVerifyResult =
  | { ok: true; otp: { id: string; email: string; purpose: OtpPurpose } }
  | { ok: false; reason: "expired" | "invalid" | "too_many_attempts" | "not_found" };

export async function verifyOtp(params: {
  userId: string;
  purpose: OtpPurpose;
  code: string;
}): Promise<OtpVerifyResult> {
  const { userId, purpose, code } = params;
  const otp = await prisma.emailOtp.findFirst({
    where: { userId, purpose, usedAt: null },
    orderBy: { createdAt: "desc" },
  });
  if (!otp) return { ok: false, reason: "not_found" };
  if (otp.expiresAt.getTime() < Date.now())
    return { ok: false, reason: "expired" };
  if (otp.attempts >= MAX_ATTEMPTS)
    return { ok: false, reason: "too_many_attempts" };

  if (otp.codeHash !== hash(code.trim())) {
    await prisma.emailOtp.update({
      where: { id: otp.id },
      data: { attempts: { increment: 1 } },
    });
    return { ok: false, reason: "invalid" };
  }

  await prisma.emailOtp.update({
    where: { id: otp.id },
    data: { usedAt: new Date() },
  });
  return {
    ok: true,
    otp: { id: otp.id, email: otp.email, purpose: otp.purpose },
  };
}
