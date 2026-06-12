/**
 * GET /api/bot/sync
 *
 * Bot-facing snapshot endpoint. Returns:
 *   - accounts:       linked PO accounts with tier/deposit/telegramId
 *   - config:         bot configuration (welcome msg, signal template,
 *                     FAQ, price source) — see lib/bot-config.ts.
 *   - tierThresholds: for tier-up calculations.
 *   - onDemandConfig: per-tier daily limits & allowed signal types.
 *
 * On-demand model: signals are no longer broadcast from admin. Each user
 * requests signals individually. The bot generates signals on /signal command
 * using onDemandConfig for limits and allowed types.
 *
 * Auth: header `X-Bot-Secret` must equal env BOT_SYNC_SECRET.
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
import { verifyBotSecret } from "@/lib/bot-secret";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const check = verifyBotSecret(req.headers.get("x-bot-secret"));
  if (!check.ok) {
    const status = check.reason === "not_configured" ? 503 : 401;
    return NextResponse.json(
      { ok: false, reason: check.reason === "not_configured" ? "sync_disabled" : "bad_secret" },
      { status },
    );
  }

  // On-demand model: no scheduled signals to sync. Only accounts + config.
  const [accounts, settings] = await Promise.all([
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

  // On-demand signal config for the bot (daily limits per tier)
  const onDemandRow = settings.find((s) => s.key === "on_demand_signal_config");
  const onDemandConfig = onDemandRow?.value ?? {
    dailyLimits: { "0": 3, "1": 10, "2": null },
    allowedTypes: {
      "0": ["otc"],
      "1": ["otc", "exchange"],
      "2": ["otc", "exchange", "elite"],
    },
    proFrequencySeconds: 0,
  };

  return NextResponse.json({
    ok: true,
    ts: Date.now(),
    accounts: accountsData,
    config,
    tierThresholds,
    onDemandConfig,
  });
}
