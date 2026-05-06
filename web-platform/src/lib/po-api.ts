/**
 * PocketOption Affiliate API client (web-platform side).
 *
 * Mirrors `bot/services/po_api.py`. Direct GET to:
 *   https://affiliate.pocketoption.com/api/user-info/{user_id}/{partner_id}/{hash}
 * where hash = md5("{user_id}:{partner_id}:{api_token}").
 *
 * Returns trader info (deposit, FTD timestamp) or null if the trader does not
 * belong to our partner / does not exist / network error.
 *
 * Configured via env:
 *   POCKETOPTION_API_TOKEN  — secret API token
 *   POCKETOPTION_PARTNER_ID — partner numeric id
 */
import { createHash } from "node:crypto";

const API_BASE = "https://affiliate.pocketoption.com/api/user-info";
const REQUEST_TIMEOUT_MS = 8_000;

export type TraderInfo = {
  userId: string;
  depositTotal: number;
  ftdAt: string | null;
  raw: Record<string, unknown>;
};

function md5(input: string): string {
  return createHash("md5").update(input).digest("hex");
}

function credentials(): { partnerId: string; token: string } | null {
  const token = (process.env["POCKETOPTION_API_TOKEN"] ?? "").trim();
  const partnerId = (process.env["POCKETOPTION_PARTNER_ID"] ?? "").trim();
  if (!token || !partnerId) return null;
  return { partnerId, token };
}

export type PoVerifyOutcome =
  | { ok: true; info: TraderInfo }
  | { ok: false; reason: "not_configured" | "not_found" | "auth_failed" | "network_error" | "invalid_response" };

/**
 * Hit the PO affiliate API. Caller decides what "not_found" means
 * (typically: the trader didn't sign up via our referral or doesn't exist).
 */
export async function fetchTraderInfo(userId: string): Promise<PoVerifyOutcome> {
  const creds = credentials();
  if (!creds) return { ok: false, reason: "not_configured" };

  const { partnerId, token } = creds;
  const hash = md5(`${userId}:${partnerId}:${token}`);
  const url = `${API_BASE}/${userId}/${partnerId}/${hash}`;

  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), REQUEST_TIMEOUT_MS);

  let resp: Response;
  try {
    resp = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: ac.signal,
      cache: "no-store",
    });
  } catch (err) {
    console.warn("[po-api] network error for", userId, err);
    return { ok: false, reason: "network_error" };
  } finally {
    clearTimeout(timer);
  }

  if (resp.status === 404) {
    return { ok: false, reason: "not_found" };
  }
  if (resp.status === 401 || resp.status === 403) {
    console.error(
      "[po-api] auth/permission denied (HTTP %d). Check POCKETOPTION_API_TOKEN and POCKETOPTION_PARTNER_ID.",
      resp.status,
    );
    return { ok: false, reason: "auth_failed" };
  }
  if (resp.status >= 400) {
    return { ok: false, reason: "invalid_response" };
  }

  let data: unknown;
  try {
    data = await resp.json();
  } catch {
    return { ok: false, reason: "invalid_response" };
  }

  // Accept several common shapes — PO docs are sparse.
  let payload: Record<string, unknown> = {};
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    if (obj["data"] && typeof obj["data"] === "object") {
      payload = obj["data"] as Record<string, unknown>;
    } else {
      payload = obj;
    }
  }

  if (payload["error"] === true) {
    return { ok: false, reason: "not_found" };
  }

  const depositRaw =
    payload["totalDeposit"] ??
    payload["deposit"] ??
    payload["total_deposit"] ??
    payload["deposit_amount"] ??
    0;
  const depositTotal = typeof depositRaw === "number" ? depositRaw : Number(depositRaw) || 0;

  const ftdRaw =
    payload["ftdAt"] ?? payload["ftd_at"] ?? payload["firstDeposit"] ?? payload["first_deposit_at"];
  const ftdAt = ftdRaw ? String(ftdRaw) : null;

  return {
    ok: true,
    info: {
      userId: String(userId),
      depositTotal,
      ftdAt,
      raw: payload,
    },
  };
}

/**
 * Format-only validation (does NOT hit the API).
 * PocketOption trader IDs are numeric, typically 7-11 digits.
 */
export function isValidTraderIdFormat(traderId: string): boolean {
  return /^\d{6,12}$/.test(traderId.trim());
}
