"""
Onboarding flow for new users.

Triggered automatically after /start for users without PocketOption linked.

Flow:
  Welcome → "Есть аккаунт?" → [Нет] → send to website → enter ID
                              → [Есть] → enter ID (must verify via API)
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
from handlers.link import LinkPo

logger = logging.getLogger(__name__)
router = Router()

SITE_URL = "https://spacesignal.net"


async def trigger_for_new_user(message: Message) -> None:
    """Launch onboarding for a freshly-registered or PO-unlinked user."""
    await _send_welcome(message)


async def _send_welcome(message: Message) -> None:
    first_name = message.from_user.first_name or "Трейдер"
    text = (
        f"Приветствую, <b>{first_name}</b>!\n"
        f"\n"
        f"Ты в <b>Signal Trade GPT</b> — пространстве, где технологии, "
        f"аналитика и скорость принятия решений объединены в одной системе.\n"
        f"\n"
        f"Signal Trade GPT создан для тех, кто хочет работать с рынком не на "
        f"эмоциях, а на данных, структуре и современных AI-инструментах.\n"
        f"\n"
        f"У тебя уже есть действующий аккаунт в системе?"
    )
    await message.answer(
        text,
        parse_mode=ParseMode.HTML,
        reply_markup=InlineKeyboardMarkup(inline_keyboard=[
            [
                InlineKeyboardButton(text="Нет аккаунта", callback_data="onb:no_account"),
                InlineKeyboardButton(text="Есть аккаунт", callback_data="onb:has_account"),
            ],
        ]),
    )


@router.message(Command("onboard", "tutorial", "start_tour"))
async def cmd_onboard(message: Message) -> None:
    await _send_welcome(message)


@router.callback_query(F.data == "onb:no_account")
async def cb_no_account(query: CallbackQuery) -> None:
    """User has no account — send to website + PocketOption registration."""
    text = (
        "<b>Регистрация нового аккаунта</b>\n"
        "\n"
        "Для начала работы нужно:\n"
        "\n"
        "1️⃣ <b>Зарегистрируйся на нашем сайте</b>\n"
        f'   → <a href="{SITE_URL}/register">spacesignal.net/register</a>\n'
        "\n"
        "2️⃣ <b>Открой счёт на PocketOption</b> по нашей реф-ссылке\n"
        "   (это обязательно — именно так система знает, что ты от нас)\n"
        "\n"
        "3️⃣ <b>Привяжи свой Trader ID</b> — его можно найти в PocketOption:\n"
        "   Профиль → раздел «Мой ID» (6–12 цифр)\n"
        "\n"
        "После привязки ты сразу получаешь уровень <b>Free</b> — "
        "3 OTC-сигнала в день. Депозит открывает больше."
    )
    if query.message:
        await query.message.edit_text(
            text,
            parse_mode=ParseMode.HTML,
            disable_web_page_preview=True,
            reply_markup=InlineKeyboardMarkup(inline_keyboard=[
                [InlineKeyboardButton(text="📋 Зарегистрироваться на сайте", url=f"{SITE_URL}/register")],
                [InlineKeyboardButton(text="💎 Открыть PocketOption", url=settings.pocket_option_url)],
                [InlineKeyboardButton(text="✅ Готово — ввести Trader ID", callback_data="onb:enter_id")],
            ]),
        )
    await query.answer()


@router.callback_query(F.data == "onb:has_account")
async def cb_has_account(query: CallbackQuery, state: FSMContext) -> None:
    """User claims to have an account — prompt for PO ID."""
    text = (
        "<b>Привязка аккаунта</b>\n"
        "\n"
        "Отлично! Если ты уже зарегистрирован на PocketOption по нашей "
        "реф-ссылке — пришли свой <b>Trader ID</b>.\n"
        "\n"
        "Найти его можно: PocketOption → <b>Профиль</b> → раздел <b>«Мой ID»</b>.\n"
        "Это 6–12-значный номер.\n"
        "\n"
        "⚠️ ID будет проверен — он должен быть зарегистрирован через нашу партнёрскую ссылку."
    )
    if query.message:
        await query.message.edit_text(
            text,
            parse_mode=ParseMode.HTML,
            reply_markup=InlineKeyboardMarkup(inline_keyboard=[
                [InlineKeyboardButton(text="💎 Открыть PocketOption", url=settings.pocket_option_url)],
                [InlineKeyboardButton(text="❌ Отменить", callback_data="onb:cancel")],
            ]),
        )
        await query.message.answer(
            "Пришли свой PocketOption Trader ID (6–12 цифр):",
        )
    await state.set_state(LinkPo.waiting_for_id)
    await state.update_data(onboarding=True)
    await query.answer()


@router.callback_query(F.data == "onb:enter_id")
async def cb_enter_id(query: CallbackQuery, state: FSMContext) -> None:
    """User completed registration — now enter their PO Trader ID."""
    if query.message:
        await query.message.answer(
            "Пришли свой PocketOption Trader ID (6–12 цифр).\n"
            "Найти: PocketOption → Профиль → «Мой ID».",
        )
    await state.set_state(LinkPo.waiting_for_id)
    await state.update_data(onboarding=True)
    await query.answer()


@router.callback_query(F.data == "onb:cancel")
async def cb_cancel(query: CallbackQuery, state: FSMContext) -> None:
    await state.clear()
    if query.message:
        await query.message.edit_text(
            "Привязка отложена.\n\n"
            "Без привязанного PocketOption ID сигналы недоступны.\n"
            "Когда будешь готов — нажми /start.",
        )
    await query.answer()
