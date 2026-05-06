/**
 * PocketOption integration helpers.
 *
 * Reference docs:
 * - PocketOption Affiliate Postback 2.0 (delivered via partner UI):
 *   events = registration | email_confirm | ftd | redeposit | commission
 *
 * The integration is configured via SiteSettings (`po_referral_link_template`,
 * `po_partner_account`) so admins can change the ref link or sub-affiliate
 * percent without a redeploy.
 */
import { createHmac, timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";
import {
  computeTier,
  DEFAULT_TIER_THRESHOLDS,
  SITE_SETTING_TIER_THRESHOLDS,
  type TierThresholds,
} from "@/lib/tier";
import { fetchTraderInfo, isValidTraderIdFormat } from "@/lib/po-api";
import type { POAccountStatus } from "@/generated/prisma/enums";

export type RawPostback = {
  event: string;
  click_id?: string;
  trader_id?: string;
  amount?: string | number;
  currency?: string;
  email_confirmed?: boolean | string;
  is_first_deposit?: boolean | string;
  signature?: string;
  /** Original raw body for re-hashing in tests. */
  __raw?: string;
};

export type ParsedPostback = {
  event: "registration" | "email_confirm" | "ftd" | "redeposit" | "commission";
  clickId: string | null;
  poTraderId: string | null;
  amount: number | null;
  currency: string | null;
  isFirstDeposit: boolean;
  signature: string | null;
  /** dedupe key: SHA-256 of event+trader_id+amount+timestamp_minute. */
  dedupeKey: string;
  receivedAt: Date;
  raw: unknown;
};

const ALLOWED_EVENTS: ParsedPostback["event"][] = [
  "registration",
  "email_confirm",
  "ftd",
  "redeposit",
  "commission",
];

function hashDedupe(parts: Array<string | number | null | undefined>): string {
  const input = parts.map((p) => (p == null ? "" : String(p))).join("|");
  return createHmac("sha256", "stg-dedupe").update(input).digest("hex");
}

export function parsePostback(rawBody: string): ParsedPostback | null {
  let payload: RawPostback;
  try {
    payload = JSON.parse(rawBody) as RawPostback;
  } catch {
    return null;
  }
  const event = (payload.event ?? "").toLowerCase() as ParsedPostback["event"];
  if (!ALLOWED_EVENTS.includes(event)) return null;

  const amount =
    payload.amount != null && payload.amount !== "" ? Number(payload.amount) : null;
  const isFirstDeposit =
    String(payload.is_first_deposit ?? "").toLowerCase() === "true" ||
    payload.is_first_deposit === true ||
    event === "ftd";

  const now = new Date();
  // Minute-bucket so duplicate retries within 60s collapse.
  const minuteBucket = Math.floor(now.getTime() / 60_000);

  return {
    event,
    clickId: payload.click_id ?? null,
    poTraderId: payload.trader_id ?? null,
    amount,
    currency: payload.currency ?? null,
    isFirstDeposit,
    signature: payload.signature ?? null,
    dedupeKey: hashDedupe([event, payload.trader_id, amount, payload.click_id, minuteBucket]),
    receivedAt: now,
    raw: payload,
  };
}

/**
 * Verify HMAC-SHA256 signature against POCKETOPTION_POSTBACK_SECRET.
 *
 * If no secret is configured we **fail open** but log a warning — useful in
 * dev/staging. Production must always set the secret.
 */
export function verifyPostbackSignature(rawBody: string, providedSig: string | null): boolean {
  const secret = process.env["POCKETOPTION_POSTBACK_SECRET"];
  if (!secret) {
    if (process.env["NODE_ENV"] === "production") {
      console.warn("[postback] POCKETOPTION_POSTBACK_SECRET not set; rejecting signature.");
      return false;
    }
    return true;
  }
  if (!providedSig) return false;

  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  if (expected.length !== providedSig.length) return false;
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(providedSig));
  } catch {
    return false;
  }
}

async function getTierThresholds(): Promise<TierThresholds> {
  const setting = await prisma.siteSettings.findUnique({
    where: { key: SITE_SETTING_TIER_THRESHOLDS },
  });
  if (!setting) return DEFAULT_TIER_THRESHOLDS;
  const v = setting.value as unknown;
  if (typeof v !== "object" || v === null) return DEFAULT_TIER_THRESHOLDS;
  return v as TierThresholds;
}

