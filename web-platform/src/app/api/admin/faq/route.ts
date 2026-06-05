import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "admin") return null;
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const faqs = await prisma.faq.findMany({
    orderBy: [{ category: "asc" }, { position: "asc" }],
  });
  return NextResponse.json({ faqs });
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();

  const VALID_CATEGORIES = ["general", "trading", "deposit", "technical", "account"] as const;
  if (!body.question || typeof body.question !== "string" || !body.question.trim()) {
    return NextResponse.json({ error: "question is required" }, { status: 400 });
  }
  if (!body.answer || typeof body.answer !== "string" || !body.answer.trim()) {
    return NextResponse.json({ error: "answer is required" }, { status: 400 });
  }
  if (body.category && !(VALID_CATEGORIES as readonly string[]).includes(body.category)) {
    return NextResponse.json({ error: `category must be one of: ${VALID_CATEGORIES.join(", ")}` }, { status: 400 });
  }

  const faq = await prisma.faq.create({
    data: {
      question: body.question,
      answer: body.answer,
      category: body.category ?? "general",
      position: body.position ?? 0,
      isActive: body.isActive ?? true,
    },
  });
  return NextResponse.json({ faq }, { status: 201 });
}
