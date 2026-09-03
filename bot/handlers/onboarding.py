"""
Onboarding flow for new users.

Triggered automatically after /start for users without PocketOption linked.

Flow:
  Welcome → "Есть аккаунт?" → [Нет] → register on site + new PO account via referral → enter ID
                              → [Есть] → create NEW PO account via referral → enter ID
"""
from __future__ import annotations

import logging

from aiogram import F, Router
from aiogram.filters import Command
from aiogram.fsm.context import FSMContext
from aiogram.types import (
    CallbackQuery,
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    Message,
)
from aiogram.enums import ParseMode

from config import settings
from database.db import get_user_web_id
from handlers.link import LinkPo
from i18n import t
from i18n_helpers import get_locale

logger = logging.getLogger(__name__)
router = Router()


async def trigger_for_new_user(message: Message, *, po_url: str | None = None) -> None:
    """Launch onboarding for a freshly-registered or PO-unlinked user."""
    await _send_welcome(message, po_url=po_url)


async def _send_welcome(message: Message, *, po_url: str | None = None) -> None:
    locale = get_locale(message.from_user)
    first_name = message.from_user.first_name or t("common.trader", locale)
    text = t("onboarding.welcome", locale, first_name=first_name)
    await message.answer(
        text,
        parse_mode=ParseMode.HTML,
        reply_markup=InlineKeyboardMarkup(inline_keyboard=[
            [
                InlineKeyboardButton(text=t("keyboard.no_account", locale), callback_data="onb:no_account"),
                InlineKeyboardButton(text=t("keyboard.has_account", locale), callback_data="onb:has_account"),
            ],
        ]),
    )


@router.message(Command("onboard", "tutorial", "start_tour"))
async def cmd_onboard(message: Message) -> None:
    await _send_welcome(message)


@router.callback_query(F.data == "onb:no_account")
async def cb_no_account(query: CallbackQuery) -> None:
    """User has no account — send to website + PocketOption registration."""
    locale = get_locale(query.from_user)
    # Personalize PO URL with user's web ID for postback matching
    from handlers.start import _personalize_po_url
    web_id = await get_user_web_id(query.from_user.id)
    po_url = _personalize_po_url(settings.pocket_option_url, web_id) if web_id else settings.pocket_option_url

    text = t("onboarding.no_account", locale, site_url=settings.site_url)
    if query.message:
        await query.message.edit_text(
            text,
            parse_mode=ParseMode.HTML,
            disable_web_page_preview=True,
            reply_markup=InlineKeyboardMarkup(inline_keyboard=[
                [InlineKeyboardButton(text=t("keyboard.register_on_site", locale), url=f"{settings.site_url}/register")],
                [InlineKeyboardButton(text=t("keyboard.open_pocket_option_diamond", locale), url=po_url)],
                [InlineKeyboardButton(text=t("keyboard.done_enter_id", locale), callback_data="onb:enter_id")],
            ]),
        )
    await query.answer()


@router.callback_query(F.data == "onb:has_account")
async def cb_has_account(query: CallbackQuery) -> None:
    """User has an existing account but needs a NEW PocketOption via our referral."""
    locale = get_locale(query.from_user)
    # Personalize PO URL with user's web ID for postback matching
    from handlers.start import _personalize_po_url
    web_id = await get_user_web_id(query.from_user.id)
    po_url = _personalize_po_url(settings.pocket_option_url, web_id) if web_id else settings.pocket_option_url

    text = t("onboarding.has_account", locale)
    if query.message:
        await query.message.edit_text(
            text,
            parse_mode=ParseMode.HTML,
            reply_markup=InlineKeyboardMarkup(inline_keyboard=[
                [InlineKeyboardButton(text=t("keyboard.register_on_site", locale), url=f"{settings.site_url}/register")],
                [InlineKeyboardButton(text=t("keyboard.create_new_po", locale), url=po_url)],
                [InlineKeyboardButton(text=t("keyboard.done_enter_id", locale), callback_data="onb:enter_id")],
            ]),
        )
    await query.answer()


@router.callback_query(F.data == "onb:enter_id")
async def cb_enter_id(query: CallbackQuery, state: FSMContext) -> None:
    """User completed registration — now enter their PO Trader ID."""
    locale = get_locale(query.from_user)
    if query.message:
        await query.message.answer(t("onboarding.enter_id", locale))
    await state.set_state(LinkPo.waiting_for_id)
    await state.update_data(onboarding=True)
    await query.answer()


@router.callback_query(F.data == "onb:cancel")
async def cb_cancel(query: CallbackQuery, state: FSMContext) -> None:
    locale = get_locale(query.from_user)
    await state.clear()
    if query.message:
        await query.message.edit_text(t("onboarding.cancelled", locale))
    await query.answer()
