# Инструкция исполнителю (агенту / разработчику)

> Это техническое задание для агента, который будет выполнять переработку `signal-trade-gpt-`.
> Перед началом любой работы — **прочитать целиком** этот документ + `02_PRD_v2.md` + текущий `docs/PRD.md` + `web-platform/AGENTS.md`.

---

## 0. Фон в одном абзаце

Проект — Telegram-бот + веб-платформа для трейдеров бинарных опционов на PocketOption. Текущая реализация устаревает по двум причинам: (1) она построена вокруг подписок (FREE/PREMIUM/VIP), которых больше не будет, потому что монетизация переезжает на партнёрскую программу PocketOption (RevShare / CPA); (2) дизайн плоский и «AI-сгенерёный», нужен уровень `signal-trade-gpt-v3.html` (animated canvas, кастомный курсор, preloader), но в **жёлтой** палитре.

---

## 1. Ground rules — нерушимые

1. **Не удалять `signal-trade-gpt-v3.html`** — это референс дизайна, оставить в `docs/reference-landing.html` или аналогичном месте. **Не копировать его 1:1** — это HTML-черновик, нам нужен модульный код в Next.js.
2. **Не делать платежи**: никаких Stripe / крипты / карт. Все платежи проходят на стороне PocketOption, мы только слушаем postback.
3. **Не показывать цены подписок** на сайте/в боте. Все упоминания «$29 / $79 / Premium / VIP» — убрать или переделать в «tier 2 / tier 3» по депозиту.
4. **Не использовать эмодзи в UI кнопок и навигации.** Только Lucide React Icons. Эмодзи разрешены только внутри **тела сообщений Telegram-бота** (потому что Telegram это естественная среда для эмодзи).
5. **Не коммитить `.env` и не оставлять токены в коде.** Если найдёшь живой токен в `bot/.env` из архива — добавь в `.gitignore`, попроси у пользователя новый и через `secrets` request его.
6. **Не пытаться сделать «свой AI»**. Сигналы пока остаются random (`signal_generator.py`); реальные графики через PocketOption API — это **отдельная фаза**, не делать в этой итерации без явного апрува.
7. **Стек = Next.js 16 + React 19 + Prisma 7 + Tailwind 4** — это bleeding edge. Не доверять старым туториалам, **читать `node_modules/next/dist/docs/`** (как требует `web-platform/AGENTS.md`).
8. **Не делать огромные PR.** Каждая фаза (см. §3) = отдельный PR, ревью, мердж, потом следующая.
9. **Перед коммитом**: `npm run lint` в `web-platform/`, `ruff check bot/` в `bot/`. Никаких failing-checks в PR.
10. **Никаких placeholder'ов вроде `// TODO: implement`** в production-коде. Если что-то не успели — выноси в отдельный issue, не оставляй в main.

---

## 2. Что трогать, что не трогать

### Удаляем целиком
- Папка `web/` (старый статический лендинг). Это дубликат, теперь всё живёт в `web-platform/`.

### Оставляем как есть
- `bot/main.py`, `bot/database/db.py` — каркас рабочий, **миграция SQLite → Postgres** делается отдельным шагом (см. фаза E).
- `bot/services/signal_generator.py` — рандом-генератор оставить, дополнить tier-фильтрами.
- `web-platform/prisma/schema.prisma` — оставить большинство моделей (`User`, `Signal`, `Review`, `Faq`, `BotTemplate`, `ActivityLog`, `AdminLog` — без изменений).

### Переделываем
- `web-platform/src/app/page.tsx` (лендинг) — полностью на новый дизайн.
- `web-platform/src/app/dashboard/**` — полностью переписать ЛК.
- `web-platform/src/app/admin/**` — переписать с добавлением страниц `po-accounts`, `postbacks`, `perks`.
- `web-platform/src/app/globals.css` — заменить токены на новые (см. §6.2 PRD v2).
- `web-platform/src/components/shared/Logo.tsx` — переделать с нуля.
- Все эмодзи в JSX → Lucide.

### Депрекейтим (НЕ дропаем таблицы, но не используем в API)
- `Subscription`, `Payment`, `PromoCode`. Оставляем миграции, в API роуты `/api/admin/promo`, `/api/promo/check` и страницу `/admin/promo` помечаем как deprecated и **скрываем из навигации** (но не удаляем — так чище для миграции).

