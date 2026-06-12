"""
On-demand signal delivery + Win/Loss feedback callbacks.

User presses "Получить сигнал" button → bot calls the web platform API
to generate a signal (unified pipeline), renders chart locally, sends to user.

If the web API is unreachable (PLATFORM_API_URL not set), falls back to
local generation via signal_generator.py.

An analysis animation is shown while the signal is being generated.
"""
import asyncio
import logging
import random
from typing import Any

import httpx
from aiogram import Bot, F, Router
from aiogram.filters import Command
from aiogram.types import CallbackQuery, Message
from aiogram.enums import ParseMode
from aiogram.types import BufferedInputFile

from config import settings
from constants import TIER_DAILY_LIMITS, TIER_NAMES, TIER_SIGNAL_TYPES
from database.db import (
    get_daily_signal_count,
    get_user,
    increment_daily_signal,
    increment_signals_received,
    record_signal_result,
    reset_daily_signals_if_expired,
    save_signal,
)
from database.models import Signal
from services.achievements import check_and_award
from services.formatter import format_otc_minimal, format_pro_signal_caption
from services.imagegen import make_otc_banner, make_signal_chart_advanced
from services.keyboards import signal_inline
from services.price_feed import fetch_ohlc
from services.signal_generator import generate_signal

logger = logging.getLogger(__name__)
router = Router()

# Per-user lock to prevent concurrent signal requests bypassing daily limits.
_user_locks: dict[int, asyncio.Lock] = {}

ANALYSIS_STEPS = [
    "Анализируем рынок...",
    "Проверяем индикаторы...",
    "Оцениваем точку входа...",
    "Рассчитываем вероятность...",
    "Формируем сигнал...",
]


def _can_use_web_api() -> bool:
    """Check whether we have the web platform API configured."""
    return bool(settings.platform_api_url and settings.bot_sync_secret)


async def _request_signal_via_api(telegram_id: int) -> dict[str, Any] | None:
    """
    Call the web platform's /api/bot/signal-request endpoint.

    Returns the JSON response dict on success, or None if the API
    is unreachable / returns a non-parseable response.
    Raises no exceptions — all errors are logged and return None
    (so the caller can fall back to local generation).
    """
    url = f"{settings.platform_api_url.rstrip('/')}/api/bot/signal-request"
    headers = {
        "X-Bot-Secret": settings.bot_sync_secret,
        "Content-Type": "application/json",
    }
    payload = {"telegramId": telegram_id}

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(url, json=payload, headers=headers)
            data: dict[str, Any] = resp.json()
            data["_status"] = resp.status_code
            return data
    except Exception:
        logger.exception("Web API signal request failed for telegram_id=%s", telegram_id)
        return None


def _api_signal_to_local(data: dict[str, Any]) -> Signal:
    """Convert the web API signal response to a local Signal model."""
    sig = data.get("signal", {})
    return Signal(
        pair=sig.get("pair", "???"),
        direction=sig.get("direction", "CALL"),
        expiration=sig.get("expiration", "60s"),
        confidence=sig.get("confidence", 80),
        signal_type=sig.get("type", "ai"),
        tier=sig.get("tier", "otc"),
        analysis=sig.get("analysis"),
        result="pending",
        id=None,
    )


async def _show_analysis_animation(bot: Bot, chat_id: int, delay_seconds: float) -> Message:
    """Send and animate analysis progress messages."""
    msg = await bot.send_message(chat_id, f"⏳ {ANALYSIS_STEPS[0]}")
    step_interval = delay_seconds / len(ANALYSIS_STEPS)

    for i, text in enumerate(ANALYSIS_STEPS[1:], 1):
        await asyncio.sleep(step_interval)
        progress = "▓" * i + "░" * (len(ANALYSIS_STEPS) - i)
        try:
            await msg.edit_text(
                f"⏳ {text}\n\n[{progress}] {int(i / len(ANALYSIS_STEPS) * 100)}%"
            )
        except Exception:  # noqa: BLE001
            pass

    return msg


