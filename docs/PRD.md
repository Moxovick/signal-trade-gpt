# Signal Trade GPT — Product Requirements Document (PRD)

**Версия:** 1.0  
**Дата:** 28.04.2026  
**Продукт:** Telegram-бот + Веб-платформа для торговых сигналов (Pocket Option)

---

## 1. Общее видение продукта

**Signal Trade GPT** — премиальная платформа для генерации и доставки торговых сигналов для бинарных опционов (Pocket Option). Платформа состоит из двух ключевых компонентов:

1. **Telegram-бот** — основной канал доставки сигналов пользователям в реальном времени
2. **Веб-сайт** — лендинг + личный кабинет для доверия, регистрации и управления подпиской

**Цель:** Создать профессионально выглядящий продукт, который вызывает доверие с первого взгляда — как у бота, так и у сайта.

---

## 2. Целевая аудитория

- Начинающие трейдеры бинарных опционов (18-35 лет)
- Пользователи Pocket Option, ищущие сигналы
- Русскоязычная аудитория (в первую очередь), с возможностью расширения на EN

---

## 3. Фазы разработки

### Фаза 1 — MVP (2-3 недели)

> Цель: Запустить рабочий Telegram-бот с рандомными сигналами + одностраничный лендинг. Минимально жизнеспособный продукт для тестирования гипотезы.

#### 3.1 Telegram-бот (MVP)

**Функционал:**

| Функция | Описание |
|---------|----------|
| `/start` | Приветствие, краткое описание, кнопки навигации |
| Автоматические сигналы | Бот каждые N минут (настраиваемо) отправляет сигнал в канал/группу |
| Формат сигнала | Валютная пара, направление (CALL/PUT), время экспирации, уверенность AI |
| Inline-кнопки | "Открыть Pocket Option", "Мой профиль", "Статистика" |
| Статистика (фейковая) | Красивый отчёт с процентом "успешных" сигналов |
| Реферальная ссылка | Каждый пользователь получает реферальную ссылку |

**Формат сообщения-сигнала:**

```
🔴 SIGNAL TRADE GPT

📊 Пара: EUR/USD
📈 Направление: CALL ⬆️
⏱ Экспирация: 1 минута
🤖 AI Confidence: 87%
📡 Тип: AI Neural Analysis

━━━━━━━━━━━━━━━
⚡ Рекомендуемый объём: 1-3% депозита
🔗 Открыть Pocket Option →

#signal #eurusd #call
```

**Генерация сигналов (MVP — рандом):**
- Пул валютных пар: EUR/USD, GBP/USD, USD/JPY, AUD/USD, EUR/GBP, GBP/JPY, USD/CHF, NZD/USD, EUR/JPY, AUD/JPY, USD/CAD, EUR/AUD
- Направление: рандом CALL/PUT (50/50)
- Confidence: рандом 73-96%
- Экспирация: рандом из [30 сек, 1 мин, 2 мин, 5 мин]
- Интервал: каждые 5-15 минут (настраиваемый в конфиге)
- Часы работы: 08:00 - 22:00 UTC (когда рынки активны)
- Красивое оформление: эмодзи, разделители, хештеги

**Технические требования (бот):**

| Параметр | Значение |
|----------|----------|
| Язык | Python 3.11+ |
| Библиотека | aiogram 3.x (async Telegram Bot API) |
| Scheduler | APScheduler или asyncio tasks |
| Конфиг | .env файл (токен бота, ID канала, интервалы) |
| База (MVP) | SQLite (позже миграция на PostgreSQL) |
| Деплой | VPS (Ubuntu) или Docker |
| Логирование | structlog / loguru |

**Структура данных (MVP):**

```
User:
  - telegram_id (PK)
  - username
  - first_name
  - joined_at
  - referral_code (unique)
  - referred_by (nullable)
  - is_premium (bool, default false)

Signal:
  - id (auto)
  - pair (str)
  - direction (CALL/PUT)
  - expiration (str)
  - confidence (int)
  - created_at (datetime)
  - result (win/loss/pending, nullable)
```

