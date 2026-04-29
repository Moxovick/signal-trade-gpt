import logging

from aiogram import Router, F
from aiogram.filters import Command
from aiogram.types import Message, CallbackQuery
from aiogram.enums import ParseMode

from database.db import get_total_signals, get_total_users, get_user
from services.formatter import format_stats

logger = logging.getLogger(__name__)
router = Router()


@router.message(Command("stats"))
async def cmd_stats(message: Message) -> None:
    total_signals = await get_total_signals()
    total_users = await get_total_users()
    text = format_stats(total_signals, total_users)
    await message.answer(text, parse_mode=ParseMode.HTML)


@router.message(Command("mystats"))
async def cmd_mystats(message: Message) -> None:
    user = await get_user(message.from_user.id)
    if user is None:
        await message.answer(
            "Ты ещё не зарегистрирован. Напиши /start чтобы начать."
        )
        return

    status = "🌟 Премиум" if user.is_premium else "🆓 Бесплатный"
    await message.answer(
        f"👤 <b>Мой профиль</b>\n"
        f"\n"
        f"🪪 Имя: <b>{user.first_name}</b>\n"
        f"💎 Статус: <b>{status}</b>\n"
        f"📡 Сигналов получено: <b>{user.signals_received}</b>\n"
        f"🔑 Реф. код: <code>{user.referral_code}</code>\n",
        parse_mode=ParseMode.HTML,
    )


@router.message(Command("referral"))
async def cmd_referral(message: Message) -> None:
    user = await get_user(message.from_user.id)
    if user is None:
        await message.answer("Напиши /start чтобы начать.")
        return

    bot_info = await message.bot.get_me()
    referral_link = f"https://t.me/{bot_info.username}?start={user.referral_code}"
    await message.answer(
        f"🔗 <b>Твоя реферальная ссылка:</b>\n"
        f"<code>{referral_link}</code>\n"
        f"\n"
        f"Поделись ею с друзьями и получай бонусы!",
        parse_mode=ParseMode.HTML,
    )


@router.callback_query(F.data == "stats")
async def cb_stats(callback: CallbackQuery) -> None:
    total_signals = await get_total_signals()
    total_users = await get_total_users()
    text = format_stats(total_signals, total_users)
    await callback.message.answer(text, parse_mode=ParseMode.HTML)
    await callback.answer()


@router.callback_query(F.data == "profile")
async def cb_profile(callback: CallbackQuery) -> None:
    user = await get_user(callback.from_user.id)
    if user is None:
        await callback.answer("Сначала напиши /start", show_alert=True)
        return

    status = "🌟 Премиум" if user.is_premium else "🆓 Бесплатный"
    await callback.message.answer(
        f"👤 <b>Мой профиль</b>\n"
        f"\n"
        f"🪪 Имя: <b>{user.first_name}</b>\n"
        f"💎 Статус: <b>{status}</b>\n"
        f"📡 Сигналов получено: <b>{user.signals_received}</b>\n"
        f"🔑 Реф. код: <code>{user.referral_code}</code>\n",
        parse_mode=ParseMode.HTML,
    )
    await callback.answer()
