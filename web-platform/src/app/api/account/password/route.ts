/**
 * POST /api/account/password — set or change the account password.
 *
 * Body: { currentPassword: string | null, newPassword: string }.
 * `currentPassword` is null when the user has never had a password (e.g.
 * signed up with Telegram only) and wants to set one.
 */
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function ipFrom(req: Request): string | null {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    null
  );
}

export async function POST(req: Request): Promise<Response> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = (await req.json().catch(() => null)) as
    | { currentPassword: string | null; newPassword: string }
    | null;
  if (!body || typeof body.newPassword !== "string") {
    return NextResponse.json({ error: "bad_body" }, { status: 400 });
  }
  if (body.newPassword.length < 8) {
    return NextResponse.json(
      { error: "Минимум 8 символов" },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, passwordHash: true },
  });
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (user.passwordHash) {
    if (typeof body.currentPassword !== "string") {
      return NextResponse.json(
        { error: "Введи текущий пароль" },
        { status: 400 },
      );
    }
    const ok = await bcrypt.compare(body.currentPassword, user.passwordHash);
    if (!ok) {
      await prisma.loginEvent.create({
        data: {
          userId: user.id,
          kind: "login_fail",
          ip: ipFrom(req),
          userAgent: req.headers.get("user-agent"),
          details: { action: "password_change_bad_current" },
        },
      });
      return NextResponse.json(
        { error: "Текущий пароль не совпадает" },
        { status: 400 },
      );
    }
  }

  const hash = await bcrypt.hash(body.newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: hash },
  });
  await prisma.loginEvent.create({
    data: {
      userId: user.id,
      kind: "password_change",
      ip: ipFrom(req),
      userAgent: req.headers.get("user-agent"),
    },
  });

  return NextResponse.json({ ok: true });
}