### Добавляем
- Prisma модели: `PocketOptionAccount`, `Postback`, `BotPerk` (схемы — см. §7.1 PRD v2).
- Поле `User.tier Int @default(0)`.
- API endpoints (см. §7.2 PRD v2).
- Дизайн-система: компоненты `Button`, `Card`, `Modal`, `Toast`, `Tooltip`, `Skeleton`, `TierBadge`, `AnimatedBackground`, `CustomCursor`, `Preloader`, `ScrollProgress`, `Logo` v2.
- Анимированный фон canvas (см. §6.3 PRD v2).

---

## 3. Фазы и порядок работ

> Каждая фаза = отдельная ветка `feat/phase-X-…` + PR. Не начинать фазу N+1 пока не смерджена N.

### Phase A — Foundation cleanup (1–2 дня)
1. `git rm -r web/`.
2. Создать `migrations/cleanup_subscription_ui` — НЕ дропать таблицы, только убрать UI/API роуты подписок (страницы `/pricing`, `/api/promo/check`, и т. д. — отдать 410 Gone или редиректить).
3. Добавить новые модели в Prisma: `PocketOptionAccount`, `Postback`, `BotPerk`. Поле `User.tier`.
4. Сгенерить и проверить миграцию: `npx prisma migrate dev --name v2_po_referral_model`.
5. Обновить README с инструкцией нового запуска (Postgres вместо SQLite).
6. **Acceptance:** проект собирается, все существующие страницы открываются (даже с deprecated UI), новая schema deployed.

### Phase B — Design system v2 (3–4 дня)
1. Обновить `globals.css` с новыми токенами (см. §6.2 PRD v2).
2. Создать `src/components/effects/` с компонентами:
   - `AnimatedBackground.tsx` — Canvas с орбитами, частицами, связями, grid.
   - `CustomCursor.tsx` — desktop-only, с hover-detection.
   - `Preloader.tsx` — 1.2с заставка с logo + progress bar.
   - `ScrollProgress.tsx` — top bar.
3. Создать `src/components/ui/` базовые: `Button`, `Card`, `Modal`, `Toast`, `Tooltip`, `Skeleton`, `TierBadge`, `Stat`. Использовать `cva` (уже в зависимостях) + Tailwind.
4. Переделать `Logo.tsx` (см. §6.5 PRD v2).
5. Создать `src/lib/icons.tsx` — **map старых эмодзи → Lucide** для миграции. Например:
   ```ts
   export const Icon = {
     Dashboard: Zap,
     Leads: Target,
     Signals: BarChart3,
     // …
   };
   ```
6. Storybook **не настраиваем** (overhead не оправдан) — вместо этого создать `/dev/components` страницу (видна только в `NODE_ENV=development`) с грид-демонстрацией всех компонентов.
7. **Acceptance:** анимированный фон работает на главной, кастомный курсор активен на desktop, preloader показывается 1.2с при первой загрузке, все компоненты задокументированы на `/dev/components`.

### Phase C — Pages v2 (3–4 дня)
1. **Лендинг `/`** — переписать `src/app/page.tsx` по структуре §8.1 PRD v2.
   - Все секции отдельными компонентами `src/app/(landing)/sections/*.tsx`.
   - Анимация появления — `framer-motion` (`whileInView`).
   - Live feed — реальный pull из `/api/signals` каждые 8 секунд.
2. **ЛК `/dashboard`** — переписать все страницы (`page.tsx`, `signals/`, `referrals/`, `profile/`, `history/`, добавить `pocket-option/`, `perks/`).
3. **Админка `/admin`** — переписать. Добавить новые страницы `po-accounts/`, `postbacks/`, `perks/`. Прежнюю `/admin/deposits` — слить с `po-accounts`.
4. Убрать всю Promo-страницу из nav.
5. Проверить мобильную адаптивность (lighthouse score ≥ 85 mobile).
6. **Acceptance:** все 3 секции (лендинг / ЛК / админка) выглядят как одно семейство, дизайн консистентен.

### Phase D — PocketOption integration (2–3 дня)
1. Реализовать endpoint `POST /api/postback/po`:
   - Принимает 5 типов событий (`registration`, `email_confirm`, `ftd`, `redeposit`, `commission`).
   - Сохраняет raw в `Postback`.
   - Создаёт/обновляет `PocketOptionAccount`.
   - Если событие — `ftd` или `redeposit`: создаёт `Deposit` + обновляет `User.depositTotal` + пересчитывает `User.tier`.
   - Защита: query-параметр `?token=…` (значение из env `PO_POSTBACK_TOKEN`), плюс whitelist IP (env `PO_POSTBACK_IPS`, comma-separated).
