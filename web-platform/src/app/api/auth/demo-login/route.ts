/**
 * /api/auth/demo-login — TEST-ONLY guest account creator.
 *
 * Creates an ephemeral demo user with tier 4 and a random email/password,
 * returns the credentials so the client can immediately call NextAuth's
 * `signIn("credentials", ...)` and land on /dashboard.
 *
 * Useful for local testing and demos when Telegram Login Widget can't be
 * used (no public domain) and email registration is being debugged.
 *
 * Disabled in production unless ENABLE_DEMO_LOGIN=1.
 */
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";

const isProd = process.env["NODE_ENV"] === "production";
const explicitlyEnabled = process.env["ENABLE_DEMO_LOGIN"] === "1";

export async function POST() {
  if (isProd && !explicitlyEnabled) {
    return NextResponse.json(
      { error: "Demo login disabled in production" },
      { status: 403 },
    );
  }

  try {
    const id = randomBytes(4).toString("hex");
    const email = `demo-${id}@guest.local`;
    const password = `demo-${id}`;
    const passwordHash = await bcrypt.hash(password, 12);
    const referralCode = `STG${randomBytes(4).toString("hex").toUpperCase()}`;

    await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName: `Demo ${id.slice(0, 4).toUpperCase()}`,
        tier: 4,
        role: "user",
        referralCode,
        depositTotal: 25000,
      },
    });

    return NextResponse.json({ email, password });
  } catch (err) {
    console.error("[demo-login] create failed", err);
    return NextResponse.json(
      { error: "Не удалось создать демо-аккаунт. Проверь миграции БД." },
      { status: 500 },
    );
  }
}
