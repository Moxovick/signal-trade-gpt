# Signal Trade GPT — Instructions for Claude Code (v2)

## Project Overview

Signal Trade GPT — платформа AI-сигналов для PocketOption.
Монетизация — RevShare через партнёрку PocketOption (доступ открывается
депозитом, не подпиской).

**Source of truth — `docs/PRD-v2.md` и `docs/AGENT-BRIEF-v2.md`. Прочитай их
до того, как что-то менять.**

Состав:
- `bot/` — Telegram-бот (Python + aiogram 3, SQLite).
- `web-platform/` — Next.js 16 + Prisma + Postgres.
- `docs/` — PRD, брифинги.
- `docker-compose.yml` — Postgres + бот.

## Phase 2 status (текущее)

- [x] Подписки удалены из UI/копии.
- [x] Prisma v2 схема: PocketOptionAccount, Postback, BotPerk, User.tier.
- [x] Tier-engine + access-engine.
- [x] PocketOption postback API (HMAC, idempotent).
- [x] Manual ID flow (web + bot /link).
- [x] Telegram Login Widget на /login (NextAuth credentials provider).
- [x] Дизайн-токены (matte gold), AnimatedBackground, CustomCursor, Preloader.
- [x] Лендинг / dashboard / админка переписаны.
- [ ] Real-time графики (Phase G — Chipa API).

## Code conventions

### General
- **Language:** code на английском, UI/копия — русский.
- **Не использовать тяжёлые UI-библиотеки** (Ant Design, MUI и т.п.).
- **Только Lucide-иконки** в продакшен UI; эмодзи допустимы только в
  Telegram-сообщениях бота, где это естественно.
- **Не push'ить .env в репозиторий.** Все секреты — через `.env` (см.
  `.env.example`).
- **Коммиты атомарные**, в English (формат `feat(area): …`, `fix(…): …`).
- **NEVER amend / force-push** без явной просьбы.

### Web (web-platform/)
- Next.js 16 — это **не** тот, что у тебя в обучении. См. AGENTS.md в
  `web-platform/`. Перед изменением API маршрутов читай
  `node_modules/next/dist/docs/`.
- Server Components по умолчанию; `"use client"` только там, где нужны
  hooks / events / animation.
- TypeScript strict: никаких `any`, `as` для типобезопасности, `getattr`
  и подобных хаков.
- Lint + tsc должны быть зелёными перед коммитом:
  - `npm run lint`
  - `npx tsc --noEmit`

### Bot (bot/)
- Python 3.11+, type hints везде.
- aiogram 3, async/await, FSM из `aiogram.fsm.*` для многошаговых команд.
- Линт: `ruff check bot/`.
- Не хардкодить токены — только из `settings` (pydantic-settings).

## PocketOption integration — golden path

1. Юзер логинится через Telegram → у него на сайте есть `referralCode`
   и user.id.
2. Юзер либо переходит по нашей реф-ссылке (с `click_id={user.id}`),
   либо вручную привязывает свой PO ID через `/dashboard` или `/link`
   в боте.
3. PocketOption шлёт постбэки на `/api/po/postback`. Мы:
   - Проверяем HMAC (`POCKETOPTION_POSTBACK_SECRET`).
   - Идемпотентно сохраняем (по `dedupeKey`).
   - Зеркалим в `Deposit` если `event ∈ {ftd, redeposit}`.
   - Пересчитываем `User.tier`.
4. Tier открывает перки (`BotPerk.minTier ≤ User.tier`).

## Tier perks (минимум для Phase 2)

| Tier | Депозит | Лимит/день | Сигналы               |
|-----:|---------|------------|-----------------------|
|   T0 | 0       | 2 (life)   | demo                  |
|   T1 | $100    | 5          | OTC                   |
|   T2 | $500    | 15         | OTC + биржа           |
|   T3 | $2000   | 25         | + аналитика           |
|   T4 | $10000  | ∞          | + ранний доступ 60с   |

Пороги редактируются в `/admin/settings → tier_thresholds`.

## Disclaimer (обязательный во всех каналах)

> Signal Trade GPT не является финансовым советником. Все сигналы
> предоставляются в информационных целях. Торговля бинарными опционами
> сопряжена с высоким риском потери средств. Прошлые результаты не
> гарантируют будущей доходности.

## Do NOT

- Не возвращать $29/$79 / "Premium" / "VIP" подписочную копию.
- Не использовать эмодзи в production-UI веб-платформы (Lucide only).
- Не делать "своего AI" — генерация сигналов остаётся random в MVP.
- Не делать платежи (для Phase 2 не нужно — деньги приходят через PO).
- Не коммитить `bot/.env` или `web-platform/.env`.
- Не модифицировать сгенерированные Prisma-файлы вручную; правь
  `schema.prisma` и пересобирай миграции.
