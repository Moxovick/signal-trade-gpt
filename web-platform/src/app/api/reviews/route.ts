import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const reviews = await prisma.review.findMany({
    where: { status: "published" },
    include: {
      user: { select: { firstName: true, email: true, subscriptionPlan: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ reviews });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { text, rating } = await req.json();

  if (!text || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "text and rating (1-5) required" }, { status: 400 });
  }

  const review = await prisma.review.create({
    data: {
      userId: (session.user as { id: string }).id,
      text,
      rating,
      status: "hidden",
    },
  });

  return NextResponse.json({ review }, { status: 201 });
}
