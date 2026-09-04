"""
Locale resolution helpers for bot handlers.

Usage:
    from i18n_helpers import get_locale, get_user_locale
    from i18n import t

    locale = await get_user_locale(message.from_user)
    await message.answer(t("start.welcome", locale, first_name=first_name))
"""
from __future__ import annotations

from aiogram.types import User as TgUser

from i18n import Locale, DEFAULT_LOCALE

_SUPPORTED: set[Locale] = {"ru", "uk"}


def get_locale(tg_user: TgUser | None) -> Locale:
    """
    Return default locale (ru).  Telegram language_code auto-detection is
    disabled — locale is only changed when explicitly saved via /lang command
    (resolved by get_user_locale which checks the DB).
    """
    return DEFAULT_LOCALE


async def get_user_locale(tg_user: TgUser | None) -> Locale:
    """
    Resolve locale: DB preference > Telegram language_code > default.
    """
    if tg_user is None:
        return DEFAULT_LOCALE
    try:
        from database.db import get_user_locale as db_get_locale
        saved = await db_get_locale(tg_user.id)
        if saved in _SUPPORTED:
            return saved  # type: ignore[return-value]
    except Exception:
        pass
    return get_locale(tg_user)
