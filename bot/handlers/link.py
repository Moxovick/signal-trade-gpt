"""
/link command — finite-state attach flow for PocketOption trader ID.

The bot stores the ID locally (SQLite); the web platform Postback service is
the source of truth for tier, but storing the ID locally lets us prefill the
website form and answer /tier with at least the linked-status hint.
"""
import asyncio
import logging
import re

from aiogram import Router, F
from aiogram.filters import Command
from aiogram.types import CallbackQuery, Message, InlineKeyboardButton, InlineKeyboardMarkup
from aiogram.enums import ParseMode
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import StatesGroup, State

from database.db import get_user, log_activity, set_po_trader_id  # noqa: F401

logger = logging.getLogger(__name__)
router = Router()

PO_ID_RE = re.compile(r"^\d{6,12}$")


class LinkPo(StatesGroup):
    waiting_for_id = State()


@router.message(Command("link"))
async def cmd_link(message: Message, state: FSMContext) -> None:
    user = await get_user(message.from_user.id)
    if user is None:
        await message.answer("Сначала /start.")
        return

    if user.po_trader_id:
        await message.answer(
            f"Аккаунт привязан: <code>{user.po_trader_id}</code>.\n"
            f"Если нужно сменить — пришли новый ID (6–12 цифр).",
            parse_mode=ParseMode.HTML,
        )
        await state.set_state(LinkPo.waiting_for_id)
    else:
        # No PO ID — redirect to onboarding
        from handlers.onboarding import trigger_for_new_user
        await trigger_for_new_user(message)


@router.message(LinkPo.waiting_for_id, Command("cancel"))
async def cmd_cancel_in_link(message: Message, state: FSMContext) -> None:
    """Handle /cancel while waiting for PO trader ID."""
    await state.clear()
    await message.answer("Привязка отменена. Вернись когда будет готов — /link.")


@router.message(LinkPo.waiting_for_id, F.text)
async def receive_id(message: Message, state: FSMContext) -> None:
    candidate = (message.text or "").strip()
    # Catch any other command sent while in state (safety net)
    if candidate.startswith("/"):
        await state.clear()
        await message.answer(
            "Привязка отменена. Используй /link чтобы начать заново.",
        )
        return
    # If user tapped a menu button, cancel FSM and forward to menu handler
    from services.keyboards import MENU_BUTTONS
    if candidate in MENU_BUTTONS:
        await state.clear()
        # Re-process by importing and calling the menu handler directly
        from handlers.menu import dispatch_menu_button
        await dispatch_menu_button(message, state)
        return
    if not PO_ID_RE.match(candidate):
        await message.answer(
            "Trader ID должен быть числовым, 6–12 цифр.\n"
            "Найти его можно: PocketOption → Профиль → «Мой ID».\n\n"
            "Нажми /cancel чтобы отменить.",
        )
        return

    # Strict PO API verification
    try:
        from services.po_api import fetch_trader_info, _credentials

        if _credentials() is None:
            # API not configured — save without verification, warn in logs
            logger.warning("PO API credentials missing — saving ID %s without verification", candidate)
            await set_po_trader_id(message.from_user.id, candidate)
            await _send_success(message, state, candidate, verified=False, deposit=0.0)
            return

        info = await fetch_trader_info(candidate)
        if info is None:
            # ID not found in our partner network — REJECT
            from config import settings
            await message.answer(
                "❌ <b>Trader ID не найден</b> в нашей партнёрской сети.\n\n"
                "Убедись, что ты зарегистрировался на PocketOption "
                "<b>по нашей реферальной ссылке</b>.\n\n"
                "Если ещё не зарегистрирован — нажми кнопку ниже:",
                parse_mode=ParseMode.HTML,
                reply_markup=InlineKeyboardMarkup(inline_keyboard=[
                    [InlineKeyboardButton(text="🚀 Зарегистрироваться в PocketOption", url=settings.pocket_option_url)],
                    [InlineKeyboardButton(text="🔄 Ввести другой ID", callback_data="link:enter_id")],
                    [InlineKeyboardButton(text="❌ Отменить", callback_data="onb:cancel")],
                ]),
            )
            await state.clear()
            return

        # Verified! Save ID and deposit
        await set_po_trader_id(message.from_user.id, candidate)
        try:
            from database.db import set_deposit_total
            await set_deposit_total(message.from_user.id, info.deposit_total)
        except Exception:
            logger.warning("Could not store deposit_total", exc_info=True)

        await _send_success(message, state, candidate, verified=True, deposit=info.deposit_total)

    except Exception as exc:
        logger.warning("PO verification error: %s", exc)
        await message.answer(
            "⚠️ PocketOption API временно недоступен. Попробуй через минуту.\n"
            "Нажми /cancel чтобы отменить.",
        )
        # Keep FSM state so user can retry


async def _send_success(message: Message, state: FSMContext, trader_id: str, verified: bool, deposit: float) -> None:
    """Send success message after PO ID is saved."""
    asyncio.create_task(log_activity(message.from_user.id, "po_link", {
        "trader_id": trader_id,
        "verified": verified,
        "deposit": deposit,
    }))
    data = await state.get_data()
    is_onboarding = bool(data.get("onboarding"))
    await state.clear()

    verify_line = ""
    if verified:
        verify_line = f"\n✅ <b>Подтверждено</b> — депозит: ${deposit:,.0f}"

    if is_onboarding:
        bot_info = await message.bot.get_me()
        user = await get_user(message.from_user.id)
        ref_code = user.referral_code if user else "??"
        ref_link = f"https://t.me/{bot_info.username}?start=ref_{ref_code}"
        await message.answer(
            f"<b>✅ Готово — PocketOption привязан!</b>\n"
            f"\n"
            f"Trader ID: <code>{trader_id}</code>"
            f"{verify_line}\n"
            f"Уровень: <b>Free</b> — OTC-сигналы, 3/день\n"
            f"\n"
            f"Нажми «🎯 Получить сигнал» в меню, чтобы запросить сигнал.\n"
            f"Депозит ≥ $20 → <b>Basic</b> (10/день), ≥ $100 → <b>Pro</b> (безлимит).\n"
            f"\n"
            f"Реф-ссылка (5% с FTD приглашённых):\n"
            f"<code>{ref_link}</code>",
            parse_mode=ParseMode.HTML,
        )
    else:
        await message.answer(
            f"<b>✅ PocketOption привязан.</b>\n\n"
            f"Trader ID: <code>{trader_id}</code>"
            f"{verify_line}\n"
            f"Уровень обновится автоматически после депозита.",
            parse_mode=ParseMode.HTML,
        )


@router.callback_query(F.data == "link:enter_id")
async def cb_enter_id(query: CallbackQuery, state: FSMContext) -> None:
    """Handle inline button 'Я уже зарегистрирован — ввести ID'."""
    await query.answer()
    await state.set_state(LinkPo.waiting_for_id)
    await query.message.answer(
        "Пришли свой PocketOption Trader ID (только цифры, 6–12 знаков).\n"
        "Найти его можно в профиле PocketOption → раздел «Мой ID».",
    )


@router.message(Command("cancel"))
async def cmd_cancel(message: Message, state: FSMContext) -> None:
    await state.clear()
    await message.answer("Отменено.")
