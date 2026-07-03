/**
 * Telegram Mini App `initData` verification.
 *
 * https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 *
 * Algorithm differs slightly from the Login Widget:
 *   secret = HMAC-SHA-256("WebAppData", botToken)
 *   hash   = HMAC-SHA-256(secret, dataCheckString)
 *
 * `initData` arrives as a URL-encoded query string with `user`, `auth_date`,
 * `hash`, optionally `query_id`, `start_param` etc.
 */
import { createHmac, timingSafeEqual } from "node:crypto";

const MAX_AUTH_AGE_SECONDS = 24 * 60 * 60;

export type TmaUser = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  language_code?: string;
};

export type VerifiedInitData = {
  user: TmaUser;
  authDate: number;
  startParam?: string;
};

export function verifyInitData(initData: string, botToken: string): VerifiedInitData | null {
  if (!initData || !botToken) return null;
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return null;
  params.delete("hash");

  // Build data-check string sorted alphabetically.
  const entries: Array<[string, string]> = [];
  for (const [k, v] of params.entries()) entries.push([k, v]);
  entries.sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  const dataCheckString = entries.map(([k, v]) => `${k}=${v}`).join("\n");

  const secret = createHmac("sha256", "WebAppData").update(botToken).digest();
  const expected = createHmac("sha256", secret).update(dataCheckString).digest("hex");

  if (expected.length !== hash.length) return null;
  try {
    if (!timingSafeEqual(Buffer.from(expected), Buffer.from(hash))) return null;
  } catch {
    return null;
  }

  const authDate = Number(params.get("auth_date") ?? 0);
  if (!Number.isFinite(authDate) || authDate <= 0) return null;
  const ageSec = Math.floor(Date.now() / 1000) - authDate;
  if (ageSec > MAX_AUTH_AGE_SECONDS) return null;

  const userJson = params.get("user");
  if (!userJson) return null;
  let user: TmaUser;
  try {
    user = JSON.parse(userJson) as TmaUser;
  } catch {
    return null;
  }
  if (typeof user.id !== "number") return null;

  return {
    user,
    authDate,
    startParam: params.get("start_param") ?? undefined,
  };
}
