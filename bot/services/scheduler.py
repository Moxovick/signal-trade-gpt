import asyncio
import logging
from datetime import datetime, timezone

from aiogram import Bot

from aiogram.types import LinkPreviewOptions

from config import settings
from database.db import save_signal
from services.signal_generator import generate_signal, random_interval_seconds
from services.formatter import format_signal

logger = logging.getLogger(__name__)


def _is_working_hours() -> bool:
    now_utc = datetime.now(timezone.utc)
    return settings.working_hours_start <= now_utc.hour < settings.working_hours_end


async def signal_loop(bot: Bot) -> None:
    logger.info("Signal loop started")
    while True:
        interval = random_interval_seconds(
            settings.signal_interval_min, settings.signal_interval_max
        )
        await asyncio.sleep(interval)

        if not _is_working_hours():
            logger.debug("Outside working hours, skipping signal")
            continue

        try:
            signal = generate_signal()
            await save_signal(signal)

            message = format_signal(signal, settings.pocket_option_url)
            await bot.send_message(
                chat_id=settings.channel_id,
                text=message,
                link_preview=LinkPreviewOptions(is_disabled=True),
            )
            logger.info(
                "Signal sent: %s %s exp=%s conf=%d%%",
                signal.pair,
                signal.direction,
                signal.expiration,
                signal.confidence,
            )
        except Exception:
            logger.exception("Failed to send signal")