/**
 * Recompute and persist `User.tier` based on the current PO account state.
 * Returns the new tier value.
 */
export async function recomputeUserTier(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { poAccount: true },
  });
  if (!user) return 0;

  const thresholds = await getTierThresholds();
  const verified = user.poAccount?.status === "verified";
  const total = user.poAccount?.totalDeposit ?? 0;
  const tier = computeTier(total, verified, thresholds);

  if (tier !== user.tier) {
    await prisma.user.update({ where: { id: userId }, data: { tier } });
  }
  return tier;
}

/**
 * Apply a parsed postback: locate or create the PO account, update fields,
 * record the postback row, recompute the user's tier.
 *
 * - For `ftd` and `redeposit` we additionally insert a `Deposit` row marked as
 *   automated (proofUrl=null, postbackId set).
 *
 * Idempotent on `dedupeKey`.
 */
export async function applyPostback(parsed: ParsedPostback): Promise<{
  applied: boolean;
  reason?: string;
  poAccountId?: string;
  userId?: string;
  newTier?: number;
}> {
  // Dedupe.
  const existing = await prisma.postback.findUnique({
    where: { dedupeKey: parsed.dedupeKey },
  });
  if (existing) return { applied: false, reason: "duplicate" };

  // Locate the PO account.
  let userId: string | null = null;
  let poAccountId: string | null = null;

  if (parsed.poTraderId) {
    const acc = await prisma.pocketOptionAccount.findUnique({
      where: { poTraderId: parsed.poTraderId },
    });
    if (acc) {
      poAccountId = acc.id;
      userId = acc.userId;
    }
  }

  if (!poAccountId && parsed.clickId) {
    // Click ID == User.id (we put it into the ref link).
    const user = await prisma.user.findUnique({
      where: { id: parsed.clickId },
      include: { poAccount: true },
    });
    if (user) {
      userId = user.id;
      if (user.poAccount) {
        poAccountId = user.poAccount.id;
      } else if (parsed.poTraderId) {
        const created = await prisma.pocketOptionAccount.create({
          data: {
            userId: user.id,
            poTraderId: parsed.poTraderId,
            status: "pending",
            source: "postback",
          },
        });
        poAccountId = created.id;
      }
    }
  }

  // Persist the raw postback regardless of whether we matched a user — admins
  // can attribute later from the unmatched queue.
  const stored = await prisma.postback.create({
    data: {
      poAccountId,
      eventType: parsed.event,
      rawPayload: parsed.raw as object,
      clickId: parsed.clickId,
      poTraderId: parsed.poTraderId,
      amount: parsed.amount ?? undefined,
      currency: parsed.currency,
      receivedAt: parsed.receivedAt,
      signature: parsed.signature,
      dedupeKey: parsed.dedupeKey,
    },
  });

  if (!poAccountId || !userId) {
    return { applied: true, reason: "unmatched", poAccountId: undefined };
  }

  // Apply event-specific updates.
  const updates: Record<string, unknown> = { lastPostbackAt: parsed.receivedAt };

  switch (parsed.event) {
    case "registration":
      updates.registeredAt = parsed.receivedAt;
      updates.status = "pending";
      break;
    case "email_confirm":
      updates.emailConfirmedAt = parsed.receivedAt;
      break;
    case "ftd":
      updates.ftdAt = parsed.receivedAt;
      updates.ftdAmount = parsed.amount ?? 0;
      updates.totalDeposit = { increment: parsed.amount ?? 0 };
      updates.status = "verified";
      break;
    case "redeposit":
      updates.totalDeposit = { increment: parsed.amount ?? 0 };
      updates.status = "verified";
      break;
    case "commission":
      updates.totalRevShare = { increment: parsed.amount ?? 0 };
      break;
  }

  await prisma.pocketOptionAccount.update({ where: { id: poAccountId }, data: updates });

  // Mirror deposit events to Deposit table.
  if ((parsed.event === "ftd" || parsed.event === "redeposit") && parsed.amount && userId) {
    await prisma.deposit.create({
      data: {
        userId,
        amount: parsed.amount,
        status: "confirmed",
        postbackId: stored.id,
        isFirst: parsed.event === "ftd",
        confirmedAt: parsed.receivedAt,
      },
    });
  }

  const newTier = await recomputeUserTier(userId);
  return { applied: true, poAccountId, userId, newTier };
}

