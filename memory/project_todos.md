---
name: Project TODOs
description: Backlog of phases not yet implemented — bot Postgres, TMA, charts, Email OTP
type: project
---

Pending phases (as of 2026-05-20):

**Email OTP** — infrastructure exists (EmailOtp model, send-verify endpoint) but not wired into all auth flows. Low priority for now, remember to do later.

**Why:** MVP uses Telegram login; OTP needed for email-only users.
**How to apply:** Don't touch auth flows until user asks for it specifically.

---

**Bot → Postgres migration (Phase E)** — bot currently uses SQLite (aiosqlite). Need to migrate to Postgres so there's a single DB. Must not break anything during migration.

**Why:** Single source of truth, easier ops. SQLite is dev-only.
**How to apply:** When user asks, migrate bot/database/db.py + models.py to asyncpg/Prisma-compatible Postgres. Keep SQLite as fallback until proven stable.

---

**TMA (Telegram Mini App) — HIGH PRIORITY** — routes exist at /tma/*, structure in place, but UX is minimal. Most users will use the bot as a Mini App.

**Why:** User expects the bot to work well as both a Mini App AND regular bot.
**How to apply:** When working on TMA, treat it as a primary interface, not secondary. Full signal display, tier info, PO linking should all work in TMA.

---

**Real-time charts** — Only needed when doing signal charts for NON-OTC pairs. Chipa API is wired partially. OTC signals don't need charts.

**Why:** OTC is random/synthetic; exchange signals can show real candlestick data.
**How to apply:** Don't implement charts for OTC signals. Only add when working on exchange-tier signals.
