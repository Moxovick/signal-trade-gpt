"""
/signal — manual signal request.

Behaviour:
  1. T0 users get demo signals (no real trade tag), with a hard lifetime cap of
     2 across the user's lifetime.
  2. Higher tiers see admin-published signals first (queue from /api/bot/sync).
  3. Daily limits per tier are read from admin bot-config when available; the
     legacy 5/15/25/∞ defaults are used otherwise.
  4. If price-source is configured, we fetch the real entry price for the pair
     and overlay it on the chart + caption.

Each signal renders a candle-chart image (matplotlib) with direction overlay,
plus inline buttons for Win/Loss feedback after expiration.
"""
import logging

from aiogram import F, Router
from aiogram.filters import Command
from aiogram.types import (
    BufferedInputFile,
    CallbackQuery,
    Message,
)
from aiogram.enums import ParseMode

from config import settings
from database.db import (
    get_user,
    increment_signals_received,
    record_signal_result,
    save_signal,
)
from database.models import Signal
from services import web_sync
from services.achievements import check_and_award
from services.formatter import format_signal_caption
from services.imagegen import make_signal_chart
from services.keyboards import signal_inline
from services.price_feed import fetch_price
from services.signal_generator import generate_signal

logger = logging.getLogger(__name__)
router = Router()

T0_LIFETIME_DEMO_LIMIT = 2

TIER_TO_KIND = {0: "demo", 1: "otc", 2: "exchange", 3: "elite", 4: "elite"}
TIER_ALLOWED_BANDS = {
    0: ["demo"],
    1: ["otc"],
    2: ["otc", "exchange"],
    3: ["otc", "exchange", "elite"],
    4: ["otc", "exchange", "elite"],
}


def _admin_signal_to_local(payload: dict) -> Signal:
    """Map the JSON payload from /api/bot/sync.signals[*] to a local Signal."""
    return Signal(
        pair=payload.get("pair", ""),
        direction=payload.get("direction", "CALL"),
        expiration=payload.get("expiration", "1m"),
        confidence=int(payload.get("confidence", 80)),
        signal_type=payload.get("type", "manual"),
        tier=payload.get("tier", "otc"),
        analysis=payload.get("analysis"),
        result="pending",
    )


@router.message(Command("signal"))
async def cmd_signal(message: Message) -> None:
    user = await get_user(message.from_user.id)
    if user is None:
        await message.answer("Сначала /start.")
        return

    # Lifetime demo cap (T0 only).
    if user.tier == 0 and user.signals_received >= T0_LIFETIME_DEMO_LIMIT:
        await message.answer(
            "<b>Демо-лимит исчерпан</b>\n"
            "Чтобы получать сигналы регулярно — привяжи PocketOption через /link "
            "и внеси депозит ≥ $100 для перехода на T1.",
            parse_mode=ParseMode.HTML,
        )
        return

    # Daily quota (admin-configurable).
    daily_limit = web_sync.get_daily_limit(user.tier)
    if daily_limit is not None and user.tier > 0 and daily_limit < 9999:
        # NOTE: signals_received is lifetime, not daily. Daily window enforcement
        # is the web platform's responsibility; here we only short-circuit on
        # the obvious "0" override admins might set to pause a tier.
        if daily_limit == 0:
            await message.answer(
                "<b>Сигналы временно приостановлены</b>\n"
                "Админ выставил лимит 0 для твоего тира. Обновись или попробуй позже.",
                parse_mode=ParseMode.HTML,
            )
            return

    # 1) Try admin-published signal first.
    allowed_bands = TIER_ALLOWED_BANDS.get(user.tier, ["otc"])
    admin_payload = web_sync.next_pending_admin_signal(allowed_bands)
    if admin_payload is not None:
        signal = _admin_signal_to_local(admin_payload)
        admin_entry = admin_payload.get("entryPrice")
        entry_price = float(admin_entry) if admin_entry is not None else None
        if entry_price is None:
            entry_price = await fetch_price(signal.pair)
        logger.info(
            "Sending ADMIN signal to user %s: %s %s",
            message.from_user.id, signal.pair, signal.direction,
        )
    else:
        # 2) Fall back to local random generator.
        kind = TIER_TO_KIND.get(user.tier, "otc")
        signal = generate_signal(kind)
        if user.tier == 0:
            signal.tier = "demo"
        entry_price = await fetch_price(signal.pair)

    signal_id = await save_signal(signal)
    signal.id = signal_id
    await increment_signals_received(user.telegram_id)

    chart_bytes = make_signal_chart(signal)
    caption = format_signal_caption(signal, settings.pocket_option_url, entry_price)

    await message.answer_photo(
        BufferedInputFile(chart_bytes, filename=f"signal_{signal_id}.png"),
        caption=caption,
        parse_mode=ParseMode.HTML,
        reply_markup=signal_inline(settings.pocket_option_url, signal_id),
    )


@router.callback_query(F.data.startswith("sig:"))
async def cb_signal_result(query: CallbackQuery) -> None:
    """Handle Win/Loss feedback buttons attached to a signal message."""
    if query.data is None or query.from_user is None:
        await query.answer()
        return
    try:
        _, sid_s, result = query.data.split(":")
        signal_id = int(sid_s)
    except (ValueError, IndexError):
        await query.answer("Bad payload", show_alert=False)
        return
    if result not in {"win", "loss"}:
        await query.answer()
        return

    await record_signal_result(query.from_user.id, signal_id, result)
    label = "✅ Записано как WIN" if result == "win" else "❌ Записано как LOSS"
    await query.answer(label, show_alert=False)

    # Strip buttons so the signal can't be voted on twice.
    try:
        await query.message.edit_reply_markup(reply_markup=None)
    except Exception:  # noqa: BLE001
        pass

    # Achievement check (5/10 wins, winrate 70%, etc.)
    user = await get_user(query.from_user.id)
    if user is not None:
        await check_and_award(query.bot, user)
