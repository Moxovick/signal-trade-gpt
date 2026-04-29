/**
 * Tier engine — единственный источник истины о доступе пользователя к перкам.
 *
 * Tier рассчитывается из суммы депозита на PocketOption + факта, что аккаунт
 * привязан и верифицирован. Пороги хранятся в SiteSettings (key="tier_thresholds")
 * и редактируются в админке без релиза.
 */
/**
 * Duck-typed Decimal: anything with `toNumber()` works (covers Prisma.Decimal,
 * decimal.js, and our own wrappers in tests).
 */
interface DecimalLike {
  toNumber(): number;
}

export type TierThresholds = {
  /** Депозит, при котором открывается T1, T2, T3, T4 (USD). */
  1: number;
  2: number;
  3: number;
  4: number;
};

export const DEFAULT_TIER_THRESHOLDS: TierThresholds = {
  1: 100,
  2: 500,
  3: 2000,
  4: 10000,
};

export const SITE_SETTING_TIER_THRESHOLDS = "tier_thresholds";

type DepositLike = DecimalLike | number | string;

function toNumber(value: DepositLike): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  return value.toNumber();
}

/**
 * Compute tier 0..4 for a user.
 *
 * - 0 — PocketOption account not yet attached/verified.
 * - 1..4 — by deposit amount.
 *
 * T0 пользователи могут получить ограниченный набор демо-сигналов
 * (см. perk `signals_demo`).
 */
export function computeTier(
  depositTotal: DepositLike,
  hasVerifiedPoAccount: boolean,
  thresholds: TierThresholds = DEFAULT_TIER_THRESHOLDS,
): number {
  if (!hasVerifiedPoAccount) return 0;
  const total = toNumber(depositTotal);
  if (total >= thresholds[4]) return 4;
  if (total >= thresholds[3]) return 3;
  if (total >= thresholds[2]) return 2;
  if (total >= thresholds[1]) return 1;
  return 0;
}

/**
 * Сколько ещё нужно довнести до следующего уровня.
 * Возвращает null, если уже T4 (максимум).
 */
export function distanceToNextTier(
  depositTotal: DepositLike,
  currentTier: number,
  thresholds: TierThresholds = DEFAULT_TIER_THRESHOLDS,
): { nextTier: number; needed: number } | null {
  if (currentTier >= 4) return null;
  const next = (currentTier + 1) as 1 | 2 | 3 | 4;
  const total = toNumber(depositTotal);
  return { nextTier: next, needed: Math.max(0, thresholds[next] - total) };
}

export const TIER_LABELS: Record<number, string> = {
  0: "Демо",
  1: "Starter",
  2: "Active",
  3: "Pro",
  4: "VIP",
};