/**
 * Build the user-facing PocketOption referral URL with our user.id as click_id.
 *
 * The template comes from SiteSettings.po_referral_link_template and may
 * contain `{click_id}` and `{user_id}` placeholders.
 */
export async function buildReferralLink(userId: string): Promise<string> {
  const setting = await prisma.siteSettings.findUnique({
    where: { key: "po_referral_link_template" },
  });
  const template =
    typeof setting?.value === "string"
      ? setting.value
      : "https://po.cash/smart/aff?click_id={click_id}";
  return template.replace(/\{click_id\}/g, userId).replace(/\{user_id\}/g, userId);
}

/**
 * Manually attach an existing PO trader account to the current user.
 *
 * If PocketOption affiliate API credentials are configured, the trader id is
 * verified live: only IDs that belong to OUR partner network are accepted.
 * If creds are absent (e.g. local dev), we fall back to format-only check and
 * mark the link as `pending` until a postback verifies it.
 */
export async function manualAttachPoAccount(
  userId: string,
  poTraderId: string,
): Promise<
  | { ok: true; status: "verified" | "pending"; depositTotal: number }
  | {
      ok: false;
      reason:
        | "invalid_trader_id"
        | "trader_id_taken"
        | "not_in_our_network"
        | "po_unreachable";
    }
> {
  const trimmed = poTraderId.trim();
  if (!isValidTraderIdFormat(trimmed)) {
    return { ok: false, reason: "invalid_trader_id" };
  }

  const conflict = await prisma.pocketOptionAccount.findUnique({
    where: { poTraderId: trimmed },
  });
  if (conflict && conflict.userId !== userId) {
    return { ok: false, reason: "trader_id_taken" };
  }

  const verifyResult = await fetchTraderInfo(trimmed);
  let status: POAccountStatus = "pending";
  let depositTotal = 0;
  let ftdAt: Date | null = null;

  if (verifyResult.ok) {
    status = "verified";
    depositTotal = verifyResult.info.depositTotal;
    if (verifyResult.info.ftdAt) {
      const parsed = new Date(verifyResult.info.ftdAt);
      if (!Number.isNaN(parsed.getTime())) ftdAt = parsed;
    }
  } else if (verifyResult.reason === "not_found") {
    return { ok: false, reason: "not_in_our_network" };
  } else if (verifyResult.reason === "auth_failed" || verifyResult.reason === "network_error") {
    return { ok: false, reason: "po_unreachable" };
  }
  // "not_configured" | "invalid_response" → fall through with pending status.

  await prisma.pocketOptionAccount.upsert({
    where: { userId },
    create: {
      userId,
      poTraderId: trimmed,
      status,
      source: "manual",
      totalDeposit: depositTotal,
      ...(ftdAt ? { ftdAt } : {}),
    },
    update: {
      poTraderId: trimmed,
      source: "manual",
      ...(status === "verified" ? { status, totalDeposit: depositTotal } : {}),
      ...(ftdAt ? { ftdAt } : {}),
    },
  });

  await recomputeUserTier(userId);
  return { ok: true, status, depositTotal };
}

/**
 * Site-settings key + default for the public PocketOption referral URL shown
 * during onboarding. Admin can override in /admin/settings.
 */
export const SITE_SETTING_PO_REFERRAL_URL = "po_referral_url";
export const DEFAULT_PO_REFERRAL_URL =
  "https://u3.shortink.io/smart/ojwEUtTw0lh1p0";

export async function getPoReferralUrl(): Promise<string> {
  const setting = await prisma.siteSettings.findUnique({
    where: { key: SITE_SETTING_PO_REFERRAL_URL },
  });
  if (typeof setting?.value === "string" && setting.value.length > 0) {
    return setting.value;
  }
  return DEFAULT_PO_REFERRAL_URL;
}
