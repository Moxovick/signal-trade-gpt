/**
 * PocketOption integration config — single read path for the secret/token
 * values that drive postbacks and the Affiliate API.
 *
 * Source-of-truth ordering:
 *   1. `SiteSettings` (DB) — admin can edit these via /admin/settings/po-api
 *      and /admin/postbacks/setup. This is the preferred path so non-technical
 *      operators don't have to redeploy to rotate a secret.
 *   2. Process env — fallback for local dev, CI, and "first boot" before the
 *      admin has populated the DB.
 *
 * All getters return Promises because they hit Prisma; results are
 * intentionally NOT cached so admins see updates immediately.
 */
import { prisma } from "@/lib/prisma";

export const SITE_SETTING_PO_API_TOKEN = "po_api_token";
export const SITE_SETTING_PO_PARTNER_ID = "po_partner_id";
export const SITE_SETTING_PO_POSTBACK_SECRET = "po_postback_secret";

async function readString(key: string): Promise<string> {
  const row = await prisma.siteSettings.findUnique({ where: { key } });
  if (!row) return "";
  // SiteSettings.value is Json. We accept either a plain string or
  // {value: string} for forward compatibility with future label/desc fields.
  if (typeof row.value === "string") return row.value.trim();
  if (row.value && typeof row.value === "object" && !Array.isArray(row.value)) {
    const v = (row.value as Record<string, unknown>)["value"];
    if (typeof v === "string") return v.trim();
  }
  return "";
}

/**
 * Read the PocketOption Affiliate API token.
 * SiteSettings.po_api_token (preferred) → env POCKETOPTION_API_TOKEN.
 */
export async function getPoApiToken(): Promise<string> {
  const fromDb = await readString(SITE_SETTING_PO_API_TOKEN);
  if (fromDb) return fromDb;
  return (process.env["POCKETOPTION_API_TOKEN"] ?? "").trim();
}

/**
 * Read the PocketOption Affiliate partner ID.
 * SiteSettings.po_partner_id (preferred) → env POCKETOPTION_PARTNER_ID.
 */
export async function getPoPartnerId(): Promise<string> {
  const fromDb = await readString(SITE_SETTING_PO_PARTNER_ID);
  if (fromDb) return fromDb;
  return (process.env["POCKETOPTION_PARTNER_ID"] ?? "").trim();
}

/**
 * Read the PocketOption postback secret used to authenticate incoming
 * `/api/po/postback?...&secret=...` requests.
 * SiteSettings.po_postback_secret (preferred) → env POCKETOPTION_POSTBACK_SECRET.
 *
 * Returns "" when neither is configured. The route treats "" as
 * "fail-open in dev / reject in production".
 */
export async function getPostbackSecret(): Promise<string> {
  const fromDb = await readString(SITE_SETTING_PO_POSTBACK_SECRET);
  if (fromDb) return fromDb;
  return (process.env["POCKETOPTION_POSTBACK_SECRET"] ?? "").trim();
}

/**
 * Bundle of all three values — used by admin pages to render the current
 * "effective" state and indicate whether it came from DB or env.
 */
export type PoConfigSnapshot = {
  apiToken: string;
  partnerId: string;
  postbackSecret: string;
  /** Per-field provenance, useful for the admin UI to render badges. */
  source: {
    apiToken: "db" | "env" | "unset";
    partnerId: "db" | "env" | "unset";
    postbackSecret: "db" | "env" | "unset";
  };
};

async function probe(key: string, envName: string): Promise<{
  value: string;
  source: "db" | "env" | "unset";
}> {
  const db = await readString(key);
  if (db) return { value: db, source: "db" };
  const env = (process.env[envName] ?? "").trim();
  if (env) return { value: env, source: "env" };
  return { value: "", source: "unset" };
}

export async function getPoConfigSnapshot(): Promise<PoConfigSnapshot> {
  const [tok, partner, secret] = await Promise.all([
    probe(SITE_SETTING_PO_API_TOKEN, "POCKETOPTION_API_TOKEN"),
    probe(SITE_SETTING_PO_PARTNER_ID, "POCKETOPTION_PARTNER_ID"),
    probe(SITE_SETTING_PO_POSTBACK_SECRET, "POCKETOPTION_POSTBACK_SECRET"),
  ]);
  return {
    apiToken: tok.value,
    partnerId: partner.value,
    postbackSecret: secret.value,
    source: {
      apiToken: tok.source,
      partnerId: partner.source,
      postbackSecret: secret.source,
    },
  };
}
