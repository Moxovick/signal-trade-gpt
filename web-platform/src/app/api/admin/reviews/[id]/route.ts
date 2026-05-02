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
  const updated = await prisma.review.update({
    where: { id },
    data: {
      ...(b.authorName !== undefined && { authorName: b.authorName }),
      ...(b.authorRole !== undefined && { authorRole: b.authorRole }),
      ...(b.avatarUrl !== undefined && { avatarUrl: b.avatarUrl }),
      ...(b.rating !== undefined && { rating: b.rating }),
      ...(b.text !== undefined && { text: b.text }),
      ...(b.isFeatured !== undefined && { isFeatured: b.isFeatured }),
      ...(b.isPublic !== undefined && { isPublic: b.isPublic }),
      ...(b.position !== undefined && { position: b.position }),
      ...(b.status !== undefined && { status: b.status }),
    },
  });
  return NextResponse.json({ review: updated });
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await ctx.params;
  await prisma.review.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
