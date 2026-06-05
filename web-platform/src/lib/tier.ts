/**
 * Tier engine — единственный источник истины о доступе пользователя к перкам.
 *
 * Модель доступа (2 тира):
 *   T0 — PocketOption-аккаунт привязан (любой статус), любой депозит.
 *        Базовый доступ к кабинету и сигналам (с мягким дневным лимитом).
 *   T1 — Привязан + общий депозит ≥ `tier_thresholds.1` (по умолчанию $20).
 *        Полный доступ: безлимит, все типы сигналов.
 *
 * Доступ к /dashboard гейтится отдельно (см. `app/dashboard/layout.tsx`):
 * пользователи без привязанного PO-аккаунта попадают на `/onboarding/po-id`.
 *
 * Старшие тиры (T2/T3/T4) на текущем этапе НЕ используются, но поля в
 * `TierThresholds` оставлены для backward-compat: их можно поднять выше
 * MAX_SAFE_INTEGER чтобы они никогда не срабатывали. Если потом понадобится
 * расширить модель — достаточно поменять пороги через `/admin/settings`.
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

/**
 * Effective deposit thresholds for each tier (USD).
 *
 * Two-tier model: T1 at $20, остальные пороги выставлены недостижимыми, чтобы
 * никогда не сработать (пока бизнес не решит вернуть 5-уровневую модель).
 */
export const DEFAULT_TIER_THRESHOLDS: TierThresholds = {
  1: 20,
  2: Number.MAX_SAFE_INTEGER,
  3: Number.MAX_SAFE_INTEGER,
  4: Number.MAX_SAFE_INTEGER,
};

export const SITE_SETTING_TIER_THRESHOLDS = "tier_thresholds";

type DepositLike = DecimalLike | number | string;

function toNumber(value: DepositLike): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  return value.toNumber();
}

/**
 * Compute the user's tier.
 *
 * @param depositTotal     Сумма депозитов на PO (USD).
 * @param hasPoAccount     Привязан ли PO-аккаунт (любой статус).
 *                         Без привязки пользователь не должен попадать в
 *                         /dashboard вообще (см. dashboard/layout.tsx), но
 *                         для устойчивости движка считаем такого юзера T0.
 * @param thresholds       Пороги (берутся из `SiteSettings.tier_thresholds`).
 *
 * Возврат:
 *   0 — нет PO-аккаунта ИЛИ депо < tier_thresholds[1].
 *   1..4 — по сумме депо; в текущей 2-тирной модели реально достижим только T1.
 */
export function computeTier(
  depositTotal: DepositLike,
  hasPoAccount: boolean,
  thresholds: TierThresholds = DEFAULT_TIER_THRESHOLDS,
): number {
  if (!hasPoAccount) return 0;
  const total = toNumber(depositTotal);
  if (total >= thresholds[4]) return 4;
  if (total >= thresholds[3]) return 3;
  if (total >= thresholds[2]) return 2;
  if (total >= thresholds[1]) return 1;
  return 0;
}

/**
 * Сколько ещё нужно довнести до следующего уровня.
 * Возвращает null, если выше уже некуда (тир ≥ максимальный достижимый).
 */
export function distanceToNextTier(
  depositTotal: DepositLike,
  currentTier: number,
  thresholds: TierThresholds = DEFAULT_TIER_THRESHOLDS,
): { nextTier: number; needed: number } | null {
  if (currentTier >= 4) return null;
  const next = (currentTier + 1) as 1 | 2 | 3 | 4;
  const cap = thresholds[next];
  // Скрываем тиры, у которых порог выставлен недостижимым.
  if (cap >= Number.MAX_SAFE_INTEGER) return null;
  const total = toNumber(depositTotal);
  return { nextTier: next, needed: Math.max(0, cap - total) };
}

/**
 * Человеко-читаемые названия тиров.
 *
 * В 2-тирной модели всё, что выше T0, — это «Pro». Если позже включим
 * 5-уровневую модель, лейблы можно вернуть к Pro / Pro+ / VIP и т.п.
 */
/**
 * Signal bands accessible at each tier (2-tier model).
 *
 * T0 = OTC only; T1+ = all bands. Higher tiers mirror T1 for forward-compat.
 */
export type SignalBand = "otc" | "exchange" | "elite";

export const TIER_ACCESS: Record<number, SignalBand[]> = {
  0: ["otc"],
  1: ["otc", "exchange", "elite"],
  2: ["otc", "exchange", "elite"],
  3: ["otc", "exchange", "elite"],
  4: ["otc", "exchange", "elite"],
};

export const TIER_LABELS: Record<number, string> = {
  0: "Обычный",
  1: "Про",
  2: "Про",
  3: "Про",
  4: "Про",
};
