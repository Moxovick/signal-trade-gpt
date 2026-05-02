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

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { username, firstName } = await req.json();

  const user = await prisma.user.update({
    where: { id: (session.user as { id: string }).id },
    data: { username, firstName },
    select: { id: true, username: true, firstName: true },
  });

  return NextResponse.json({ user });
}
