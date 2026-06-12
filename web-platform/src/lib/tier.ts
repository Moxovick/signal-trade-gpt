/**
 * Tier engine — единственный источник истины о доступе пользователя к перкам.
 *
 * Модель доступа (3 тира):
 *   T0 (Free)  — PocketOption-аккаунт привязан (любой статус), депозит $0.
 *                3 OTC-сигнала в день, доступ к кабинету и боту.
 *   T1 (Basic) — Привязан + общий депозит ≥ $20.
 *                10 сигналов в день, OTC + биржевые.
 *   T2 (Pro)   — Привязан + общий депозит ≥ $100.
 *                Безлимит сигналов, все типы (OTC + биржа + Elite).
 *
 * Доступ к /dashboard гейтится отдельно (см. `app/dashboard/layout.tsx`):
 * пользователи без привязанного PO-аккаунта попадают на `/onboarding/po-id`.
 *
 * Старшие тиры (T3/T4) на текущем этапе НЕ используются, но поля в
 * `TierThresholds` оставлены для backward-compat: их можно поднять выше
 * MAX_SAFE_INTEGER чтобы они никогда не срабатывали. Если потом понадобится
 * расширить модель — достаточно поменять пороги через `/admin/settings`.
 */

// Re-export client-safe constants so existing server-side imports keep working.
export {
  type TierThresholds,
  DEFAULT_TIER_THRESHOLDS,
  type SignalBand,
  TIER_ACCESS,
  TIER_LABELS,
  TIER_LABELS_EN,
} from "@/lib/tier-constants";

import type { TierThresholds } from "@/lib/tier-constants";
import { DEFAULT_TIER_THRESHOLDS } from "@/lib/tier-constants";

/**
 * Duck-typed Decimal: anything with `toNumber()` works (covers Prisma.Decimal,
 * decimal.js, and our own wrappers in tests).
 */
interface DecimalLike {
  toNumber(): number;
}

export const SITE_SETTING_TIER_THRESHOLDS = "tier_thresholds";

import { prisma } from "@/lib/prisma";

/**
 * Load tier thresholds from SiteSettings (DB), falling back to defaults.
 */
export async function getTierThresholds(): Promise<TierThresholds> {
  const setting = await prisma.siteSettings.findUnique({
    where: { key: SITE_SETTING_TIER_THRESHOLDS },
  });
  if (!setting) return DEFAULT_TIER_THRESHOLDS;
  const v = setting.value as unknown;
  if (typeof v !== "object" || v === null) return DEFAULT_TIER_THRESHOLDS;
  return v as TierThresholds;
}

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
 *   1 — Basic (депо ≥ $20), 2 — Pro (депо ≥ $100).
 *   3..4 — зарезервированы, пороги выставлены недостижимыми.
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

