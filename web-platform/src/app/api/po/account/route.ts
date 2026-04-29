/**
 * GET /api/po/account — current user's PO account snapshot + tier perks.
 */
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAccessReport } from "@/lib/access";
import { distanceToNextTier, DEFAULT_TIER_THRESHOLDS, SITE_SETTING_TIER_THRESHOLDS, type TierThresholds } from "@/lib/tier";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, reason: "unauthorized" }, { status: 401 });
  }

  const [account, settings, report] = await Promise.all([
    prisma.pocketOptionAccount.findUnique({ where: { userId: session.user.id } }),
    prisma.siteSettings.findUnique({ where: { key: SITE_SETTING_TIER_THRESHOLDS } }),
    getAccessReport(session.user.id),
  ]);

  const thresholds: TierThresholds =
    settings && typeof settings.value === "object" && settings.value !== null
      ? (settings.value as TierThresholds)
      : DEFAULT_TIER_THRESHOLDS;

  const tier = report?.tier ?? 0;
  const total = account?.totalDeposit ? Number(account.totalDeposit) : 0;

  return NextResponse.json({
    ok: true,
    account: account
      ? {
          poTraderId: account.poTraderId,
          status: account.status,
          source: account.source,
          totalDeposit: total,
          totalRevShare: account.totalRevShare ? Number(account.totalRevShare) : 0,
          ftdAt: account.ftdAt,
          registeredAt: account.registeredAt,
        }
      : null,
    tier,
    thresholds,
    nextTier: distanceToNextTier(total, tier, thresholds),
    perks: report?.perks ?? [],
    demoSignalsRemaining: report?.demoSignalsRemaining ?? null,
    dailyLimit: report?.dailySignalLimit ?? null,
    signalsTodayUsed: report?.signalsTodayUsed ?? 0,
  });
}
