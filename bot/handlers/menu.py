"""
Routes the persistent main-menu reply-keyboard button taps to the same
handlers that back the slash commands.

Order matters: this router must be registered AFTER specific handlers
(start, signals, link, stats) so that, e.g., "/signal" takes precedence
over a stray text "📊 Сигнал" being misrouted.
"""
import asyncio
import logging

from aiogram import F, Router
from aiogram.fsm.context import FSMContext
from aiogram.types import Message
from aiogram.enums import ParseMode

from database.db import get_referral_count, get_user, log_activity, toggle_notifications
from i18n import t
from i18n_helpers import get_locale
from services.imagegen import (
    make_achievements_grid,
    make_leaderboard_table,
    make_referral_card,
)
from services.keyboards import (
    BTN_HELP,
    BTN_LEADERBOARD,
    BTN_PROFILE,
    BTN_REF,
    BTN_SIGNAL,
    MAIN_MENU,
    referral_inline,
)
from aiogram.types import BufferedInputFile

logger = logging.getLogger(__name__)
router = Router()

from handlers.signals import _send_signal_with_animation  # noqa: E402


async def dispatch_menu_button(message: Message, state: FSMContext) -> None:
    """Dispatch a menu button press. Called from link FSM when user taps a menu button."""
    text = (message.text or "").strip()
    if text == BTN_SIGNAL:
        await btn_signal(message, state)
    elif text == BTN_REF:
        await btn_ref(message, state)
    elif text == BTN_LEADERBOARD:
        await btn_leaderboard(message)
    elif text == BTN_PROFILE:
        await btn_profile(message)
    elif text == BTN_HELP:
        await btn_help(message)


@router.message(F.text == BTN_SIGNAL)
async def btn_signal(message: Message, state: FSMContext) -> None:
    await state.clear()
    locale = get_locale(message.from_user)
    # Check if user has PO ID before allowing signal
    user = await get_user(message.from_user.id)
    if user is None:
        await message.answer(t("common.start_first", locale))
        return
    if not user.po_trader_id:
        from services.tier_sync import try_sync_user
        synced = await try_sync_user(message.from_user.id)
        if synced:
            user = await get_user(message.from_user.id)
        if not user or not user.po_trader_id:
            await message.answer(
                t("signal.need_po_account", locale),
                parse_mode=ParseMode.HTML,
            )
            return
    error = await _send_signal_with_animation(message.from_user.id, message.bot, locale)
    if error:
        from aiogram.enums import ParseMode as _PM
        await message.answer(error, parse_mode=_PM.HTML)


@router.message(F.text == BTN_REF)
async def btn_ref(message: Message, state: FSMContext) -> None:
    await state.clear()
    locale = get_locale(message.from_user)
    user = await get_user(message.from_user.id)
    if user is None:
        await message.answer(t("common.start_first_alt", locale))
        return
    bot_info = await message.bot.get_me()
    referral_link = f"https://t.me/{bot_info.username}?start=ref_{user.referral_code}"
    invited = await get_referral_count(user.telegram_id)
    caption = t("ref.caption", locale, ref_link=referral_link)
    try:
        card = make_referral_card(
            name=user.first_name,
            referral_code=user.referral_code,
            deep_link=referral_link,
            invited_count=invited,
            locale=locale,
        )
        await message.answer_photo(
            BufferedInputFile(card, filename=f"ref_{user.referral_code}.png"),
            caption=caption,
            parse_mode=ParseMode.HTML,
            reply_markup=referral_inline(bot_info.username, user.referral_code),
        )
    except Exception as exc:  # noqa: BLE001
        logger.warning("Could not render referral card: %s", exc)
        await message.answer(
            caption,
            parse_mode=ParseMode.HTML,
            reply_markup=referral_inline(bot_info.username, user.referral_code),
        )


@router.message(F.text == BTN_LEADERBOARD)
async def btn_leaderboard(message: Message) -> None:
    """Shortcut for /leaderboard from menu button."""
    asyncio.create_task(log_activity(message.from_user.id, "leaderboard_view"))
    await cmd_leaderboard(message)


