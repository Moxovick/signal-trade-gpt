from aiogram import Router
from aiogram.filters import Command
from aiogram.types import Message
from aiogram.enums import ParseMode

from database.db import get_user

router = Router()


# /stats and /tier removed — signals flow automatically, no tier UI needed.


@router.message(Command("ref", "referral"))
async def cmd_ref(message: Message) -> None:
    user = await get_user(message.from_user.id)
    if user is None:
        await message.answer("Напиши /start чтобы начать.")
        return

    bot_info = await message.bot.get_me()
    # Must use ref_ prefix so /start handler parses it correctly.
    referral_link = f"https://t.me/{bot_info.username}?start=ref_{user.referral_code}"
    await message.answer(
        f"<b>Твоя реферальная ссылка:</b>\n"
        f"<code>{referral_link}</code>\n"
        f"\n"
        f"Когда твой друг зарегистрируется по ссылке и сделает депозит на PocketOption, "
        f"мы начислим тебе 5% от его FTD как sub-affiliate бонус.",
        parse_mode=ParseMode.HTML,
    )
