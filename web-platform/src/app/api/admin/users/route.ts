import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "admin") return null;
  return session;
}

export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Math.min(10000, Number(searchParams.get("page") ?? 1) || 1));
  const limit = Math.max(1, Math.min(100, Number(searchParams.get("limit") ?? 20) || 20));
  const search = searchParams.get("search") ?? "";
  const tierFilter = searchParams.get("tier");
  const statusFilter = searchParams.get("status");
  const sortBy = searchParams.get("sortBy") ?? "createdAt";
  const sortDir = searchParams.get("sortDir") === "asc" ? "asc" as const : "desc" as const;

  const where: Record<string, unknown> = {};
  const conditions: Array<Record<string, unknown>> = [];

  if (search) {
    conditions.push({
      OR: [
        { email: { contains: search, mode: "insensitive" } },
        { username: { contains: search, mode: "insensitive" } },
        { firstName: { contains: search, mode: "insensitive" } },
      ],
    });
  }

  if (tierFilter !== null && tierFilter !== "" && tierFilter !== "all") {
    conditions.push({ tier: Number(tierFilter) });
  }

  if (statusFilter && statusFilter !== "all") {
    conditions.push({ status: statusFilter });
  }

  if (conditions.length > 0) {
    where.AND = conditions;
  }

  const orderByField = ["createdAt", "lastLogin", "depositTotal", "signalsReceived", "tier"].includes(sortBy)
    ? sortBy
    : "createdAt";

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        telegramId: true,
        avatar: true,
        role: true,
        status: true,
        tier: true,
        depositTotal: true,
        signalsReceived: true,
        wins: true,
        losses: true,
        createdAt: true,
        lastLogin: true,
        poAccount: {
          select: {
            poTraderId: true,
            status: true,
            totalDeposit: true,
          },
        },
      },
      orderBy: { [orderByField]: sortDir },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  // Serialize BigInt and Decimal
  const serialized = users.map((u) => ({
    ...u,
    telegramId: u.telegramId ? u.telegramId.toString() : null,
    depositTotal: Number(u.depositTotal),
    poAccount: u.poAccount
      ? {
          ...u.poAccount,
          totalDeposit: Number(u.poAccount.totalDeposit),
        }
      : null,
  }));

  return NextResponse.json({ users: serialized, total, page, limit });
}
