# Signal Trade GPT — как всё устроено сейчас

Краткий обзор системы: что есть, как связано, на чём работает.

---

## 1. Архитектура (high-level)

```
┌─────────────────────┐         ┌──────────────────────┐
│  Telegram User      │◄───────►│  Telegram Bot        │
│  (даёт /start, /tier│         │  (Python + aiogram)  │
│   /signals и т.д.)  │         │  bot/                │
└─────────────────────┘         └──────────┬───────────┘
                                           │
                                           │ HTTP (BOT_SYNC_SECRET)
                                           ▼
┌─────────────────────┐         ┌──────────────────────┐
│  Browser User       │◄───────►│  Web Platform        │
│  (лендинг,          │  HTTPS  │  (Next.js 16 + Prisma│
│   dashboard, admin) │         │  web-platform/)      │
└─────────────────────┘         └──────────┬───────────┘
                                           │
                                           ▼
                                ┌──────────────────────┐
                                │  Postgres (Prisma)   │
                                │  — User, Signal,     │
                                │    PocketOptionAcc,  │
                                │    FAQ, Review, Prize│
                                └──────────┬───────────┘
                                           ▲
                                           │ postback (HMAC)
                                           │
                                ┌──────────┴───────────┐
                                │  PocketOption        │
                                │  (внешний партнёр)   │
                                │  + Affiliate API     │
                                └──────────────────────┘
```

**Две независимые БД:**
- **Web → Postgres** (вся бизнес-логика, юзеры, тиры, контент админки)
- **Bot → SQLite** (`bot/data/bot.db`, локальная для бота — telegram_id, депозит, сигналы)

Они **синхронизируются** периодически через защищённый эндпоинт `/api/bot/sync` (см. ниже).

---

## 2. Компоненты

### 2.1 Web Platform (`web-platform/`)

**Стек:**
- **Next.js 16** (App Router, Server Components by default, "use client" только где нужны hooks/анимации)
- **Prisma 5** + **Postgres** (via `@prisma/adapter-pg`, миграции в `prisma/migrations/`)
- **NextAuth v5** (credentials provider — Telegram Login Widget)
- **TailwindCSS** + кастомные CSS-переменные (matte gold `#d4a017`, dark `#08060a`)
- **Lucide-icons** (никаких эмодзи в UI)
- **react-markdown + remark-gfm** для legal-страниц
- **qrcode.react** для QR-кода реф-ссылки

**Главные папки:**
- `src/app/` — все страницы (App Router)
  - `page.tsx` — лендинг (FAQ + reviews + giveaway + legal — всё из БД)
  - `dashboard/` — личный кабинет (tabs: Обзор, Сигналы, Рефералы, Достижения, Розыгрыш, Лидерборд, Профиль)
  - `admin/` — админка (faq, reviews, giveaway, legal, perks, signals, users, ...)
  - `api/` — REST endpoints (см. ниже)
  - `faq/`, `reviews/`, `giveaway/`, `terms/`, `privacy/` — публичные страницы (контент из админки)
- `src/components/` — UI (Card, TierBadge, Stat, Button, Logo + dashboard/TopNav, shared/SiteHeader)
- `src/lib/` — `prisma.ts`, `auth.ts`, `tier.ts`, `access.ts`, `marketdata.ts`, `pocketoption.ts`, `telegram.ts`
- `prisma/schema.prisma` — основной файл схемы БД
- `prisma/seed-content.ts` — сидер для FAQ/Reviews/Prizes/LegalPages
- `create-demo.ts` — создание демо-юзера admin@demo.local (tier 4)

