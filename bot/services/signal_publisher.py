"""
Signal publisher — mark-before-send pattern.

All signal publishing (channel + user broadcast) goes through `publish_signal`.
The signal is marked as consumed/sent BEFORE any Telegram delivery, so that
even if the send fails partway the signal will not be re-published on the next
loop iteration.
"""
from __future__ import annotations

import asyncio
import logging
from typing import Callable, Awaitable

from aiogram import Bot
from aiogram.enums import ParseMode
from aiogram.types import BufferedInputFile

from config import settings
from database.db import get_users_with_notifications, increment_signals_received
from database.models import Signal
from services.formatter import (
    format_otc_minimal,
    format_pro_signal_caption,
    format_signal_caption,
)

logger = logging.getLogger(__name__)

MarkConsumedFn = Callable[[str], Awaitable[None]]


async def broadcast_to_users(bot: Bot, signal: Signal, chart_bytes: bytes) -> int:
    """
    Push signal to every opted-in user, tier-filtered.

    Returns number of users successfully reached.
    """
    try:
        users = await get_users_with_notifications()
    except Exception:  # noqa: BLE001
        logger.exception("Failed to fetch users for broadcast")
        return 0

    tier = signal.tier or "otc"
    is_pro_signal = tier not in {"otc", "demo"}

    sent = 0
    for user in users:
        if is_pro_signal and user.tier == 0:
            continue
        try:
            if is_pro_signal and user.tier >= 1:
                caption = format_pro_signal_caption(signal, settings.pocket_option_url)
            else:
                caption = format_otc_minimal(signal)
            await bot.send_photo(
                chat_id=user.telegram_id,
                photo=BufferedInputFile(chart_bytes, filename="signal.png"),
                caption=caption,
                parse_mode=ParseMode.HTML,
            )
            await increment_signals_received(user.telegram_id)
            sent += 1
            await asyncio.sleep(0.035)
        except Exception:  # noqa: BLE001
            logger.debug("Cannot deliver to telegram_id=%s", user.telegram_id)

    logger.info("Broadcast complete: %d/%d users reached", sent, len(users))
    return sent


async def publish_signal(
    bot: Bot,
    signal: Signal,
    signal_id: str,
    chart_bytes: bytes,
    mark_consumed: MarkConsumedFn | None = None,
) -> None:
    """
    Publish a signal to the channel and broadcast to users.

    **Key invariant:** if *mark_consumed* is provided it is called BEFORE any
    Telegram message is sent.  This ensures that a partial send failure (e.g.
    channel post succeeds but user broadcast crashes) will NOT cause the signal
    to be re-published on the next scheduler tick.

    Args:
        bot: aiogram Bot instance.
        signal: Signal model.
        signal_id: Unique signal identifier (DB id or web platform id).
        chart_bytes: Rendered chart/banner PNG bytes.
        mark_consumed: Optional async callback to mark the signal as consumed
            in whatever store tracks it (web_sync, DB, etc.).
    """
    # ── Mark consumed BEFORE any delivery ──────────────────────────────
    if mark_consumed is not None:
        await mark_consumed(signal_id)

    # ── Channel post ───────────────────────────────────────────────────
    channel_caption = format_signal_caption(signal, settings.pocket_option_url)
    await bot.send_photo(
        chat_id=settings.channel_id,
        photo=BufferedInputFile(chart_bytes, filename=f"signal_{signal_id}.png"),
        caption=channel_caption,
        parse_mode=ParseMode.HTML,
    )

    logger.info(
        "Signal published: %s %s exp=%s conf=%d%% tier=%s id=%s",
        signal.pair,
        signal.direction,
        signal.expiration,
        signal.confidence,
        signal.tier or "otc",
        signal_id,
    )

    # ── User broadcast ─────────────────────────────────────────────────
    await broadcast_to_users(bot, signal, chart_bytes)