async def _validate_user(user_id: int) -> tuple[str | None, Any]:
    """
    Validate that a user exists and has PO linked.

    Returns (error_text, user). If error_text is not None, request is denied.
    """
    user = await get_user(user_id)
    if user is None:
        return "Сначала нажми /start, чтобы зарегистрироваться.", None

    if not user.po_trader_id:
        return (
            "Сначала привяжи PocketOption аккаунт.\n"
            "Используй /link или кнопку «🔗 Привязать ID» в меню."
        ), None

    return None, user


async def _generate_signal_data(
    user: Any,
) -> tuple[str | None, Signal | None, bytes | None, dict[str, Any] | None]:
    """
    Generate a signal via API or local fallback.

    Returns (error_text, signal, chart_bytes, api_resp).
    """

    # ── Try web API first ──
    if _can_use_web_api():
        api_resp = await _request_signal_via_api(user.telegram_id)
        if api_resp is not None:
            status = api_resp.get("_status", 500)

            if status == 429:
                code = api_resp.get("code", "daily_limit")
                used = api_resp.get("used", 0)
                daily_limit = api_resp.get("dailyLimit")
                if code == "daily_limit":
                    tier = user.tier
                    if tier < 2:
                        next_tier = TIER_NAMES.get(tier + 1, "Pro")
                        return (
                            f"Лимит исчерпан ({used}/{daily_limit} сигналов сегодня).\n\n"
                            f"Повысь тариф до <b>{next_tier}</b> для большего количества сигналов."
                        ), None, None, None
                    return (
                        f"Лимит исчерпан ({used}/{daily_limit} сигналов сегодня).\n"
                        "Следующий сигнал будет доступен через несколько часов."
                    ), None, None, None
                return "Пользователь не найден на платформе.", None, None, None

            if status == 404:
                return "Пользователь не найден на платформе. Зарегистрируйся на сайте.", None, None, None

            if status >= 400:
                logger.warning("Web API returned status %s: %s", status, api_resp.get("error"))
                # Fall through to local generation below
            else:
                signal = _api_signal_to_local(api_resp)
                sid = await save_signal(signal)
                signal.id = sid

                tier_str = signal.tier or "otc"
                is_otc = tier_str in {"otc", "demo"}

                if is_otc:
                    chart_bytes: bytes = make_otc_banner(signal)
                else:
                    chart_data = api_resp.get("signal", {}).get("chartData")
                    if chart_data and isinstance(chart_data, dict):
                        candles = chart_data.get("candles", [])
                        real_ohlc = [
                            (
                                float(c.get("open", 0)),
                                float(c.get("high", 0)),
                                float(c.get("low", 0)),
                                float(c.get("close", 0)),
                            )
                            for c in candles
                        ] if candles else None
                    else:
                        real_ohlc = await fetch_ohlc(signal.pair)
                    chart_bytes = make_signal_chart_advanced(signal, ohlc=real_ohlc)

                return None, signal, chart_bytes, api_resp

    # ── Local fallback ──
    logger.info("Using local signal generation fallback for user %s", user.telegram_id)

    await reset_daily_signals_if_expired(user.telegram_id)

    daily_limit = TIER_DAILY_LIMITS.get(user.tier)
    used, limit, can_request = await get_daily_signal_count(user.telegram_id, daily_limit)

    if not can_request:
        if user.tier < 2:
            next_tier = TIER_NAMES.get(user.tier + 1, "Pro")
            return (
                f"Лимит исчерпан ({used}/{limit} сигналов сегодня).\n\n"
                f"Повысь тариф до <b>{next_tier}</b> для большего количества сигналов."
            ), None, None, None
        return (
            f"Лимит исчерпан ({used}/{limit} сигналов сегодня).\n"
            "Следующий сигнал будет доступен через несколько часов."
        ), None, None, None

    allowed_types = TIER_SIGNAL_TYPES.get(user.tier, ["otc"])
    signal_tier = random.choice(allowed_types)

    signal = generate_signal(signal_tier)
    sid = await save_signal(signal)
    signal.id = sid

    tier_str = signal.tier or "otc"
    is_otc = tier_str in {"otc", "demo"}

    if is_otc:
        chart_bytes = make_otc_banner(signal)
    else:
        real_ohlc = await fetch_ohlc(signal.pair)
        chart_bytes = make_signal_chart_advanced(signal, ohlc=real_ohlc)

    return None, signal, chart_bytes, None


