/**
 * PUT /api/account/profile — update user profile fields.
 *
 * Body: { firstName?: string, username?: string, avatar?: string | null }
 */
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MAX_NAME = 32;
const MAX_AVATAR_BYTES = 3 * 1024 * 1024; // 3 MB (2 MB binary + ~33% base64 overhead)

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { firstName, username, avatar } = body as Record<string, unknown>;

  // Validate firstName
  if (firstName !== undefined) {
    if (typeof firstName !== "string" || firstName.length > MAX_NAME) {
      return NextResponse.json(
        { error: `firstName must be a string up to ${MAX_NAME} chars` },
        { status: 400 },
      );
    }
  }

  // Validate username
  if (username !== undefined) {
    if (typeof username !== "string" || username.length > MAX_NAME) {
      return NextResponse.json(
        { error: `username must be a string up to ${MAX_NAME} chars` },
        { status: 400 },
      );
    }
  }

  // Validate avatar
  if (avatar !== undefined && avatar !== null) {
    if (typeof avatar !== "string" || avatar.length > MAX_AVATAR_BYTES) {
      return NextResponse.json(
        { error: "avatar must be a data URL under 2 MB" },
        { status: 400 },
      );
    }
  }

  const data: Record<string, string | null> = {};
  if (firstName !== undefined) data.firstName = (firstName as string).trim() || null;
  if (username !== undefined) data.username = (username as string).trim() || null;
  if (avatar !== undefined) data.avatar = (avatar as string | null) ?? null;

  await prisma.user.update({
    where: { id: session.user.id },
    data,
  });

  return NextResponse.json({ ok: true });
}