**Ключевые модели в БД:**
- **User** — `id, email, telegramId (BigInt), tier (0-4), referralCode, signalsReceived, ...`
- **PocketOptionAccount** — связь User → PO трейдер; `poTraderId, totalDeposit, ftdAt, status`
- **Postback** — лог всех HMAC-постбэков от PO (idempotent по `dedupeKey`)
- **Deposit** — зеркало депозита из postback
- **Signal** — сгенерированный сигнал; `pair, direction, confidence, tier (otc/exchange/elite), result`
- **Referral** — связь рефералов (referrer ↔ referred)
- **Faq, Review, Prize, LegalPage** — контент админки (CRUD через `/admin/*`)
- **BotPerk** — список перков с `minTier` (отображаются на лендинге и в дашборде)
- **SiteSettings** — JSON-настройки (например `tier_thresholds`)

### 2.2 Bot (`bot/`)

**Стек:**
- **Python 3.11+**, type hints, async/await
- **aiogram 3** — Telegram Bot API
- **SQLite** — `bot/data/bot.db`, простая локальная БД
- **Pillow + matplotlib** — генерация брендированных PNG-картинок на каждый экран
- **httpx** — для запросов к PocketOption Affiliate API и /api/bot/sync
- **pydantic-settings** — конфиг из `.env`

**Главные файлы:**
- `main.py` — точка входа, поднимает aiogram-диспетчер, scheduler-loop, sync-loop
- `config.py` — загрузка `.env` (BOT_TOKEN, PLATFORM_API_URL, BOT_SYNC_SECRET, POCKETOPTION_API_TOKEN, POCKETOPTION_PARTNER_ID, ADMIN_TELEGRAM_IDS, ...)
- `database/db.py` — миграции SQLite (запускаются при старте), CRUD-операции
- `database/models.py` — dataclasses для User, Signal
- `handlers/`:
  - `start.py` — `/start` (создаёт юзера, шлёт brand-card)
  - `menu.py` — главное меню + кнопки (Мой тир, Статы, Рефералы, Достижения, Лидерборд, Настройки, Помощь)
  - `signals.py` — выдача сигналов с учётом tier
  - `link.py` — `/link <po_id>` — привязка PO ID, верификация через Affiliate API
  - `stats.py` — `/stats` — карточка с винрейтом
  - `onboarding.py` — пошаговая привязка PO для новых юзеров
  - `admin.py` — admin-команды (только для ADMIN_TELEGRAM_IDS):
    - `/set_tier <user_id|me> <0-4>` — выдать тир
    - `/test_as <user_id>` — посмотреть бот глазами юзера
    - `/demo_signal [pair] [dir] [conf]` — сгенерить сигнал кастомно
    - `/reset_my_state` — обнулить свои счётчики
    - `/seed_data` — создать 5 фейк-юзеров для leaderboard
    - `/preview <screen>` — превью любого экрана
    - `/broadcast`, `/ban`
- `services/`:
  - `imagegen.py` — генерация PNG-карточек (brand_card, tier_card, signal_chart, stats, ref, leaderboard, achievements, settings, help)
  - `formatter.py` — форматирование текстов с HTML-разметкой
  - `keyboards.py` — InlineKeyboardMarkup билдеры
  - `scheduler.py` — фоновый цикл, отправляет новые сигналы по тиру каждые N минут
  - `tier_sync.py` — фоновый цикл, раз в 60с тянет `/api/bot/sync` с веба, обновляет SQLite
  - `achievements.py` — каталог ачивок и проверка их на юзере
  - `po_api.py` — клиент PocketOption Affiliate API (`affiliate.pocketoption.com/api/user-info/...` с MD5 hash)

---

## 3. Зависимости

### 3.1 Web (`web-platform/package.json` — основные)
```
next                — 16.x (App Router)
react / react-dom   — 19
prisma + @prisma/client + @prisma/adapter-pg
next-auth           — v5 (credentials provider)
react-markdown + remark-gfm
qrcode.react
lucide-react
tailwindcss
```

### 3.2 Bot (`bot/requirements.txt`)
```
aiogram==3.x
pydantic-settings
httpx
Pillow
matplotlib
python-dotenv
```