@router.message(F.text == BTN_PROFILE)
async def btn_profile(message: Message) -> None:
    """Show user profile with tier, stats, PO ID."""
    asyncio.create_task(log_activity(message.from_user.id, "profile_view"))
    locale = get_locale(message.from_user)
    user = await get_user(message.from_user.id)
    if user is None:
        await message.answer(t("common.start_first", locale))
        return

    if not user.po_trader_id:
        from services.tier_sync import try_sync_user
        if await try_sync_user(message.from_user.id):
            user = await get_user(message.from_user.id)

    from constants import TIER_NAMES, TIER_DAILY_LIMITS

    tier_name = TIER_NAMES.get(user.tier, "Free")
    daily_limit = TIER_DAILY_LIMITS.get(user.tier, 3)
    limit_text = t("common.unlimited", locale) if daily_limit is None else f"{daily_limit}{t('common.per_day', locale)}"
    wins = user.wins or 0
    losses = user.losses or 0
    total_trades = wins + losses
    winrate = (wins / total_trades * 100) if total_trades > 0 else 0

    po_line = f"<code>{user.po_trader_id}</code>" if user.po_trader_id else t("stats.no_po", locale)

    name = user.first_name or user.username or t("common.trader", locale)
    text = t(
        "stats.detailed_profile",
        locale,
        name=name,
        tier_name=tier_name,
        po_line=po_line,
        signals_received=user.signals_received,
        limit=limit_text,
        wins=wins,
        losses=losses,
        winrate=winrate,
    )

    if user.tier < 2:
        next_tier = TIER_NAMES.get(user.tier + 1, "Pro")
        from constants import TIER_DEPOSIT_THRESHOLDS
        threshold = TIER_DEPOSIT_THRESHOLDS.get(user.tier + 1, 100)
        text += "\n" + t("stats.to_next_tier", locale, next_tier=next_tier, threshold=threshold)

    await message.answer(text, parse_mode=ParseMode.HTML)


@router.message(F.text == BTN_HELP)
async def btn_help(message: Message) -> None:
    asyncio.create_task(log_activity(message.from_user.id, "help_view"))
    locale = get_locale(message.from_user)
    help_commands: list[tuple[str, str]] = [
        ("/start", t("help.cmd_start_desc", locale)),
        ("/signal", t("help.cmd_signal_desc", locale)),
        ("/ref", t("help.cmd_ref_desc", locale)),
        ("/leaderboard", t("help.cmd_leaderboard_desc", locale)),
        ("/calc", t("help.cmd_calc_desc", locale)),
        ("/cancel", t("help.cmd_cancel_desc", locale)),
        ("/help", t("help.cmd_help_desc", locale)),
    ]
    text = (
        t("help.commands_header", locale) + "\n\n"
        + "\n".join(f"{c} — {d}" for c, d in help_commands)
        + "\n\n" + t("help.spacesignal_footer", locale)
    )
    await message.answer(text, parse_mode=ParseMode.HTML, reply_markup=MAIN_MENU)


@router.message(F.text.in_({"/notifications", "/notif"}))
async def cmd_notifications(message: Message) -> None:
    locale = get_locale(message.from_user)
    enabled = await toggle_notifications(message.from_user.id)
    state_key = "notifications.enabled" if enabled else "notifications.disabled"
    await message.answer(
        t("notifications.status", locale, state=t(state_key, locale)),
        parse_mode=ParseMode.HTML,
    )


@router.message(F.text.startswith("/calc"))
async def cmd_calc(message: Message) -> None:
    """
    /calc <deposit> <pct> <payout?>
    Defaults: pct=2, payout=82
    Example: /calc 500 3 80 → bet $15 (3% of $500), profit at 80% payout = $12
    """
    locale = get_locale(message.from_user)
    parts = (message.text or "").split()
    try:
        deposit = float(parts[1]) if len(parts) > 1 else 500
        pct = float(parts[2]) if len(parts) > 2 else 2.0
        payout = float(parts[3]) if len(parts) > 3 else 82.0
    except (ValueError, IndexError):
        await message.answer(t("calc.invalid_format", locale), parse_mode=ParseMode.HTML)
        return
    if deposit <= 0 or pct <= 0 or payout <= 0:
        await message.answer(t("calc.positive_values", locale))
        return
    bet = deposit * pct / 100
    profit = bet * payout / 100
    text = t("calc.result", locale, deposit=deposit, pct=pct, bet=bet, payout=payout, profit=profit)
    await message.answer(text, parse_mode=ParseMode.HTML)


