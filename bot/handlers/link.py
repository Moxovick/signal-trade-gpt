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
from i18n import t
from i18n_helpers import get_locale

logger = logging.getLogger(__name__)
router = Router()

PO_ID_RE = re.compile(r"^\d{6,12}$")


class LinkPo(StatesGroup):
    waiting_for_id = State()


@router.message(Command("link"))
async def cmd_link(message: Message, state: FSMContext) -> None:
    locale = get_locale(message.from_user)
    user = await get_user(message.from_user.id)
    if user is None:
        await message.answer(t("common.start_first_alt", locale))
        return

    if user.po_trader_id:
        await message.answer(
            t("link.already_linked", locale, po_trader_id=user.po_trader_id),
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
    locale = get_locale(message.from_user)
    await state.clear()
    await message.answer(t("link.cancel_in_fsm", locale))


@router.message(LinkPo.waiting_for_id, F.text)
async def receive_id(message: Message, state: FSMContext) -> None:
    locale = get_locale(message.from_user)
    candidate = (message.text or "").strip()
    # Catch any other command sent while in state (safety net)
    if candidate.startswith("/"):
        await state.clear()
        await message.answer(t("link.command_cancelled", locale))
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
        await message.answer(t("link.invalid_id", locale))
        return

    # Strict PO API verification
    try:
        from services.po_api import fetch_trader_info, _credentials

        if _credentials() is None:
            # API not configured — save without verification, warn in logs
            logger.warning("PO API credentials missing — saving ID %s without verification", candidate)
            ok = await set_po_trader_id(message.from_user.id, candidate, verified=False)
            if not ok:
                await message.answer(t("link.already_taken", locale), parse_mode=ParseMode.HTML)
                await state.clear()
                return
            await _send_success(message, state, candidate, verified=False, deposit=0.0)
            return

        info = await fetch_trader_info(candidate)
        if info is None:
            # ID not found in our partner network — REJECT
            from config import settings
            await message.answer(
                t("link.not_found_in_network", locale),
                parse_mode=ParseMode.HTML,
                reply_markup=InlineKeyboardMarkup(inline_keyboard=[
                    [InlineKeyboardButton(text=t("keyboard.register_po_full", locale), url=settings.pocket_option_url)],
                    [InlineKeyboardButton(text=t("keyboard.enter_another_id", locale), callback_data="link:enter_id")],
                    [InlineKeyboardButton(text=t("keyboard.cancel", locale), callback_data="onb:cancel")],
                ]),
            )
            await state.clear()
            return

        # Verified! Save ID, deposit, and status in po_accounts
        ok = await set_po_trader_id(
            message.from_user.id,
            candidate,
            verified=True,
            deposit_total=info.deposit_total,
        )
        if not ok:
            await message.answer(t("link.already_taken", locale), parse_mode=ParseMode.HTML)
            await state.clear()
            return
        try:
            from database.db import set_deposit_total
            await set_deposit_total(message.from_user.id, info.deposit_total)
        except Exception:
            logger.warning("Could not store deposit_total", exc_info=True)

        await _send_success(message, state, candidate, verified=True, deposit=info.deposit_total)

        # Trigger immediate tier sync so user gets correct tier right away
        try:
            from services.tier_sync import try_sync_user
            await try_sync_user(message.from_user.id)
        except Exception:
            logger.debug("Post-link tier sync failed, will catch up later", exc_info=True)

    except Exception as exc:
        logger.warning("PO verification error: %s", exc)
        await message.answer(t("link.po_api_unavailable", locale))
        # Keep FSM state so user can retry


async def _send_success(message: Message, state: FSMContext, trader_id: str, verified: bool, deposit: float) -> None:
    """Send success message after PO ID is saved."""
    locale = get_locale(message.from_user)
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
        verify_line = t("link.verified_deposit", locale, deposit=deposit)

    if is_onboarding:
        bot_info = await message.bot.get_me()
        user = await get_user(message.from_user.id)
        ref_code = user.referral_code if user else "??"
        ref_link = f"https://t.me/{bot_info.username}?start=ref_{ref_code}"
        await message.answer(
            t("link.success_onboarding", locale,
              trader_id=trader_id, verify_line=verify_line, ref_link=ref_link),
            parse_mode=ParseMode.HTML,
        )
    else:
        await message.answer(
            t("link.success", locale, trader_id=trader_id, verify_line=verify_line),
            parse_mode=ParseMode.HTML,
        )


@router.callback_query(F.data == "link:enter_id")
async def cb_enter_id(query: CallbackQuery, state: FSMContext) -> None:
    """Handle inline button 'Я уже зарегистрирован — ввести ID'."""
    locale = get_locale(query.from_user)
    await query.answer()
    await state.set_state(LinkPo.waiting_for_id)
    await query.message.answer(t("link.enter_id_prompt", locale))


@router.message(Command("cancel"))
async def cmd_cancel(message: Message, state: FSMContext) -> None:
    locale = get_locale(message.from_user)
    await state.clear()
    await message.answer(t("link.cancelled", locale))
