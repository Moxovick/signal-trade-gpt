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
│   │       ├── tier.ts        # tier-engine (computeTier, 2-тирная модель)
│   │       ├── access.ts      # access-engine (T0: 3 OTC / day, T1+: безлимит)
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

## Модель доступа (2-tier)

| Tier | Депозит на PO   | Лимит сигналов             | Перки                                              |
|-----:|-----------------|----------------------------|----------------------------------------------------|
|  T0  | регистрация PO  | 3 OTC / день (бот: 2 demo) | личный кабинет, OTC-сигналы                        |
|  T1  | от $20          | безлимит                   | OTC + биржа + Elite, индикаторы, ранний доступ     |

- T0 открывается регистрацией на PocketOption по нашей реф-ссылке — депозит
  не требуется. Регистрация на сайте **не** блокируется по сумме депозита:
  Trader ID опционален, его можно дозаполнить позже на `/onboarding/po-id`.
- T1 (Pro) открывается автоматически при первом депозите ≥ $20 на
  привязанном счёте (через postback PO).

Порог T1 редактируется в админке (`/admin/settings → tier_thresholds`).
Поля T2-T4 оставлены в схеме выставленными в `Number.MAX_SAFE_INTEGER` —
возврат к многоуровневой модели делается без миграции кода.

## Дисклеймер

> Signal Trade GPT не является финансовым советником. Все сигналы
> предоставляются в информационных целях. Торговля бинарными опционами
> сопряжена с высоким риском потери средств. Прошлые результаты не
> гарантируют будущей доходности.
