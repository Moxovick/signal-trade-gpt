"""
Signal result feedback callbacks (Win/Loss buttons on signal messages).
The /signal command is removed — signals are delivered automatically by scheduler.
"""
import logging

from aiogram import F, Router
from aiogram.filters import Command
from aiogram.types import CallbackQuery, Message

from database.db import get_user, record_signal_result
from services.achievements import check_and_award

logger = logging.getLogger(__name__)
router = Router()


@router.message(Command("signal"))
async def cmd_signal(message: Message) -> None:
    """Signals are delivered automatically — inform the user."""
    await message.answer(
        "Сигналы приходят автоматически — ничего нажимать не нужно.\n"
        "Просто жди: как только появится хороший вход, я пришлю его сюда 📊",
    )


@router.callback_query(F.data.startswith("sig:"))
async def cb_signal_result(query: CallbackQuery) -> None:
    """Handle Win/Loss feedback buttons attached to a signal message."""
    if query.data is None or query.from_user is None:
        await query.answer()
        return
    try:
        _, sid_s, result = query.data.split(":")
        signal_id = int(sid_s)
    except (ValueError, IndexError):
        await query.answer("Bad payload", show_alert=False)
        return
    if result not in {"win", "loss"}:
        await query.answer()
        return

    await record_signal_result(query.from_user.id, signal_id, result)
    label = "✅ Записано как WIN" if result == "win" else "❌ Записано как LOSS"
    await query.answer(label, show_alert=False)

    # Strip buttons so the signal can't be voted on twice.
    try:
        await query.message.edit_reply_markup(reply_markup=None)
    except Exception:  # noqa: BLE001
        pass

    # Achievement check (5/10 wins, winrate 70%, etc.)
    user = await get_user(query.from_user.id)
    if user is not None:
        await check_and_award(query.bot, user)