2. Endpoint `POST /api/po/submit-id` — лид присылает trader_id, ищем в `Postback` по `poTraderId`, если match — auto-verify; иначе `pending`.
3. Endpoint `GET /api/po/link` — возвращает реф-ссылку с `click_id={userId}`.
4. Endpoint `GET /api/me/tier` — текущий статус для UI.
5. Endpoint `GET /api/bot/access-check?telegramId=…` — для бота.
6. Сидинг базовых перков в `BotPerk` через `prisma db seed`.
7. Логика `recomputeTier(userId)` — extracted в `src/lib/tier.ts`.
8. **Acceptance:** руками отправил тестовый POST на `/api/postback/po` с payload-ом ftd → в БД создался `Postback` + `PocketOptionAccount` + `Deposit` + `User.tier` обновился. Тест в `tests/postback.test.ts`.

### Phase E — Bot v2 (2–3 дня)
1. Подключить `asyncpg` к боту, перевести его на общий Postgres (миграция данных из SQLite — отдельный скрипт `scripts/migrate_sqlite_to_pg.py`).
2. Реализовать FSM-онбординг (см. §9.2 PRD v2). Использовать `aiogram.fsm.state.State`.
3. Перед каждой выдачей сигнала — звонок в `GET /api/bot/access-check?telegramId=…`.
4. Daily limit — реализовать через таблицу `BotMessage` (counter за день, уже в схеме) или Redis (если решим добавить).
5. Tier-aware фильтр сигналов (T1 → только OTC, T3+ → плюс Elite).
6. Кнопки в боте: «Сигнал сейчас», «Мои перки», «Реф-ссылка», «PocketOption аккаунт», «Настройки».
7. **Acceptance:** новый юзер делает /start → онбординг → привязал PO → tier обновился → бот выдаёт сигнал согласно tier. Прокатать сценарий в Telegram-тест-канале.

### Phase F — Polish + Deploy (1–2 дня)
1. Юнит-тесты на critical paths: `recomputeTier`, postback parsing, access-check.
2. E2E-проверка из browser (Devin testing mode после создания PR — только если пользователь явно попросит).
3. Обновить `docker-compose.yml` (добавить Caddy, env-файлы).
4. Дисклеймер на каждой странице (footer) + в `/start` бота.
5. README обновить.
6. **Acceptance:** `docker-compose up -d` поднимает 4 сервиса, сайт доступен по https, бот отвечает.

### Phase G (опционально, после апрува заказчика)
- Real-time графики через `pocketoptionapi_async` — отдельная служба `chart-worker/`, генерит PNG, постит в админку, админ может прикрепить к сигналу. **Не делать без явного «да» от пользователя**.

---

## 4. Стиль кода

### TypeScript / React
- **Server Components by default**. Client components — только когда нужны hooks/animation (`"use client"` обязательно в первой строке).
- Никаких `any`, `as`, `getattr`-аналогов. Если не понимаешь тип — сходи в Prisma generated types.
- Файл-структура: `src/app/(public)/`, `src/app/(authed)/dashboard/`, `src/app/(authed)/admin/` — route groups. **Не вкладывать слишком глубоко.**
- Компоненты: одна папка на сложный компонент с `index.tsx + types.ts + variants.ts`.
- Утилиты: `src/lib/` — только pure functions; `src/lib/server/` — server-only (с `import "server-only"` в начале).
- Tailwind: **только utility-классы**, никаких новых `.custom-css` за пределами `globals.css`. Сложные паттерны — в `tailwind.config.ts` как plugins или `cva` варианты.
- `framer-motion` использовать **умеренно** — анимации появления при скролле, hover, переходы между страницами. Не делать «чтобы было», а только там, где улучшает воспринимаемое качество.

### Python (бот)
- Type hints везде, ruff-clean, `pathlib.Path` вместо строк.
- `aiogram 3` async-only.
- Конфиги через `pydantic-settings`, не `os.environ` напрямую.
- Один FSM-state в одном файле: `bot/states/onboarding.py` и т. п.
- Тесты на handler через `aiogram.tests.utils`.

### SQL / Prisma
- **Никаких raw SQL** в API-роутах. Только через Prisma.
- Миграции называем читаемо: `add_po_account_model`, `index_postback_received_at`.
- Не делать `prisma db push` в production — только `prisma migrate deploy`.

