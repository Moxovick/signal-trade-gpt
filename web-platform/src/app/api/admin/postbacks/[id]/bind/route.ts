/**
 * Admin · POST /api/admin/postbacks/[id]/bind
 *
 * Manually attach an unmatched postback to a user. Useful when PO didn't
 * send back our click_id (e.g. the user installed the app before we
 * regenerated their referral link, or copy-pasted a generic affiliate
 * URL).
 *
 * Body: { userId: string, poTraderId?: string }
 *   - userId is required and identifies the recipient.
 *   - poTraderId overrides the one stored on the postback. Defaults to
 *     whatever was in the postback row.
 *
 * Side effects (idempotent):
 *   - Upserts the user's PocketOptionAccount (creates it on the fly if
 *     missing, using poTraderId).
 *   - Sets postback.poAccountId so the row no longer shows as unmatched.
 *   - Replays the postback's event effects on the account (FTD amount,
 *     redeposit / commission increments, withdrawal status, etc).
 *   - Recomputes the user's tier.
 */
import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recomputeUserTier } from "@/lib/pocketoption";
import type { Prisma } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "admin") return null;
  return session;
}

export async function POST(req: NextRequest, ctx: Params) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, reason: "forbidden" }, { status: 403 });
  }
  const { id } = await ctx.params;
  const body = (await req.json().catch(() => null)) as
    | { userId?: unknown; poTraderId?: unknown }
    | null;
  if (!body || typeof body.userId !== "string" || body.userId.length === 0) {
    return NextResponse.json(
      { ok: false, reason: "missing_user_id" },
      { status: 400 },
    );
  }
  const userId = body.userId;
  const traderIdOverride =
    typeof body.poTraderId === "string" && body.poTraderId.trim().length > 0
      ? body.poTraderId.trim()
      : null;

  const postback = await prisma.postback.findUnique({ where: { id } });
  if (!postback) {
    return NextResponse.json({ ok: false, reason: "postback_not_found" }, { status: 404 });
  }
  if (postback.poAccountId) {
    return NextResponse.json({ ok: false, reason: "already_bound" }, { status: 409 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { poAccount: true },
  });
  if (!user) {
    return NextResponse.json({ ok: false, reason: "user_not_found" }, { status: 404 });
  }

  // Filter out unresolved PO macro placeholders like "{trader_id}"
  const isMacro = (s: string | null | undefined): boolean =>
    s != null && /^\{[^}]+\}$/.test(s);

  const poTraderId =
    traderIdOverride
    ?? (isMacro(postback.poTraderId) ? null : postback.poTraderId)
    ?? user.poAccount?.poTraderId
    ?? null;
  if (!poTraderId || isMacro(poTraderId)) {
    return NextResponse.json(
      { ok: false, reason: "missing_trader_id" },
      { status: 400 },
    );
  }

  // Trader-id uniqueness: make sure we're not trying to assign one that
  // already belongs to a different user.
  const conflict = await prisma.pocketOptionAccount.findUnique({
    where: { poTraderId },
  });
  if (conflict && conflict.userId !== user.id) {
    return NextResponse.json(
      { ok: false, reason: "trader_id_taken" },
      { status: 409 },
    );
  }

  const amount = postback.amount ? Number(postback.amount) : 0;
  const updates: Prisma.PocketOptionAccountUncheckedUpdateInput = {
    poTraderId,
    lastPostbackAt: postback.receivedAt,
  };
  switch (postback.eventType) {
    case "registration":
      updates.registeredAt = postback.receivedAt;
      if (user.poAccount?.status !== "verified") {
        updates.status = "pending";
      }
      break;
    case "email_confirm":
      updates.emailConfirmedAt = postback.receivedAt;
      break;
    case "ftd":
      updates.ftdAt = postback.receivedAt;
      updates.ftdAmount = amount;
      updates.totalDeposit = { increment: amount };
      updates.status = "verified";
      break;
    case "redeposit":
      updates.totalDeposit = { increment: amount };
      updates.status = "verified";
      break;
    case "commission":
      updates.totalRevShare = { increment: amount };
      break;
    case "withdrawal":
      if (postback.withdrawalStatus === "processed" && amount > 0) {
        updates.totalDeposit = { decrement: amount };
      }
      break;
  }

  const account = await prisma.pocketOptionAccount.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      poTraderId,
      status: postback.eventType === "ftd" || postback.eventType === "redeposit"
        ? "verified"
        : "pending",
      source: "manual",
      totalDeposit:
        postback.eventType === "ftd" || postback.eventType === "redeposit"
          ? amount
          : 0,
      totalRevShare: postback.eventType === "commission" ? amount : 0,
      ftdAt: postback.eventType === "ftd" ? postback.receivedAt : null,
      ftdAmount: postback.eventType === "ftd" ? amount : null,
      registeredAt:
        postback.eventType === "registration" ? postback.receivedAt : null,
      emailConfirmedAt:
        postback.eventType === "email_confirm" ? postback.receivedAt : null,
      lastPostbackAt: postback.receivedAt,
    },
    update: updates,
  });

  // Bind the postback to this account so it no longer shows as unmatched.
  await prisma.postback.update({
    where: { id },
    data: {
      poAccountId: account.id,
      poTraderId,
      clickId: postback.clickId ?? user.id,
    },
  });

  // Mirror FTD / redeposit into the Deposit table so dashboards line up.
  if (
    (postback.eventType === "ftd" || postback.eventType === "redeposit") &&
    amount > 0
  ) {
    const existing = await prisma.deposit.findUnique({
      where: { postbackId: postback.id },
    });
    if (!existing) {
      await prisma.deposit.create({
        data: {
          userId: user.id,
          amount,
          status: "confirmed",
          postbackId: postback.id,
          isFirst: postback.eventType === "ftd",
          confirmedAt: postback.receivedAt,
        },
      });
    }
  }

  // Sync User.depositTotal from PO account so dashboard/admin show correct value.
  if (
    (postback.eventType === "ftd" || postback.eventType === "redeposit") &&
    amount > 0
  ) {
    await prisma.user.update({
      where: { id: user.id },
      data: { depositTotal: { increment: amount } },
    });
  }

  const newTier = await recomputeUserTier(user.id);

  return NextResponse.json({
    ok: true,
    poAccountId: account.id,
    poTraderId,
    newTier,
  });
}