### 3.3 Внешние сервисы
- **PocketOption Affiliate API** — `affiliate.pocketoption.com/api/user-info/{user_id}/{partner_id}/{hash}` — для верификации PO ID и получения депозита
- **PocketOption Postbacks** — POST на наш `/api/po/postback` при событиях (registration, ftd, redeposit) — реалтайм
- **Telegram Bot API** — для бота
- **Telegram Login Widget** — для логина на сайте
- **Postgres** — пользовательская БД (через docker-compose)

---

## 4. Как работают API

Все эндпоинты в `web-platform/src/app/api/*/route.ts`. Защита — через `auth()` (NextAuth) для пользовательских, через секреты — для машинных.

### 4.1 Машинные (без юзер-сессии)

#### `POST /api/po/postback`
Принимает HMAC-подписанные постбэки от PocketOption.
Шаги:
1. Проверяем HMAC-подпись (`POCKETOPTION_POSTBACK_SECRET` из env)
2. По `dedupeKey` идемпотентно сохраняем в `Postback` (если уже был — игнор)
3. Если событие = `ftd` или `redeposit` — зеркалим в `Deposit`, обновляем `PocketOptionAccount.totalDeposit`
4. Пересчитываем `User.tier` по порогам в `SiteSettings.tier_thresholds`
5. Возвращаем 200 OK

#### `GET /api/bot/sync`
Бот раз в 60с дёргает этот эндпоинт. Возвращает массив `{poTraderId, tier, totalDeposit, telegramId}` для всех PO-аккаунтов. Защита — header `Authorization: Bearer <BOT_SYNC_SECRET>`. Бот мерджит данные в свой SQLite (`UPDATE users SET tier=?, deposit_total=? WHERE telegram_id=?`).

### 4.2 Пользовательские (требуют сессии)

- `GET /api/users/me` — данные залогиненного юзера (для /dashboard/profile)
- `POST /api/po/link` — юзер привязывает свой PO ID вручную; делает запрос к Affiliate API, валидирует, сохраняет в `PocketOptionAccount`
- `GET /api/signals` — лента сигналов с учётом tier-доступа
- `GET /api/faq`, `GET /api/reviews` — публичный контент для лендинга

### 4.3 Админские (требуют `auth().role === "admin"`)

- `GET/POST /api/admin/faq`, `PATCH/DELETE /api/admin/faq/[id]` — CRUD FAQ
- То же для `/api/admin/reviews`, `/api/admin/prizes`, `/api/admin/legal/[slug]`
- `/api/admin/users`, `/api/admin/postbacks`, `/api/admin/perks` — служебные

---

## 5. Как работает бот

### 5.1 Старт
1. `python main.py` загружает конфиг, запускает SQLite-миграции (`init_db()`), стартует aiogram-диспетчер в polling-режиме
2. Параллельно поднимает 2 фоновых корутины:
   - **scheduler.py** — каждые 5–15 минут (рандом) шлёт сигналы юзерам по их тиру
   - **tier_sync.py** — каждые 60с тянет `/api/bot/sync` с веба, обновляет тиры/депозиты

### 5.2 Жизненный цикл юзера в боте
1. Юзер пишет `/start` → `handlers/start.py` создаёт запись в SQLite (tier=0, deposit_total=0), шлёт PNG brand-card
2. Юзер тыкает «🔗 Привязать PocketOption» → `handlers/onboarding.py` запрашивает PO ID
3. Юзер вводит PO ID → бот вызывает `services/po_api.py`, проверяет в PocketOption Affiliate API, если депозит >0 → обновляет SQLite + параллельно шлёт на веб (`POST /api/po/link` через сервисный токен)
4. Параллельно: **постбэк** от PocketOption приходит на веб → веб обновляет тир → tier_sync.py за 60с подтянет новый тир в SQLite
5. Юзер получает сигналы по своему тиру
6. Юзер видит «🎯 Мой тир», «📈 Статы», «👥 Рефералы», «🏅 Достижения», «🏆 Лидерборд», «⚙️ Настройки», «❔ Помощь» — каждая кнопка генерит кастомную PNG в стиле сайта

