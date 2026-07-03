"""Middleware that blocks banned users from interacting with the bot."""
from __future__ import annotations

from typing import Any, Awaitable, Callable, Dict

from aiogram import BaseMiddleware
from aiogram.types import CallbackQuery, Message, TelegramObject

from database.db import is_user_banned


class BannedUserMiddleware(BaseMiddleware):
    async def __call__(
        self,
        handler: Callable[[TelegramObject, Dict[str, Any]], Awaitable[Any]],
        event: TelegramObject,
        data: Dict[str, Any],
    ) -> Any:
        if isinstance(event, Message) and event.from_user:
            if await is_user_banned(event.from_user.id):
                await event.answer("⛔ Ваш аккаунт заблокирован.")
                return None
        if isinstance(event, CallbackQuery) and event.from_user:
            if await is_user_banned(event.from_user.id):
                await event.answer("⛔ Ваш аккаунт заблокирован.", show_alert=True)
                return None
        return await handler(event, data)
