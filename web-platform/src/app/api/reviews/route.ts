import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const reviews = await prisma.review.findMany({
    where: { isPublic: true, status: "published" },
    orderBy: [{ isFeatured: "desc" }, { position: "asc" }, { createdAt: "desc" }],
    take: 50,
  });
  return NextResponse.json({ reviews });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { text, rating, authorName, authorRole } = await req.json();

  if (!text || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "text and rating (1-5) required" }, { status: 400 });
  }

  const userId = (session.user as { id: string }).id;
  const user = await prisma.user.findUnique({ where: { id: userId } });

  const review = await prisma.review.create({
    data: {
      userId,
      authorName: authorName || user?.firstName || user?.email || "Anonymous",
      authorRole: authorRole || null,
      text,
      rating,
      status: "moderation",
      isPublic: false,
    },
  });

  return NextResponse.json({ review }, { status: 201 });
}
