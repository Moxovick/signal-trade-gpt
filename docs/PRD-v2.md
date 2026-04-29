# Signal Trade GPT — PRD v2.0

> **Статус:** Draft. Заменяет `docs/PRD.md` v1.0 от 28.04.2026.
> **Дата:** 29.04.2026.
> **Главные изменения относительно v1:**
> 1. Монетизация через **PocketOption партнёрку** (revenue-share / CPA), а не через подписки.
> 2. Доступ к боту = подтверждённый PocketOption аккаунт под нашей партнёркой.
> 3. Уровни возможностей бота разблокируются по сумме депозита лида на PocketOption.
> 4. Новая дизайн-система (жёлтый, custom animated background), референс — `signal-trade-gpt-v3.html`.

---

## 1. Видение и ЦА

**Signal Trade GPT** — Telegram-бот + веб-платформа, выдающие торговые сигналы для Pocket Option **только** пользователям, которые зарегистрированы на бирже под нашей партнёрской ссылкой (или вручную привязали свой trader ID, и мы убедились, что он наш реферал). Чем больше у лида депозит — тем больше у него «прокачек» в боте.

**ЦА:** русскоязычные начинающие и средние трейдеры бинарных опционов 18–40 лет, активные в Telegram, готовые внести депозит $50–$2000 и торговать по сигналам.

**Ключевая метрика:** **NetRev = Σ(RevShare commission)** от подтверждённых рефералов за период. Промежуточные: `FTD count`, `активные трейдеры` (>1 сделка / 7 дней), `средний депозит`, `LTV лида`.

---

## 2. Не-цели (что НЕ делаем в этой итерации)

- **Не** продаём подписки. Никаких $29/$79 / промо-кодов на триалы / платных тарифов **на нашем сайте**.
- **Не** принимаем платежи (Stripe / крипту / карты). Все деньги идут через PocketOption.
- **Не** обучаем собственный AI/LLM на сигналах. Используем готовые индикаторы или ручные сигналы аналитика.
- **Не** делаем мобильное приложение в этой итерации (PWA — да, native — нет).
- **Не** делаем мульти-брокер. Только PocketOption.

---

## 3. Архитектура (high level)

```
┌─────────────────────────────────────────────────────────────────┐
│                       Пользователь (lead)                       │
└──────┬──────────────────────────────────────────────┬───────────┘
       │ заходит на сайт                              │ пишет боту
       ▼                                              ▼
┌──────────────────┐                          ┌────────────────┐
│  Web platform    │                          │  Telegram bot  │
│  (Next.js 16)    │                          │  (aiogram 3)   │
│                  │                          │                │
│  • Лендинг       │                          │  • /start      │
│  • Регистрация   │                          │  • FSM onboarding
│  • Личный кабинет│                          │  • Сигналы     │
│  • Админка       │                          │  • Перки       │
└────────┬─────────┘                          └────────┬───────┘
         │                                             │
         │ REST + Server Actions                       │ aiosqlite/asyncpg
         ▼                                             ▼
┌───────────────────────────────────────────────────────────────┐
│           Backend (Next.js API routes + Prisma)                │
│                                                                │
│  /api/postback/po          — приём postback от PocketOption    │
│  /api/po/link              — генерация реф-ссылки lead-у       │
│  /api/po/submit-id         — приём trader_id от лида           │
│  /api/admin/*              — CRUD админки                       │
│  /api/bot/access-check     — бот спрашивает «можно ли?»        │
└───────────────────────────────────────────────────────────────┘
         │                                             ▲
         ▼                                             │ webhook
┌──────────────────────┐                  ┌────────────┴────────┐
│  Postgres (Prisma)   │                  │   PocketOption       │
└──────────────────────┘                  │   affiliate.pocket… │
                                          │                      │
                                          │  • Postbacks 2.0     │
                                          │  • CSV export        │
                                          └──────────────────────┘
```

**Стек:**
- Frontend / Backend: Next.js 16 (App Router), React 19, Tailwind 4, framer-motion
- DB: Postgres 15+ (через Prisma 7)
- Auth: NextAuth 5 (credentials + Telegram OAuth по желанию)
- Bot: Python 3.11+, aiogram 3, asyncpg (общая БД с веб-платформой)
- Hosting: VPS + Docker Compose (1 контейнер web, 1 — bot, 1 — postgres)

