/**
 * Client-safe tier constants.
 *
 * Extracted from `@/lib/tier` so that client components (TierBadge, TierHero,
 * etc.) can import labels/access maps without pulling in Prisma (server-only).
 */

export type TierThresholds = {
  1: number;
  2: number;
  3: number;
  4: number;
};

export const DEFAULT_TIER_THRESHOLDS: TierThresholds = {
  1: 20,
  2: 100,
  3: Number.MAX_SAFE_INTEGER,
  4: Number.MAX_SAFE_INTEGER,
};

export type SignalBand = "otc" | "exchange" | "elite";

export const TIER_ACCESS: Record<number, SignalBand[]> = {
  0: ["otc"],
  1: ["otc", "exchange"],
  2: ["otc", "exchange", "elite"],
  3: ["otc", "exchange", "elite"],
  4: ["otc", "exchange", "elite"],
};

/** Human-readable tier labels (Russian UI). */
export const TIER_LABELS: Record<number, string> = {
  0: "Бесплатный",
  1: "Базовый",
  2: "Про",
};

/** Short English tier labels for internal/API use. */
export const TIER_LABELS_EN: Record<number, string> = {
  0: "Free",
  1: "Basic",
  2: "Pro",
};
