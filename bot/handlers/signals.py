"""
/signal — manual signal request.

T0 users get demo signals (no real trade tag), with a hard lifetime cap of
2 across the user's lifetime.  Higher tiers get OTC/exchange/elite, but
quota tracking against the real-time limit lives in the web platform — this
SQLite-only handler is intentionally permissive.
"""
import logging

from aiogram import Router
from aiogram.filters import Command
from aiogram.types import Message, LinkPreviewOptions
from aiogram.enums import ParseMode

from config import settings
from database.db import get_user, save_signal, increment_signals_received
from services.signal_generator import generate_signal
from services.formatter import format_signal

logger = logging.getLogger(__name__)
router = Router()

T0_LIFETIME_DEMO_LIMIT = 2


@router.message(Command("signal"))
async def cmd_signal(message: Message) -> None:
    user = await get_user(message.from_user.id)
    if user is None:
        await message.answer("Сначала /start.")
        return

    # T0 = no PocketOption account or $0 deposit. Hard lifetime cap of 2 demos.
    if user.tier == 0:
        if user.signals_received >= T0_LIFETIME_DEMO_LIMIT:
            await message.answer(
                "Демо-лимит исчерпан (2 сигнала за всё время).\n"
                "Чтобы получать сигналы регулярно — привяжи PocketOption через /link "
                "и внеси депозит ≥ $100 для перехода на T1.",
                parse_mode=ParseMode.HTML,
            )
            return
        signal = generate_signal()
        signal.tier = "demo"
    else:
        signal = generate_signal()

    await save_signal(signal)
    await increment_signals_received(user.telegram_id)
    text = format_signal(signal, settings.pocket_option_url)
    await message.answer(
        text,
        parse_mode=ParseMode.HTML,
        link_preview=LinkPreviewOptions(is_disabled=True),
    )
