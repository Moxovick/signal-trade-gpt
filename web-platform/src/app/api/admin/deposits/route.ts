import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function isAdmin() {
  const session = await auth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return session?.user && (session.user as any).role === "admin";
}

export async function GET(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = 50;

  const where = status ? { status: status as "pending" | "confirmed" | "rejected" } : {};

  const [deposits, total] = await Promise.all([
    prisma.deposit.findMany({
      where,
      include: {
        user: { select: { id: true, email: true, username: true, subscriptionPlan: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.deposit.count({ where }),
  ]);

  return NextResponse.json({ deposits, total, page, pages: Math.ceil(total / limit) });
}

export async function PUT(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id, status } = await req.json();

  if (!id || !status) {
    return NextResponse.json({ error: "ID и статус обязательны" }, { status: 400 });
  }

  const deposit = await prisma.deposit.update({
    where: { id },
    data: {
      status,
      confirmedAt: status === "confirmed" ? new Date() : null,
    },
  });

  if (status === "confirmed") {
    const userDeposits = await prisma.deposit.aggregate({
      where: { userId: deposit.userId, status: "confirmed" },
      _sum: { amount: true },
    });

    const totalDeposit = Number(userDeposits._sum.amount ?? 0);

    await prisma.user.update({
      where: { id: deposit.userId },
      data: {
        depositTotal: totalDeposit,
        eliteUnlocked: totalDeposit >= 500,
        ...(totalDeposit >= 500 && { subscriptionPlan: "elite" }),
      },
    });
  }

  return NextResponse.json({ deposit });
}