### 5.3 Admin-команды
Доступны только если `update.from_user.id` ∈ `ADMIN_TELEGRAM_IDS` из `.env`. См. список в разделе 2.2.

---

## 6. Как работает выдача тира

```
PocketOption postback → /api/po/postback
                         ↓
                  обновили PocketOptionAccount.totalDeposit
                         ↓
                  пересчитали User.tier по SiteSettings.tier_thresholds
                         ↓
                  (через 60с) бот тянет /api/bot/sync
                         ↓
                  обновили users.tier и users.deposit_total в SQLite
                         ↓
                  юзер в боте видит новый тир + перки
```

Пороги по умолчанию:

| Tier | Депозит | Лимит/день | Доступ                    |
|-----:|---------|------------|---------------------------|
| T0   | 0       | 2 (life)   | demo                      |
| T1   | $100    | 5          | OTC                       |
| T2   | $500    | 15         | OTC + биржа               |
| T3   | $2 000  | 25         | + Elite-сигналы + анализ  |
| T4   | $10 000 | ∞          | + ранний доступ за 60с    |

Меняются админом в `/admin/settings` (key=`tier_thresholds`, JSON).

---

## 7. Что админ-конфигурируемо (через `/admin/*`)

| Раздел                    | Что меняет                                |
|---------------------------|-------------------------------------------|
| `/admin/faq`              | вопросы/ответы (видны на лендинге + /faq) |
| `/admin/reviews`          | отзывы (featured → карусель на лендинге)  |
| `/admin/giveaway`         | призы и пороги депозита                   |
| `/admin/legal`            | /terms и /privacy (markdown-редактор)     |
| `/admin/perks`            | список перков по тирам                    |
| `/admin/users`            | юзеры — менять тир, банить, рассылка      |
| `/admin/po-accounts`      | привязки PO; кнопка «Refresh from PO API» |
| `/admin/postbacks`        | лог постбэков от PocketOption             |
| `/admin/signals`          | сигналы (можно править/удалять)           |
| `/admin/settings`         | tier_thresholds + общие настройки         |
| `/admin/templates`        | шаблоны бот-сообщений                     |
| `/admin/leads`, `/promo`  | лиды / промокоды (legacy)                 |

---

## 8. Запуск локально

### Web
```powershell
cd web-platform
npm install
npx prisma generate
npx prisma migrate deploy
npx tsx prisma/seed-content.ts          # FAQ/Reviews/Prizes/LegalPages
npx tsx create-demo.ts                  # demo-юзер admin@demo.local (T4)
npm run dev                             # http://localhost:3000
```

### Bot
```powershell
cd bot
python -m pip install -r requirements.txt
# создать data/.env с минимум: BOT_TOKEN, ADMIN_TELEGRAM_IDS, PLATFORM_API_URL, BOT_SYNC_SECRET
python main.py
```

### Postgres (если нет своего)
```powershell
cd ..
docker-compose up -d
```

---

## 9. Что дальше / TODO

- [ ] Phase G: real-time графики цен (Chipa API)
- [ ] Production deploy: Vercel (web) + VPS (bot)
- [ ] Заполнить контент в `/admin/legal` (terms + privacy)
- [ ] Заполнить FAQ/Reviews/Prizes под боевые тексты
- [ ] Настроить PocketOption postback URL в дашборде PO

---

**В двух словах**: веб = маркетинг + личный кабинет + админка + источник правды (Postgres). Бот = доставка сигналов в Telegram + UX (картинки) + чтение тиров с веба. PocketOption = генератор денег и тиров (постбэки). Связь: HMAC-постбэки PO → веб; защищённый sync-эндпоинт веб → бот.
