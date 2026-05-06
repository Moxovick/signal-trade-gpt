# v4-accounts (без прокси/VPN) — как применить

Из этого ZIP убраны все файлы про прокси и VPN. Если ты раньше применял
`v4-accounts-MAX.zip`, дополнительно нужно удалить старые proxy-файлы
вручную (см. секцию «Если ставил v4-accounts-MAX до этого» ниже).

## Применить с нуля (чистый вариант)

```powershell
cd "C:\Users\Den\Desktop\LASTOFUS\Signal Trade GPT\1\signal-trade-gpt-"

# 1) Распаковать ZIP поверх репо
Expand-Archive -Path "v4-accounts-NO-PROXY.zip" -DestinationPath . -Force

# 2) Прогнать миграцию БД (ВАЖНО — иначе фичи не поедут)
cd web-platform
npx prisma migrate deploy
npx prisma generate
cd ..

# 3) Закоммитить и запушить
git add web-platform
git commit -m "feat(v4-accounts): settings hub, security, preferences, achievements, public profile"
git push
```

## Если ставил v4-accounts-MAX до этого

Удали старые proxy/VPN файлы перед коммитом:

```powershell
cd "C:\Users\Den\Desktop\LASTOFUS\Signal Trade GPT\1\signal-trade-gpt-"

# 1) Удалить proxy/VPN директории и файлы
Remove-Item -Recurse -Force web-platform\src\app\admin\proxy -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force web-platform\src\app\dashboard\settings\proxy -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force web-platform\src\app\api\admin\proxy -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force web-platform\src\app\api\admin\po-mirrors -ErrorAction SilentlyContinue
Remove-Item -Force web-platform\src\lib\proxy-recommendations.ts -ErrorAction SilentlyContinue
Remove-Item -Force web-platform\src\lib\po-mirrors.ts -ErrorAction SilentlyContinue

# 2) Распаковать новый ZIP поверх (он перезапишет admin/layout.tsx,
#    SettingsSidebar.tsx и settings/pocketoption/page.tsx — там убраны
#    ссылки на удалённые страницы)
Expand-Archive -Path "v4-accounts-NO-PROXY.zip" -DestinationPath . -Force

# 3) Миграция (если ещё не делал)
cd web-platform
npx prisma migrate deploy
npx prisma generate
cd ..

# 4) Коммит + push
git add -A web-platform
git commit -m "feat(v4-accounts): remove proxy/VPN, keep account hub"
git push
```

## Что внутри (42 файла)

**Кабинет / settings:**
- `/dashboard/settings` — хаб с боковой навигацией
- → Внешний вид: тема (свет/тёмн/системная), язык, таймзон
- → Уведомления: матрица событий × каналов (email / TG / браузер)
- → Безопасность: смена пароля, 2FA-email toggle, журнал входов
- → PocketOption: ID, статус, история депозитов, оценочный P&L
- → Достижения: streak + 10 бейджей, разблокируются автоматически
- → Рефералы (линк в существующую страницу)

**Профиль:** аватар (URL → Gravatar → инициалы), статус email + OTP-верификация,
редактирование ника / TG / аватара.

**Публичный профиль:** `/u/:username` — тир, число сигналов, рефералов, достижения.

**Админка:**
- `/admin/achievements` — каталог + счётчики, кнопка «пересеять»
- `/dashboard/leaderboard` — фильтры «период + тир»

**Бэкенд:**
- API `/api/account/{preferences,password,email/*}`
- API `/api/admin/achievements/reseed`
- `/api/cron/seed-content` — идемпотентный сид каталога достижений
- NextAuth теперь пишет `login_ok / login_fail` в `LoginEvent`
- Dashboard при каждой загрузке: `touchStreak` + `checkAndUnlockAchievements`
  (тихо, ошибки игнорятся)
- Email через Resend (если нет `RESEND_API_KEY` — пишет в лог, фичи работают)

## Если хочешь реальные письма

В Vercel env добавь:
- `RESEND_API_KEY` (из resend.com)
- `EMAIL_FROM` = `Signal Trade GPT <no-reply@твой-домен>`

Без них всё работает, но OTP-коды пишутся в логи Vercel
(Functions → logs).
