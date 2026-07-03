/**
 * PocketOption integration helpers.
 *
 * Postback flow (Pocket Partners → us):
 *   PO sends a GET request to `/api/po/postback?...` with macro-substituted
 *   query params. Supported macros (per Pocket Partners docs):
 *     event       → registration | email_confirm | ftd | redeposit |
 *                   commission | withdrawal
 *     click_id    → User.id we placed into the ref link
 *     trader_id   → PocketOption trader ID
 *     sumdep      → deposit amount in USD (FTD/redeposit)
 *     commission  → commission amount in USD
 *     wdr_sum     → withdrawal amount in USD
 *     status      → withdrawal status: new | processed | cancelled
 *     site_id, cid, ac, sub_id1..5, country, device_type, os_version,
 *     browser, promo, link_type, date_time — attribution / analytics.
 *
 * The integration is configured via SiteSettings (`po_referral_link_template`,
 * `po_partner_account`) so admins can change the ref link or sub-affiliate
 * percent without a redeploy. The secret used to authenticate incoming
 * postbacks lives in SiteSettings.po_postback_secret (preferred) or env
 * POCKETOPTION_POSTBACK_SECRET (fallback).
 */
import { createHmac, timingSafeEqual } from "node:crypto";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  computeTier,
  getTierThresholds,
  type TierThresholds,
} from "@/lib/tier";
import { fetchTraderInfo, isValidTraderIdFormat } from "@/lib/po-api";
import { getPostbackSecret } from "@/lib/po-config";
import type { POAccountStatus, WithdrawalStatus } from "@/generated/prisma/enums";

/** Canonical event types after alias normalisation. */
export type PostbackEventName =
  | "registration"
  | "email_confirm"
  | "ftd"
  | "redeposit"
  | "commission"
  | "withdrawal";

export type ParsedPostback = {
  event: PostbackEventName;
  clickId: string | null;
  poTraderId: string | null;
  /** Normalised USD amount: sumdep (deposit) / commission / wdr_sum / amount. */
  amount: number | null;
  currency: string | null;
  isFirstDeposit: boolean;
  /** PO doesn't actually sign requests, but kept for backward-compat tests. */
  signature: string | null;
  /** dedupe key: HMAC of event+trader_id+amount+click_id+minute_bucket. */
  dedupeKey: string;
  receivedAt: Date;
  /** Original full query map, persisted to Postback.rawPayload. */
  raw: Record<string, string>;
  // Attribution / analytics fields.
  siteId: string | null;
  campaignId: string | null;
  campaignName: string | null;
  subId1: string | null;
  subId2: string | null;
  subId3: string | null;
  subId4: string | null;
  subId5: string | null;
  country: string | null;
  deviceType: string | null;
  osVersion: string | null;
  browser: string | null;
  promo: string | null;
  linkType: string | null;
  eventDate: string | null;
  withdrawalStatus: WithdrawalStatus | null;
};

const ALLOWED_EVENTS: readonly PostbackEventName[] = [
  "registration",
  "email_confirm",
  "ftd",
  "redeposit",
  "commission",
  "withdrawal",
];

/** Aliases PocketOption uses for event names. */
const EVENT_ALIASES: Record<string, PostbackEventName> = {
  registration: "registration",
  reg: "registration",
  register: "registration",
  signup: "registration",
  email_confirm: "email_confirm",
  email: "email_confirm",
  email_verified: "email_confirm",
  ftd: "ftd",
  first_deposit: "ftd",
  firstdeposit: "ftd",
  redeposit: "redeposit",
  repeat_deposit: "redeposit",
  repeated_deposit: "redeposit",
  deposit: "redeposit",
  commission: "commission",
  comm: "commission",
  withdrawal: "withdrawal",
  withdraw: "withdrawal",
  wdr: "withdrawal",
};

function normaliseEvent(input: string | null | undefined): PostbackEventName | null {
  const key = String(input ?? "").trim().toLowerCase();
  if (!key) return null;
  const mapped = EVENT_ALIASES[key];
  return mapped && ALLOWED_EVENTS.includes(mapped) ? mapped : null;
}

function nonEmpty(s: string | null | undefined): string | null {
  if (s == null) return null;
  const t = String(s).trim();
  return t.length > 0 ? t : null;
}

