# Signal Trade GPT — Instructions for Claude Code

## Project Overview

Signal Trade GPT — premium platform for delivering trading signals for binary options (Pocket Option).
Two components: Telegram bot + Landing website.

**Full PRD:** `docs/PRD.md` — read it first before any work.

---

## Current Phase: Phase 1 — MVP

Focus on two deliverables:

### 1. Telegram Bot (`bot/`)
- **Stack:** Python 3.11+, aiogram 3.x, SQLite (aiosqlite), APScheduler
- **Core feature:** Auto-generate random trading signals every 5-15 minutes and send to a Telegram channel/group
- **Signal format:** Currency pair, direction (CALL/PUT), expiration, AI confidence %
- **Additional:** /start command, user registration, referral codes, stats command
- **Config:** All settings via `.env` file (bot token, channel ID, intervals)

### 2. Landing Website (`web/`)
- **Stack:** Static HTML/CSS/JS (single page, no framework)
- **Design:** Dark theme, red accent (#e53030), green for positive (#00e5a0)
- **Fonts:** Bebas Neue (headings), Manrope (body), JetBrains Mono (data/numbers)
- **Sections:** Hero, Ticker, How It Works, Stats, Pricing, Reviews, FAQ, Footer
- **CTA:** All buttons lead to the Telegram bot
- **Base file:** Reference `docs/reference-landing.html` for design inspiration (DO NOT copy it as-is, build clean modular code)

---

## Code Conventions

### General
- **Code language:** English (variables, functions, comments, commits)
- **Interface language:** Russian (all user-facing text in bot messages and website)
- **Commits:** Atomic, descriptive, in English. Format: `feat: add signal generator`, `fix: correct ticker animation`
- **No secrets in code.** Use `.env` files. Reference `.env.example` for required variables.

### Python (Bot)
- Python 3.11+
- Type hints everywhere
- Async/await (aiogram 3 is fully async)
- Use `pathlib.Path` for file paths
- Use `pydantic` or `dataclasses` for data models
- Logging via `loguru` or stdlib `logging`
- Format with `ruff` (line length 100)
- Structure:
  ```
  bot/
  ├── main.py              # Entry point, bot startup
  ├── config.py            # Settings from .env (using pydantic-settings or os.environ)
  ├── handlers/
  │   ├── __init__.py
  │   ├── start.py         # /start, /help commands
  │   ├── signals.py       # Signal-related commands
  │   └── stats.py         # /stats, /mystats commands
  ├── services/
  │   ├── __init__.py
  │   ├── signal_generator.py  # Random signal generation logic
  │   ├── scheduler.py        # APScheduler setup, periodic signal sending
  │   └── formatter.py        # Format signal messages with emoji
  ├── database/
  │   ├── __init__.py
  │   ├── models.py        # SQLite models (users, signals)
  │   └── db.py            # Database connection and init
  ├── requirements.txt
  ├── Dockerfile
  └── .env.example
  ```

### HTML/CSS/JS (Website)
- Semantic HTML5
- CSS custom properties (variables) for theming
- Vanilla JS (no jQuery, no frameworks for MVP)
- Mobile-first responsive design
- Smooth scroll-reveal animations (IntersectionObserver)
- Structure:
  ```
  web/
  ├── index.html
  ├── css/
  │   └── style.css
  ├── js/
  │   └── main.js
  └── assets/
      └── (images, icons if needed)
  ```

---

## Signal Generation (MVP — Random)

Currency pairs pool:
```
EUR/USD, GBP/USD, USD/JPY, AUD/USD, EUR/GBP,
GBP/JPY, USD/CHF, NZD/USD, EUR/JPY, AUD/JPY,
USD/CAD, EUR/AUD
```

Rules:
- Direction: random CALL or PUT (50/50)
- Confidence: random integer 73-96
- Expiration: random from [30s, 1m, 2m, 5m]
- Interval: random 5-15 minutes between signals
- Working hours: 08:00 - 22:00 UTC only (when markets are active)
- Free users: 3-5 signals/day
- Premium users: 15-25 signals/day (future)

Message template:
```
🔴 SIGNAL TRADE GPT

📊 Пара: {pair}
📈 Направление: {direction} {arrow}
⏱ Экспирация: {expiration}
🤖 AI Confidence: {confidence}%
📡 Тип: AI Neural Analysis

━━━━━━━━━━━━━━━
⚡ Рекомендуемый объём: 1-3% депозита
🔗 Открыть Pocket Option →

#signal #{pair_tag} #{direction_tag}
```

---

## Database Schema (MVP — SQLite)

```sql
CREATE TABLE users (
    telegram_id INTEGER PRIMARY KEY,
    username TEXT,
    first_name TEXT,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    referral_code TEXT UNIQUE NOT NULL,
    referred_by INTEGER REFERENCES users(telegram_id),
    is_premium BOOLEAN DEFAULT FALSE,
    signals_received INTEGER DEFAULT 0
);

CREATE TABLE signals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pair TEXT NOT NULL,
    direction TEXT NOT NULL CHECK(direction IN ('CALL', 'PUT')),
    expiration TEXT NOT NULL,
    confidence INTEGER NOT NULL,
    signal_type TEXT DEFAULT 'ai',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    result TEXT CHECK(result IN ('win', 'loss', 'pending'))
);
```

---

## Pricing Tiers (for landing page)

| | Free | Premium | VIP |
|--|------|---------|-----|
| Price | $0 | $29/mo | $79/mo |
| Signals/day | 3-5 | 15-25 | Unlimited |
| Pairs | 4 major | All | All + exotic |
| Support | — | Email | Priority 24/7 |

---

## Mandatory Disclaimer

Add to BOTH bot and website:

> "Signal Trade GPT не является финансовым советником. Все сигналы предоставляются в информационных целях. Торговля бинарными опционами сопряжена с высоким риском потери средств. Прошлые результаты не гарантируют будущей доходности."

---

## Task Order (suggested)

1. **Bot first:** `bot/` — get it working locally with a test token
2. **Website second:** `web/` — build the landing page
3. **Docker:** Dockerfile for bot + docker-compose.yml
4. **README:** Update with setup instructions

---

## Testing

- Bot: Test with a real Telegram bot (create via @BotFather)
- Website: Open `web/index.html` in browser, check mobile responsiveness
- Run `ruff check bot/` for Python linting
- No unit tests required for MVP, but structure code to be testable

---

## Do NOT

- Do NOT use frameworks for the landing page (no React, no Vue — plain HTML/CSS/JS)
- Do NOT hardcode the bot token — always use .env
- Do NOT generate real trading signals — everything is random for MVP
- Do NOT add payment processing — just show pricing cards on the landing
- Do NOT create an admin panel — that's Phase 2
- Do NOT create user authentication on the website — that's Phase 2
- Do NOT use Ant Design or any heavy UI library for MVP
