/**
 * Timing-safe verification of the X-Bot-Secret header used by bot API routes.
 *
 * Uses `crypto.timingSafeEqual` to prevent timing attacks that could leak
 * the secret byte-by-byte through response-time analysis.
 */
import { timingSafeEqual } from "node:crypto";

/**
 * Verify the bot sync secret in constant time.
 * Returns true only if BOT_SYNC_SECRET is configured and the provided
 * value matches exactly.
 */
export function verifyBotSecret(provided: string | null): {
  ok: boolean;
  reason?: "not_configured" | "bad_secret";
} {
  const expected = process.env["BOT_SYNC_SECRET"];
  if (!expected) {
    return { ok: false, reason: "not_configured" };
  }
  if (!provided) {
    return { ok: false, reason: "bad_secret" };
  }
  const a = Buffer.from(expected);
  const b = Buffer.from(provided);
  if (a.length !== b.length) {
    return { ok: false, reason: "bad_secret" };
  }
  try {
    if (!timingSafeEqual(a, b)) {
      return { ok: false, reason: "bad_secret" };
    }
  } catch {
    return { ok: false, reason: "bad_secret" };
  }
  return { ok: true };
}