---

## 4. Юзер-флоу

### 4.1 Главный сценарий: новый лид через сайт

```
1.  Пользователь приходит на signaltradegpt.com (через рекламу / Telegram / реф-ссылку другого юзера).
2.  Видит лендинг (см. §6) → жмёт «Подключить бота» / «Получить сигналы».
3.  Регистрируется (email + пароль, либо «Войти через Telegram»).
4.  В Личном Кабинете (ЛК) видит баннер:
    «Чтобы получить доступ к сигналам — зарегистрируйся на Pocket Option
     по этой ссылке [BIG YELLOW BUTTON]».
    Ссылка имеет вид: https://po.cash/smart/abc?click_id={user_uuid}
    (click_id = ID нашего пользователя)
5.  Пользователь регистрируется на PocketOption. PocketOption отправляет
    нам postback Registration → мы создаём запись PocketOptionAccount
    (poTraderId, ourUserId).
6.  В ЛК статус меняется: «✓ Аккаунт PocketOption привязан».
7.  Пользователь делает депозит на PO. PocketOption отправляет postback
    First Deposit → мы записываем Deposit + обновляем User.depositTotal.
8.  В ЛК и в боте разблокируются перки в зависимости от суммы (см. §7).
9.  Пользователь идёт в Telegram-бот, жмёт /start, бот видит, что аккаунт
    PO привязан + депозит есть → выдаёт сигналы.
```

### 4.2 Альтернатива: лид уже с аккаунтом PO

```
1.  В ЛК есть кнопка «У меня уже есть аккаунт PocketOption» → форма ввода trader_id.
2.  Пользователь вводит свой PocketOption ID.
3.  Мы:
    (a) проверяем по нашему журналу postback'ов — есть ли от этого trader_id Registration с нашим click_id;
    (b) если нет — помечаем `pendingVerification`. Админ сверяет вручную через CSV-экспорт партнёр-кабинета и одобряет / отклоняет.
4.  При одобрении — то же, что в шаге 6 главного сценария.
```

### 4.3 Запрет: пользователь не привязал PO

- В боте: ответ «Чтобы получать сигналы — привяжи аккаунт PocketOption: [ссылка на ЛК]».
- В ЛК: вкладки «Сигналы», «История» помечены замком, при клике — модалка с CTA на привязку PO.

### 4.4 Внутренняя реферальная программа (юзер → юзер)

- Каждый пользователь получает свою реф-ссылку: `signaltradegpt.com/r/{code}`.
- Если новый лид зашёл по ней и впоследствии сделал FTD на PO — пригласившему открывается **бонусная перка** в боте (например, +5 сигналов в день, или доступ к одному tier выше).
- **Не платим деньгами** — только перками. Это полностью соответствует тому, что мы сами получаем плюшки от PO за приведённого юзера.

---

## 5. Бизнес-модель и Tier'ы перков

### 5.1 Источники дохода

| Источник | Объяснение |
|---|---|
| **RevShare с PocketOption** (основной) | 50–80% от прибыли брокера на наших трейдерах. Капает ежедневно. |
| **CPA-бонусы за FTD** (опциональный план) | Разовая комиссия за первый депозит лида (зависит от GEO). |
| **Sub-affiliate 5%** | Если нашего юзера-партнёра в PO будут юзать его рефералы — нам идёт 5% поверх. |

### 5.2 Tier'ы лида (что разблокируется в боте)

| Tier | Депозит | Что доступно |
|---|---|---|
| **T0 — Lead** | $0 (не привязан PO) | Ничего, только демо-просмотр и онбординг |
| **T1 — Starter** | Привязан PO, депозит $0–$49 | OTC-сигналы (3–5/день), 4 базовых пары, текстовый формат |
| **T2 — Active** | Депозит $50–$499 | OTC + Биржевые сигналы (10–15/день), все 12 пар, графический формат |
| **T3 — Pro** | Депозит $500–$1999 | + Elite-сигналы (≥90% confidence), приоритетная очередь, аналитический комментарий |
| **T4 — VIP** | Депозит $2000+ | Всё выше + персональный менеджер в чате, ранние сигналы (за 1 мин до публичных), еженедельный обзор |

