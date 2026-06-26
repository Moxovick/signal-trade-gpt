"""
On-demand signal delivery with multi-step pair selection + Win/Loss feedback.

Flow: /signal → category → sub-category → pair → expiration → signal.
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
from aiogram.utils.keyboard import InlineKeyboardBuilder

from config import settings
from i18n import t
from i18n_helpers import get_locale
from constants import (
    EXPIRATIONS,
    PAIRS_BY_TIER,
    SIGNAL_TIER_LABELS,
    SUBCATEGORY_LABELS,
    TIER_DAILY_LIMITS,
    TIER_NAMES,
    TIER_SIGNAL_TYPES,
    PairInfo,
)
import services.web_sync as web_sync
from database.db import (
    get_daily_signal_count,
    get_user,
    increment_daily_signal,
    increment_signals_received,
    log_activity,
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
from services.signal_generator import generate_signal, generate_signal_for_pair

logger = logging.getLogger(__name__)
router = Router()

# Per-user lock to prevent concurrent signal requests bypassing daily limits.
_user_locks: dict[int, asyncio.Lock] = {}

def _analysis_steps(locale: str) -> list[str]:
    return [
        t("signal.analyzing", locale),
        t("signal.checking_indicators", locale),
        t("signal.evaluating_entry", locale),
        t("signal.calculating_probability", locale),
        t("signal.forming_signal", locale),
    ]


# ── Helpers ──────────────────────────────────────────────────────────────────


def _get_available_categories(pairs: list[PairInfo]) -> list[str]:
    """Return sorted unique categories present in a pair list."""
    seen: set[str] = set()
    result: list[str] = []
    for p in pairs:
        cat = p["category"]
        if cat not in seen:
            seen.add(cat)
            result.append(cat)
    return result


def _get_pairs_for_subcategory(
    tier_key: str, subcategory: str
) -> list[PairInfo]:
    """Return pairs matching tier + sub-category."""
    pairs = PAIRS_BY_TIER.get(tier_key, [])
    return [p for p in pairs if p["category"] == subcategory]


def _find_pair(tier_key: str, pair_symbol: str) -> PairInfo | None:
    """Find a pair by symbol in a tier's pair list."""
    for p in PAIRS_BY_TIER.get(tier_key, []):
        if p["symbol"] == pair_symbol:
            return p
    return None


# ── Step 1: Show signal-type category buttons ───────────────────────────────


def _build_category_keyboard(user_tier: int) -> InlineKeyboardBuilder:
    """Build inline keyboard with signal categories available to user's tier."""
    allowed = web_sync.get_allowed_types(user_tier) or TIER_SIGNAL_TYPES.get(
        user_tier, ["otc"]
    )
    builder = InlineKeyboardBuilder()
    for sig_tier in allowed:
        label = SIGNAL_TIER_LABELS.get(sig_tier, sig_tier.upper())
        builder.button(text=label, callback_data=f"sig_cat:{sig_tier}")
    builder.adjust(3)
    return builder


async def _validate_user(user_id: int, locale: str = "ru") -> tuple[str | None, Any]:
    """Validate that a user exists and has PO linked."""
    user = await get_user(user_id)
    if user is None:
        return t("signal.register_first", locale), None
    if not user.po_trader_id:
        return t("signal.need_po_account_with_link", locale), None
    return None, user


def _get_web_daily_usage(telegram_id: int) -> int | None:
    """Get today's signal usage from web_sync snapshot. Returns None if unavailable."""
    snapshot = web_sync.state().accounts
    tg_str = str(telegram_id)
    for item in snapshot:
        if item.get("telegramId") == tg_str:
            val = item.get("signalsTodayUsed")
            return int(val) if val is not None else None
    return None


async def _check_daily_limit(user: Any, locale: str = "ru") -> str | None:
    """Check daily limit. Returns error text or None if OK."""
    await reset_daily_signals_if_expired(user.telegram_id)
    daily_limit = web_sync.get_daily_limit(user.tier)
    if daily_limit is None:
        daily_limit = TIER_DAILY_LIMITS.get(user.tier)

    # Refresh web sync for real-time usage data (fast — single HTTP call)
    await web_sync.refresh_now()
    web_used = _get_web_daily_usage(user.telegram_id)
    if web_used is not None:
        used = web_used
        limit = daily_limit
        can_request = limit is None or used < limit
    else:
        used, limit, can_request = await get_daily_signal_count(
            user.telegram_id, daily_limit
        )
    if not can_request:
        if user.tier < 2:
            next_tier = TIER_NAMES.get(user.tier + 1, "Pro")
            return t("signal.limit_exceeded_upgrade", locale,
                     used=used, limit=limit, next_tier=next_tier)
        return t("signal.limit_exceeded", locale, used=used, limit=limit)
    return None


