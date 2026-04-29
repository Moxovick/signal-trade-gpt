import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function isAdmin() {
  const session = await auth();
   
  return session?.user && session.user.role === "admin";
}

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const promoCodes = await prisma.promoCode.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { usedBy: true } } },
  });

  return NextResponse.json({ promoCodes });
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { code, type, trialDays, discountPercent, maxUses, expiresAt, description } = await req.json();

  if (!code) {
    return NextResponse.json({ error: "Код обязателен" }, { status: 400 });
  }

  const existing = await prisma.promoCode.findUnique({ where: { code: code.toUpperCase() } });
  if (existing) {
    return NextResponse.json({ error: "Промо-код уже существует" }, { status: 409 });
  }

  const promo = await prisma.promoCode.create({
    data: {
      code: code.toUpperCase(),
      type: type ?? "trial",
      trialDays: trialDays ?? 7,
      discountPercent: discountPercent ?? null,
      maxUses: maxUses ?? null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      description: description ?? null,
    },
  });

  return NextResponse.json({ promo }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id, isActive, maxUses, expiresAt } = await req.json();

  if (!id) {
    return NextResponse.json({ error: "ID обязателен" }, { status: 400 });
  }

  const promo = await prisma.promoCode.update({
    where: { id },
    data: {
      ...(isActive !== undefined && { isActive }),
      ...(maxUses !== undefined && { maxUses }),
      ...(expiresAt !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : null }),
    },
  });

  return NextResponse.json({ promo });
}
