import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "admin") return null;
  return session;
}

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await ctx.params;
  const b = await req.json();
  const updated = await prisma.prize.update({
    where: { id },
    data: {
      ...(b.tier !== undefined && { tier: b.tier }),
      ...(b.position !== undefined && { position: b.position }),
      ...(b.minDeposit !== undefined && { minDeposit: b.minDeposit }),
      ...(b.title !== undefined && { title: b.title }),
      ...(b.description !== undefined && { description: b.description }),
      ...(b.valueLabel !== undefined && { valueLabel: b.valueLabel }),
      ...(b.imageUrl !== undefined && { imageUrl: b.imageUrl }),
      ...(b.isActive !== undefined && { isActive: b.isActive }),
    },
  });
  return NextResponse.json({ prize: updated });
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await ctx.params;
  await prisma.prize.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
