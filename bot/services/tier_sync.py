"""
Tier-sync — periodically pulls a snapshot of PocketOption account state from
the web platform and applies it to the shared Postgres database.

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

from aiogram import Bot
from aiogram.enums import ParseMode
from aiogram.types import BufferedInputFile

from config import settings
from constants import TIER_DEPOSIT_THRESHOLDS, TIER_NAMES
from database.db import set_deposit_total, set_signals_received, set_tier, _get_pool, telegram_id_to_bigint
from services import web_sync
from services.imagegen import make_tier_card

logger = logging.getLogger(__name__)

POLL_INTERVAL_SECONDS = 60
USER_TIER_DEPOSIT_THRESHOLDS = TIER_DEPOSIT_THRESHOLDS
USER_TIER_NAMES = TIER_NAMES


async def _local_state(po_trader_id: str) -> tuple[int, float, int | None] | None:
    """Returns (tier, deposit_total, telegram_id) for a po_trader_id, or None."""
    pool = _get_pool()
    row = await pool.fetchrow(
        """
        SELECT u.tier, u."depositTotal", u."telegramId"
        FROM "users" u
        JOIN "po_accounts" pa ON pa."userId" = u.id
        WHERE pa."poTraderId" = $1
        """,
        po_trader_id,
    )
    if row is None or row["telegramId"] is None:
        return None
    return int(row["tier"] or 0), float(row["depositTotal"] or 0.0), int(row["telegramId"])


async def _send_upgrade(bot: Bot, telegram_id: int, new_tier: int, deposit: float) -> None:
    name = USER_TIER_NAMES.get(new_tier, "—")
    next_threshold = USER_TIER_DEPOSIT_THRESHOLDS.get(new_tier + 1)
    try:
        card = make_tier_card(new_tier, deposit, next_threshold)
    except Exception as exc:  # noqa: BLE001
        logger.warning("Could not render tier card on upgrade: %s", exc)
        card = None

    from constants import TIER_DAILY_LIMITS, TIER_SIGNAL_TYPES
    types = TIER_SIGNAL_TYPES.get(new_tier, ["otc"])
    signal_access = " + ".join(t.upper() for t in types)
    daily_limit = TIER_DAILY_LIMITS.get(new_tier)
    limit_text = "безлимит" if daily_limit is None else f"{daily_limit}/день"

    text = (
        f"<b>🎉 Уровень разблокирован: {name}!</b>\n"
        f"\n"
        f"Депозит на PocketOption: <b>${deposit:,.2f}</b>\n"
        f"\n"
        f"Доступные сигналы: <b>{signal_access}</b>\n"
        f"Лимит: <b>{limit_text}</b>\n"
        "\n"
        "Нажми «🎯 Получить сигнал» в меню, чтобы запросить сигнал."
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


def _compute_tier_from_deposit(deposit: float) -> int:
    """Mirror the web-platform computeTier logic locally."""
    thresholds = USER_TIER_DEPOSIT_THRESHOLDS
    if deposit >= thresholds.get(2, 100):
        return 2
    if deposit >= thresholds.get(1, 20):
        return 1
    return 0


async def _apply_one(bot: Bot, item: dict[str, Any]) -> None:
    po_id = item.get("poTraderId")
    if not po_id:
        return
    po_id = str(po_id)
    deposit = float(item.get("totalDeposit") or 0.0)
    # Compute tier from deposit locally, don't blindly trust API tier
    new_tier = _compute_tier_from_deposit(deposit)

    state = await _local_state(po_id)
    if state is None:
        # Account exists on web but bot user hasn't /linked locally yet.
        # Try to match by telegramId and auto-link the PO ID.
        tg_id_str = item.get("telegramId")
        if tg_id_str:
            try:
                from database.db import get_user, set_po_trader_id
                tg_id = int(tg_id_str)
                user = await get_user(tg_id)
                if user and not user.po_trader_id:
                    await set_po_trader_id(tg_id, po_id)
                    await set_deposit_total(tg_id, deposit)
                    await set_tier(tg_id, new_tier)
                    logger.info("Auto-linked PO ID %s to telegram_id %s via web sync", po_id, tg_id)
                    if new_tier > 0:
                        try:
                            await _send_upgrade(bot, tg_id, new_tier, deposit)
                        except Exception:  # noqa: BLE001
                            pass
                    return
            except (ValueError, TypeError):
                pass
        return
    old_tier, old_deposit, telegram_id = state

    if abs(deposit - old_deposit) > 1e-2:
        await set_deposit_total(telegram_id, deposit)

    # Sync signal count from web (includes signals from website + MiniApp + bot)
    web_signals = int(item.get("signalsCount") or 0)
    if web_signals > 0:
        from database.db import get_user as _get_user
        _u = await _get_user(telegram_id)
        if _u and web_signals > _u.signals_received:
            await set_signals_received(telegram_id, web_signals)

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


async def try_sync_user(telegram_id: int) -> bool:
    """Check web platform for this user's PO account and sync all fields.

    Returns True if anything was updated (caller should re-read user).
    Does NOT require a Bot instance — no upgrade message is sent.
    """
    if not settings.platform_api_url or not settings.bot_sync_secret:
        return False
    ok = await web_sync.refresh_now()
    if not ok:
        return False
    snapshot = web_sync.state().accounts
    for item in snapshot:
        tg_id_str = item.get("telegramId")
        if not tg_id_str:
            continue
        try:
            if int(tg_id_str) != telegram_id:
                continue
        except (ValueError, TypeError):
            continue
        po_id = item.get("poTraderId")
        if not po_id:
            continue
        po_id = str(po_id)
        deposit = float(item.get("totalDeposit") or 0.0)
        new_tier = _compute_tier_from_deposit(deposit)
        web_signals = int(item.get("signalsCount") or 0)
        from database.db import get_user, set_po_trader_id
        user = await get_user(telegram_id)
        if not user:
            return False
        changed = False
        if not user.po_trader_id:
            await set_po_trader_id(telegram_id, po_id)
            await set_deposit_total(telegram_id, deposit)
            await set_tier(telegram_id, new_tier)
            logger.info("Immediate sync: linked PO ID %s to telegram_id %s", po_id, telegram_id)
            changed = True
        if abs(deposit - user.deposit_total) > 1e-2:
            await set_deposit_total(telegram_id, deposit)
            changed = True
        if new_tier != user.tier:
            await set_tier(telegram_id, new_tier)
            changed = True
        if web_signals > user.signals_received:
            await set_signals_received(telegram_id, web_signals)
            changed = True
        return changed
    return False


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
            snapshot = web_sync.state().accounts
            for item in snapshot:
                await _apply_one(bot, item)
        except Exception as exc:  # noqa: BLE001
            logger.exception("Tier-sync iteration failed: %s", exc)
        await asyncio.sleep(POLL_INTERVAL_SECONDS)
