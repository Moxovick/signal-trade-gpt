import logging

from aiogram import Router
from aiogram.filters import Command
from aiogram.types import Message
from aiogram.enums import ParseMode

from database.db import get_total_signals, get_total_users, get_user
from services.formatter import format_stats, format_tier_info

logger = logging.getLogger(__name__)
router = Router()


@router.message(Command("stats"))
async def cmd_stats(message: Message) -> None:
    total_signals = await get_total_signals()
    total_users = await get_total_users()
    text = format_stats(total_signals, total_users)
    await message.answer(text, parse_mode=ParseMode.HTML)


@router.message(Command("tier", "mystats"))
async def cmd_tier(message: Message) -> None:
    user = await get_user(message.from_user.id)
    if user is None:
        await message.answer("Ты ещё не зарегистрирован. Напиши /start чтобы начать.")
        return

    text = format_tier_info(user.tier, user.po_trader_id, user.signals_received)
    await message.answer(text, parse_mode=ParseMode.HTML)


@router.message(Command("ref", "referral"))
async def cmd_ref(message: Message) -> None:
    user = await get_user(message.from_user.id)
    if user is None:
        await message.answer("Напиши /start чтобы начать.")
        return

    bot_info = await message.bot.get_me()
    referral_link = f"https://t.me/{bot_info.username}?start={user.referral_code}"
    await message.answer(
        f"<b>Твоя реферальная ссылка:</b>\n"
        f"<code>{referral_link}</code>\n"
        f"\n"
        f"Когда твой друг зарегистрируется по ссылке и сделает депозит на PocketOption, "
        f"мы начислим тебе 5% от его FTD как sub-affiliate бонус.",
        parse_mode=ParseMode.HTML,
    )
