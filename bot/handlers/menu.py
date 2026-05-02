"""
Routes the persistent main-menu reply-keyboard button taps to the same
handlers that back the slash commands.

Order matters: this router must be registered AFTER specific handlers
(start, signals, link, stats) so that, e.g., "/signal" takes precedence
over a stray text "📊 Сигнал" being misrouted.
"""
import logging

from aiogram import F, Router
from aiogram.fsm.context import FSMContext
from aiogram.types import Message
from aiogram.enums import ParseMode

from database.db import get_referral_count, get_user, toggle_notifications
from services.formatter import format_tier_info
from services.imagegen import (
    make_achievements_grid,
    make_help_sheet,
    make_leaderboard_table,
    make_referral_card,
    make_settings_card,
    make_stats_card,
    make_tier_card,
)
from services.keyboards import (
    BTN_HELP,
    BTN_LINK,
    BTN_REF,
    BTN_SETTINGS,
    BTN_SIGNAL,
    BTN_STATS,
    BTN_TIER,
    MAIN_MENU,
    referral_inline,
)
from aiogram.types import BufferedInputFile

logger = logging.getLogger(__name__)
router = Router()


# Each button forwards to /command equivalents using bot.send_message-like flows.
# We reuse the underlying handler logic by importing them.

from handlers.signals import cmd_signal as do_signal  # noqa: E402
from handlers.stats import cmd_stats as do_stats  # noqa: E402
from handlers.link import cmd_link as do_link  # noqa: E402


@router.message(F.text == BTN_SIGNAL)
async def btn_signal(message: Message) -> None:
    await do_signal(message)


@router.message(F.text == BTN_TIER)
async def btn_tier(message: Message) -> None:
    user = await get_user(message.from_user.id)
    if user is None:
        await message.answer("Сначала /start.")
        return
    text = format_tier_info(user.tier, user.po_trader_id, user.signals_received)
    next_threshold = {0: 100, 1: 100, 2: 500, 3: 2000, 4: None}[user.tier] if user.tier <= 4 else None
    try:
        card = make_tier_card(user.tier, user.deposit_total, next_threshold)
        await message.answer_photo(
            BufferedInputFile(card, filename=f"tier_{user.tier}.png"),
            caption=text,
            parse_mode=ParseMode.HTML,
        )
    except Exception as exc:  # noqa: BLE001
        logger.warning("Could not render tier card: %s", exc)
        await message.answer(text, parse_mode=ParseMode.HTML)


@router.message(F.text == BTN_LINK)
async def btn_link(message: Message, state: FSMContext) -> None:
    # aiogram injects extra kwargs (bot, dispatcher, ...). do_link only wants
    # `state`, so we forward it explicitly rather than splatting **kwargs.
    await do_link(message, state)


