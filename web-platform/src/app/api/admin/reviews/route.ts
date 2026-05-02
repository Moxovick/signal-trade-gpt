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
  const reviews = await prisma.review.findMany({
    orderBy: [{ isFeatured: "desc" }, { position: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json({ reviews });
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const b = await req.json();
  const review = await prisma.review.create({
    data: {
      authorName: b.authorName,
      authorRole: b.authorRole ?? null,
      avatarUrl: b.avatarUrl ?? null,
      rating: b.rating ?? 5,
      text: b.text,
      isFeatured: b.isFeatured ?? false,
      isPublic: b.isPublic ?? true,
      position: b.position ?? 0,
      status: b.status ?? "published",
    },
  });
  return NextResponse.json({ review }, { status: 201 });
}
