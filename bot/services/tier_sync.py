"""
Tier-sync — periodically pulls a snapshot of PocketOption account state from
the web platform and applies it to the bot's local SQLite mirror.

When a user's tier is upgraded, the bot fires a congratulations message
including a regenerated tier-card image. Idempotent: if the snapshot tier
matches local state, nothing is sent.

Disabled when PLATFORM_API_URL or BOT_SYNC_SECRET are unset (the bot can run
fully standalone for local dev).
"""
from __future__ import annotations

import asyncio
import logging
from typing import Any

import aiosqlite
import httpx
from aiogram import Bot
from aiogram.enums import ParseMode
from aiogram.types import BufferedInputFile

from config import settings
from database.db import DB_PATH, set_deposit_total, set_tier
from services.imagegen import make_tier_card

logger = logging.getLogger(__name__)

POLL_INTERVAL_SECONDS = 60
# 2-tier модель (см. web-platform/src/lib/tier.ts).
_UNREACHABLE_THRESHOLD = 9_007_199_254_740_991
USER_TIER_DEPOSIT_THRESHOLDS = {
    1: 20,
    2: _UNREACHABLE_THRESHOLD,
    3: _UNREACHABLE_THRESHOLD,
    4: _UNREACHABLE_THRESHOLD,
}
USER_TIER_NAMES = {0: "Обычный", 1: "Про", 2: "Про", 3: "Про", 4: "Про"}


async def _fetch_snapshot() -> list[dict[str, Any]]:
    url = f"{settings.platform_api_url.rstrip('/')}/api/bot/sync"
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(
            url, headers={"X-Bot-Secret": settings.bot_sync_secret}
        )
        resp.raise_for_status()
        body = resp.json()
        if not body.get("ok"):
            raise RuntimeError(f"sync failed: {body}")
        return body["accounts"]


async def _local_state(po_trader_id: str) -> tuple[int, float, int | None] | None:
    """Returns (tier, deposit_total, telegram_id) for a po_trader_id, or None."""
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute(
            "SELECT tier, deposit_total, telegram_id FROM users WHERE po_trader_id = ?",
            (po_trader_id,),
        ) as cur:
            row = await cur.fetchone()
            if row is None:
                return None
            return int(row[0] or 0), float(row[1] or 0.0), int(row[2])


async def _send_upgrade(bot: Bot, telegram_id: int, new_tier: int, deposit: float) -> None:
    name = USER_TIER_NAMES.get(new_tier, "—")
    next_threshold = USER_TIER_DEPOSIT_THRESHOLDS.get(new_tier + 1)
    try:
        card = make_tier_card(new_tier, deposit, next_threshold)
    except Exception as exc:  # noqa: BLE001
        logger.warning("Could not render tier card on upgrade: %s", exc)
        card = None

    text = (
        f"<b>🎉 Уровень разблокирован: {name}!</b>\n"
        f"\n"
        f"Депозит на PocketOption: <b>${deposit:,.2f}</b>\n"
        f"\n"
        "Теперь тебе доступны все типы сигналов — OTC, биржевые и Elite — "
        "с полной аналитикой (RSI, MACD, EMA).\n"
        "\n"
        "Сигналы приходят автоматически — просто жди 📊"
    )
    if card:
        await bot.send_photo(
            telegram_id,
            BufferedInputFile(card, filename=f"tier_{new_tier}.png"),
            caption=text,
            parse_mode=ParseMode.HTML,
        )
    else:
        await bot.send_message(telegram_id, text, parse_mode=ParseMode.HTML)


async def _apply_one(bot: Bot, item: dict[str, Any]) -> None:
    po_id = str(item["poTraderId"])
    new_tier = int(item.get("tier") or 0)
    deposit = float(item.get("totalDeposit") or 0.0)

    state = await _local_state(po_id)
    if state is None:
        # Account exists on web but bot user hasn't /linked locally yet — skip.
        return
    old_tier, old_deposit, telegram_id = state

    if abs(deposit - old_deposit) > 1e-2:
        await set_deposit_total(telegram_id, deposit)

    if new_tier > old_tier:
        await set_tier(telegram_id, new_tier)
        try:
            await _send_upgrade(bot, telegram_id, new_tier, deposit)
        except Exception as exc:  # noqa: BLE001
            logger.warning("Could not deliver tier upgrade to %s: %s", telegram_id, exc)

        # Achievements that depend on tier or deposit may now be unlockable.
        from database.db import get_user
        from services.achievements import check_and_award

        user = await get_user(telegram_id)
        if user is not None:
            await check_and_award(bot, user)
    elif new_tier < old_tier:
        # Edge case (refund / rollback) — silently mirror without notifying.
        await set_tier(telegram_id, new_tier)


async def tier_sync_loop(bot: Bot) -> None:
    """Background task that polls the web platform every POLL_INTERVAL_SECONDS."""
    if not settings.platform_api_url or not settings.bot_sync_secret:
        logger.info("Tier-sync disabled (PLATFORM_API_URL or BOT_SYNC_SECRET unset)")
        return

    logger.info(
        "Tier-sync loop started, poll=%ds, target=%s",
        POLL_INTERVAL_SECONDS,
        settings.platform_api_url,
    )
    while True:
        try:
            snapshot = await _fetch_snapshot()
            for item in snapshot:
                await _apply_one(bot, item)
        except httpx.HTTPError as exc:
            logger.warning("Tier-sync fetch failed: %s", exc)
        except Exception as exc:  # noqa: BLE001
            logger.exception("Tier-sync iteration failed: %s", exc)
        await asyncio.sleep(POLL_INTERVAL_SECONDS)
