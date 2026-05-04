/**
 * Bot config — single source of truth for what the bot reads from /api/bot/sync.
 *
 * All values are stored in SiteSettings with `bot_*` keys. Defaults below are
 * used when a key is missing.
 */

/**
 * DEPRECATED: Daily-limits-per-tier. Kept for backward compatibility with the
 * bot's older sync payload, but defaults are now unlimited for T1+. The new
 * tier model gates *features* (chart indicators, early access), not signal
 * count. See `TierFeatures` below.
 */
export type DailyLimits = Record<"0" | "1" | "2" | "3" | "4", number>;

/**
 * Per-tier feature flags. Bot reads this to decide rendering/timing for each
 * user's tier. Editable via /admin/bot-config.
 *
 * - chartIndicators: render extended chart with RSI / MACD / volume overlay
 * - earlyAccessSeconds: how many seconds before public release this tier sees
 *   the signal (0 = no early access)
 * - elitePairs: tier may see "elite" / high-confidence pairs
 */
export type TierFeatures = {
  "0": TierFeatureFlags;
  "1": TierFeatureFlags;
  "2": TierFeatureFlags;
  "3": TierFeatureFlags;
  "4": TierFeatureFlags;
};

export type TierFeatureFlags = {
  chartIndicators: boolean;
  earlyAccessSeconds: number;
  elitePairs: boolean;
};

/**
 * Deposit thresholds (USD) at which each tier unlocks. Mirrors the
 * `tier_thresholds` SiteSettings row, included in the bot-config payload so
 * the bot can render correct "you need $X more" hints in onboarding.
 */
export type TierThresholds = {
  "1": number;
  "2": number;
  "3": number;
  "4": number;
};

export type BotAutopost = {
  enabled: boolean;
  intervalMinutes: number;
  /** Pairs to use when generating fallback random signals (if no admin signal pending) */
  pairs: string[];
};

export type BotFaqEntry = {
  question: string;
  answer: string;
};

export type PriceSource = {
  /** Provider key. "twelvedata" / "yahoo" / "binance" / "pocketoption". */
  provider: "twelvedata" | "yahoo" | "binance" | "pocketoption" | "off";
  /** API endpoint base or empty to use provider default. */
  endpoint?: string;
  /** Optional API key (kept in DB for now; rotate via admin UI). */
  apiKey?: string;
};

export const DEFAULT_BOT_WELCOME =
  "Привет, {first_name}! Это Signal Trade GPT.\n\n" +
  "Твой текущий тир: T{tier}.\n\n" +
  "Команды:\n" +
  "/signals — последние сигналы\n" +
  "/stats — твоя статистика\n" +
  "/link — привязать PocketOption\n" +
  "/help — частые вопросы";

export const DEFAULT_BOT_SIGNAL_TEMPLATE =
  "🎯 НОВЫЙ СИГНАЛ\n\n" +
  "Пара: {pair}\n" +
  "Направление: {direction_emoji} {direction_word}\n" +
  "Экспирация: {expiration}\n" +
  "Уверенность: {confidence}%\n" +
  "{entry_line}" +
  "{analysis_line}";

export const DEFAULT_BOT_DISCLAIMER =
  "Сигналы предоставляются в информационных целях. Торговля бинарными опционами " +
  "сопряжена с высоким риском. Прошлые результаты не гарантируют будущей доходности.";

export const DEFAULT_DAILY_LIMITS: DailyLimits = {
  "0": 2,
  "1": 9999,
  "2": 9999,
  "3": 9999,
  "4": 9999,
};

export const DEFAULT_TIER_FEATURES: TierFeatures = {
  "0": { chartIndicators: false, earlyAccessSeconds: 0, elitePairs: false },
  "1": { chartIndicators: false, earlyAccessSeconds: 0, elitePairs: false },
  "2": { chartIndicators: true, earlyAccessSeconds: 0, elitePairs: false },
  "3": { chartIndicators: true, earlyAccessSeconds: 60, elitePairs: false },
  "4": { chartIndicators: true, earlyAccessSeconds: 60, elitePairs: true },
};

export const DEFAULT_BOT_TIER_THRESHOLDS: TierThresholds = {
  "1": 100,
  "2": 1000,
  "3": 5000,
  "4": 10000,
};

export const DEFAULT_AUTOPOST: BotAutopost = {
  enabled: false,
  intervalMinutes: 30,
  pairs: ["EUR/USD", "GBP/USD", "USD/JPY"],
};

export const DEFAULT_PRICE_SOURCE: PriceSource = {
  provider: "off",
  endpoint: "",
  apiKey: "",
};

export const DEFAULT_FAQ: BotFaqEntry[] = [
  {
    question: "Как открывается доступ к сигналам?",
    answer:
      "Доступ привязан к депозиту на PocketOption. Чем больше депозит — тем выше тир и больше перков.",
  },
  {
    question: "Как привязать PocketOption?",
    answer: "Открой /link в боте или раздел «Кабинет → PocketOption» на сайте.",
  },
];

export const SETTING_KEYS = {
  welcome: "bot_welcome_message",
  signalTemplate: "bot_signal_template",
  disclaimer: "bot_disclaimer",
  dailyLimits: "bot_daily_limits",
  tierFeatures: "bot_tier_features",
  tierThresholds: "bot_tier_thresholds",
  autopost: "bot_autopost",
  faq: "bot_faq",
  priceSource: "bot_price_source",
} as const;

export type BotConfig = {
  welcome: string;
  signalTemplate: string;
  disclaimer: string;
  dailyLimits: DailyLimits;
  tierFeatures: TierFeatures;
  tierThresholds: TierThresholds;
  autopost: BotAutopost;
  faq: BotFaqEntry[];
  priceSource: PriceSource;
};

