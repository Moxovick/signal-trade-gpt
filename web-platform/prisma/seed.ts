/**
 * Seed v2 — базовые перки и настройки сайта для PocketOption RevShare-модели.
 *
 * Запуск:
 *   npx tsx prisma/seed.ts
 *
 * Идемпотентен: повторный запуск не создаёт дубликаты.
 */
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { DEFAULT_TIER_THRESHOLDS, SITE_SETTING_TIER_THRESHOLDS } from "../src/lib/tier";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const PERKS = [
  {
    code: "signals_demo",
    name: "Демо-сигналы",
    description: "Несколько демо-сигналов для пользователей без привязки PocketOption.",
    minTier: 0,
    config: { count: 2 },
  },
  {
    code: "signals_otc",
    name: "OTC-сигналы",
    description: "Внерыночные пары, доступны 24/7. Базовый набор Starter.",
    minTier: 1,
    config: { daily: 5, pairs: ["EUR/USD OTC", "GBP/USD OTC", "USD/JPY OTC", "EUR/GBP OTC"] },
  },
  {
    code: "signals_exchange",
    name: "Биржевые сигналы",
    description: "Сигналы по основным валютным парам в часы работы рынка.",
    minTier: 2,
    config: { daily: 15 },
  },
  {
    code: "signals_elite",
    name: "Elite-сигналы",
    description: "Премиум-сигналы с уверенностью ≥90% и детальной аналитикой.",
    minTier: 3,
    config: { daily: 25, confidence_min: 90 },
  },
  {
    code: "early_access_60s",
    name: "Ранний доступ 60 сек",
    description: "Получение сигналов на 60 секунд раньше публичной рассылки.",
    minTier: 4,
    config: { lead_seconds: 60 },
  },
  {
    code: "personal_manager",
    name: "Персональный менеджер",
    description: "Прямая связь с аналитиком в Telegram-чате 24/7.",
    minTier: 4,
    config: {},
  },
  {
    code: "referral_bonus_signals",
    name: "Реферальный бонус",
    description: "+5 сигналов в день за каждого приглашённого с FTD на PocketOption.",
    minTier: 1,
    config: { per_ftd: 5 },
  },
];

const SETTINGS: Array<{ key: string; value: unknown; label: string }> = [
  {
    key: SITE_SETTING_TIER_THRESHOLDS,
    value: DEFAULT_TIER_THRESHOLDS,
    label: "Пороги депозита (USD) для tier'ов 1..4",
  },
  {
    key: "po_referral_link_template",
    value: "https://po.cash/smart/aff?click_id={click_id}",
    label: "Шаблон реферальной ссылки PocketOption (поддерживает {click_id})",
  },
  {
    key: "po_partner_account",
    value: { plan: "revshare", subAffiliateRate: 5 },
    label: "Параметры партнёрки PocketOption",
  },
  {
    key: "site_disclaimer",
    value:
      "Signal Trade GPT не является финансовым советником. Все сигналы " +
      "предоставляются в информационных целях. Торговля бинарными опционами " +
      "сопряжена с высоким риском потери средств. Прошлые результаты не " +
      "гарантируют будущей доходности.",
    label: "Дисклеймер на сайте и в боте",
  },
];

async function main() {
  console.log("Seeding bot perks…");
  for (const perk of PERKS) {
    await prisma.botPerk.upsert({
      where: { code: perk.code },
      create: perk,
      update: {
        name: perk.name,
        description: perk.description,
        minTier: perk.minTier,
        config: perk.config,
      },
    });
  }

  console.log("Seeding site settings…");
  for (const setting of SETTINGS) {
    await prisma.siteSettings.upsert({
      where: { key: setting.key },
      create: { key: setting.key, value: setting.value as never, label: setting.label },
      update: { value: setting.value as never, label: setting.label },
    });
  }

  console.log("✓ Seed complete.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