#### 3.2 Веб-сайт (MVP — Лендинг)

**Секции лендинга:**

1. **Hero** — Заголовок "SIGNAL TRADE GPT", подзаголовок про AI-сигналы, CTA "Подключить бота", живой график
2. **Тикер** — бегущая строка с валютными парами и процентами
3. **Как это работает** — 4 шага (Подключи бота → Получай сигналы → Торгуй → Зарабатывай)
4. **Статистика** — Счётчики (87%+ точность, 14K+ сигналов, 4200+ пользователей, 24/7 работа)
5. **Преимущества** — AI анализ, скорость, точность, поддержка
6. **Тарифы** — Free / Premium / VIP (карточки)
7. **Отзывы** — Слайдер с "отзывами" пользователей
8. **FAQ** — Аккордеон с вопросами
9. **Footer** — Ссылки, социальные сети, дисклеймер

**Технические требования (лендинг MVP):**

| Параметр | Значение |
|----------|----------|
| Тип | Статический HTML/CSS/JS (single page) |
| Хостинг | GitHub Pages / Netlify / Vercel |
| Дизайн | Тёмная тема, красный акцент |
| Адаптивность | Mobile-first, все экраны |
| Анимации | Scroll-reveal, hover-эффекты, бегущий тикер |
| CTA | Кнопки ведут на Telegram-бота |

---

### Фаза 2 — Расширение (4-6 недель после MVP)

> Цель: Полноценная веб-платформа с регистрацией, личным кабинетом и админкой.

#### 3.3 Веб-платформа (полная версия)

**Стек:**

| Слой | Технология |
|------|-----------|
| Frontend | Next.js 14+ (App Router) + TypeScript |
| UI | Tailwind CSS + Shadcn/ui |
| Анимации | Framer Motion |
| Графики | Recharts или Lightweight Charts (TradingView) |
| Backend | Next.js API Routes + Prisma ORM |
| База данных | PostgreSQL (Supabase или selfhosted) |
| Аутентификация | NextAuth.js (email + Telegram login) |
| Платежи | Криптоплатежи (Cryptomus / NOWPayments) |
| Real-time | WebSocket через Socket.io или Pusher |
| Деплой | Vercel (фронт) + Railway/VPS (бэк + БД) |

**Страницы:**

| Страница | Описание |
|----------|----------|
| `/` | Лендинг (из MVP, портированный в Next.js) |
| `/login` | Вход (email + пароль) |
| `/register` | Регистрация |
| `/dashboard` | Личный кабинет — обзор |
| `/dashboard/signals` | Список сигналов (текущие + история) |
| `/dashboard/profile` | Профиль пользователя |
| `/dashboard/referrals` | Партнёрская программа |
| `/dashboard/history` | История действий |
| `/dashboard/leaderboard` | Лидерборд |
| `/pricing` | Тарифы и оплата |
| `/how-it-works` | Как это работает |
| `/reviews` | Отзывы |
| `/faq` | FAQ |
| `/admin/*` | Админ-панель |

#### 3.4 Админ-панель

**Функционал:**

- **Пользователи:** Список, поиск, фильтры, блокировка, смена статуса, просмотр истории
- **Сигналы:** Добавление, редактирование, удаление, массовая загрузка, фильтры
- **Тарифы:** Управление тарифами, настройка цен
- **Контент:** Управление всеми текстами, FAQ, отзывами, блоками на сайте
- **Партнёрка:** Статистика, выплаты, управление условиями
- **Аналитика:** Графики роста, активности, конверсии
- **Логи:** Действия админов, история изменений

#### 3.5 Telegram-бот (расширенная версия)

| Функция | Описание |
|---------|----------|
| Премиум-сигналы | Расширенные сигналы для платных пользователей |
| Привязка аккаунта | Связь Telegram с аккаунтом на сайте |
| Управление подпиской | Проверка/продление подписки через бота |
| Уведомления | Push о новых сигналах, истечении подписки |
| Мини-статистика | Персональная статистика за день/неделю/месяц |
| Inline-режим | Возможность шарить сигналы в другие чаты |
| Языки | Русский + English |

