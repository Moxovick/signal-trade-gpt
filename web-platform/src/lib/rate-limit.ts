/**
 * Simple in-memory sliding-window rate limiter.
 *
 * Not distributed — works per-process only. Sufficient for single-instance
 * deployments and Vercel serverless (where each cold start resets state).
 * For multi-instance setups, swap to Redis-backed implementation.
 */

interface WindowEntry {
  timestamps: number[];
}

const windows = new Map<string, WindowEntry>();

/** Periodically prune stale entries to avoid unbounded memory growth. */
const PRUNE_INTERVAL_MS = 60_000;
let lastPrune = Date.now();

function pruneIfNeeded(windowMs: number): void {
  const now = Date.now();
  if (now - lastPrune < PRUNE_INTERVAL_MS) return;
  lastPrune = now;
  const cutoff = now - windowMs;
  for (const [key, entry] of windows) {
    entry.timestamps = entry.timestamps.filter((t) => t > cutoff);
    if (entry.timestamps.length === 0) windows.delete(key);
  }
}

/**
 * Check and record a request against the rate limit.
 *
 * @param key   Unique key (e.g. IP address, user ID, or a composite).
 * @param limit Maximum number of requests in the window.
 * @param windowMs Window duration in milliseconds.
 * @returns `{ ok: true }` if allowed, `{ ok: false, retryAfterMs }` if blocked.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { ok: true } | { ok: false; retryAfterMs: number } {
  pruneIfNeeded(windowMs);

  const now = Date.now();
  const cutoff = now - windowMs;

  let entry = windows.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    windows.set(key, entry);
  }

  // Remove expired timestamps.
  entry.timestamps = entry.timestamps.filter((t) => t > cutoff);

  if (entry.timestamps.length >= limit) {
    const oldest = entry.timestamps[0]!;
    const retryAfterMs = oldest + windowMs - now;
    return { ok: false, retryAfterMs: Math.max(0, retryAfterMs) };
  }

  entry.timestamps.push(now);
  return { ok: true };
}

/**
 * Extract a client IP from common headers for rate-limiting purposes.
 *
 * Security note: This trusts X-Forwarded-For, which is safe on Vercel/reverse-proxy
 * deployments where the platform overwrites the header. If deployed behind a load
 * balancer that does NOT strip/overwrite X-Forwarded-For, clients can spoof their IP
 * and bypass rate limits. Ensure the deployment platform sets this header reliably.
 */
export function clientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}
