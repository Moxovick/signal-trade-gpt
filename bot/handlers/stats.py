from aiogram import Router
from aiogram.filters import Command
from aiogram.types import Message
from aiogram.enums import ParseMode

from constants import TIER_NAMES, TIER_DEPOSIT_THRESHOLDS, TIER_DAILY_LIMITS
from database.db import get_user

router = Router()


def _distance_to_next_tier(tier: int, deposit_total: float) -> str:
    """Return a Russian string describing how much more to deposit for the next tier."""
    if tier >= 2:
        return "🏆 Максимальный уровень достигнут!"
    next_tier = tier + 1
    threshold = TIER_DEPOSIT_THRESHOLDS[next_tier]
    needed = max(0, threshold - deposit_total)
    next_name = TIER_NAMES.get(next_tier, f"Tier {next_tier}")
    return f"До {next_name} осталось: ${needed:.0f}"


@router.message(Command("profile", "stats", "tier"))
async def cmd_profile(message: Message) -> None:
    user = await get_user(message.from_user.id)
    if user is None:
        await message.answer("Напиши /start чтобы начать.")
        return

    tier = user.tier or 0
    deposit = user.deposit_total or 0.0
    tier_name = TIER_NAMES.get(tier, "Free")
    limit = TIER_DAILY_LIMITS.get(tier)
    limit_str = "безлимит" if limit is None else str(limit)
    distance = _distance_to_next_tier(tier, deposit)

    await message.answer(
        f"<b>👤 Профиль</b>\n\n"
        f"Уровень: <b>{tier_name}</b>\n"
        f"Депозит: <b>${deposit:.0f}</b>\n"
        f"Лимит сигналов: <b>{limit_str} / день</b>\n\n"
        f"{distance}",
        parse_mode=ParseMode.HTML,
    )


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
