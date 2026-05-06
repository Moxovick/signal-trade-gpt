import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "admin") return null;
  return session;
}

type Ctx = { params: Promise<{ id: string }> };

function parseConfig(value: unknown): unknown {
  if (value === null || value === undefined) return undefined;
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

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await ctx.params;
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

  const data: Record<string, unknown> = {};
  if (body["name"] !== undefined) data["name"] = String(body["name"]).trim();
  if (body["description"] !== undefined) data["description"] = String(body["description"]).trim();
  if (body["minTier"] !== undefined) {
    data["minTier"] = Math.max(0, Math.min(4, Number(body["minTier"])));
  }
  if (body["isActive"] !== undefined) data["isActive"] = Boolean(body["isActive"]);
  if (body["code"] !== undefined) {
    const newCode = String(body["code"]).trim();
    if (!newCode) {
      return NextResponse.json({ error: "code cannot be empty" }, { status: 400 });
    }
    data["code"] = newCode;
  }
  if (body["config"] !== undefined) {
    try {
      const cfg = parseConfig(body["config"]);
      if (cfg !== undefined) data["config"] = cfg;
    } catch {
      return NextResponse.json({ error: "config must be valid JSON" }, { status: 400 });
    }
  }

  try {
    const perk = await prisma.botPerk.update({ where: { id }, data });
    return NextResponse.json({ perk });
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code === "P2002") {
      return NextResponse.json({ error: "code already exists" }, { status: 409 });
    }
    if (code === "P2025") {
      return NextResponse.json({ error: "perk not found" }, { status: 404 });
    }
    throw err;
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await ctx.params;
  try {
    await prisma.botPerk.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code === "P2025") {
      return NextResponse.json({ error: "perk not found" }, { status: 404 });
    }
    throw err;
  }
}