---

### Фаза 3 — Монетизация и масштаб (после запуска)

- Интеграция крипто-платежей
- Реферальная программа с выплатами
- Улучшенная "AI-аналитика" (RSI, MACD и т.д.)
- A/B тестирование сигналов
- Discord-бот
- Мультиязычность (EN, UA, KZ)
- SEO-оптимизация
- Маркетинг: YouTube, TikTok, Telegram Ads

---

## 4. Архитектура базы данных (полная версия)

### User
| Поле | Тип | Описание |
|------|-----|----------|
| id | uuid, PK | |
| email | unique | |
| password_hash | text | |
| telegram_id | unique, nullable | |
| username | text | |
| role | enum | user / admin |
| status | enum | active / banned / pending |
| subscription_plan | enum | free / premium / vip |
| subscription_expires_at | timestamp, nullable | |
| referral_code | unique | |
| referred_by | FK → User, nullable | |
| created_at | timestamp | |
| last_login | timestamp | |
| notification_settings | jsonb | |

### Signal
| Поле | Тип | Описание |
|------|-----|----------|
| id | uuid, PK | |
| pair | varchar | EUR/USD etc. |
| direction | enum | CALL / PUT |
| expiration | varchar | 1m, 5m etc. |
| confidence | int | 73-96 |
| type | enum | ai / expert |
| entry_price | decimal, nullable | |
| result | enum | win / loss / pending |
| is_premium | bool | |
| created_at | timestamp | |
| closed_at | timestamp, nullable | |
| created_by | FK → User, nullable | |

### Subscription
| Поле | Тип | Описание |
|------|-----|----------|
| id | uuid, PK | |
| user_id | FK → User | |
| plan | enum | premium / vip |
| start_date | timestamp | |
| end_date | timestamp | |
| payment_id | FK → Payment, nullable | |

### Payment
| Поле | Тип | Описание |
|------|-----|----------|
| id | uuid, PK | |
| user_id | FK → User | |
| amount | decimal | |
| currency | varchar | BTC, USDT etc. |
| status | enum | pending / ok / fail |
| tx_hash | nullable | |
| provider | varchar | cryptomus etc. |
| created_at | timestamp | |
| confirmed_at | timestamp, nullable | |

### Referral
| Поле | Тип | Описание |
|------|-----|----------|
| id | uuid, PK | |
| referrer_id | FK → User | |
| referred_id | FK → User | |
| created_at | timestamp | |
| reward_amount | decimal | |
| reward_status | enum | pending / paid |

### Review
| Поле | Тип | Описание |
|------|-----|----------|
| id | uuid, PK | |
| user_id | FK → User | |
| text | text | |
| rating | int | 1-5 |
| status | enum | published / hidden |
| created_at | timestamp | |

### Faq
| Поле | Тип | Описание |
|------|-----|----------|
| id | uuid, PK | |
| question | text | |
| answer | text | |
| category | varchar | |
| order | int | |
| is_active | bool | |

### LeaderboardEntry
| Поле | Тип | Описание |
|------|-----|----------|
| id | uuid, PK | |
| user_id | FK → User | |
| period | enum | day / week / month |
| signals_count | int | |
| success_rate | decimal | |
| profit | decimal | |
| rank | int | |
| calculated_at | timestamp | |

### ContentBlock
| Поле | Тип | Описание |
|------|-----|----------|
| id | uuid, PK | |
| type | varchar | hero, pricing etc. |
| title | varchar | |
| body | jsonb | |
| order | int | |
| is_active | bool | |

### AdminLog
| Поле | Тип | Описание |
|------|-----|----------|
| id | uuid, PK | |
| admin_id | FK → User | |
| action | varchar | |
| entity_type | varchar | |
| entity_id | uuid | |
| details | jsonb | |
| created_at | timestamp | |

