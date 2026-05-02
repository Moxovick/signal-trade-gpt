/**
 * Bot config — single source of truth for what the bot reads from /api/bot/sync.
 *
 * All values are stored in SiteSettings with `bot_*` keys. Defaults below are
 * used when a key is missing.
 */

export type DailyLimits = Record<"0" | "1" | "2" | "3" | "4", number>;

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
  "1": 5,
  "2": 15,
  "3": 25,
  "4": 9999,
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
  autopost: "bot_autopost",
  faq: "bot_faq",
  priceSource: "bot_price_source",
} as const;

export type BotConfig = {
  welcome: string;
  signalTemplate: string;
  disclaimer: string;
  dailyLimits: DailyLimits;
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
    autopost: asAutopost(map.get(SETTING_KEYS.autopost)),
    faq: asFaq(map.get(SETTING_KEYS.faq)),
    priceSource: asPriceSource(map.get(SETTING_KEYS.priceSource)),
  };
}
