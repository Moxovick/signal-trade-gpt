import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "admin") return null;
  return session;
}

function parseConfig(value: unknown): unknown {
  if (value === null || value === undefined) return {};
  if (typeof value === "object") return value;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return {};
    try {
      return JSON.parse(trimmed);
    } catch {
      throw new Error("invalid_config_json");
    }
  }
  throw new Error("invalid_config_json");
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const perks = await prisma.botPerk.findMany({
    orderBy: [{ minTier: "asc" }, { name: "asc" }],
  });
  return NextResponse.json({ perks });
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

  const code = String(body["code"] ?? "").trim();
  const name = String(body["name"] ?? "").trim();
  if (!code || !name) {
    return NextResponse.json({ error: "code and name are required" }, { status: 400 });
  }

  let config: unknown;
  try {
    config = parseConfig(body["config"]);
  } catch {
    return NextResponse.json({ error: "config must be valid JSON" }, { status: 400 });
  }

  const existing = await prisma.botPerk.findUnique({ where: { code } });
  if (existing) {
    return NextResponse.json({ error: "code already exists" }, { status: 409 });
  }

  const perk = await prisma.botPerk.create({
    data: {
      code,
      name,
      description: String(body["description"] ?? "").trim(),
      minTier: Math.max(0, Math.min(4, Number(body["minTier"] ?? 1))),
      config: config as object,
      isActive: body["isActive"] !== false,
    },
  });
  return NextResponse.json({ perk }, { status: 201 });
}
