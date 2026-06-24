import asyncio

from aiogram import Router
from aiogram.filters import Command
from aiogram.types import Message
from aiogram.enums import ParseMode

from constants import TIER_NAMES, TIER_DEPOSIT_THRESHOLDS, TIER_DAILY_LIMITS
from database.db import get_user, log_activity
from i18n import t
from i18n_helpers import get_locale

router = Router()


def _distance_to_next_tier(tier: int, deposit_total: float, locale: str = "ru") -> str:
    """Return a localised string describing how much more to deposit for the next tier."""
    if tier >= 2:
        return t("tier.max_reached", locale)
    next_tier = tier + 1
    threshold = TIER_DEPOSIT_THRESHOLDS[next_tier]
    needed = max(0, threshold - deposit_total)
    next_name = TIER_NAMES.get(next_tier, f"Tier {next_tier}")
    return t("tier.distance_to_next", locale, next_name=next_name, needed=needed)


@router.message(Command("profile", "stats", "tier"))
async def cmd_profile(message: Message) -> None:
    asyncio.create_task(log_activity(message.from_user.id, "stats_view"))
    locale = get_locale(message.from_user)
    user = await get_user(message.from_user.id)
    if user is None:
        await message.answer(t("common.write_start", locale))
        return

    tier = user.tier or 0
    deposit = user.deposit_total or 0.0
    tier_name = TIER_NAMES.get(tier, "Free")
    limit = TIER_DAILY_LIMITS.get(tier)
    limit_str = t("common.unlimited", locale) if limit is None else str(limit)
    distance = _distance_to_next_tier(tier, deposit, locale)

    await message.answer(
        t("stats.full_profile", locale,
          tier_name=tier_name, deposit=deposit, limit=limit_str, distance=distance),
        parse_mode=ParseMode.HTML,
    )


@router.message(Command("ref", "referral"))
async def cmd_ref(message: Message) -> None:
    locale = get_locale(message.from_user)
    user = await get_user(message.from_user.id)
    if user is None:
        await message.answer(t("common.write_start", locale))
        return

    bot_info = await message.bot.get_me()
    # Must use ref_ prefix so /start handler parses it correctly.
    referral_link = f"https://t.me/{bot_info.username}?start=ref_{user.referral_code}"
    await message.answer(
        t("ref.your_link", locale, ref_link=referral_link)
        + "\n\n"
        + t("ref.ftd_bonus", locale),
        parse_mode=ParseMode.HTML,
    )