function parseAmount(...candidates: Array<string | null | undefined>): number | null {
  for (const raw of candidates) {
    if (raw == null) continue;
    const s = String(raw).trim();
    if (!s) continue;
    // PO sends amounts with `.` decimals. Strip any currency suffix just in case.
    const cleaned = s.replace(/[^0-9.\-]/g, "");
    if (!cleaned) continue;
    const n = Number(cleaned);
    if (!Number.isFinite(n)) continue;
    if (n <= 0 || n > 1_000_000) {
      console.warn(`[parseAmount] anomalous amount rejected: ${n}`);
      return null;
    }
    return n;
  }
  return null;
}

const VALID_WITHDRAWAL_STATUSES: Record<string, WithdrawalStatus> = {
  new: "new",
  pending: "new",
  not_processed: "new",
  unprocessed: "new",
  processed: "processed",
  paid: "processed",
  done: "processed",
  complete: "processed",
  completed: "processed",
  cancelled: "cancelled",
  canceled: "cancelled",
  rejected: "cancelled",
  declined: "cancelled",
};

function parseWithdrawalStatus(raw: string | null | undefined): WithdrawalStatus | null {
  if (!raw) return null;
  return VALID_WITHDRAWAL_STATUSES[String(raw).trim().toLowerCase()] ?? null;
}

function hashDedupe(parts: Array<string | number | null | undefined>): string {
  const input = parts.map((p) => (p == null ? "" : String(p))).join("|");
  const secret = process.env["POCKETOPTION_POSTBACK_SECRET"] ?? "ss-dedupe-fallback";
  return createHmac("sha256", secret).update(input).digest("hex");
}

/** Read either a URLSearchParams or a plain Record<string,string>. */
export type PostbackParamsLike =
  | URLSearchParams
  | Record<string, string | string[] | undefined>;

function readParam(params: PostbackParamsLike, ...keys: string[]): string | null {
  for (const k of keys) {
    if (params instanceof URLSearchParams) {
      const v = params.get(k);
      if (v != null && v !== "") return v;
    } else {
      const v = params[k];
      if (Array.isArray(v)) {
        const first = v.find((x) => x != null && x !== "");
        if (first) return first;
      } else if (v != null && v !== "") {
        return v;
      }
    }
  }
  return null;
}

function paramsToRecord(params: PostbackParamsLike): Record<string, string> {
  const out: Record<string, string> = {};
  if (params instanceof URLSearchParams) {
    for (const [k, v] of params.entries()) out[k] = v;
  } else {
    for (const [k, v] of Object.entries(params)) {
      if (v == null) continue;
      out[k] = Array.isArray(v) ? (v[0] ?? "") : v;
    }
  }
  return out;
}

/**
 * Parse a GET-postback URL into a normalised ParsedPostback shape.
 *
 * Returns null when the event is missing/unknown — caller should respond
 * with 400 in that case so PocketOption logs the misconfig.
 */
