import asyncio
import logging
import os
import sys
from pathlib import Path

from aiogram import Bot, Dispatcher
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode

from config import settings
from database.db import init_db
from handlers import admin, link, menu, onboarding, signals, start, stats
from services.scheduler import daily_brief_loop, signal_loop
from services.tier_sync import tier_sync_loop
from services.web_sync import web_sync_loop

logging.basicConfig(
    level=getattr(logging, settings.log_level.upper(), logging.INFO),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    stream=sys.stdout,
)
logger = logging.getLogger(__name__)

PID_FILE = Path("data/bot.pid")


def check_single_instance() -> None:
    """Ensure only one bot instance is running via PID file."""
    PID_FILE.parent.mkdir(parents=True, exist_ok=True)
    if PID_FILE.exists():
        old_pid = PID_FILE.read_text().strip()
        try:
            pid = int(old_pid)
            # On Windows os.kill(pid, 0) raises OSError if process doesn't exist
            os.kill(pid, 0)
            logger.error(
                "Another bot instance is already running (PID %s). "
                "Stop it first or delete %s if it's stale.",
                pid,
                PID_FILE,
            )
            sys.exit(1)
        except (OSError, ValueError):
            # Process not running — stale PID file, safe to overwrite
            pass
    PID_FILE.write_text(str(os.getpid()))


async def main() -> None:
    check_single_instance()
    await init_db()

    bot = Bot(
        token=settings.bot_token,
        default=DefaultBotProperties(parse_mode=ParseMode.HTML),
    )
    dp = Dispatcher()

    # Order matters: specific command routers first, generic menu/text last.
    dp.include_router(admin.router)
    dp.include_router(start.router)
    dp.include_router(onboarding.router)
    dp.include_router(signals.router)
    dp.include_router(link.router)
    dp.include_router(stats.router)
    dp.include_router(menu.router)

    # Start background loops (signal cadence + tier-sync + daily brief +
    # web-sync to pull bot config & admin signals from the platform).
    loop_task = asyncio.create_task(signal_loop(bot))
    sync_task = asyncio.create_task(tier_sync_loop(bot))
    brief_task = asyncio.create_task(daily_brief_loop(bot))
    web_sync_task = asyncio.create_task(web_sync_loop())

    # Drop any active webhook so polling works without conflict
    await bot.delete_webhook(drop_pending_updates=True)
    logger.info("Webhook cleared. Bot starting (polling mode), PID=%s", os.getpid())
    try:
        await dp.start_polling(bot)
    finally:
        loop_task.cancel()
        sync_task.cancel()
        brief_task.cancel()
        web_sync_task.cancel()
        await bot.session.close()
        if PID_FILE.exists():
            PID_FILE.unlink()


if __name__ == "__main__":
    asyncio.run(main())
