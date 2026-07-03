/**
 * Admin · POST /api/admin/users/[id]/sync-deposit
 *
 * Re-sync User.depositTotal from PO account totalDeposit and recompute tier.
 * Use when bind happened but deposit/tier didn't update.
 */
import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recomputeUserTier } from "@/lib/pocketoption";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, ctx: Params) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ ok: false, reason: "forbidden" }, { status: 403 });
  }
  const { id } = await ctx.params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: { poAccount: true },
  });
  if (!user) {
    return NextResponse.json({ ok: false, reason: "user_not_found" }, { status: 404 });
  }

  const poDeposit = Number(user.poAccount?.totalDeposit ?? 0);

  await prisma.user.update({
    where: { id },
    data: { depositTotal: poDeposit },
  });

  const newTier = await recomputeUserTier(id);

  return NextResponse.json({
    ok: true,
    depositTotal: poDeposit,
    newTier,
  });
}
