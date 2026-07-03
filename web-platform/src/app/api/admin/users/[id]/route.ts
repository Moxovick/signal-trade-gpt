/**
 * Admin · GET /api/admin/users/:id
 *
 * Returns detailed user info with PO account, recent activity logs,
 * and login events for the admin user detail panel.
 */
import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      username: true,
      firstName: true,
      lastName: true,
      telegramId: true,
      avatar: true,
      role: true,
      status: true,
      tier: true,
      tierOverride: true,
      depositTotal: true,
      signalsReceived: true,
      wins: true,
      losses: true,
      dailySignalsUsed: true,
      streakDays: true,
      referralCode: true,
      lastLogin: true,
      createdAt: true,
      poAccount: {
        select: {
          id: true,
          poTraderId: true,
          status: true,
          source: true,
          totalDeposit: true,
          totalRevShare: true,
          ftdAt: true,
          ftdAmount: true,
          registeredAt: true,
          emailConfirmedAt: true,
          lastPostbackAt: true,
          createdAt: true,
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const [activityLogs, loginEvents] = await Promise.all([
    prisma.activityLog.findMany({
      where: { userId: id },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        action: true,
        details: true,
        ip: true,
        createdAt: true,
      },
    }),
    prisma.loginEvent.findMany({
      where: { userId: id },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        kind: true,
        ip: true,
        createdAt: true,
      },
    }),
  ]);

  // Serialize BigInt telegramId to string
  const serialized = {
    ...user,
    telegramId: user.telegramId ? user.telegramId.toString() : null,
    depositTotal: Number(user.depositTotal),
    poAccount: user.poAccount
      ? {
          ...user.poAccount,
          totalDeposit: Number(user.poAccount.totalDeposit),
          totalRevShare: Number(user.poAccount.totalRevShare),
          ftdAmount: user.poAccount.ftdAmount
            ? Number(user.poAccount.ftdAmount)
            : null,
        }
      : null,
    activityLogs,
    loginEvents,
  };

  return NextResponse.json(serialized);
}
