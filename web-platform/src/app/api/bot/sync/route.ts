/**
 * GET /api/bot/sync
 *
 * Bot-facing snapshot endpoint. Returns:
 *   - accounts:   linked PO accounts with tier/deposit/telegramId
 *   - signals:    recent active signals (admin-published) the bot can broadcast
 *   - config:     bot configuration (welcome msg, signal template, autopost,
 *                 daily limits, FAQ, price source) — see lib/bot-config.ts.
 *   - tierThresholds: for tier-up calculations.
 *
 * Auth: header `X-Bot-Secret` must equal env BOT_SYNC_SECRET. Shared-secret
 * auth is enough because the response is read-only and the bot is trusted.
 *
 * The bot polls this endpoint every ~60s and mirrors data to SQLite.
 */
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseBotConfig } from "@/lib/bot-config";
import {
  DEFAULT_TIER_THRESHOLDS,
  SITE_SETTING_TIER_THRESHOLDS,
  type TierThresholds,
} from "@/lib/tier";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const secret = process.env["BOT_SYNC_SECRET"];
  if (!secret) {
    return NextResponse.json(
      { ok: false, reason: "sync_disabled" },
      { status: 503 },
    );
  }
  const provided = req.headers.get("x-bot-secret");
  if (provided !== secret) {
    return NextResponse.json(
      { ok: false, reason: "bad_secret" },
      { status: 401 },
    );
  }

  const [accounts, settings, signals] = await Promise.all([
    prisma.pocketOptionAccount.findMany({
      select: {
        poTraderId: true,
        totalDeposit: true,
        user: {
          select: {
            tier: true,
            telegramId: true,
          },
        },
      },
    }),
    prisma.siteSettings.findMany(),
    prisma.signal.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  const accountsData = accounts.map((a) => ({
    poTraderId: a.poTraderId,
    tier: a.user.tier,
    totalDeposit: Number(a.totalDeposit),
    telegramId: a.user.telegramId ? a.user.telegramId.toString() : null,
  }));

  const settingsRows = settings.map((s) => ({ key: s.key, value: s.value }));
  const config = parseBotConfig(settingsRows);

  const tierRow = settings.find((s) => s.key === SITE_SETTING_TIER_THRESHOLDS);
  const tierThresholds: TierThresholds =
    tierRow && tierRow.value && typeof tierRow.value === "object"
      ? (tierRow.value as TierThresholds)
      : DEFAULT_TIER_THRESHOLDS;

  const signalsData = signals.map((s) => ({
    id: s.id,
    pair: s.pair,
    direction: s.direction,
    expiration: s.expiration,
    confidence: s.confidence,
    tier: s.tier,
    type: s.type,
    entryPrice: s.entryPrice == null ? null : Number(s.entryPrice),
    analysis: s.analysis,
    reasoning: s.reasoning,
    result: s.result,
    isActive: s.isActive,
    createdAt: s.createdAt.toISOString(),
    closedAt: s.closedAt ? s.closedAt.toISOString() : null,
  }));

  return NextResponse.json({
    ok: true,
    ts: Date.now(),
    accounts: accountsData,
    signals: signalsData,
    config,
    tierThresholds,
  });
}
