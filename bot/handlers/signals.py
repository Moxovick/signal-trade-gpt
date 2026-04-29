import logging

from aiogram import Router
from aiogram.filters import Command
from aiogram.types import Message, LinkPreviewOptions

from config import settings
from database.db import save_signal
from services.signal_generator import generate_signal
from services.formatter import format_signal

logger = logging.getLogger(__name__)
router = Router()


@router.message(Command("signal"))
async def cmd_signal(message: Message) -> None:
    """Manually request a signal (for testing / admins)."""
    signal = generate_signal()
    await save_signal(signal)
    text = format_signal(signal, settings.pocket_option_url)
    await message.answer(
        text,
        link_preview=LinkPreviewOptions(is_disabled=True),
    )