@router.message(Command("signal"))
async def cmd_signal(message: Message) -> None:
    """Handle /signal command — show category picker."""
    locale = get_locale(message.from_user)
    error, user = await _validate_user(message.from_user.id, locale)
    if error:
        await message.answer(error, parse_mode=ParseMode.HTML)
        return

    limit_error = await _check_daily_limit(user, locale)
    if limit_error:
        await message.answer(limit_error, parse_mode=ParseMode.HTML)
        return

    kb = _build_category_keyboard(user.tier)
    await message.answer(
        t("signal.choose_type", locale),
        parse_mode=ParseMode.HTML,
        reply_markup=kb.as_markup(),
    )


@router.callback_query(F.data == "get_signal")
async def cb_get_signal(query: CallbackQuery) -> None:
    """Handle inline 'get_signal' / 'Ещё сигнал' button — restart flow."""
    await query.answer()
    if query.from_user is None:
        return

    locale = get_locale(query.from_user)
    error, user = await _validate_user(query.from_user.id, locale)
    if error:
        await query.message.answer(error, parse_mode=ParseMode.HTML)
        return

    limit_error = await _check_daily_limit(user, locale)
    if limit_error:
        await query.message.answer(limit_error, parse_mode=ParseMode.HTML)
        return

    kb = _build_category_keyboard(user.tier)
    await query.message.answer(
        t("signal.choose_type", locale),
        parse_mode=ParseMode.HTML,
        reply_markup=kb.as_markup(),
    )


# ── Step 2: User picks category → show sub-categories ───────────────────────


@router.callback_query(F.data.startswith("sig_cat:"))
async def cb_signal_category(query: CallbackQuery) -> None:
    """User picked a signal category (otc/exchange/elite)."""
    await query.answer()
    if query.from_user is None:
        return

    locale = get_locale(query.from_user)
    sig_tier = query.data.split(":", 1)[1]  # e.g. "otc"

    # Validate tier access
    error, user = await _validate_user(query.from_user.id, locale)
    if error:
        await query.message.answer(error, parse_mode=ParseMode.HTML)
        return

    allowed = web_sync.get_allowed_types(user.tier) or TIER_SIGNAL_TYPES.get(
        user.tier, ["otc"]
    )
    if sig_tier not in allowed:
        await query.message.answer(
            t("signal.unavailable_tier", locale),
            parse_mode=ParseMode.HTML,
        )
        return

    pairs = PAIRS_BY_TIER.get(sig_tier, [])
    categories = _get_available_categories(pairs)

    builder = InlineKeyboardBuilder()
    for cat in categories:
        label = SUBCATEGORY_LABELS.get(cat, cat.title())
        builder.button(text=label, callback_data=f"sig_sub:{sig_tier}:{cat}")
    builder.button(text=t("keyboard.back", locale), callback_data="sig_back_to_cat")
    builder.adjust(2)

    tier_label = SIGNAL_TIER_LABELS.get(sig_tier, sig_tier.upper())
    choose_cat = t("signal.choose_category", locale)
    try:
        await query.message.edit_text(
            f"{tier_label}\n\n{choose_cat}",
            parse_mode=ParseMode.HTML,
            reply_markup=builder.as_markup(),
        )
    except Exception:  # noqa: BLE001
        await query.message.answer(
            f"{tier_label}\n\n{choose_cat}",
            parse_mode=ParseMode.HTML,
            reply_markup=builder.as_markup(),
        )


@router.callback_query(F.data == "sig_back_to_cat")
async def cb_back_to_category(query: CallbackQuery) -> None:
    """Back button → return to category selection."""
    await query.answer()
    if query.from_user is None:
        return
    locale = get_locale(query.from_user)
    error, user = await _validate_user(query.from_user.id, locale)
    if error:
        await query.message.answer(error, parse_mode=ParseMode.HTML)
        return
    kb = _build_category_keyboard(user.tier)
    choose_type = t("signal.choose_type", locale)
    try:
        await query.message.edit_text(
            choose_type,
            parse_mode=ParseMode.HTML,
            reply_markup=kb.as_markup(),
        )
    except Exception:  # noqa: BLE001
        await query.message.answer(
            choose_type,
            parse_mode=ParseMode.HTML,
            reply_markup=kb.as_markup(),
        )


