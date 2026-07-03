# PocketOption overhaul — upload pack (v6d)

Базовая ветка: `devin/1777461956-rebuild-v2` (от `3ab6a0d`).
Эта папка содержит **32 изменённых файла** после v6c, разбитых на
**10 логических коммитов**. Структура папки 1:1 повторяет дерево репо
— просто перетащи всё в репо/PR-ветку.

## Как залить

1. В GitHub UI открой `signal-trade-gpt` → **Branches** → создай новую
   ветку (например `devin/po-overhaul-v6d`) от
   `devin/1777461956-rebuild-v2`.
2. На этой ветке: **Add file → Upload files** → перетащи всё содержимое
   из этой папки (включая подкаталоги `web-platform/...`, `bot/...`).
3. Жми «Commit changes». Если хочешь чище — можешь грузить по
   подсистемам (см. список коммитов ниже).
4. Открой PR `devin/po-overhaul-v6d` → `devin/1777461956-rebuild-v2`.
5. После мерджа на проде один раз:
   ```bash
   npx prisma migrate deploy
   ```
   (выкатит миграцию `20260518091522_v6c_postback_macros`).
6. Зайди в админку:
   - `/admin/settings/po-api` → впиши **Partner ID**, проверь токен
     кнопкой «Проверить трейдера».
   - `/admin/postbacks/setup` → сгенерируй секрет, скопируй 6 готовых
     URL и вставь в PocketOption Partners (Global postback или
     Campaign-level).

## Локальный путь (если предпочтёшь патчем)

```bash
git checkout devin/1777461956-rebuild-v2
git checkout -b devin/po-overhaul-v6d
# скопируй файлы из этой папки поверх репо
git add -A
git commit -m "feat(po): overhaul v6d — postbacks, tier, UI"
git push -u origin devin/po-overhaul-v6d
```

## Что внутри (логически — 10 коммитов)

### v6c base (уже в твоей предыдущей выгрузке)
1. **feat(po): GET-postback support, secret/api creds via DB with env fallback**
   - `web-platform/prisma/schema.prisma`
   - `web-platform/prisma/migrations/20260518091522_v6c_postback_macros/migration.sql`
   - `web-platform/src/app/api/po/postback/route.ts`
   - `web-platform/src/lib/po-config.ts`
   - `web-platform/src/lib/po-api.ts`
   - `web-platform/src/lib/pocketoption.ts`
2. **feat(admin): PO config UI — postbacks setup + API creds pages**
   - `web-platform/src/app/admin/postbacks/setup/page.tsx`
   - `web-platform/src/app/admin/postbacks/setup/_components/PostbackSetupClient.tsx`
   - `web-platform/src/app/admin/settings/po-api/page.tsx`
   - `web-platform/src/app/admin/settings/po-api/_components/PoApiForm.tsx`
   - `web-platform/src/app/api/admin/po-config/route.ts`
   - `web-platform/src/app/api/admin/po-config/rotate-secret/route.ts`
   - `web-platform/src/app/api/admin/po-config/test-trader/route.ts`
3. **feat(tier): T0 = unlimited OTC (drop demo/3-per-day caps)**
   - `bot/handlers/signals.py`, `bot/handlers/start.py`,
     `bot/handlers/link.py`, `bot/handlers/onboarding.py`,
     `bot/services/formatter.py`
   - `web-platform/src/lib/access.ts`
4. **feat(ui): unlimited-OTC copy + personal referral link on onboarding**
   - `web-platform/src/app/page.tsx`,
     `web-platform/src/app/how-it-works/page.tsx`,
     `web-platform/src/app/onboarding/po-id/page.tsx`

### v6d delta (новое в этой выгрузке)
5. **feat(admin): grouped sidebar with active link + unmatched badge**
   - `web-platform/src/app/admin/_components/AdminSidebar.tsx`
   - `web-platform/src/app/admin/layout.tsx`
6. **fix(admin): never leak/overwrite PO api token**
   - `web-platform/src/app/admin/settings/po-api/page.tsx`
   - `web-platform/src/app/admin/settings/po-api/_components/PoApiForm.tsx`
   - `web-platform/src/app/api/admin/po-config/route.ts`
7. **fix(postback): don't downgrade verified PO accounts on out-of-order
   registration**
   - `web-platform/src/lib/pocketoption.ts`
8. **feat(dashboard): premium tier hero + locked-signal upsell**
   - `web-platform/src/app/dashboard/signals/_components/TierHero.tsx`
   - `web-platform/src/app/dashboard/signals/page.tsx`
9. **feat(admin): PocketOption funnel widget on overview**
   - `web-platform/src/app/admin/page.tsx`
10. **feat(admin): manual-bind UI for unmatched postbacks**
    - `web-platform/src/app/admin/postbacks/page.tsx`
    - `web-platform/src/app/admin/postbacks/_components/BindUnmatched.tsx`
    - `web-platform/src/app/api/admin/postbacks/[id]/bind/route.ts`
    - `web-platform/src/app/api/admin/users/search/route.ts`

## Что в боте поменялось

- `signals.py` — снят `T0_LIFETIME_DEMO_LIMIT = 2`, T0 видит band `otc`
  без daily-кэпа.
- `start.py` / `link.py` / `onboarding.py` / `formatter.py` —
  обновлены тексты приветствия/витрины: «безлим OTC» вместо
  «2 пробных сигнала».

## Что меняется для админа после мерджа

- **`/admin`** — сверху виджет воронки: Лиды → Регистрация PO →
  Email confirm → FTD → Pro. Каждый шаг показывает количество и
  конверсию от предыдущего шага.
- **Сайдбар** сгруппирован: «Главное / PocketOption / Контент /
  Системное». Активный пункт подсвечен золотом. Рядом с «Postbacks»
  бейдж с числом непривязанных постбэков.
- **`/admin/postbacks`** — у непривязанных строк под основной
  строкой раскрывается мини-форма: поиск юзера по username/email/имени,
  опциональный override trader_id, кнопка «Привязать». После
  привязки строка обновляется, юзеру пересчитывается тир, FTD/
  redeposit попадают в таблицу `Deposit`.
- **`/admin/settings/po-api`** — токен больше не утекает на клиент.
  Поле API-токена скрыто, показывает только маску (`tZbV…CQy`). Чтобы
  поменять — нажми «Изменить», впиши новый. Кнопка «Сохранить»
  ничего не сделает, если ты ничего не ввёл (раньше затирала токен
  маской — фикс).
- **`/dashboard/signals`** — сверху новый блок:
  бейдж тира + «Pro / Безлим OTC», твой PO Trader ID с копированием,
  персональная реф-ссылка с копированием, прогресс-бар «$X / $20 до
  Pro» для T0. У T0 видны все сигналы — но non-OTC заблокированы
  (lock-иконка, размытое название, диагональная штриховка confidence
  bar, CTA «Открыть» вместо результата).

## Локальные проверки

Перед заливкой я гонял на этой ветке:
- `npm run lint` — clean
- `npx tsc --noEmit` — clean
- Миграция уже была применена ранее в v6c.

## Env / fallbacks (без изменений)

Все секреты (`POCKETOPTION_API_TOKEN`, `POCKETOPTION_PARTNER_ID`,
`POCKETOPTION_POSTBACK_SECRET`) теперь читаются из `SiteSettings` в БД
**в первую очередь**, а если пусто — из `.env`. То есть твой текущий
`.env` ничего не ломает; просто после деплоя имеет смысл задать
`partner_id` через UI (в env он у тебя пустой).