@router.message(F.text == BTN_REF)
async def btn_ref(message: Message) -> None:
    user = await get_user(message.from_user.id)
    if user is None:
        await message.answer("Сначала /start.")
        return
    bot_info = await message.bot.get_me()
    referral_link = f"https://t.me/{bot_info.username}?start=ref_{user.referral_code}"
    invited = await get_referral_count(user.telegram_id)
    caption = (
        "<b>👥 Реферальная программа</b>\n"
        "\n"
        "Получай <b>5% sub-affiliate</b> от FTD каждого приглашённого — "
        "после его первого депозита на PocketOption по ТВОЕЙ ссылке.\n"
        "\n"
        f"<b>Ссылка:</b> <code>{referral_link}</code>"
    )
    try:
        card = make_referral_card(
            name=user.first_name,
            referral_code=user.referral_code,
            deep_link=referral_link,
            invited_count=invited,
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


@router.message(F.text == BTN_STATS)
async def btn_stats(message: Message) -> None:
    user = await get_user(message.from_user.id)
    if user is None:
        await do_stats(message)
        return
    total = user.wins + user.losses
    winrate = (user.wins / total * 100) if total else 0.0
    caption = (
        "<b>📊 Твоя статистика</b>\n"
        "\n"
        f"<b>Тир:</b> T{user.tier}  ·  <b>Депозит:</b> ${user.deposit_total:,.0f}\n"
        f"<b>Сигналов получено:</b> {user.signals_received}\n"
        f"<b>Wins / Losses:</b> {user.wins} / {user.losses}\n"
        f"<b>Винрейт:</b> {winrate:.1f}%"
    )
    try:
        card = make_stats_card(
            name=user.first_name,
            tier=user.tier,
            deposit=user.deposit_total,
            signals_received=user.signals_received,
            wins=user.wins,
            losses=user.losses,
        )
        await message.answer_photo(
            BufferedInputFile(card, filename="stats.png"),
            caption=caption,
            parse_mode=ParseMode.HTML,
        )
    except Exception as exc:  # noqa: BLE001
        logger.warning("Could not render stats card: %s", exc)
        await do_stats(message)


@router.message(F.text == BTN_SETTINGS)
async def btn_settings(message: Message) -> None:
    user = await get_user(message.from_user.id)
    if user is None:
        await message.answer("Сначала /start.")
        return
    text = (
        "<b>⚙️ Настройки</b>\n"
        "\n"
        "Переключить уведомления — /notifications\n"
        "Привязать PocketOption ID — /link"
    )
    try:
        card = make_settings_card(
            name=user.first_name,
            tier=user.tier,
            po_trader_id=user.po_trader_id,
            notifications_enabled=user.notifications_enabled,
        )
        await message.answer_photo(
            BufferedInputFile(card, filename="settings.png"),
            caption=text,
            parse_mode=ParseMode.HTML,
            reply_markup=MAIN_MENU,
        )
    except Exception as exc:  # noqa: BLE001
        logger.warning("Could not render settings card: %s", exc)
        await message.answer(text, parse_mode=ParseMode.HTML, reply_markup=MAIN_MENU)


HELP_COMMANDS: list[tuple[str, str]] = [
    ("/start", "приветствие и онбординг"),
    ("/signal", "получить торговый сигнал"),
    ("/tier", "твой тир и прогресс"),
    ("/stats", "личная статистика"),
    ("/ref", "реферальная ссылка + QR"),
    ("/link", "привязать PocketOption ID"),
    ("/achievements", "коллекция достижений"),
    ("/leaderboard", "топ-10 трейдеров"),
    ("/calc", "калькулятор сделки"),
    ("/notifications", "вкл/выкл уведомлений"),
    ("/settings", "настройки профиля"),
]


@router.message(F.text == BTN_HELP)
async def btn_help(message: Message) -> None:
    caption = "<b>❔ Справка по командам</b>"
    try:
        sheet = make_help_sheet(HELP_COMMANDS)
        await message.answer_photo(
            BufferedInputFile(sheet, filename="help.png"),
            caption=caption,
            parse_mode=ParseMode.HTML,
            reply_markup=MAIN_MENU,
        )
    except Exception as exc:  # noqa: BLE001
        logger.warning("Could not render help sheet: %s", exc)
        await message.answer(
            "<b>Команды</b>\n\n"
            + "\n".join(f"{c} — {d}" for c, d in HELP_COMMANDS),
            parse_mode=ParseMode.HTML,
            reply_markup=MAIN_MENU,
        )


@router.message(F.text.in_({"/notifications", "/notif"}))
async def cmd_notifications(message: Message) -> None:
    enabled = await toggle_notifications(message.from_user.id)
    state = "✅ включены" if enabled else "❌ отключены"
    await message.answer(f"Уведомления о новых сигналах: <b>{state}</b>", parse_mode=ParseMode.HTML)


@router.message(F.text.startswith("/calc"))
async def cmd_calc(message: Message) -> None:
    """
    /calc <deposit> <pct> <payout?>
    Defaults: pct=2, payout=82
    Example: /calc 500 3 80 → bet $15 (3% of $500), profit at 80% payout = $12
    """
    parts = (message.text or "").split()
    deposit = float(parts[1]) if len(parts) > 1 else 500
    pct = float(parts[2]) if len(parts) > 2 else 2.0
    payout = float(parts[3]) if len(parts) > 3 else 82.0
    bet = deposit * pct / 100
    profit = bet * payout / 100
    text = (
        "<b>📐 Калькулятор сделки</b>\n"
        "\n"
        f"<b>Депозит:</b> ${deposit:,.2f}\n"
        f"<b>Размер сделки:</b> {pct:g}% = <code>${bet:,.2f}</code>\n"
        f"<b>Payout:</b> {payout:g}%\n"
        f"<b>Прибыль при WIN:</b> <code>+${profit:,.2f}</code>\n"
        f"<b>Убыток при LOSS:</b> <code>-${bet:,.2f}</code>\n"
        "\n"
        "<i>Формат: /calc &lt;депозит&gt; &lt;%&gt; &lt;payout%&gt;</i>"
    )
    await message.answer(text, parse_mode=ParseMode.HTML)


@router.message(F.text.in_({"/achievements", "/badges"}))
async def cmd_achievements(message: Message) -> None:
    from services.achievements import list_for_user

    items = await list_for_user(message.from_user.id)
    earned = [a for a, ok in items if ok]
    caption = (
        f"<b>🏅 Достижения</b> — открыто {len(earned)} из {len(items)}\n\n"
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
        png = make_achievements_grid(grid_items)
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
    from database.db import get_top_users  # local import to keep menu cohesive

    top = await get_top_users(limit=10)
    if not top:
        await message.answer(
            "Лидерборд пока пуст — нужно минимум 5 сигналов с результатом, "
            "чтобы попасть в рейтинг.",
            parse_mode=ParseMode.HTML,
        )
        return
    my_rank: int | None = None
    rows = []
    for i, u in enumerate(top, start=1):
        total = u.wins + u.losses
        wr = u.wins / total * 100 if total else 0.0
        name = u.username or u.first_name
        rows.append((i, name, wr, u.wins, u.losses, u.tier))
        if u.telegram_id == message.from_user.id:
            my_rank = i

    caption = "<b>🏆 Лидерборд — топ по винрейту</b>"
    if my_rank:
        caption += f"\n\nТы на <b>{my_rank} месте</b>."
    try:
        png = make_leaderboard_table(rows, highlight_rank=my_rank)
        await message.answer_photo(
            BufferedInputFile(png, filename="leaderboard.png"),
            caption=caption,
            parse_mode=ParseMode.HTML,
        )
    except Exception as exc:  # noqa: BLE001
        logger.warning("Could not render leaderboard: %s", exc)
        lines = [caption, ""]
        medals = ["🥇", "🥈", "🥉"]
        for rank, name, wr, w, _l, t in rows:
            prefix = medals[rank - 1] if rank <= 3 else f"{rank}."
            total = w + _l
            lines.append(
                f"{prefix} <b>{name}</b> · <code>{wr:.1f}%</code> ({w}/{total}) · T{t}"
            )
        await message.answer("\n".join(lines), parse_mode=ParseMode.HTML)