# ── Step 3: User picks sub-category → show pairs ────────────────────────────


@router.callback_query(F.data.startswith("sig_sub:"))
async def cb_signal_subcategory(query: CallbackQuery) -> None:
    """User picked a sub-category → show pairs."""
    await query.answer()
    if query.from_user is None:
        return

    locale = get_locale(query.from_user)
    parts = query.data.split(":", 2)
    if len(parts) < 3:
        return
    sig_tier = parts[1]
    subcategory = parts[2]

    pairs = _get_pairs_for_subcategory(sig_tier, subcategory)
    if not pairs:
        await query.message.answer(t("signal.no_pairs_in_category", locale))
        return

    builder = InlineKeyboardBuilder()
    for p in pairs:
        payout = p["payout"]
        btn_text = f"{p['name']}  ({payout}%)"
        builder.button(
            text=btn_text,
            callback_data=f"sig_pair:{sig_tier}:{p['symbol']}",
        )
    builder.button(text=t("keyboard.back", locale), callback_data=f"sig_cat:{sig_tier}")
    builder.adjust(2)

    cat_label = SUBCATEGORY_LABELS.get(subcategory, subcategory.title())
    choose_pair = t("signal.choose_pair", locale)
    try:
        await query.message.edit_text(
            f"{cat_label}\n\n{choose_pair}",
            parse_mode=ParseMode.HTML,
            reply_markup=builder.as_markup(),
        )
    except Exception:  # noqa: BLE001
        await query.message.answer(
            f"{cat_label}\n\n{choose_pair}",
            parse_mode=ParseMode.HTML,
            reply_markup=builder.as_markup(),
        )


# ── Step 4: User picks pair → show expirations ──────────────────────────────


@router.callback_query(F.data.startswith("sig_pair:"))
async def cb_signal_pair(query: CallbackQuery) -> None:
    """User picked a pair → show expiration options."""
    await query.answer()
    if query.from_user is None:
        return

    locale = get_locale(query.from_user)
    parts = query.data.split(":", 2)
    if len(parts) < 3:
        return
    sig_tier = parts[1]
    pair_symbol = parts[2]

    pair_info = _find_pair(sig_tier, pair_symbol)
    if pair_info is None:
        await query.message.answer(t("signal.pair_not_found", locale))
        return

    expirations = EXPIRATIONS.get(sig_tier, EXPIRATIONS["otc"])
    builder = InlineKeyboardBuilder()
    for label, code in expirations:
        builder.button(
            text=label,
            callback_data=f"sig_exp:{sig_tier}:{pair_symbol}:{code}",
        )
    # Back to sub-category
    builder.button(
        text=t("keyboard.back", locale),
        callback_data=f"sig_sub:{sig_tier}:{pair_info['category']}",
    )
    builder.adjust(3)

    pair_payout = t("signal.pair_payout", locale,
                    pair_name=pair_info["name"], payout=pair_info["payout"])
    choose_exp = t("signal.choose_expiration", locale)
    try:
        await query.message.edit_text(
            f"{pair_payout}\n\n{choose_exp}",
            parse_mode=ParseMode.HTML,
            reply_markup=builder.as_markup(),
        )
    except Exception:  # noqa: BLE001
        await query.message.answer(
            f"{pair_payout}\n\n{choose_exp}",
            parse_mode=ParseMode.HTML,
            reply_markup=builder.as_markup(),
        )


# ── Step 5: User picks expiration → generate & send signal ──────────────────


def _can_use_web_api() -> bool:
    """Check whether we have the web platform API configured."""
    return bool(settings.platform_api_url and settings.bot_sync_secret)