> Цифры выше — **черновик**. Финальные пороги нужно подбирать так, чтобы наш RevShare (или CPA × вероятность апа) с этого депозита покрывал стоимость перка.

### 5.3 Перки (атомарные единицы)

В админке должна быть таблица `BotPerk` — **редактируемая без релиза**:

| Перк | Условие | Действие |
|---|---|---|
| `signals_daily_limit` | tier ≥ T1 | разблокировать N сигналов/день |
| `pairs_advanced` | tier ≥ T2 | пары не в default 4 |
| `tier_elite` | tier ≥ T3 | сигналы с tier=`elite` в Prisma |
| `early_access_60s` | tier ≥ T4 | сигналы за 60 сек до публичной выдачи |
| `personal_manager` | tier ≥ T4 | в боте появляется кнопка «связаться с менеджером» |
| `referral_bonus_+5` | sub-FTD = TRUE | +5 сигналов/день за каждого реферала, давшего FTD |

---

## 6. Дизайн

### 6.1 Принципы

1. **Жёлтый — главный, и он не казино.** Используем не чисто `#FFD700`, а тёплый сложный цвет с золотистым отливом + один секондари (тёплый молочный/кремовый для контраста на светлых блоках).
2. **Тёмный фон по умолчанию**, но с кастомной анимацией (см. §6.3).
3. **Плотность как у v3.html, не как у текущей платформы.** Должно быть «дорого», много мелких живых деталей.
4. **Единая система** — лендинг, ЛК, админка выглядят как один продукт. Один шрифт-стек, одна палитра, одни компоненты.
5. **Икноки SVG (Lucide), эмодзи допустимы только в текстах сигналов в боте**. На сайте — никаких 📊 в кнопках.

### 6.2 Палитра (черновик токенов)

```css
:root {
  /* Brand */
  --brand-yellow:        #f5c518;  /* primary */
  --brand-yellow-bright: #ffd84d;  /* hover/highlight */
  --brand-yellow-deep:   #c98e00;  /* shadow/pressed */
  --brand-cream:         #fff7d6;  /* light surface accent */

  /* Background system (warm dark, not blue-black) */
  --bg-0: #0a0805;   /* deepest */
  --bg-1: #120e07;
  --bg-2: #1a1409;
  --bg-3: #221a0c;
  --bg-glass: rgba(255, 220, 100, 0.04);

  /* Text */
  --t-1: #fff7e0;    /* primary, slight warm tint */
  --t-2: #b9a880;
  --t-3: #6e6048;

  /* Status (used sparingly) */
  --green: #8ee06b;  /* warmer than the current #00e5a0 */
  --red:   #ff6b3d;  /* warm red — fits yellow palette */

  /* Borders */
  --b-soft:  rgba(245, 197, 24, 0.08);
  --b-hard:  rgba(245, 197, 24, 0.30);

  /* Shadows */
  --glow-y:  0 0 32px rgba(245, 197, 24, 0.35);
}
```

**Шрифты:** оставляем стек Bebas Neue (заголовки) + Manrope (текст) + JetBrains Mono (числа/тикер). Bebas — 800/900 weight, всегда `letter-spacing: 0.04em`.

### 6.3 Анимированный фон (главное «вау»)

Берём идеи из `signal-trade-gpt-v3.html`:

1. **Canvas с орбитами** — 4 размытых градиентных пятна, медленно дрейфующих по экрану. Цвета: 2 оттенка жёлтого, 1 кремовый, 1 тёплый красный.
2. **Сетка 64×64px** — тонкие линии `rgba(245, 197, 24, 0.025)` поверх canvas.
3. **Частицы (50 шт)** — мелкие жёлтые точки, медленно дрейфующие; **связи** между близкими частицами (расстояние < 130px) — тонкие линии, прозрачность зависит от дистанции.
4. **Зернистый overlay** — SVG-шум `feTurbulence` с opacity 0.03, чтобы убить плоскость градиентов.
5. **Скролл-прогресс** — тонкая полоса наверху страницы, светящаяся жёлтым.
6. **Кастомный курсор** (только desktop, не mobile) — точка 8px + следующее за ней с лагом кольцо 36px. На hover интерактивных элементов кольцо увеличивается до 52px и подсвечивается ярче.
7. **Preloader** — 1.5 сек заставка с логотипом и progress bar; уходит fade-out.

