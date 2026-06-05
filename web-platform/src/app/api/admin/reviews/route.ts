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

  if (!b.authorName || typeof b.authorName !== "string" || !b.authorName.trim()) {
    return NextResponse.json({ error: "authorName is required" }, { status: 400 });
  }
  if (!b.text || typeof b.text !== "string" || !b.text.trim()) {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }
  if (b.rating != null && (typeof b.rating !== "number" || b.rating < 1 || b.rating > 5)) {
    return NextResponse.json({ error: "rating must be between 1 and 5" }, { status: 400 });
  }
  const VALID_STATUSES = ["draft", "published", "archived"] as const;
  if (b.status && !(VALID_STATUSES as readonly string[]).includes(b.status)) {
    return NextResponse.json({ error: `status must be one of: ${VALID_STATUSES.join(", ")}` }, { status: 400 });
  }

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
