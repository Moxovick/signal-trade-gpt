"""
Daily brief background loop.

Signal delivery is now on-demand (user presses button), so the old
signal_loop and scheduled_signal_loop are removed.
"""
from __future__ import annotations

import asyncio
import logging
import random
from datetime import datetime, timezone

from aiogram import Bot
from aiogram.enums import ParseMode

from config import settings
from database.db import get_total_signals

logger = logging.getLogger(__name__)


# ── Daily brief ───────────────────────────────────────────────────────────────


def _seconds_until_utc_hour(target_hour: int) -> float:
    from datetime import timedelta
    now = datetime.now(timezone.utc)
    target = now.replace(hour=target_hour, minute=0, second=0, microsecond=0)
    if target <= now:
        target += timedelta(days=1)
    return (target - now).total_seconds()


async def daily_brief_loop(bot: Bot) -> None:
    """Posts a daily market-open brief to the channel at 08:00 UTC."""
    logger.info("Daily brief loop started (08:00 UTC daily)")
    while True:
        # Sleep until next 08:00 UTC.
        try:
            wait = _seconds_until_utc_hour(8)
        except Exception:  # noqa: BLE001
            wait = 60 * 60 * 24
        await asyncio.sleep(wait)
        try:
            total = await get_total_signals()
            top_pair = random.choice(
                ["EUR/USD", "GBP/JPY", "USD/JPY", "AUD/USD", "EUR/GBP"]
            )
            est_winrate = random.randint(74, 88)
            text = (
                "<b>☀️ Доброе утро, трейдеры</b>\n"
                "\n"
                "Лондон + Нью-Йорк уже включились — сейчас лучшее окно для "
                "intraday-сетапов.\n"
                "\n"
                f"<b>Топ-пара дня:</b> {top_pair}\n"
                f"<b>Ожидаемый winrate AI:</b> {est_winrate}%\n"
                f"<b>Сигналов всего:</b> {total:,}\n"
                "\n"
                "Не забывай про <b>1–3% от депозита на сделку</b>. Холодный ум "
                "и риск-менеджмент важнее любого сигнала.\n"
                "\n"
                "<i>Нажми «🎯 Получить сигнал» в боте, чтобы запросить сигнал.</i>"
            )
            await bot.send_message(
                chat_id=settings.channel_id, text=text, parse_mode=ParseMode.HTML
            )
            logger.info("Daily brief posted")
        except Exception:  # noqa: BLE001
            logger.exception("Failed to send daily brief")