**Производительность:** canvas работает в `requestAnimationFrame`, на mobile (`prefers-reduced-motion` или `width < 768`) — отключаем анимации, оставляем статичный градиент.

### 6.4 Компоненты-эталоны

| Компонент | Поведение |
|---|---|
| **Кнопка primary** | Заливка `--brand-yellow`, текст `--bg-0`. Hover: `scale(1.03)` + glow. Press: `scale(0.98)`. |
| **Кнопка secondary** | Прозрачная, рамка `--b-hard`, текст `--brand-yellow`. Hover: фон `--brand-yellow / 8%`. |
| **Карточка** | `--bg-1` фон, `1px solid --b-soft` рамка, radius 16px. Hover: рамка → `--b-hard`, soft glow `--glow-y`. |
| **Tier-badge** | Pill-форма с динамическим цветом. T1 — серый, T2 — голубоватый, T3 — золото, T4 — кремовый+gold-border. |
| **Tooltip** | На фоне `--bg-3 / 95%`, blur 12px, max-width 240px. |
| **Toast** | В правом нижнем углу, slide-in, auto-hide 4 сек. |
| **Modal** | Backdrop `rgba(0,0,0,0.7) + blur(8px)`, окно `--bg-1` с рамкой `--b-hard`. |
| **Skeleton** | Shimmer-анимация, цвет `--bg-2 → --bg-3 → --bg-2`, длительность 2с. |

### 6.5 Логотип

Текущий SVG в `Logo.tsx` непригоден. Нужен:
- Word-mark `SIGNAL TRADE GPT` — Bebas Neue, 800, `--brand-yellow`, **слово GPT обведено жёлтой рамкой со скруглением 4px** (как чип).
- Глиф — стилизованный candlestick + лучик AI (можно: вертикальный жёлтый «фитиль» + золотой ореол).
- Анимация ореола (3-сек pulse, opacity 0.3 → 0.6 → 0.3).
- 3 размера: `xs (h-5)`, `sm (h-6)`, `md (h-8)`, `lg (h-12)`.

### 6.6 Иконки

Полный переход на **Lucide React** (уже установлен). Заменить ВСЕ эмодзи в UI (не в текстах сигналов) на иконки:
- `📊` → `<BarChart3 />`
- `📈` → `<TrendingUp />`
- `📱` → `<Smartphone />`
- `💎` → `<Gem />`
- `🎯` → `<Target />`
- `🔗` → `<Link2 />`
- `⚡` → `<Zap />`
- `👥` → `<Users />`
- … и т. д.

---

## 7. Бэкенд: модели и API

### 7.1 Изменения Prisma

**Удалить из активного использования (но не дропать таблицы):**
- `Subscription`, `Payment`, `PromoCode` — оставить миграциями для совместимости, но в UI/API больше не дёргать.
- `User.subscriptionPlan`, `User.subscriptionExpiresAt`, `User.trialExpiresAt` — depricated, не показывать.

**Добавить:**

```prisma
model PocketOptionAccount {
  id              String   @id @default(cuid())
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id])
  poTraderId      String   @unique
  status          POAccountStatus @default(pending) // pending | verified | rejected
  source          String   // "postback" | "manual"
  registeredAt    DateTime?
  emailConfirmed  Boolean  @default(false)
  ftdAt           DateTime?
  ftdAmount       Decimal?
  totalDeposit    Decimal  @default(0)
  totalRevShare   Decimal  @default(0)
  lastPostbackAt  DateTime?
  notes           String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  postbacks       Postback[]
  @@index([poTraderId])
  @@map("po_accounts")
}

enum POAccountStatus { pending verified rejected }

model Postback {
  id           String   @id @default(cuid())
  poAccountId  String?
  poAccount    PocketOptionAccount? @relation(fields: [poAccountId], references: [id])
  eventType    PostbackEvent
  rawPayload   Json
  clickId      String?  // = our user UUID
  poTraderId   String?
  amount       Decimal?
  currency     String?
  receivedAt   DateTime @default(now())
  signature    String?  // если PO даёт hmac

  @@index([poTraderId])
  @@index([receivedAt])
  @@map("postbacks")
}

enum PostbackEvent { registration email_confirm ftd redeposit commission }

model BotPerk {
  id          String   @id @default(cuid())
  code        String   @unique     // напр. "signals_daily_limit"
  name        String
  description String
  minTier     Int                  // 1..4
  config      Json     @default("{}") // напр. {"value": 25}
  isActive    Boolean  @default(true)
  @@map("bot_perks")
}
```