### Git
- Branch naming: `feat/phase-A-cleanup`, `fix/admin-leads-pagination`, `chore/deps-update`.
- Commits: атомарные, на английском, conventional commits (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`).
- PR заголовок = название фичи на английском, тело PR на русском (краткое summary + чек-лист по acceptance criteria из этого документа).
- Один PR — одна фаза. Не смешивать дизайн-систему с PocketOption.

---

## 5. Чего НЕ делать (антипаттерны, на которые часто валятся агенты)

1. **Не использовать UI-библиотеки типа Ant Design / Chakra / Material.** Только Tailwind + Radix (Radix уже стоит — `@radix-ui/react-dialog`, `react-tabs` и т. д.).
2. **Не пытаться всё переделать одним PR.** Если PR > 1500 строк диффа — это плохой PR.
3. **Не использовать `useEffect` для fetch'а** — это Next.js 16, есть Server Components и Server Actions. Fetch на сервере, передавай data через props.
4. **Не писать «казино-стиль» CSS:** `box-shadow: 0 0 50px gold; border: 3px solid gold; text-shadow: …;` всё одновременно — нет. Сдержанность важна.
5. **Не описывать в коде «добавил поле X для фичи Y»** — комментарии не должны объяснять диф. Объяснение — в PR description.
6. **Не пушить в master/main напрямую.** Всегда через PR + ревью.
7. **Не использовать `sudo` в git-командах.**
8. **Не запускать npm install / prisma migrate без проверки**, что попадаешь в правильную папку.
9. **Не «починить» CI пропуском тестов** (`--no-verify`, `it.skip()`). Чини настоящую проблему.

---

## 6. Тест-план (Acceptance Tests)

После всех фаз должно проходить:

| # | Сценарий | Ожидаемый результат |
|---|---|---|
| 1 | Захожу на главную desktop | Preloader 1.2с → лендинг с анимированным фоном, кастомный курсор работает |
| 2 | Захожу с iPhone | Preloader не показывается, кастомный курсор отключен, анимация фона упрощена; макет адаптирован |
| 3 | Регистрируюсь email + password | Создан User, redirect в `/dashboard`, видно tier=0 + баннер «привяжи PO» |
| 4 | Жму «Получить реф-ссылку» в ЛК | Получаю `https://po.cash/...?click_id={my_user_id}`, копируется в буфер |
| 5 | Имитирую postback `registration` с этим click_id | Создан `PocketOptionAccount(status=verified)`, в ЛК статус «✓ привязан» |
| 6 | Имитирую postback `ftd` $100 | Создан `Deposit`, `User.depositTotal=100`, `User.tier=2`, в ЛК разблокированы T1+T2 перки |
| 7 | Имитирую postback `ftd` $2500 | tier=4, разблокированы все перки, баннер VIP |
| 8 | Иду в Telegram-бот, /start | Видит, что я tier 4, выдаёт расширенный набор сигналов |
| 9 | Админ заходит в `/admin/postbacks` | Видит все 3 postback'а из теста с raw payload |
| 10 | Админ создаёт сигнал вручную в `/admin/signals` | Сигнал распыляется по всем юзерам с tier ≥ 1 в боте |
| 11 | Реферал моего юзера сделал FTD | У моего юзера в ЛК добавлен бонус-перк, в боте daily_limit повысился |
| 12 | `npm run lint` + `ruff check bot/` | Чисто, 0 ошибок, 0 warnings |
| 13 | `docker-compose up -d` на чистом VPS | 4 сервиса поднялись, сайт по https открывается, бот отвечает |

---

## 7. Open questions (НЕ принимать решения молча)

Если упираешься в любой из этих вопросов — спрашивай у пользователя, **не угадывай**:

1. План в PocketOption Partner: RevShare или CPA?
2. Финальные пороги tier'ов ($50 / $500 / $2000) — или другие?
3. Sub-affiliate (5%) — нужен в этой итерации?
4. Telegram OAuth для регистрации — добавить или только email/password?
5. Язык интерфейса — только русский?
6. Real-time графики через неофициальный PO-API — делать в Phase G?
7. T1 ($0 депозит, привязан): даём ли вообще сигналы или только промо?
8. Цвет акцента: оставляем `#f5c518` или подобрать другой gold?

---

## 8. Контакты / эскалация

- Заказчик отвечает в Telegram / Devin.
- Все архитектурные решения, выходящие за рамки этого документа, → **эскалация заказчику**.
- Ничего не «допиливаем тихо» — всё в PR description.

---

## 9. Готовность к старту

Перед первым коммитом убедись, что:
- [ ] Прочитал этот документ + `02_PRD_v2.md` + `web-platform/AGENTS.md` + текущий `docs/PRD.md`.
- [ ] Запустил локально текущий `web-platform/` (`npm install && npm run dev`) — открылся ли он?
- [ ] Запустил локально `bot/` с тестовым токеном — отвечает ли на `/start`?
- [ ] Получил от пользователя ответы на open questions из §7 (или явное «решай сам»).
- [ ] Создал git-ветку `feat/phase-A-cleanup` и пишешь в неё.

Если хоть один пункт не выполнен — не пишешь код. Уточняй.