function asString(v: unknown, fallback: string): string {
  return typeof v === "string" ? v : fallback;
}

function asDailyLimits(v: unknown): DailyLimits {
  if (!v || typeof v !== "object") return DEFAULT_DAILY_LIMITS;
  const obj = v as Record<string, unknown>;
  const out: DailyLimits = { ...DEFAULT_DAILY_LIMITS };
  for (const k of ["0", "1", "2", "3", "4"] as const) {
    const n = Number(obj[k]);
    if (Number.isFinite(n) && n >= 0) out[k] = Math.floor(n);
  }
  return out;
}

function asTierFeatures(v: unknown): TierFeatures {
  if (!v || typeof v !== "object") return DEFAULT_TIER_FEATURES;
  const obj = v as Record<string, unknown>;
  const out: TierFeatures = {
    ...DEFAULT_TIER_FEATURES,
    "0": { ...DEFAULT_TIER_FEATURES["0"] },
    "1": { ...DEFAULT_TIER_FEATURES["1"] },
    "2": { ...DEFAULT_TIER_FEATURES["2"] },
    "3": { ...DEFAULT_TIER_FEATURES["3"] },
    "4": { ...DEFAULT_TIER_FEATURES["4"] },
  };
  for (const k of ["0", "1", "2", "3", "4"] as const) {
    const tier = obj[k];
    if (!tier || typeof tier !== "object") continue;
    const t = tier as Record<string, unknown>;
    if (typeof t["chartIndicators"] === "boolean") {
      out[k].chartIndicators = t["chartIndicators"];
    }
    if (typeof t["earlyAccessSeconds"] === "number" && t["earlyAccessSeconds"] >= 0) {
      out[k].earlyAccessSeconds = Math.floor(t["earlyAccessSeconds"]);
    }
    if (typeof t["elitePairs"] === "boolean") {
      out[k].elitePairs = t["elitePairs"];
    }
  }
  return out;
}

function asTierThresholds(v: unknown): TierThresholds {
  if (!v || typeof v !== "object") return DEFAULT_BOT_TIER_THRESHOLDS;
  const obj = v as Record<string, unknown>;
  const out: TierThresholds = { ...DEFAULT_BOT_TIER_THRESHOLDS };
  for (const k of ["1", "2", "3", "4"] as const) {
    const n = Number(obj[k]);
    if (Number.isFinite(n) && n >= 0) out[k] = Math.floor(n);
  }
  return out;
}

function asAutopost(v: unknown): BotAutopost {
  if (!v || typeof v !== "object") return DEFAULT_AUTOPOST;
  const obj = v as Record<string, unknown>;
  return {
    enabled: typeof obj["enabled"] === "boolean" ? obj["enabled"] : false,
    intervalMinutes:
      typeof obj["intervalMinutes"] === "number" && obj["intervalMinutes"] > 0
        ? Math.floor(obj["intervalMinutes"])
        : DEFAULT_AUTOPOST.intervalMinutes,
    pairs: Array.isArray(obj["pairs"])
      ? (obj["pairs"] as unknown[]).filter(
          (p): p is string => typeof p === "string",
        )
      : DEFAULT_AUTOPOST.pairs,
  };
}

function asFaq(v: unknown): BotFaqEntry[] {
  if (!Array.isArray(v)) return DEFAULT_FAQ;
  return v
    .map((item): BotFaqEntry | null => {
      if (!item || typeof item !== "object") return null;
      const obj = item as Record<string, unknown>;
      const q = obj["question"];
      const a = obj["answer"];
      if (typeof q !== "string" || typeof a !== "string") return null;
      return { question: q, answer: a };
    })
    .filter((x): x is BotFaqEntry => x !== null);
}

function asPriceSource(v: unknown): PriceSource {
  if (!v || typeof v !== "object") return DEFAULT_PRICE_SOURCE;
  const obj = v as Record<string, unknown>;
  const provider = obj["provider"];
  const validProviders: PriceSource["provider"][] = [
    "twelvedata",
    "yahoo",
    "binance",
    "pocketoption",
    "off",
  ];
  return {
    provider: validProviders.includes(provider as PriceSource["provider"])
      ? (provider as PriceSource["provider"])
      : "off",
    endpoint: typeof obj["endpoint"] === "string" ? obj["endpoint"] : "",
    apiKey: typeof obj["apiKey"] === "string" ? obj["apiKey"] : "",
  };
}

export function parseBotConfig(
  rows: ReadonlyArray<{ key: string; value: unknown }>,
): BotConfig {
  const map = new Map(rows.map((r) => [r.key, r.value]));
  return {
    welcome: asString(map.get(SETTING_KEYS.welcome), DEFAULT_BOT_WELCOME),
    signalTemplate: asString(
      map.get(SETTING_KEYS.signalTemplate),
      DEFAULT_BOT_SIGNAL_TEMPLATE,
    ),
    disclaimer: asString(
      map.get(SETTING_KEYS.disclaimer),
      DEFAULT_BOT_DISCLAIMER,
    ),
    dailyLimits: asDailyLimits(map.get(SETTING_KEYS.dailyLimits)),
    tierFeatures: asTierFeatures(map.get(SETTING_KEYS.tierFeatures)),
    tierThresholds: asTierThresholds(map.get(SETTING_KEYS.tierThresholds)),
    autopost: asAutopost(map.get(SETTING_KEYS.autopost)),
    faq: asFaq(map.get(SETTING_KEYS.faq)),
    priceSource: asPriceSource(map.get(SETTING_KEYS.priceSource)),
  };
}
