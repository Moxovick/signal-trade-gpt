import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "admin") return null;
  return session;
}

type Ctx = { params: Promise<{ slug: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { slug } = await ctx.params;
  const page = await prisma.legalPage.findUnique({ where: { slug } });
  return NextResponse.json({ page });
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { slug } = await ctx.params;
  const b = await req.json();
  const page = await prisma.legalPage.upsert({
    where: { slug },
    create: {
      slug,
      title: b.title,
      body: b.body,
      isActive: b.isActive ?? true,
    },
    update: {
      ...(b.title !== undefined && { title: b.title }),
      ...(b.body !== undefined && { body: b.body }),
      ...(b.isActive !== undefined && { isActive: b.isActive }),
    },
  });
  return NextResponse.json({ page });
}