export function parsePostbackQuery(params: PostbackParamsLike): ParsedPostback | null {
  const eventRaw = readParam(params, "event", "type");
  const event = normaliseEvent(eventRaw);
  if (!event) return null;

  const clickId = nonEmpty(readParam(params, "click_id", "clickid", "subid", "sub_id"));
  const poTraderId = nonEmpty(readParam(params, "trader_id", "traderid", "user_id", "userid"));

  // PocketOption sends DIFFERENT amount macros depending on event:
  //  - ftd / redeposit → {sumdep}
  //  - commission      → {commission}
  //  - withdrawal      → {wdr_sum}
  // We also accept a generic {amount} for forward compatibility.
  const amount = parseAmount(
    readParam(params, "sumdep"),
    readParam(params, "commission"),
    readParam(params, "wdr_sum", "wdr", "withdrawal_sum"),
    readParam(params, "amount", "sum"),
  );

  const isFirstDeposit =
    event === "ftd" ||
    String(readParam(params, "is_first_deposit") ?? "").toLowerCase() === "true";

  const withdrawalStatus =
    event === "withdrawal" ? parseWithdrawalStatus(readParam(params, "status")) : null;

  const now = new Date();
  const minuteBucket = Math.floor(now.getTime() / 60_000);

  const raw = paramsToRecord(params);
  // Don't persist the URL secret in raw payload.
  delete raw["secret"];
  delete raw["signature"];

  return {
    event,
    clickId,
    poTraderId,
    amount,
    currency: nonEmpty(readParam(params, "currency")),
    isFirstDeposit,
    signature: nonEmpty(readParam(params, "signature")),
    dedupeKey: hashDedupe([
      event,
      poTraderId,
      amount,
      clickId,
      // For withdrawal events, status is part of identity (a wd can move
      // new → processed → ... and each transition is its own postback).
      withdrawalStatus,
      minuteBucket,
    ]),
    receivedAt: now,
    raw,
    siteId: nonEmpty(readParam(params, "site_id", "siteid", "subsource")),
    campaignId: nonEmpty(readParam(params, "cid", "campaign_id")),
    campaignName: nonEmpty(readParam(params, "ac", "campaign", "campaign_name")),
    subId1: nonEmpty(readParam(params, "sub_id1", "subid1")),
    subId2: nonEmpty(readParam(params, "sub_id2", "subid2")),
    subId3: nonEmpty(readParam(params, "sub_id3", "subid3")),
    subId4: nonEmpty(readParam(params, "sub_id4", "subid4")),
    subId5: nonEmpty(readParam(params, "sub_id5", "subid5")),
    country: nonEmpty(readParam(params, "country", "geo")),
    deviceType: nonEmpty(readParam(params, "device_type", "device")),
    osVersion: nonEmpty(readParam(params, "os_version", "os")),
    browser: nonEmpty(readParam(params, "browser")),
    promo: nonEmpty(readParam(params, "promo", "promo_code")),
    linkType: nonEmpty(readParam(params, "link_type", "linktype")),
    eventDate: nonEmpty(readParam(params, "date_time", "datetime")),
    withdrawalStatus,
  };
}

/**
 * Constant-time string compare to authenticate the `?secret=...` URL param
 * against the configured postback secret (SiteSettings preferred, env
 * fallback). Returns:
 *   true  — secret matches OR no secret configured AND not in production
 *           (dev/staging fail-open).
 *   false — secret mismatch OR no secret configured in production.
 */
