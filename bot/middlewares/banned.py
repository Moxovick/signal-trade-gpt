"""Middleware that blocks banned users from interacting with the bot."""
from __future__ import annotations

import time
from typing import Any, Awaitable, Callable, Dict

from aiogram import BaseMiddleware
from aiogram.types import CallbackQuery, Message, TelegramObject

from database.db import is_user_banned

_BAN_CACHE_TTL = 60  # seconds
_ban_cache: dict[int, tuple[bool, float]] = {}


def _get_cached_ban(user_id: int) -> bool | None:
    """Return cached ban status if still fresh, else None."""
    entry = _ban_cache.get(user_id)
    if entry is None:
        return None
    is_banned, ts = entry
    if time.monotonic() - ts > _BAN_CACHE_TTL:
        return None
    return is_banned


class BannedUserMiddleware(BaseMiddleware):
    async def __call__(
        self,
        handler: Callable[[TelegramObject, Dict[str, Any]], Awaitable[Any]],
        event: TelegramObject,
        data: Dict[str, Any],
    ) -> Any:
        user_id: int | None = None
        if isinstance(event, Message) and event.from_user:
            user_id = event.from_user.id
        elif isinstance(event, CallbackQuery) and event.from_user:
            user_id = event.from_user.id

        if user_id is not None:
            cached = _get_cached_ban(user_id)
            if cached is None:
                cached = await is_user_banned(user_id)
                _ban_cache[user_id] = (cached, time.monotonic())
            if cached:
                if isinstance(event, Message):
                    await event.answer("⛔ Ваш аккаунт заблокирован.")
                elif isinstance(event, CallbackQuery):
                    await event.answer("⛔ Ваш аккаунт заблокирован.", show_alert=True)
                return None
        return await handler(event, data)