**Расширить `Deposit`:** связать с `Postback` (1:1 для FTD/redeposit), убрать `proofUrl` (ручная верификация больше не нужна), оставить только админ-override.

**В `User`:** добавить `tier Int @default(0)`, обновлять триггером / явным `recomputeTier(userId)` после каждого postback. Логика:

```python
def compute_tier(deposit_total: Decimal, has_po_account: bool) -> int:
    if not has_po_account: return 0
    if deposit_total >= 2000: return 4
    if deposit_total >= 500:  return 3
    if deposit_total >= 50:   return 2
    return 1
```

### 7.2 API endpoints (Next.js)

| Метод + путь | Назначение |
|---|---|
| `POST /api/postback/po` | Приём postback от PocketOption. Парсит payload, находит/создаёт `PocketOptionAccount`, создаёт `Postback`, обновляет агрегаты. **Защита:** IP-whitelist + подписной токен в URL (PO позволяет добавить static query string). |
| `POST /api/po/submit-id` | Лид присылает свой trader_id вручную → создаём `PocketOptionAccount(status=pending)`, ищем в `Postback`-журнале совпадение по `poTraderId` → если есть — auto-verify. |
| `GET /api/po/link` | Возвращает реф-ссылку для текущего юзера (с его `click_id = userId`). |
| `GET /api/me/tier` | Текущий tier + агрегаты + список доступных перков. |
| `GET /api/bot/access-check?telegramId=…` | Бот спрашивает доступ. Возвращает `{tier, perks: [...], dailyLimit, pairs: [...]}`. Защищён shared-secret заголовком. |
| `POST /api/admin/po/verify` | Админ вручную одобряет / отклоняет `PocketOptionAccount`. |
| `GET /api/admin/postbacks` | Лента последних postback'ов с фильтрами. |
| `GET /api/admin/leads` | Расширенная таблица лидов: PO trader_id, депозит, tier, last activity, CSV-export. |

### 7.3 Postback security

- URL формата: `https://signaltradegpt.com/api/postback/po?token={LONG_RANDOM_FROM_ENV}`.
- В payload PocketOption передаёт `click_id` (наш userId) и `trader_id`. Сверяем `click_id` с существующим `User.id` — если нет такого, всё равно сохраняем postback с `userId=null` (для расследования).
- Все postback'и **идемпотентны** по комбинации `(eventType, poTraderId, amount, receivedAt-rounded-to-minute)` — на случай повторов.
- Логируем raw payload **всегда** — даже если не смогли распарсить.

---

## 8. Сайт: страницы

### 8.1 Лендинг `/`

Секции (порядок):
1. **NAV** — sticky, glass, лого слева, ссылки + CTA «Подключить бота» справа.
2. **HERO** — заголовок 96px Bebas, подзаголовок Manrope, 2 CTA, ticker внизу.
3. **TICKER** — бесконечно скроллящаяся лента из 12 пар с +/- %.
4. **HOW IT WORKS** — 4 шага с иконками + числовые метки 01/02/03/04.
5. **TIERS** — 4 карточки T1–T4 с указанием порога депозита и списком перков. **Без цен.**
6. **LIVE FEED** — окно с ленточным выводом «недавних» сигналов (рандомных, как в v1) для динамики.
7. **CHART DEMO** — анимированный candlestick chart (как в v3.html) с overlay-сигналом.
8. **STATS** — 4 счётчика: трейдеров, сигналов выдано, средний % успеха, выплачено по партнёрке.
9. **REVIEWS** — карусель отзывов (3-4 вида) с tier-бейджем.
10. **FAQ** — accordion, ответы на основные вопросы (включая «как работает партнёрка», «нужно ли платить»).
11. **CTA-FOOTER** — большой жёлтый блок «Подключи бота → начни торговать сегодня».
12. **FOOTER** — мелкий, с дисклеймером и легалом.

Все CTA ведут либо на `/register`, либо на бота (одна и та же конверсия, кнопка «Начать» = регистрация → оншне-бординг → бот).

