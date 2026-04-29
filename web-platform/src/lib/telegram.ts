/**
 * Telegram Login Widget — verification helpers.
 *
 * https://core.telegram.org/widgets/login#checking-authorization
 *
 * Steps:
 *  1. Build data-check string: every field except `hash`, sorted alphabetically,
 *     joined as `key=value\n...`.
 *  2. Compute secret = SHA-256(bot_token) (raw bytes).
 *  3. Compute HMAC-SHA-256(secret, dataCheckString).
 *  4. Compare against `hash` (hex).
 *  5. Reject if `auth_date` older than `MAX_AUTH_AGE_SECONDS`.
 */
import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export type TelegramAuthPayload = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
};

const MAX_AUTH_AGE_SECONDS = 24 * 60 * 60;

export function verifyTelegramPayload(
  payload: Record<string, string | number | null | undefined>,
  botToken: string,
): TelegramAuthPayload | null {
  if (!botToken) return null;
  if (typeof payload.hash !== "string") return null;

  // Build data-check string.
  const entries: Array<[string, string]> = [];
  for (const [k, v] of Object.entries(payload)) {
    if (k === "hash" || v == null) continue;
    entries.push([k, String(v)]);
  }
  entries.sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  const dataCheckString = entries.map(([k, v]) => `${k}=${v}`).join("\n");

  const secret = createHash("sha256").update(botToken).digest();
  const expected = createHmac("sha256", secret).update(dataCheckString).digest("hex");

  if (expected.length !== payload.hash.length) return null;
  try {
    if (!timingSafeEqual(Buffer.from(expected), Buffer.from(payload.hash))) return null;
  } catch {
    return null;
  }

  const authDate = Number(payload.auth_date);
  if (!Number.isFinite(authDate)) return null;
  const ageSec = Math.floor(Date.now() / 1000) - authDate;
  if (ageSec > MAX_AUTH_AGE_SECONDS) return null;

  return {
    id: Number(payload.id),
    first_name: payload.first_name ? String(payload.first_name) : undefined,
    last_name: payload.last_name ? String(payload.last_name) : undefined,
    username: payload.username ? String(payload.username) : undefined,
    photo_url: payload.photo_url ? String(payload.photo_url) : undefined,
    auth_date: authDate,
    hash: payload.hash,
  };
}
