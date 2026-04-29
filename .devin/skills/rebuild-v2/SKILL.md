# Skill: Signal Trade GPT — Rebuild v2

> Скилл, описывающий полную переработку проекта `signal-trade-gpt-` от модели «подписки» к модели «PocketOption RevShare партнёрка с tier-перками».

## Когда применять

- Любая задача в этом репозитории (рефактор, новая фича, фикс).
- Особенно — когда нужно понять «как тут на самом деле должно быть», а старые `CLAUDE.md` и `docs/PRD.md` v1 описывают модель подписок (которая помечена deprecated).

## Главное за 30 секунд

| Что | Как сейчас | Как должно быть |
|---|---|---|
| Монетизация | Подписки $29 / $79 / Promo | **PocketOption RevShare** (50–80% от прибыли брокера) + sub-affiliate 5% |
| Доступ к боту | По plan (free/premium/vip) | По tier 0..4 = depositTotal на PO ($0 / $100 / $500 / $2000 / $10000) |
| Источник правды о депозите | Ручная загрузка скрина (`Deposit.proofUrl`) | **Postback Pocket Option 2.0** на наш `/api/postback/po` |
| Промо-коды | Триал 7 дней Premium | Удалены из UI, таблицы оставлены deprecated |
| Бот-сигналы | Tier по подписке | Tier по depositTotal через `/api/bot/access-check` |
| Дизайн | Жёлтый flat-dashboard | Жёлтый «премиум matte gold» + canvas-фон + кастомный курсор + preloader |
| Языки UI | Микс ru/uk | **Только русский** |

## Источники истины

В порядке приоритета:

1. **`docs/PRD-v2.md`** — главный документ продукта. Если что-то расходится с v1 — побеждает v2.
2. **`.devin/skills/rebuild-v2/SKILL.md`** (этот файл) — выжимка для агентов.
3. **`docs/AGENT-BRIEF-v2.md`** — пошаговая инструкция, если делаешь рефактор.
4. **`web-platform/AGENTS.md`** — обязательно для Next.js 16 (новые конвенции, читать `node_modules/next/dist/docs/`).
5. **`docs/PRD.md`** v1 — **архив**. Использовать только как контекст «что было».
6. **`CLAUDE.md`** в корне — **частично устарел** (там модель подписок). Игнорировать раздел о Pricing.

## Архитектура (v2)

```
Lead → Web platform (Next.js 16) ──┐
                                    ├─ Postgres (Prisma 7)
Lead → Telegram bot (aiogram 3) ───┘
                                    ↑ /api/bot/access-check
PocketOption ──postback──▶ /api/postback/po
```

Стек: Next.js 16 + React 19 + Tailwind 4 + framer-motion + Prisma 7 + NextAuth 5 (beta) + aiogram 3 + Postgres 16.

## Tier-движок

```ts
// src/lib/tier.ts
export function computeTier(depositTotal: Decimal, hasPoAccount: boolean): number {
  if (!hasPoAccount) return 0;
  if (depositTotal.gte(10000)) return 4;
  if (depositTotal.gte(2000))  return 3;
  if (depositTotal.gte(500))   return 2;
  if (depositTotal.gte(100))   return 1;
  return 0;  // привязан, но без депозита — демо
}
```

**Пороги хранятся в `SiteSettings` (key=`tier_thresholds`, value=`{1:100, 2:500, 3:2000, 4:10000}`)** — админ может менять без релиза.

## Перки (BotPerk)

Атомарные, редактируемые в админке. Базовый сидинг:

| `code` | `minTier` | `config` | Эффект |
|---|---|---|---|
| `signals_demo` | 0 | `{count: 2}` | 2 демо-сигнала за всё время |
| `signals_otc` | 1 | `{daily: 5}` | 5 OTC-сигналов в день |
| `signals_exchange` | 2 | `{daily: 15}` | 15 биржевых в день |
| `signals_elite` | 3 | `{daily: 25, confidence_min: 90}` | Elite сигналы |
| `early_access_60s` | 4 | `{lead_seconds: 60}` | T4 получает на 60с раньше |
| `personal_manager` | 4 | `{}` | Кнопка «связь с менеджером» |
| `referral_bonus_signals` | 1 | `{per_ftd: 5}` | +5 сигналов/день за каждого реферала с FTD |

