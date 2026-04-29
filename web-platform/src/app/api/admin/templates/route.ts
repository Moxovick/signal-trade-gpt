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

  const templates = await prisma.botTemplate.findMany({
    orderBy: [{ tier: "asc" }, { plan: "asc" }, { name: "asc" }],
  });

  return NextResponse.json({ templates });
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { name, tier, plan, subject, body, variables } = await req.json();

  if (!name || !subject || !body) {
    return NextResponse.json({ error: "Имя, тема и тело обязательны" }, { status: 400 });
  }

  const template = await prisma.botTemplate.create({
    data: {
      name,
      tier: tier ?? null,
      plan: plan ?? null,
      subject,
      body,
      variables: variables ?? [],
    },
  });

  return NextResponse.json({ template }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id, name, subject, body, variables, isActive } = await req.json();

  if (!id) {
    return NextResponse.json({ error: "ID обязателен" }, { status: 400 });
  }

  const template = await prisma.botTemplate.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(subject !== undefined && { subject }),
      ...(body !== undefined && { body }),
      ...(variables !== undefined && { variables }),
      ...(isActive !== undefined && { isActive }),
    },
  });

  return NextResponse.json({ template });
}