### 8.2 Личный Кабинет `/dashboard`

Сайдбар: Главная, Сигналы, Pocket Option, Перки, Рефералы, История, Настройки.

**Главная** — 4 stat-карточки (текущий tier, депозит, рефералов, сигналов получено), карта прогресса до следующего tier (progress bar), список последних 5 сигналов, кнопка «Открыть бота».

**Pocket Option** — самая важная страница в ЛК:
- Если PO не привязан: большой блок с реф-ссылкой и QR-кодом + альтернативная форма «У меня уже есть аккаунт» с полем `trader_id`.
- Если привязан: статус (verified/pending), trader_id, FTD дата, общий депозит, RevShare капнувший на нас (мы покажем — это и есть «социальное доказательство», что мы не врём про партнёрку).

**Перки** — список всех перков с лочком; разблокированные подсвечены, заблокированные показывают «нужно депозит $X».

**Рефералы** — реф-ссылка `signaltradegpt.com/r/{code}`, список приведённых, у кого уже FTD на PO. Бонусные перки за приведённых.

### 8.3 Админка `/admin`

Сайдбар: Дашборд, Лиды, PO-аккаунты, Postback-лог, Сигналы, Перки, Шаблоны бота, FAQ, Аналитика.

**Дашборд** — KPI: за сегодня FTD, RevShare, новые регистрации, активные трейдеры. Графики недели/месяца.

**PO-аккаунты** — таблица всех `PocketOptionAccount`. Колонки: user, trader_id, status, FTD, депозит, последний postback, действия (verify / reject).

**Postback-лог** — лента всех принятых postback'ов с raw payload (для дебага). Фильтры по eventType, дате, trader_id. Кнопка «replay» — повторно проиграть payload через handler (полезно при изменении логики).

**Перки** — CRUD `BotPerk`. Можно менять description, minTier, config-json без релиза.

**Сигналы** — добавить **форму ручного создания сигнала** (`type=manual`) + кнопку «Выпустить ещё один автоматический сейчас». Список последних сигналов с результатом.

**Шаблоны бота** — уже есть, оставить.

**FAQ** — уже есть, оставить.

**Аналитика** — конверсионная воронка: visit → register → PO link → FTD → tier-up. Когорты по UTM.

---

## 9. Telegram-бот

### 9.1 Стек

Оставляем aiogram 3, но **переключаем БД с SQLite на общий Postgres** (asyncpg) — чтобы веб и бот работали с одной правдой.

### 9.2 FSM-онбординг

```
/start
 │
 ├─ Если user уже в БД, PO привязан, tier ≥ 1:
 │     → главное меню (см. §9.3)
 │
 ├─ Если user в БД, но PO не привязан:
 │     → «Чтобы получать сигналы, привяжи аккаунт PocketOption»
 │     → [Кнопка: Перейти в кабинет] (deep link на ЛК с pre-filled email)
 │     → [Кнопка: У меня уже есть PO ID] → ввод trader_id → проверка через API
 │
 └─ Если user не в БД:
       → быстрая регистрация прямо в боте (просим email или сразу tg-only)
       → дальше как в ветке «PO не привязан»
```

### 9.3 Главное меню бота

Inline-кнопки (под последним сообщением):
- 🎯 Сигнал сейчас
- 📊 Мои перки
- 🔗 Реф-ссылка
- 💼 Pocket Option аккаунт
- ⚙ Настройки

### 9.4 Сигналы

- Бот читает `User.tier` и `BotPerk` через `/api/bot/access-check`.
- Генерирует сигналы согласно tier (см. §5.2). Логика генерации — пока остаётся random (`signal_generator.py`), но добавляются:
  - Tier-aware фильтры (T1 — только OTC, T3+ — Elite-сигналы).
  - Daily limit (хранится в Redis, либо в `BotMessage` table — counter за день).
  - Early access for T4: T4 получает сигнал на 60 сек раньше остальных (`asyncio.sleep` после T4-рассылки).
- Формат сигнала остаётся прежний (см. `CLAUDE.md` v1).

### 9.5 Реал-тайм графики (опционально, фаза 2)

