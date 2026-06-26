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
    WebAppInfo,
)

from i18n import t


# ── persistent main menu (shown after /start) ─────────────────────────────────

BTN_SIGNAL = "🎯 Получить сигнал"
BTN_LINK = "🔗 Привязать ID"
BTN_REF = "👥 Рефералы"
BTN_HELP = "❔ Помощь"
BTN_LEADERBOARD = "🏆 Лидерборд"
BTN_PROFILE = "👤 Профиль"

# Keep old names importable but unused
BTN_STATS = "📈 Статистика"
BTN_SETTINGS = "⚙️ Настройки"

MAIN_MENU = ReplyKeyboardMarkup(
    keyboard=[
        [KeyboardButton(text=BTN_SIGNAL)],
        [KeyboardButton(text=BTN_LEADERBOARD), KeyboardButton(text=BTN_REF)],
        [KeyboardButton(text=BTN_PROFILE), KeyboardButton(text=BTN_HELP)],
    ],
    resize_keyboard=True,
    is_persistent=True,
    input_field_placeholder="Выбери действие…",
)

# All menu button texts for FSM cancellation detection
MENU_BUTTONS = {BTN_SIGNAL, BTN_REF, BTN_HELP, BTN_LEADERBOARD, BTN_PROFILE}


def build_main_menu(locale: str = "ru") -> ReplyKeyboardMarkup:
    """Build locale-aware main menu keyboard."""
    return ReplyKeyboardMarkup(
        keyboard=[
            [KeyboardButton(text=t("keyboard.signal", locale))],
            [
                KeyboardButton(text=t("keyboard.leaderboard", locale)),
                KeyboardButton(text=t("keyboard.referrals", locale)),
            ],
            [
                KeyboardButton(text=t("keyboard.profile", locale)),
                KeyboardButton(text=t("keyboard.help", locale)),
            ],
        ],
        resize_keyboard=True,
        is_persistent=True,
        input_field_placeholder=t("keyboard.placeholder", locale),
    )


# ── inline CTAs ───────────────────────────────────────────────────────────────


def open_po_inline(pocket_option_url: str, locale: str = "ru") -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text=t("inline.open_po", locale), url=pocket_option_url)],
        ]
    )


def start_inline(pocket_option_url: str, webapp_url: str = "", locale: str = "ru") -> InlineKeyboardMarkup:
    """Welcome card buttons: PocketOption + (if configured) Mini App."""
    rows: list[list[InlineKeyboardButton]] = [
        [InlineKeyboardButton(text=t("inline.open_po", locale), url=pocket_option_url)],
    ]
    if webapp_url:
        rows.append(
            [
                InlineKeyboardButton(
                    text=t("inline.open_app", locale),
                    web_app=WebAppInfo(url=webapp_url),
                )
            ]
        )
    return InlineKeyboardMarkup(inline_keyboard=rows)


def signal_inline(pocket_option_url: str, signal_id: int | None, locale: str = "ru") -> InlineKeyboardMarkup:
    rows: list[list[InlineKeyboardButton]] = [
        [InlineKeyboardButton(text=t("inline.open_po", locale), url=pocket_option_url)],
    ]
    if signal_id is not None:
        rows.append(
            [
                InlineKeyboardButton(text="✅ Win", callback_data=f"result:{signal_id}:win"),
                InlineKeyboardButton(text="❌ Loss", callback_data=f"result:{signal_id}:loss"),
            ]
        )
    rows.append(
        [InlineKeyboardButton(text=t("keyboard.another_signal", locale), callback_data="get_signal")]
    )
    return InlineKeyboardMarkup(inline_keyboard=rows)


def referral_inline(bot_username: str, ref_code: str, locale: str = "ru") -> InlineKeyboardMarkup:
    share_link = f"https://t.me/{bot_username}?start=ref_{ref_code}"
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text=t("inline.share_link", locale),
                    url=f"https://t.me/share/url?url={share_link}&text=AI-сигналы для PocketOption",
                )
            ],
        ]
    )


def link_inline(po_ref_url: str, locale: str = "ru") -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text=t("inline.register_po", locale),
                    url=po_ref_url,
                )
            ],
            [
                InlineKeyboardButton(
                    text=t("inline.enter_id", locale),
                    callback_data="link:enter_id",
                )
            ],
        ]
    )