---

## 5. API-эндпоинты (полная версия)

### Auth
| Метод | Путь | Описание |
|-------|------|----------|
| POST | `/api/auth/register` | Регистрация |
| POST | `/api/auth/login` | Вход |
| POST | `/api/auth/verify-email` | Подтверждение email |
| POST | `/api/auth/forgot-password` | Восстановление пароля |
| POST | `/api/auth/telegram-link` | Привязка Telegram |

### User
| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/users/me` | Профиль |
| PUT | `/api/users/me` | Обновление профиля |
| GET | `/api/users/me/stats` | Персональная статистика |

### Signals
| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/signals` | Список сигналов |
| GET | `/api/signals/:id` | Детали сигнала |
| POST | `/api/signals` | Создание (admin) |
| PUT | `/api/signals/:id` | Обновление (admin) |
| DELETE | `/api/signals/:id` | Удаление (admin) |

### Subscriptions & Payments
| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/subscriptions` | Текущая подписка |
| POST | `/api/payments` | Создание платежа |
| POST | `/api/payments/webhook` | Webhook от платёжки |

### Content
| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/reviews` | Отзывы |
| POST | `/api/reviews` | Оставить отзыв |
| GET | `/api/faq` | FAQ |
| GET | `/api/leaderboard` | Лидерборд |
| GET | `/api/content-blocks` | Динамический контент |

### Admin
| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/admin/users` | Список пользователей |
| PUT | `/api/admin/users/:id` | Редактирование |
| CRUD | `/api/admin/signals` | Сигналы |
| CRUD | `/api/admin/tariffs` | Тарифы |
| CRUD | `/api/admin/reviews` | Отзывы |
| CRUD | `/api/admin/faq` | FAQ |
| CRUD | `/api/admin/content` | Контент |
| GET | `/api/admin/analytics` | Аналитика |
| GET | `/api/admin/logs` | Логи |

### WebSocket
| Канал | Описание |
|-------|----------|
| `ws://signals` | Real-time сигналы |
| `ws://notifications` | Уведомления |

---

## 6. Дизайн и UX

### Общий стиль
- **Тема:** Тёмная (чёрный/тёмно-синий фон)
- **Акцент:** Красный (#e53030) — основной, Зелёный (#00e5a0) — позитивные метрики
- **Шрифты:** Bebas Neue (заголовки), Manrope (тело), JetBrains Mono (данные)
- **Ощущение:** Премиум, технологичный, надёжный

### Принципы
1. Доверие с первого экрана
2. Минимум текста, максимум визуала
3. Mobile-first
4. Быстрая загрузка
5. Профессиональные числа (87.3% а не 100%)

---

## 7. Тарифы

| | Free | Premium | VIP |
|--|------|---------|-----|
| **Цена** | $0 | $29/мес | $79/мес |
| **Сигналов/день** | 3-5 | 15-25 | Безлимит |
| **Пары** | 4 основных | Все | Все + экзотика |
| **Экспирация** | 1-5 мин | 30с-15мин | Все |
| **AI Confidence** | Базовый | Расширенный | Полная аналитика |
| **Поддержка** | — | Email | Приоритет 24/7 |
| **Партнёрка** | 10% | 15% | 20% |

---

## 8. Метрики успеха

| Метрика | Цель (1 мес) | Цель (3 мес) |
|---------|-------------|--------------|
| Подписчики бота | 500+ | 3000+ |
| DAU (бот) | 100+ | 500+ |
| Конверсия Free → Premium | 3-5% | 5-8% |
| Посещения сайта | 1000+/мес | 10000+/мес |
| Retention (7d) | 40%+ | 50%+ |

---

## 9. Дисклеймеры (обязательно)

> "Signal Trade GPT не является финансовым советником. Все сигналы предоставляются в информационных целях. Торговля бинарными опционами сопряжена с высоким риском потери средств. Прошлые результаты не гарантируют будущей доходности."