Для tier ≥ T3 в админке-сгенерённом сигнале можно прикладывать **картинку графика последних 30 свечей** с PocketOption.
- Источник данных: неофициальный `pocketoptionapi_async` (через SSID нашего dev-аккаунта).
- Рендер графика: сервер генерит PNG (matplotlib / Pillow) и присылает в Telegram media-message.
- Это **рискованная зависимость** (SSID может протухнуть, API неофициальный) — поэтому опционально и в фазе 2.

---

## 10. Безопасность и compliance

- **Дисклеймер** на каждой странице сайта (footer) и в `/start` бота:
  > Signal Trade GPT не является финансовым советником. Все сигналы предоставляются в информационных целях. Торговля бинарными опционами сопряжена с высоким риском полной потери средств. Прошлые результаты не гарантируют будущей доходности.
- Cookies & Privacy: Cookie-banner на лендинге, страница `/privacy` и `/terms`.
- GDPR-минимум: возможность удалить аккаунт (cascade delete по userId, кроме `Postback` — там оставляем deidentified copy).
- **Никаких** реальных финансовых обещаний типа «гарантированная прибыль» / «80% точность» в текстах. Можно: «AI Confidence X%» — это про нашу метрику, не про результат.
- Rate-limit на `/api/postback/po` (на случай, если сорсы IP протекут).
- HMAC-проверка postback-подписи (если PO даёт; если нет — IP-allowlist).
- `bot/.env` и `.env` веб-платформы — **никогда не коммитить**. Уже сейчас в архиве `bot/.env` лежит и его, скорее всего, надо отозвать.

---

## 11. Деплой

```yaml
# docker-compose.yml (целевой)
services:
  postgres:
    image: postgres:16-alpine
    volumes: [./data/pg:/var/lib/postgresql/data]
    env_file: .env

  web:
    build: ./web-platform
    ports: ["3000:3000"]
    env_file: .env
    depends_on: [postgres]

  bot:
    build: ./bot
    env_file: .env
    depends_on: [postgres]

  caddy:    # reverse-proxy + auto-https
    image: caddy:2-alpine
    ports: ["80:80","443:443"]
    volumes: [./Caddyfile:/etc/caddy/Caddyfile, ./data/caddy:/data]
```

CI/CD: GitHub Actions — на push в `main`: lint (`eslint` + `ruff`), prisma migrate, build, scp/ssh-deploy на VPS.

---

## 12. Roadmap

| Фаза | Объём | Срок (календарных дней при 1 ent. dev / Devin) |
|---|---|---|
| **Phase A — Foundation** | Чистка (`web/` → удалить), новая Prisma-схема, удаление подписок из API | 2 |
| **Phase B — Design system v2** | Токены, компоненты, animated background, кастомный курсор, preloader, Lucide-иконки | 3–4 |
| **Phase C — Pages v2** | Лендинг, ЛК, админка — все на новом дизайне | 3–4 |
| **Phase D — PocketOption integration** | Postback endpoint, верификация, перки, tier-движок | 2–3 |
| **Phase E — Bot v2** | FSM, общий Postgres, access-check, перки, daily-limit | 2–3 |
| **Phase F — Polish + tests** | Тесты, документация, дисклеймеры, deploy | 1–2 |
| **Phase G (опционально)** | Real-time графики через Chipa API | 2–3 |

---

## 13. Открытые вопросы (нужно решение от заказчика)

1. **План в PocketOption Partner**: RevShare или CPA? Влияет на структуру `Deposit` агрегации.
2. **Пороги tier'ов** ($50 / $500 / $2000) — финальные или подобрать после первой тестовой когорты?
3. **Sub-affiliate (5%)** — нужен ли в этой итерации? Если да — нужно ещё одно поле в `PocketOptionAccount.subAffiliateUserId`.
4. **Telegram OAuth** для регистрации — добавлять или только email/password?
5. **Язык интерфейса** — русский? украинский? оба? (Сейчас в коде смешано.)
6. **Real-time графики** через неофициальный PO-API — идём в фазу G или отказываемся?
7. **Доступ к боту без депозита**: T1 (привязан, но $0) — даём ли вообще сигналы или только промо/демо? (Сейчас в PRD — даём 3–5 OTC, но это можно ужесточить.)
8. **Цвет акцента**: чистый `#f5c518` или подберём что-то более «премиум» (например, `#e7b300` matte-gold)? Хотите ли вы пробу 2–3 палитр для голосования?