@router.message(F.text.in_({"/achievements", "/badges"}))
async def cmd_achievements(message: Message) -> None:
    from services.achievements import list_for_user

    locale = get_locale(message.from_user)
    items = await list_for_user(message.from_user.id)
    earned = [a for a, ok in items if ok]
    caption = (
        t("achievements.header", locale, earned=len(earned), total=len(items)) + "\n\n"
        + "\n".join(
            f"{'✅' if ok else '🔒'} <b>{a.title}</b> — <i>{a.description}</i>"
            for a, ok in items[:8]
        )
    )
    try:
        grid_items: list[tuple[str, str, bool]] = []
        for a, ok in items:
            # title format is "🏅 Name" — split off leading emoji
            parts = a.title.split(" ", 1)
            if len(parts) == 2 and not parts[0].isascii():
                emoji_, title_ = parts
            else:
                emoji_, title_ = "🏅", a.title
            grid_items.append((emoji_, title_, ok))
        png = make_achievements_grid(grid_items, locale=locale)
        await message.answer_photo(
            BufferedInputFile(png, filename="achievements.png"),
            caption=caption,
            parse_mode=ParseMode.HTML,
        )
    except Exception as exc:  # noqa: BLE001
        logger.warning("Could not render achievements grid: %s", exc)
        await message.answer(caption, parse_mode=ParseMode.HTML)


@router.message(F.text.in_({"/leaderboard", "/top"}))
async def cmd_leaderboard(message: Message) -> None:
    import httpx
    from config import settings

    rows: list[tuple[int, str, float, int, int, int]] = []

    # Try fetching from web API (shared fake leaderboard)
    if settings.platform_api_url:
        try:
            url = f"{settings.platform_api_url.rstrip('/')}/api/leaderboard"
            async with httpx.AsyncClient(timeout=5.0, follow_redirects=True) as client:
                resp = await client.get(url)
            if resp.is_success:
                data = resp.json()
                for entry in data.get("entries", []):
                    rank = entry.get("rank", 0)
                    name = entry.get("user", {}).get("firstName", "—")
                    tier = entry.get("tier", 2)
                    signals = entry.get("signalsReceived", 0)
                    earnings = entry.get("earnings", 0)
                    rows.append((rank, name, float(earnings), signals, 0, tier))
        except Exception as exc:  # noqa: BLE001
            logger.warning("Could not fetch leaderboard from web: %s", exc)

    # Fallback to local DB if web API unavailable
    if not rows:
        from database.db import get_top_users
        top = await get_top_users(limit=10)
        for i, u in enumerate(top, start=1):
            name = u.username or u.first_name
            rows.append((i, name, 0.0, u.signals_received, 0, u.tier))

    locale = get_locale(message.from_user)
    if not rows:
        await message.answer(t("leaderboard.empty", locale), parse_mode=ParseMode.HTML)
        return

    caption = t("leaderboard.header", locale)
    try:
        png = make_leaderboard_table(rows, highlight_rank=None, locale=locale)
        await message.answer_photo(
            BufferedInputFile(png, filename="leaderboard.png"),
            caption=caption,
            parse_mode=ParseMode.HTML,
        )
    except Exception as exc:  # noqa: BLE001
        logger.warning("Could not render leaderboard: %s", exc)
        lines = [caption, ""]
        medals = ["🥇", "🥈", "🥉"]
        for rank, name, earnings, _w, _l, _t in rows:
            prefix = medals[rank - 1] if rank <= 3 else f"{rank}."
            earn_str = f"${int(earnings):,}" if earnings > 0 else ""
            lines.append(f"{prefix} <b>{name}</b> · {earn_str}")
        await message.answer("\n".join(lines), parse_mode=ParseMode.HTML)