async def _mirror_signal_to_web(telegram_id: int, pair: str, expiration: str) -> None:
    """Fire-and-forget: mirror a locally-generated signal to the web platform's Postgres."""
    if not (settings.platform_api_url and settings.bot_sync_secret):
        return
    url = f"{settings.platform_api_url.rstrip('/')}/api/bot/signal-request"
    headers = {
        "X-Bot-Secret": settings.bot_sync_secret,
        "Content-Type": "application/json",
    }
    payload = {"telegramId": telegram_id, "pair": pair, "expiration": expiration}
    try:
        async with httpx.AsyncClient(timeout=5.0, follow_redirects=True) as client:
            resp = await client.post(url, json=payload, headers=headers)
            if resp.status_code >= 400:
                logger.warning(
                    "mirror_signal_to_web: non-2xx %s for telegram_id=%s: %s",
                    resp.status_code,
                    telegram_id,
                    resp.text[:200],
                )
    except Exception:
        logger.warning(
            "mirror_signal_to_web: request failed for telegram_id=%s", telegram_id, exc_info=True
        )


async def _show_analysis_animation(
    bot: Bot, chat_id: int, delay_seconds: float, locale: str = "ru"
) -> Message:
    """Send and animate analysis progress messages."""
    steps = _analysis_steps(locale)
    msg = await bot.send_message(chat_id, f"⏳ {steps[0]}")
    step_interval = delay_seconds / len(steps)

    for i, step_text in enumerate(steps[1:], 1):
        await asyncio.sleep(step_interval)
        progress = "▓" * i + "░" * (len(steps) - i)
        try:
            await msg.edit_text(
                f"⏳ {step_text}\n\n[{progress}] {int(i / len(steps) * 100)}%"
            )
        except Exception:  # noqa: BLE001
            pass

    return msg


def _get_user_lock(user_id: int) -> asyncio.Lock:
    if user_id not in _user_locks:
        _user_locks[user_id] = asyncio.Lock()
    return _user_locks[user_id]


@router.callback_query(F.data.startswith("sig_exp:"))
async def cb_signal_expiration(query: CallbackQuery) -> None:
    """User picked expiration → generate signal and send."""
    await query.answer()
    if query.from_user is None:
        return

    locale = get_locale(query.from_user)
    parts = query.data.split(":", 3)
    if len(parts) < 4:
        return
    sig_tier = parts[1]
    pair_symbol = parts[2]
    exp_code = parts[3]

    user_id = query.from_user.id
    bot = query.bot

    lock = _get_user_lock(user_id)
    if lock.locked():
        await query.message.answer(t("signal.generating", locale))
        return

    async with lock:
        # Validate user again
        error, user = await _validate_user(user_id, locale)
        if error:
            await query.message.answer(error, parse_mode=ParseMode.HTML)
            return

        # Check daily limit
        limit_error = await _check_daily_limit(user, locale)
        if limit_error:
            await query.message.answer(limit_error, parse_mode=ParseMode.HTML)
            return

        # Verify tier access
        allowed = web_sync.get_allowed_types(user.tier) or TIER_SIGNAL_TYPES.get(
            user.tier, ["otc"]
        )
        if sig_tier not in allowed:
            await query.message.answer(
                t("signal.unavailable_tier", locale),
                parse_mode=ParseMode.HTML,
            )
            return

        # Remove the expiration keyboard
        try:
            await query.message.edit_reply_markup(reply_markup=None)
        except Exception:  # noqa: BLE001
            pass

        # Animation + generation in parallel
        delay = random.uniform(settings.analysis_delay_min, settings.analysis_delay_max)
        analysis_msg: Message | None = None

        try:
            animation_task = asyncio.create_task(
                _show_analysis_animation(bot, user.telegram_id, delay, locale)
            )

            # Generate signal
            signal = generate_signal_for_pair(sig_tier, pair_symbol, exp_code)
            sid = await save_signal(signal, telegram_id=user_id)
            signal.id = sid

            # Increment counters early — before chart/send so limit is
            # enforced even if later steps fail.
            await increment_daily_signal(user.telegram_id)
            await increment_signals_received(user.telegram_id)

            # Mirror to web platform for cross-platform history
            asyncio.create_task(_mirror_signal_to_web(user_id, pair_symbol, exp_code))

            analysis_msg = await animation_task
            try:
                await analysis_msg.delete()
            except Exception:  # noqa: BLE001
                pass

            # Build chart
            tier_str = signal.tier or "otc"
            is_otc = tier_str in {"otc", "demo"}

            if is_otc:
                chart_bytes: bytes = make_otc_banner(signal)
            else:
                real_ohlc = await fetch_ohlc(signal.pair)
                chart_bytes = make_signal_chart_advanced(signal, ohlc=real_ohlc)

            # Activity log (fire-and-forget)
            asyncio.create_task(log_activity(user_id, "signal_request", {
                "pair": pair_symbol,
                "tier": sig_tier,
                "expiration": exp_code,
            }))

            # Send signal photo
            await bot.send_photo(
                chat_id=user.telegram_id,
                photo=BufferedInputFile(
                    chart_bytes, filename=f"signal_{signal.id}.png"
                ),
                caption=caption,
                parse_mode=ParseMode.HTML,
                reply_markup=signal_inline(
                    settings.pocket_option_url, signal.id
                ),
            )

            # Achievement check
            updated_user = await get_user(user.telegram_id)
            if updated_user:
                await check_and_award(bot, updated_user)

        except Exception:
            logger.exception("Signal request failed for user %s", user_id)
            if analysis_msg is not None:
                try:
                    await analysis_msg.delete()
                except Exception:  # noqa: BLE001
                    pass
            await query.message.answer(t("signal.generation_error", locale))


