"""
Channel signal cadence + daily brief.

Two background loops:
  • signal_loop — every 5–15 min during working hours, generates a signal,
    saves it, renders a chart image, posts to the channel.
  • daily_brief_loop — once per day at 08:00 UTC, posts a market-open brief
    to the channel (yesterday's totals, top pair, motivational nudge).
"""
from __future__ import annotations

import asyncio
import logging
import random
from datetime import datetime, timezone

from aiogram import Bot
from aiogram.enums import ParseMode
from aiogram.types import BufferedInputFile

from config import settings
from database.db import get_total_signals, save_signal
from services.formatter import format_signal_caption
from services.imagegen import make_signal_chart
from services.signal_generator import generate_signal, random_interval_seconds

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
            kind = random.choice(["otc", "exchange", "elite"])
            signal = generate_signal(kind)
            sid = await save_signal(signal)
            signal.id = sid

            caption = format_signal_caption(signal, settings.pocket_option_url)

            # OTC channel posts: text-only, no chart.
            if (signal.tier or "otc") in {"otc", "demo"}:
                await bot.send_message(
                    chat_id=settings.channel_id,
                    text=caption,
                    parse_mode=ParseMode.HTML,
                    disable_web_page_preview=True,
                )
            else:
                chart_bytes = make_signal_chart(signal)
                await bot.send_photo(
                    chat_id=settings.channel_id,
                    photo=BufferedInputFile(chart_bytes, filename=f"signal_{sid}.png"),
                    caption=caption,
                    parse_mode=ParseMode.HTML,
                )
            logger.info(
                "Signal sent: %s %s exp=%s conf=%d%% kind=%s",
                signal.pair,
                signal.direction,
                signal.expiration,
                signal.confidence,
                kind,
            )
        except Exception:  # noqa: BLE001
            logger.exception("Failed to send signal")


# ── Daily brief ───────────────────────────────────────────────────────────────


def _seconds_until_utc_hour(target_hour: int) -> float:
    now = datetime.now(timezone.utc)
    target = now.replace(hour=target_hour, minute=0, second=0, microsecond=0)
    if target <= now:
        target = target.replace(day=now.day + 1)
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
                "<i>Сигналы стартуют через ~10 минут.</i>"
            )
            await bot.send_message(
                chat_id=settings.channel_id, text=text, parse_mode=ParseMode.HTML
            )
            logger.info("Daily brief posted")
        except Exception:  # noqa: BLE001
            logger.exception("Failed to send daily brief")
