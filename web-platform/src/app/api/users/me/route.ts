import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: (session.user as { id: string }).id },
    select: {
      id: true,
      email: true,
      username: true,
      firstName: true,
      telegramId: true,
      role: true,
      status: true,
      subscriptionPlan: true,
      subscriptionExpiresAt: true,
      referralCode: true,
      createdAt: true,
      lastLogin: true,
      _count: { select: { referrals: true } },
    },
  });

  // BigInt is not JSON-serializable; coerce telegramId to string before serializing.
  const safe = user
    ? { ...user, telegramId: user.telegramId == null ? null : user.telegramId.toString() }
    : null;
  return NextResponse.json({ user: safe });
}

/**
 * PUT /api/users/me — DEPRECATED, use /api/account/profile.
 * Kept for backward compatibility; redirects logic to same validation.
 */
export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as
    | { username?: string; firstName?: string; avatar?: string | null }
    | null;
  if (!body) {
    return NextResponse.json({ error: "bad_body" }, { status: 400 });
  }

  const MAX_NAME = 32;
  const MAX_AVATAR_BYTES = 500 * 1024;

  if (body.firstName !== undefined && (typeof body.firstName !== "string" || body.firstName.length > MAX_NAME)) {
    return NextResponse.json({ error: "firstName too long" }, { status: 400 });
  }
  if (body.username !== undefined && (typeof body.username !== "string" || body.username.length > MAX_NAME)) {
    return NextResponse.json({ error: "username too long" }, { status: 400 });
  }
  if (body.avatar !== undefined && body.avatar !== null) {
    if (typeof body.avatar !== "string" || body.avatar.length > MAX_AVATAR_BYTES) {
      return NextResponse.json({ error: "avatar too large" }, { status: 400 });
    }
  }

  const data: Record<string, string | null> = {};
  if (body.username !== undefined) data.username = body.username?.trim() || null;
  if (body.firstName !== undefined) data.firstName = body.firstName?.trim() || null;
  if (body.avatar !== undefined) data.avatar = body.avatar ?? null;

  const user = await prisma.user.update({
    where: { id: (session.user as { id: string }).id },
    data,
    select: { id: true, username: true, firstName: true, avatar: true },
  });

  return NextResponse.json({ user });
}