export async function verifyPostbackSecret(provided: string | null): Promise<boolean> {
  const expected = await getPostbackSecret();
  if (!expected) {
    if (process.env["NODE_ENV"] === "production") {
      console.warn(
        "[postback] po_postback_secret not configured; rejecting requests in production.",
      );
      return false;
    }
    return true;
  }
  if (!provided) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(provided);
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

// getTierThresholds is imported from @/lib/tier

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
  // T0 — любой привязанный PO-аккаунт (verified или pending).
  // T1+ — привязан и totalDeposit прошёл порог.
  // dashboard/layout.tsx уже отрезает юзеров без PO-аккаунта на /onboarding/po-id,
  // так что "нет аккаунта" сюда обычно не доходит, но обрабатываем безопасно.
  const hasAccount = user.poAccount != null;
  const total = user.poAccount?.totalDeposit ?? 0;
  const computed = computeTier(total, hasAccount, thresholds);

  // Admin override acts as a floor — tier never drops below it.
  const tier = Math.max(computed, user.tierOverride ?? 0);

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
  // Dedupe — handled via unique constraint catch below (no TOCTOU race).

  // Locate the PO account.
  let userId: string | null = null;
  let poAccountId: string | null = null;

  if (parsed.poTraderId) {
    const trimmedTraderId = parsed.poTraderId.trim();
    // Primary: exact match on unique index
    let acc = await prisma.pocketOptionAccount.findUnique({
      where: { poTraderId: trimmedTraderId },
    });
    // Fallback: case-insensitive / whitespace-tolerant search
    if (!acc) {
      acc = await prisma.pocketOptionAccount.findFirst({
        where: {
          poTraderId: {
            equals: trimmedTraderId,
            mode: "insensitive",
          },
        },
      });
    }
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
        // Use upsert to avoid TOCTOU race: two concurrent postbacks for the
        // same user could both see poAccount=null and both try to create.
        // Upsert is atomic at the DB level (uses ON CONFLICT).
        const upserted = await prisma.pocketOptionAccount.upsert({
          where: { userId: user.id },
          create: {
            userId: user.id,
            poTraderId: parsed.poTraderId,
            status: "pending",
            source: "postback",
          },
          update: {},
        });
        poAccountId = upserted.id;
      }
    }
  }

  // Persist the raw postback regardless of whether we matched a user — admins
  // can attribute later from the unmatched queue.
  // We rely on the unique constraint on `dedupeKey` to handle races atomically.
  let stored;
  try {
    stored = await prisma.postback.create({
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
        siteId: parsed.siteId,
        campaignId: parsed.campaignId,
        campaignName: parsed.campaignName,
        subId1: parsed.subId1,
        subId2: parsed.subId2,
        subId3: parsed.subId3,
        subId4: parsed.subId4,
        subId5: parsed.subId5,
        country: parsed.country,
        deviceType: parsed.deviceType,
        osVersion: parsed.osVersion,
        browser: parsed.browser,
        promo: parsed.promo,
        linkType: parsed.linkType,
        eventDate: parsed.eventDate,
        withdrawalStatus: parsed.withdrawalStatus,
      },
    });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return { applied: false, reason: "duplicate" };
    }
    throw err;
  }

  if (!poAccountId || !userId) {
    return { applied: true, reason: "unmatched", poAccountId: undefined };
  }

  // Fetch the existing account once so per-event handlers can branch on its
  // current state (e.g. registration shouldn't downgrade an already-verified
  // account back to pending).
  const account = await prisma.pocketOptionAccount.findUnique({
    where: { id: poAccountId },
    select: { status: true, totalDeposit: true },
  });

  // Apply event-specific updates.
  const updates: Record<string, unknown> = { lastPostbackAt: parsed.receivedAt };

  switch (parsed.event) {
    case "registration":
      updates.registeredAt = parsed.receivedAt;
      // Don't downgrade a verified account back to pending. If a deposit
      // already arrived via FTD/redeposit before the registration postback
      // (rare but happens with out-of-order PO postbacks), keep verified.
      if (account?.status !== "verified") {
        updates.status = "pending";
      }
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
    case "withdrawal":
      // Only deduct from totalDeposit when the withdrawal is actually paid out
      // (status=processed). "new" / "cancelled" don't affect deposit balance.
      if (parsed.withdrawalStatus === "processed" && parsed.amount) {
        // Prevent negative totalDeposit underflow
        const currentDeposit = Number(account?.totalDeposit ?? 0);
        const decrementAmount = Math.min(parsed.amount, currentDeposit);
        if (decrementAmount > 0) {
          updates.totalDeposit = { decrement: decrementAmount };
        }
      }
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
      : "https://po-ru4.click/register?utm_campaign=825519&utm_source=affiliate&utm_medium=sr&a=Be8CXM52oc4EOp&al=1769855&ac=signal&cid={click_id}&code=WELCOME50";
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

  await prisma.$transaction(async (tx) => {
    await tx.pocketOptionAccount.upsert({
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

    // Recompute tier within the same transaction.
    const user = await tx.user.findUnique({
      where: { id: userId },
      include: { poAccount: true },
    });
    if (!user) return;

    const thresholds = await getTierThresholds();
    const hasAccount = user.poAccount != null;
    const total = user.poAccount?.totalDeposit ?? 0;
    const tier = computeTier(total, hasAccount, thresholds);

    if (tier !== user.tier) {
      await tx.user.update({ where: { id: userId }, data: { tier } });
    }
  });

  return { ok: true, status, depositTotal };
}

/**
 * Site-settings key + default for the public PocketOption referral URL shown
 * during onboarding. Admin can override in /admin/settings.
 */
export const SITE_SETTING_PO_REFERRAL_URL = "po_referral_url";
export const DEFAULT_PO_REFERRAL_URL =
  "https://po-ru4.click/register?utm_campaign=825519&utm_source=affiliate&utm_medium=sr&a=Be8CXM52oc4EOp&al=1769855&ac=signal&cid=960046&code=WELCOME50";

export async function getPoReferralUrl(): Promise<string> {
  const setting = await prisma.siteSettings.findUnique({
    where: { key: SITE_SETTING_PO_REFERRAL_URL },
  });
  if (typeof setting?.value === "string" && setting.value.length > 0) {
    return setting.value;
  }
  return DEFAULT_PO_REFERRAL_URL;
}