# ── Legacy: full auto-flow (used by web API path) ───────────────────────────


async def _request_signal_via_api(telegram_id: int) -> dict[str, Any] | None:
    """Call the web platform's /api/bot/signal-request endpoint."""
    url = f"{settings.platform_api_url.rstrip('/')}/api/bot/signal-request"
    headers = {
        "X-Bot-Secret": settings.bot_sync_secret,
        "Content-Type": "application/json",
    }
    payload = {"telegramId": telegram_id}

    try:
        async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
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


async def _generate_signal_data(
    user: Any,
    locale: str = "ru",
) -> tuple[str | None, Signal | None, bytes | None, dict[str, Any] | None]:
    """Generate a signal via API or local fallback (legacy random)."""

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
                            t("signal.limit_exceeded_upgrade", locale,
                              used=used, limit=daily_limit, next_tier=next_tier)
                        ), None, None, None
                    return (
                        t("signal.limit_exceeded", locale, used=used, limit=daily_limit)
                    ), None, None, None
                return t("signal.user_not_found_platform", locale), None, None, None

            if status == 404:
                return t("signal.user_not_found_register", locale), None, None, None

            if status >= 400:
                logger.warning("Web API returned status %s: %s", status, api_resp.get("error"))
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

    daily_limit = web_sync.get_daily_limit(user.tier)
    if daily_limit is None:
        daily_limit = TIER_DAILY_LIMITS.get(user.tier)
    used, limit, can_request = await get_daily_signal_count(user.telegram_id, daily_limit)

    if not can_request:
        if user.tier < 2:
            next_tier = TIER_NAMES.get(user.tier + 1, "Pro")
            return (
                t("signal.limit_exceeded_upgrade", locale, used=used, limit=limit, next_tier=next_tier)
            ), None, None, None
        return (
            t("signal.limit_exceeded", locale, used=used, limit=limit)
        ), None, None, None

    allowed_types = web_sync.get_allowed_types(user.tier) or TIER_SIGNAL_TYPES.get(user.tier, ["otc"])
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


async def _send_signal_with_animation(user_id: int, bot: Bot, locale: str = "ru") -> str | None:
    """
    Full signal flow for legacy callers (menu button).

    Now starts the multi-step picker instead of generating immediately.
    Returns error text or None.
    """
    error, user = await _validate_user(user_id, locale)
    if error:
        return error

    limit_error = await _check_daily_limit(user, locale)
    if limit_error:
        return limit_error

    # Send the category picker — the rest continues via callbacks
    kb = _build_category_keyboard(user.tier)
    await bot.send_message(
        user.telegram_id,
        t("signal.choose_type", locale),
        parse_mode=ParseMode.HTML,
        reply_markup=kb.as_markup(),
    )
    return None


# ── Win/Loss feedback ────────────────────────────────────────────────────────


@router.callback_query(F.data.startswith("result:"))
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

    locale = get_locale(query.from_user)
    await record_signal_result(query.from_user.id, signal_id, result)
    label = t("signal.result_win", locale) if result == "win" else t("signal.result_loss", locale)
    await query.answer(label, show_alert=False)

    try:
        await query.message.edit_reply_markup(reply_markup=None)
    except Exception:  # noqa: BLE001
        pass

    user = await get_user(query.from_user.id)
    if user is not None:
        await check_and_award(query.bot, user)
