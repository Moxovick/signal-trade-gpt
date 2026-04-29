# Signal Trade GPT — v2

Платформа AI-сигналов для PocketOption. Монетизация — RevShare через
партнёрку PocketOption (доступ открывается депозитом, не подпиской).

## Структура

```
signal-trade-gpt/
├── docs/
│   ├── PRD-v2.md              # PRD текущей итерации
│   └── AGENT-BRIEF-v2.md      # Брифинг агента-исполнителя
├── bot/                        # Telegram-бот (Python + aiogram 3)
│   ├── handlers/
│   │   ├── start.py           # /start, /help
│   │   ├── stats.py           # /stats, /tier, /ref
│   │   ├── signals.py         # /signal (T0 demo cap)
│   │   └── link.py            # /link  — FSM для привязки PO Trader ID
│   ├── services/
│   ├── database/              # SQLite + миграции колонок tier, po_trader_id
│   ├── requirements.txt
│   └── .env.example
├── web-platform/              # Next.js 16 (App Router)
│   ├── prisma/
│   │   ├── schema.prisma      # User, PocketOptionAccount, Postback, BotPerk, …
│   │   └── seed.ts            # 7 BotPerk + редактируемые SiteSettings
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx       # Лендинг (5 tier-ов, FAQ, CTA в Telegram)
│   │   │   ├── dashboard/     # Личный кабинет
│   │   │   ├── admin/         # Админка (po-accounts, postbacks, perks, settings)
│   │   │   ├── login/         # Telegram Login Widget + email fallback
│   │   │   └── api/
│   │   │       ├── po/postback/   # S2S postback от PocketOption
│   │   │       ├── po/submit-id/  # ручная привязка PO trader id
│   │   │       ├── po/ref-link/   # JSON URL
│   │   │       └── admin/settings/# bulk-upsert SiteSettings
│   │   ├── components/
│   │   │   ├── effects/       # AnimatedBackground, CustomCursor, Preloader
│   │   │   ├── ui/            # Button, Card, Stat, TierBadge, Logo, …
│   │   │   └── auth/          # TelegramLoginButton
│   │   └── lib/
│   │       ├── tier.ts        # tier-engine (computeTier, distanceToNextTier)
│   │       ├── access.ts      # access-engine (T0 demo cap, T1..T4 daily limits)
│   │       ├── pocketoption.ts# parse + HMAC verify + applyPostback (idempotent)
│   │       ├── telegram.ts    # Telegram Login HMAC verification
│   │       └── auth.ts        # NextAuth (Telegram + legacy credentials)
│   └── .env.example
├── docker-compose.yml
└── README.md (этот файл)
```

## Quick start

### 1. Postgres

```bash
docker compose up -d db
```

### 2. Web-платформа

```bash
cd web-platform
cp .env.example .env
# AUTH_SECRET — выпиши `openssl rand -base64 32`
# TELEGRAM_LOGIN_BOT_TOKEN, NEXT_PUBLIC_TELEGRAM_LOGIN_BOT — твой бот для Login Widget
# POCKETOPTION_POSTBACK_SECRET — секрет, общий с PocketOption Partner

npm install
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

### 3. Бот

```bash
cd bot
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# BOT_TOKEN — токен из @BotFather (не из репозитория!).
# CHANNEL_ID — id канала, куда бот шлёт сигналы.
python main.py
```

Через `@BotFather`:

* `/setdomain` → твой домен (для Telegram Login Widget).
* `/setjoingroups`, `/setprivacy` — по необходимости.

## PocketOption Partner

В кабинете PocketOption Partner:

1. Создай токен и подвяжи его в `POCKETOPTION_POSTBACK_SECRET`.
2. URL для постбэков: `https://<your-host>/api/po/postback`.
3. В шаблон реф-ссылки добавь плейсхолдер `{click_id}` —
   именно он будет user.id из нашей платформы.

Шаблон редактируется в админке: `/admin/settings → po_referral_link_template`.

## Модель доступа (tier)

| Tier | Депозит на PO | Лимит сигналов / день  | Перки                                   |
|-----:|---------------|------------------------|-----------------------------------------|
|  T0  | $0 / нет PO   | 2 demo за всё время    | пример формата                          |
|  T1  | $100          | 5                      | OTC                                     |
|  T2  | $500          | 15                     | OTC + биржа                             |
|  T3  | $2000         | 25                     | + расширенная аналитика                 |
|  T4  | $10000        | безлимит               | + ранний доступ за 60с, элитные пары    |

Пороги редактируются в админке (`/admin/settings → tier_thresholds`).

## Дисклеймер

> Signal Trade GPT не является финансовым советником. Все сигналы
> предоставляются в информационных целях. Торговля бинарными опционами
> сопряжена с высоким риском потери средств. Прошлые результаты не
> гарантируют будущей доходности.
