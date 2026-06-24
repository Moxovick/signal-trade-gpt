"""
/lang — choose interface language (Russian / Ukrainian).
"""
import logging

from aiogram import Router, F
from aiogram.filters import Command
from aiogram.types import Message, CallbackQuery, InlineKeyboardMarkup, InlineKeyboardButton

from database.db import set_user_locale
from i18n import t
from i18n_helpers import get_user_locale

logger = logging.getLogger(__name__)
router = Router()


def _lang_keyboard(current: str) -> InlineKeyboardMarkup:
    mark = lambda code: " ✓" if code == current else ""
    return InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(
                text=f"🇷🇺 Русский{mark('ru')}",
                callback_data="lang:ru",
            ),
            InlineKeyboardButton(
                text=f"🇺🇦 Українська{mark('uk')}",
                callback_data="lang:uk",
            ),
        ]
    ])


@router.message(Command("lang"))
async def cmd_lang(message: Message) -> None:
    locale = await get_user_locale(message.from_user)
    await message.answer(
        t("lang.choose", locale),
        reply_markup=_lang_keyboard(locale),
    )


@router.callback_query(F.data.startswith("lang:"))
async def cb_lang(query: CallbackQuery) -> None:
    new_locale = query.data.split(":")[1]  # type: ignore[union-attr]
    if new_locale not in ("ru", "uk"):
        await query.answer("?")
        return

    tg_id = query.from_user.id
    await set_user_locale(tg_id, new_locale)

    await query.answer(t("lang.changed", new_locale))

    # Update the message to reflect the new choice
    await query.message.edit_text(  # type: ignore[union-attr]
        t("lang.choose", new_locale),
        reply_markup=_lang_keyboard(new_locale),
    )
