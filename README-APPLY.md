# v5-signals-and-miniapp — apply guide

This bundle adds the **Asset whitelist + OTC vs real-market signals**
infrastructure and the **Telegram Mini App** at `/tma`.

It includes everything from the previous **v4-accounts-NO-PROXY** drop, so
applying this on top of a fresh checkout is enough — you do not need to
apply v4 first.

## Apply

```powershell
cd "C:\Users\Den\Desktop\LASTOFUS\Signal Trade GPT\1\signal-trade-gpt-"

# 1. Unpack on top
Expand-Archive -Path "v5-signals-and-miniapp.zip" -DestinationPath . -Force

# 2. Web — DB migrations + Prisma client
cd web-platform
npx prisma migrate deploy
npx prisma generate
cd ..

# 3. Bot — pip install (only one new aiogram type used; nothing new in requirements)
#    No bot DB migration needed.

# 4. Commit + push
git add bot web-platform
git commit -m "feat(v5): asset whitelist, OTC/real signals split, telegram mini app"
git push
```

## What's new

### Web
- **`Asset` model + 137 PocketOption pairs** (currencies, crypto, commodities,
  stocks, indices), all with payout %, OTC flag, signal-tier mapping, and
  market-data provider (binance / twelvedata / none).
- `/admin/assets` — full CRUD editor with search, category filter, reseed.
- Signal-publisher form: dropdown of active assets (no more free-text typos),
  payout % shown next to each pair, `Signal.tier` auto-fills from the asset.
- `/api/assets` — public endpoint consumed by the live feed and the Mini App
  to render OTC badges + payout % chips on signal cards.
- `/api/market/candles` now picks the data provider per-asset:
  - `binance` — public REST klines (no key needed, crypto)
  - `twelvedata` — set `TWELVEDATA_API_KEY` in Vercel for FX / commodities /
    indices / stocks
  - synthetic fallback if neither is reachable (badge: `demo`)
- **Telegram Mini App** at `/tma`:
  - `/tma` — Home: live signal feed (OTC text-only, real with chart preview)
  - `/tma/signal/[id]` — full card; non-OTC signals show an interactive
    chart with the entry-price reference line
  - `/tma/profile` — tier, deposit, streak, PO ID, ref code with copy
  - `/tma/leaders` — leaderboard
  - Bottom navigation, gold/dark site theme, Telegram WebApp SDK auto-init
  - Auth via `Telegram.WebApp.initData` HMAC verification
    (header `X-Telegram-Init-Data`)
  - Onboarding: if a Telegram user has no website account yet, the Mini App
    shows a "Зарегистрируйся на сайте сначала" CTA with `?from=tg` deep link

### Bot
- **OTC / demo signals: text-only** (no chart image) — both `/signal` and
  the channel scheduler. Real-market signals keep the rendered chart.
- New env var **`WEBAPP_URL`** (default
  `https://signal-trade-gpt.vercel.app/tma`).
- Welcome card now has a **"📱 Открыть приложение"** WebApp button.
- The bot also **sets the chat MenuButton** to launch the Mini App on
  startup (the blue button next to the input field).

## Required env

### Vercel (web)
- `TELEGRAM_LOGIN_BOT_TOKEN` — must be the same token the Mini App is
  served under, otherwise initData verification will fail.
- `TWELVEDATA_API_KEY` — optional, enables real candles for FX/commodities/
  stocks/indices.

### Bot (.env)
- `WEBAPP_URL` — the public URL of `/tma` on the web platform. Set to
  empty if you want to disable Mini App buttons.

## Verification checklist

- `/admin/assets` — 137 rows, edit/toggle/delete works, "Reseed" button
  reports `inserted: 0` after the first run.
- `/admin/signals` — Создать сигнал form: pair is a `<select>`, optgroup
  per category, payout % visible, choosing a pair auto-fills the tier
  band.
- `/api/assets` — returns the active assets list (used by feed + Mini App).
- `/dashboard` live feed — OTC signals show an `OTC` badge and payout %,
  no chart; real signals show payout % and (in detail) a chart.
- Mini App: open `https://signal-trade-gpt.vercel.app/tma` directly in a
  browser → onboarding screen "Открой через Telegram". Open via the bot's
  MenuButton → real authenticated home feed.
- Bot `/signal` to a T1 user → text-only message (no image) for OTC.
- Bot `/signal` to a T2 user with a real-market signal → chart image.

## Known notes

- Mini App authentication uses `initData` on every request (header
  `X-Telegram-Init-Data`) instead of NextAuth cookies — Telegram's iframe
  doesn't reliably round-trip cookies across mini-app boundaries.
- The Mini App does not auto-create users. If a Telegram user has no web
  account, the onboarding screen sends them to `/register?from=tg`.
- After deploy, configure the Mini App in @BotFather → /mybots → Bot
  Settings → Configure Mini App → set the URL to
  `https://signal-trade-gpt.vercel.app/tma`. The bot itself already sets
  the MenuButton on startup, but BotFather config also enables the
  attachment-menu launch path.