def _get_user_lock(user_id: int) -> asyncio.Lock:
    if user_id not in _user_locks:
        _user_locks[user_id] = asyncio.Lock()
    return _user_locks[user_id]


async def _send_signal_with_animation(user_id: int, bot: Bot) -> str | None:
    """
    Full signal flow: validate, animate, generate, send.

    Returns error text or None on success.
    """
    lock = _get_user_lock(user_id)
    if lock.locked():
        return "Подожди — предыдущий сигнал ещё генерируется."

    async with lock:
        return await _send_signal_with_animation_inner(user_id, bot)


async def _send_signal_with_animation_inner(user_id: int, bot: Bot) -> str | None:
    """Inner implementation of signal flow (runs under per-user lock)."""
    # Step 1: Validate user
    error, user = await _validate_user(user_id)
    if error:
        return error

    # Step 2: Run animation and signal generation in parallel
    delay = random.uniform(settings.analysis_delay_min, settings.analysis_delay_max)

    async def _animate() -> Message:
        return await _show_analysis_animation(bot, user.telegram_id, delay)

    async def _generate() -> tuple[str | None, Signal | None, bytes | None, dict[str, Any] | None]:
        return await _generate_signal_data(user)

    analysis_msg: Message | None = None
    try:
        animation_task = asyncio.create_task(_animate())
        generation_task = asyncio.create_task(_generate())

        gen_error, signal, chart_bytes, api_resp = await generation_task
        analysis_msg = await animation_task

        # Clean up analysis message
        try:
            await analysis_msg.delete()
        except Exception:  # noqa: BLE001
            pass

        if gen_error:
            return gen_error

        if signal is None or chart_bytes is None:
            return "Не удалось сгенерировать сигнал. Попробуй позже."

        # Build caption
        tier_str = signal.tier or "otc"
        is_otc = tier_str in {"otc", "demo"}
        if is_otc:
            caption = format_otc_minimal(signal)
        else:
            caption = format_pro_signal_caption(signal, settings.pocket_option_url)

        # Increment counters
        await increment_daily_signal(user.telegram_id)
        await increment_signals_received(user.telegram_id)

        # Send signal photo
        await bot.send_photo(
            chat_id=user.telegram_id,
            photo=BufferedInputFile(chart_bytes, filename=f"signal_{signal.id}.png"),
            caption=caption,
            parse_mode=ParseMode.HTML,
            reply_markup=signal_inline(settings.pocket_option_url, signal.id),
        )

        # Achievement check
        updated_user = await get_user(user.telegram_id)
        if updated_user:
            await check_and_award(bot, updated_user)

        return None

    except Exception:
        logger.exception("Signal request failed for user %s", user_id)
        # Clean up analysis message if it was sent
        if analysis_msg is not None:
            try:
                await analysis_msg.delete()
            except Exception:  # noqa: BLE001
                pass
        return "Произошла ошибка при генерации сигнала. Попробуй позже."


@router.message(Command("signal"))
async def cmd_signal(message: Message) -> None:
    """Handle /signal command — request an on-demand signal."""
    error = await _send_signal_with_animation(message.from_user.id, message.bot)
    if error:
        await message.answer(error, parse_mode=ParseMode.HTML)


@router.callback_query(F.data == "get_signal")
async def cb_get_signal(query: CallbackQuery) -> None:
    """Handle inline 'get_signal' button press."""
    await query.answer()
    if query.from_user is None:
        return
    error = await _send_signal_with_animation(query.from_user.id, query.bot)
    if error:
        await query.message.answer(error, parse_mode=ParseMode.HTML)


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
