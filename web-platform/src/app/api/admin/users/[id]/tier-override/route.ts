/**
 * Admin · POST /api/admin/users/[id]/tier-override
 *
 * Set or remove a manual tier floor for a user.
 * Body: { tier: 0 | 1 | 2 | null }
 *   - 0/1/2 sets the override (tier will never drop below this)
 *   - null removes the override (tier follows deposits only)
 *
 * After setting, recomputes actual tier = max(computed, override).
 */
import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recomputeUserTier } from "@/lib/pocketoption";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, ctx: Params) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ ok: false, reason: "forbidden" }, { status: 403 });
  }
  const { id } = await ctx.params;
  const body = (await req.json().catch(() => null)) as { tier?: unknown } | null;

  if (!body || (body.tier !== null && body.tier !== 0 && body.tier !== 1 && body.tier !== 2)) {
    return NextResponse.json(
      { ok: false, reason: "invalid_tier", hint: "tier must be 0, 1, 2, or null" },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({ where: { id }, select: { id: true } });
  if (!user) {
    return NextResponse.json({ ok: false, reason: "user_not_found" }, { status: 404 });
  }

  const tierOverride = body.tier as number | null;

  await prisma.user.update({
    where: { id },
    data: { tierOverride },
  });

  const newTier = await recomputeUserTier(id);

  return NextResponse.json({ ok: true, tierOverride, newTier });
}
