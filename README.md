# Signal Trade GPT

Premium platform for AI-powered trading signals delivery via Telegram bot and landing website.

## Project Structure

```
signal-trade-gpt/
├── CLAUDE.md              # Instructions for Claude Code
├── docs/
│   ├── PRD.md             # Full Product Requirements Document
│   └── reference-landing.html  # Design reference (original HTML)
├── bot/                   # Telegram bot (Python + aiogram 3)
│   ├── main.py            # Entry point
│   ├── config.py          # Configuration from .env
│   ├── handlers/          # Command handlers
│   ├── services/          # Business logic
│   ├── database/          # SQLite models and connection
│   ├── requirements.txt   # Python dependencies
│   ├── Dockerfile
│   └── .env.example       # Required environment variables
├── web/                   # Landing website (static HTML/CSS/JS)
│   ├── index.html
│   ├── css/style.css
│   ├── js/main.js
│   └── assets/
├── docker-compose.yml
└── .gitignore
```

## Quick Start

### Prerequisites
- Python 3.11+
- Telegram bot token (create via [@BotFather](https://t.me/BotFather))

### Bot Setup

```bash
cd bot
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Configure
cp .env.example .env
# Edit .env — add your BOT_TOKEN and CHANNEL_ID

# Run
python main.py
```

### Website

```bash
# Just open in browser
open web/index.html

# Or serve locally
cd web && python -m http.server 8080
```

### Docker

```bash
docker-compose up -d
```

## Development Phases

- **Phase 1 (MVP):** Telegram bot with random signals + static landing page
- **Phase 2:** Full web platform (Next.js) with auth, dashboard, admin panel
- **Phase 3:** Crypto payments, advanced analytics, scaling

See `docs/PRD.md` for full details.

## Tech Stack (MVP)

| Component | Technology |
|-----------|-----------|
| Bot | Python 3.11 + aiogram 3.x |
| Database | SQLite |
| Scheduler | APScheduler |
| Website | HTML/CSS/JS (vanilla) |
| Hosting | VPS / Docker |

## License

Private — All rights reserved.
