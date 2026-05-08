"""
/start — register a user, attribute referrer, send brand card + persistent
main-menu keyboard. Deep-link payload formats supported:

  /start ref_<ref_code>     # legacy bot-internal referral
  /start <ref_code>         # bare ref code
  /start po_<click_id>      # PocketOption click_id attribution
"""
import logging
import secrets

from aiogram import Router
from aiogram.filters import Command, CommandStart
from aiogram.types import FSInputFile, Message
from aiogram.enums import ParseMode

from config import settings
from database.db import (
    create_user,
    get_user,
    get_user_by_referral_code,
    set_click_id,
)
from database.models import User
from services.imagegen import get_brand_card_path
from services.keyboards import MAIN_MENU, start_inline

logger = logging.getLogger(__name__)
router = Router()


def _format_welcome(first_name: str, ref_code: str, bot_username: str) -> str:
    ref_link = f"https://t.me/{bot_username}?start=ref_{ref_code}"
    return (
        f"Привет, <b>{first_name}</b>! 👋\n"
        f"\n"
        f"<b>Signal Trade GPT</b> — AI-сигналы для PocketOption.\n"
        f"Доступ открывается твоим депозитом, а не подпиской.\n"
        f"\n"
        f"<b>Как начать:</b>\n"
        f"  1. Открой счёт PocketOption по нашей ссылке\n"
        f"  2. Внеси депозит — тир откроется автоматически\n"
        f"  3. Получай сигналы с графиками в чат\n"
        f"\n"
        f"<b>Тиры по депозиту:</b>\n"
        f"  • T0 · Демо — 2 сигнала\n"
        f"  • T1 ≥ $100 — 5 OTC/день\n"
        f"  • T2 ≥ $500 — 15/день, биржа\n"
        f"  • T3 ≥ $2 000 — 25/день, аналитика\n"
        f"  • T4 ≥ $10 000 — безлимит\n"
        f"\n"
        f"<b>Реф-ссылка</b> (5% sub-affiliate):\n"
        f"<code>{ref_link}</code>\n"
        f"\n"
        f"<i>Не финсовет. Бинарные опционы — высокий риск.</i>"
    )


@router.message(CommandStart())
async def cmd_start(message: Message) -> None:
    user_id = message.from_user.id
    first_name = message.from_user.first_name or "Трейдер"
    username = message.from_user.username

    # Parse deep-link payload
    referred_by: int | None = None
    click_id: str | None = None
    parts = (message.text or "").split(maxsplit=1)
    if len(parts) > 1:
        payload = parts[1].strip()
        if payload.startswith("po_"):
            click_id = payload[3:]
        else:
            ref_code = payload.removeprefix("ref_")
            referrer = await get_user_by_referral_code(ref_code)
            if referrer and referrer.telegram_id != user_id:
                referred_by = referrer.telegram_id

    existing = await get_user(user_id)
    if existing is None:
        ref_code_self = secrets.token_urlsafe(8)
        new_user = User(
            telegram_id=user_id,
            username=username,
            first_name=first_name,
            referral_code=ref_code_self,
            referred_by=referred_by,
        )
        await create_user(new_user)
        logger.info("New user registered: %d (@%s) ref=%s", user_id, username, referred_by)
        user = new_user
    else:
        user = existing

    if click_id:
        await set_click_id(user_id, click_id)

    bot_info = await message.bot.get_me()

    # Send brand card image (cached on disk after first generation)
    try:
        card_path = get_brand_card_path()
        await message.answer_photo(
            FSInputFile(card_path),
            caption=_format_welcome(first_name, user.referral_code, bot_info.username),
            parse_mode=ParseMode.HTML,
            reply_markup=start_inline(settings.pocket_option_url, settings.webapp_url),
        )
    except Exception as exc:  # noqa: BLE001
        logger.warning("Could not render brand card: %s — falling back to text", exc)
        await message.answer(
            _format_welcome(first_name, user.referral_code, bot_info.username),
            parse_mode=ParseMode.HTML,
            reply_markup=start_inline(settings.pocket_option_url, settings.webapp_url),
        )

    # Activate persistent reply keyboard separately so it shows under the photo
    await message.answer(
        "Меню активно — пользуйся кнопками снизу 👇",
        reply_markup=MAIN_MENU,
    )

    # Auto-trigger onboarding for users who haven't linked PocketOption yet.
    if existing is None or not user.po_trader_id:
        # Defer import to avoid circular dependency.
        from handlers.onboarding import trigger_for_new_user

        await trigger_for_new_user(message)


@router.message(Command("help"))
async def cmd_help(message: Message) -> None:
    text = (
        "<b>Команды Signal Trade GPT</b>\n"
        "\n"
        "/start — приветствие и меню\n"
        "/signal — получить сигнал\n"
        "/tier — твой текущий уровень\n"
        "/link — привязать аккаунт PocketOption\n"
        "/ref — реферальная ссылка\n"
        "/stats — статистика платформы\n"
        "/settings — настройки уведомлений\n"
        "/calc — калькулятор сделки\n"
        "/help — это сообщение"
    )
    await message.answer(text, parse_mode=ParseMode.HTML, reply_markup=MAIN_MENU)
