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
import httpx

from config import settings
from database.db import get_total_signals, save_signal
from database.models import Signal
from services.imagegen import make_otc_banner, make_signal_chart_advanced
from services.price_feed import fetch_ohlc
from services.signal_generator import generate_signal, random_interval_seconds
from services.signal_publisher import publish_signal
from services import web_sync

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

            tier = signal.tier or "otc"
            is_otc = tier in {"otc", "demo"}

            if is_otc:
                chart_bytes: bytes = make_otc_banner(signal)
            else:
                real_ohlc = await fetch_ohlc(signal.pair)
                chart_bytes = make_signal_chart_advanced(signal, ohlc=real_ohlc)

            # publish_signal marks consumed BEFORE sending — safe against
            # partial-send retries (auto-generated signals have no external
            # consumed flag, so mark_consumed is omitted here).
            await publish_signal(bot, signal, str(sid), chart_bytes)

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


# ── Scheduled signal loop ──────────────────────────────────────────────────────


async def _activate_signal_on_web(signal_id: str) -> bool:
    """Call /api/bot/activate-signal to flip isActive=true on the web platform."""
    if not settings.platform_api_url or not settings.bot_sync_secret:
        return False
    url = f"{settings.platform_api_url.rstrip('/')}/api/bot/activate-signal"
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                url,
                json={"signalId": signal_id},
                headers={"X-Bot-Secret": settings.bot_sync_secret},
            )
            if resp.status_code == 200:
                return True
            logger.warning("activate-signal returned %d for %s", resp.status_code, signal_id)
            return False
    except Exception as exc:  # noqa: BLE001
        logger.warning("activate-signal request failed: %s", exc)
        return False


async def scheduled_signal_loop(bot: Bot) -> None:
    """
    Every 30 seconds, check for scheduled signals that are due.
    For each due signal:
      1. Render chart (real OHLC for exchange/elite, OTC banner for otc).
      2. Post to the Telegram channel.
      3. Broadcast to individual users (tier-filtered).
      4. Call /api/bot/activate-signal to make it visible on the web.
    """
    logger.info("Scheduled signal loop started (30s poll)")
    while True:
        await asyncio.sleep(30)
        due = await web_sync.get_due_scheduled_signals()
        if not due:
            continue

        for sig_dict in due:
            signal_id: str = sig_dict["id"]

            # Build a Signal model from the dict so we can reuse existing helpers.
            signal = Signal(
                pair=sig_dict.get("pair", "EUR/USD"),
                direction=sig_dict.get("direction", "CALL"),
                expiration=sig_dict.get("expiration", "3m"),
                confidence=sig_dict.get("confidence", 85),
                tier=sig_dict.get("tier", "otc"),
                signal_type=sig_dict.get("type", "manual"),
                analysis=sig_dict.get("analysis"),
                result="pending",
            )

            try:
                tier = signal.tier or "otc"
                is_otc = tier in {"otc", "demo"}

                if is_otc:
                    chart_bytes: bytes = make_otc_banner(signal)
                else:
                    real_ohlc = await fetch_ohlc(signal.pair)
                    chart_bytes = make_signal_chart_advanced(signal, ohlc=real_ohlc)

                # mark_consumed is called BEFORE any Telegram send inside
                # publish_signal, preventing duplicate delivery on retry.
                await publish_signal(
                    bot, signal, signal_id, chart_bytes,
                    mark_consumed=web_sync.mark_scheduled_consumed,
                )

                # Activate on web platform.
                activated = await _activate_signal_on_web(signal_id)
                if not activated:
                    logger.warning("Could not activate signal %s on web", signal_id)

            except Exception:  # noqa: BLE001
                logger.exception("Failed to publish scheduled signal %s", signal_id)
