import secrets
import logging

from aiogram import Router
from aiogram.filters import CommandStart, Command
from aiogram.types import Message, InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.enums import ParseMode

from config import settings
from database.db import get_user, create_user, get_user_by_referral_code
from database.models import User
from services.formatter import format_welcome

logger = logging.getLogger(__name__)
router = Router()


def _main_keyboard(pocket_option_url: str) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="Открыть PocketOption",
                    url=pocket_option_url,
                )
            ],
            [
                InlineKeyboardButton(text="Мой tier", callback_data="tier"),
                InlineKeyboardButton(text="Привязать ID", callback_data="link"),
            ],
        ]
    )


@router.message(CommandStart())
async def cmd_start(message: Message) -> None:
    user_id = message.from_user.id
    first_name = message.from_user.first_name or "Трейдер"
    username = message.from_user.username

    # Extract referral code from /start payload (e.g. /start ref_XXX or /start XXX).
    referred_by: int | None = None
    args = message.text.split(maxsplit=1)
    if len(args) > 1:
        ref_code = args[1].removeprefix("ref_")
        referrer = await get_user_by_referral_code(ref_code)
        if referrer and referrer.telegram_id != user_id:
            referred_by = referrer.telegram_id

    existing = await get_user(user_id)
    if existing is None:
        referral_code = secrets.token_urlsafe(8)
        new_user = User(
            telegram_id=user_id,
            username=username,
            first_name=first_name,
            referral_code=referral_code,
            referred_by=referred_by,
        )
        await create_user(new_user)
        logger.info("New user registered: %d (@%s)", user_id, username)
        user = new_user
    else:
        user = existing

    bot_info = await message.bot.get_me()
    text = format_welcome(first_name, user.referral_code, bot_info.username)
    await message.answer(
        text,
        parse_mode=ParseMode.HTML,
        reply_markup=_main_keyboard(settings.pocket_option_url),
    )


@router.message(Command("help"))
async def cmd_help(message: Message) -> None:
    await message.answer(
        "<b>Команды Signal Trade GPT</b>\n"
        "\n"
        "/start — начать работу с ботом\n"
        "/tier — твой текущий tier и лимиты\n"
        "/link — привязать аккаунт PocketOption\n"
        "/signal — получить демо-сигнал (T0)\n"
        "/stats — общая статистика платформы\n"
        "/ref — реферальная ссылка\n"
        "/help — это сообщение\n",
        parse_mode=ParseMode.HTML,
    )
