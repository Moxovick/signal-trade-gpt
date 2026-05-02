"""
Reusable keyboards for the bot.

We follow Telegram UX conventions:
  • ReplyKeyboard with the persistent main menu (always visible at the bottom).
  • InlineKeyboard for ad-hoc CTAs (open PocketOption, ref-link share, etc.).
"""
from __future__ import annotations

from aiogram.types import (
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    KeyboardButton,
    ReplyKeyboardMarkup,
)


# ── persistent main menu (shown after /start) ─────────────────────────────────

BTN_SIGNAL = "📊 Сигнал"
BTN_TIER = "🎯 Мой тир"
BTN_LINK = "🔗 Привязать ID"
BTN_REF = "👥 Рефералы"
BTN_STATS = "📈 Статы"
BTN_SETTINGS = "⚙️ Настройки"
BTN_HELP = "❔ Помощь"

MAIN_MENU = ReplyKeyboardMarkup(
    keyboard=[
        [KeyboardButton(text=BTN_SIGNAL), KeyboardButton(text=BTN_TIER)],
        [KeyboardButton(text=BTN_LINK), KeyboardButton(text=BTN_REF)],
        [KeyboardButton(text=BTN_STATS), KeyboardButton(text=BTN_SETTINGS)],
        [KeyboardButton(text=BTN_HELP)],
    ],
    resize_keyboard=True,
    is_persistent=True,
    input_field_placeholder="Выбери действие…",
)


# ── inline CTAs ───────────────────────────────────────────────────────────────


def open_po_inline(pocket_option_url: str) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="💎 Открыть PocketOption", url=pocket_option_url)],
        ]
    )


def signal_inline(pocket_option_url: str, signal_id: int | None) -> InlineKeyboardMarkup:
    rows: list[list[InlineKeyboardButton]] = [
        [InlineKeyboardButton(text="💎 Открыть PocketOption", url=pocket_option_url)],
    ]
    if signal_id is not None:
        rows.append(
            [
                InlineKeyboardButton(text="✅ Win", callback_data=f"sig:{signal_id}:win"),
                InlineKeyboardButton(text="❌ Loss", callback_data=f"sig:{signal_id}:loss"),
            ]
        )
    return InlineKeyboardMarkup(inline_keyboard=rows)


def referral_inline(bot_username: str, ref_code: str) -> InlineKeyboardMarkup:
    share_link = f"https://t.me/{bot_username}?start=ref_{ref_code}"
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="📤 Поделиться ссылкой",
                    url=f"https://t.me/share/url?url={share_link}&text=AI-сигналы для PocketOption",
                )
            ],
        ]
    )


def link_inline(po_ref_url: str) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="🚀 Регистрация в PocketOption",
                    url=po_ref_url,
                )
            ],
            [
                InlineKeyboardButton(
                    text="✏️ Я уже зарегистрирован — ввести ID",
                    callback_data="link:enter_id",
                )
            ],
        ]
    )