## PocketOption интеграция

- **Партнёрский план:** RevShare.
- **Postback events 2.0:** `Registration`, `Email Confirmation`, `First Deposit (FTD)`, `Re-Deposit`, `Commission` (RevShare daily).
- **Endpoint:** `POST /api/postback/po?token={PO_POSTBACK_TOKEN}` (защита: токен в URL + IP-allowlist `PO_POSTBACK_IPS`).
- **Параметры:** `click_id` (= наш `User.id`), `trader_id`, `amount`, `currency`, `event_type`.
- **Sub-affiliate (5%):** включён. Если `click_id` пустой, но `trader_id` нашли — это sub-affiliate уровень, отмечаем в `Postback.metadata`.

## Регистрация

**Только Telegram OAuth** (`@telegram-auth/server` или собственная реализация по [doc'у Telegram Login Widget](https://core.telegram.org/widgets/login)). Email/password убираем.

## Дизайн-токены (matte gold)

```css
--brand-gold:      #d4a017;  /* primary, тёплый matte */
--brand-gold-soft: #e6b840;
--brand-gold-deep: #8a6500;
--brand-cream:     #f5e8c0;

--bg-0: #08060a;
--bg-1: #100c10;
--bg-2: #181218;
--bg-3: #221820;

--t-1: #f5ecd9;
--t-2: #b6a586;
--t-3: #6e604c;
```

Шрифты: **Bebas Neue** 800 (заголовки, letter-spacing 0.04em), **Manrope** 400/500/700 (текст), **JetBrains Mono** 500 (числа/тикер).

## Правила кода

- **Server Components by default**. `"use client"` только когда нужен hook/animation/event.
- **Никаких эмодзи в UI** (кнопки/nav/иконки). Только Lucide React. Эмодзи — только в текстах сигналов в Telegram-боте.
- **Никаких `any`**. Если не понимаешь тип — открой Prisma generated types.
- **Server-only utilities** — в `src/lib/server/` с `import "server-only"`.
- **Bot:** type hints везде, ruff line-length 100, `pathlib.Path`, `pydantic-settings` для конфига.
- Commits: атомарные, conventional (`feat:`, `fix:`, `chore:`, `refactor:`).

## Команды

```bash
# Web
cd web-platform
npm install
npx prisma migrate dev          # локальная миграция
npx prisma generate
npm run dev
npm run lint
npm run build

# Bot
cd bot
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
ruff check .
python main.py

# Docker (целевой деплой)
docker-compose up -d
```

## Чего НЕ делать

- Не делать платежи (Stripe / крипту / карты).
- Не показывать цены $29 / $79.
- Не использовать UI-библиотеки (Ant Design / Chakra / MUI). Только Tailwind + Radix (уже стоит).
- Не использовать `useEffect` для fetch — это Next.js 16, есть Server Components / Server Actions.
- Не пушить в `main`/`master` напрямую — только через PR.
- Не коммитить `.env` файлы (уже в `.gitignore`).

## Открытые решения (зафиксированы)

| Вопрос | Решение |
|---|---|
| Партнёрский план | RevShare |
| Пороги tier | $100 / $500 / $2000 / $10000 (редактируемо в админке) |
| Sub-affiliate 5% | Включён, в админке |
| Регистрация | Telegram OAuth |
| Язык UI | Только русский |
| Real-time графики через PO API | Делаем (Phase G) |
| T0 (привязан, $0) | 2 демо-сигнала за всё время |
| Цвет акцента | Matte gold `#d4a017` (не чистый `#f5c518`) |
