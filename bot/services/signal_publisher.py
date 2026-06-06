"""
Signal publisher — simplified for on-demand delivery.

Signals are now sent directly to the requesting user in handlers/signals.py.
This module is retained as a minimal utility for any future channel posting needs.
"""
from __future__ import annotations

import logging

from aiogram import Bot
from aiogram.enums import ParseMode
from aiogram.types import BufferedInputFile

from config import settings
from database.models import Signal
from services.formatter import format_signal_caption

logger = logging.getLogger(__name__)


async def post_to_channel(bot: Bot, signal: Signal, signal_id: str, chart_bytes: bytes) -> None:
    """Post a signal to the channel (optional, for admin use)."""
    channel_caption = format_signal_caption(signal, settings.pocket_option_url)
    await bot.send_photo(
        chat_id=settings.channel_id,
        photo=BufferedInputFile(chart_bytes, filename=f"signal_{signal_id}.png"),
        caption=channel_caption,
        parse_mode=ParseMode.HTML,
    )
    logger.info(
        "Signal posted to channel: %s %s tier=%s id=%s",
        signal.pair,
        signal.direction,
        signal.tier or "otc",
        signal_id,
    )
