"""
/start — register a user, attribute referrer, send brand card + persistent
main-menu keyboard. Deep-link payload formats supported:

  /start ref_<ref_code>     # legacy bot-internal referral
  /start <ref_code>         # bare ref code
  /start po_<click_id>      # PocketOption click_id attribution
  /start link_<token>       # web -> bot account-link handshake
"""
import logging
import secrets

import httpx
from aiogram import Router
from aiogram.filters import Command, CommandStart
from aiogram.fsm.context import FSMContext
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
        f"<b>SpaceSignal</b> — AI-сигналы для PocketOption.\n"
        f"Доступ открывается регистрацией, а не подпиской.\n"
        f"\n"
        f"<b>Как начать:</b>\n"
        f"  1. Открой счёт PocketOption по нашей ссылке (/link)\n"
        f"  2. Привяжи свой Trader ID командой /link\n"
        f"  3. Нажми «🎯 Получить сигнал» — и получи первый сигнал\n"
        f"\n"
        f"<b>Уровни доступа:</b>\n"
        f"  • <b>Free</b> — OTC-сигналы, 3/день\n"
        f"  • <b>Basic</b> (депозит ≥ $20) — OTC + биржа, 10/день\n"
        f"  • <b>Pro</b> (депозит ≥ $100) — всё безлимитно + Elite\n"
        f"\n"
        f"<b>Реф-ссылка</b> (5% с FTD каждого приглашённого):\n"
        f"<code>{ref_link}</code>\n"
        f"\n"
        f"<i>Не финансовый совет. Бинарные опционы — высокий риск.</i>"
    )


async def _get_photo_url(message: Message) -> str | None:
    """
    Return a direct HTTPS URL to the user's Telegram profile photo, or None
    if they have no photo or the fetch fails.

    Strategy:
      1. Call getUserProfilePhotos to get the file_id of the first photo.
      2. Call getFile to resolve the file_path on Telegram's CDN.
      3. Construct the public URL using the bot token from settings.
    """
    try:
        photos = await message.bot.get_user_profile_photos(
            message.from_user.id, limit=1
        )
        if not photos.photos:
            return None
        file_id = photos.photos[0][-1].file_id  # largest size of first photo
        file_info = await message.bot.get_file(file_id)
        if not file_info.file_path:
            return None
        return (
            f"https://api.telegram.org/file/bot{settings.bot_token}"
            f"/{file_info.file_path}"
        )
    except Exception as exc:  # noqa: BLE001
        logger.debug("Could not fetch profile photo URL: %s", exc)
        return None


async def _redeem_link_token(message: Message, token: str) -> bool:
    """
    Redeem a `link_<token>` deep-link by calling the web platform's
    `/api/bot/telegram-link` endpoint with the bot-sync secret. On success,
    replies to the user and returns True so cmd_start skips the normal flow.
    """
    if not settings.platform_api_url or not settings.bot_sync_secret:
        await message.answer(
            "Привязка временно недоступна — связь с сайтом не настроена. "
            "Сообщи админу.",
        )
        return True
    photo_url = await _get_photo_url(message)
    payload = {
        "token": token,
        "telegramId": str(message.from_user.id),
        "username": message.from_user.username,
        "firstName": message.from_user.first_name,
        "lastName": message.from_user.last_name,
        "photoUrl": photo_url,
    }
    url = f"{settings.platform_api_url.rstrip('/')}/api/bot/telegram-link"
    try:
        async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
            resp = await client.post(
                url,
                json=payload,
                headers={"X-Bot-Secret": settings.bot_sync_secret},
            )
        if not resp.is_success:
            content_type = resp.headers.get("content-type", "")
            body = resp.json() if content_type.startswith("application/json") else {}
            reason = str(body.get("reason", "unknown"))
            logger.warning("link-token redeem HTTP %d: %s (url=%s)", resp.status_code, reason, url)
            if reason == "expired" or resp.status_code == 410:
                await message.answer(
                    "⏰ Ссылка для привязки истекла. Запроси новую на сайте "
                    "(нажми «Привязать Telegram» ещё раз).",
                )
            elif reason == "telegram_taken":
                await message.answer(
                    "⚠️ Этот Telegram уже привязан к другому аккаунту на сайте.",
                )
            elif reason == "already_used":
                await message.answer(
                    "Эта ссылка уже использована. Запроси новую на сайте.",
                )
            else:
                await message.answer(
                    "Не удалось привязать аккаунт (сервер вернул ошибку). "
                    "Попробуй ещё раз позже.",
                )
            return True
        body = resp.json()
    except Exception as exc:  # noqa: BLE001
        logger.warning("link-token redeem failed: %s", exc)
        await message.answer(
            "Не удалось связаться с сайтом для привязки. Попробуй ещё раз "
            "позже.",
        )
        return True

    if body.get("ok"):
        await message.answer(
            "✅ Telegram привязан к твоему аккаунту на сайте.\n\n"
            "Возвращайся на вкладку — она обновится автоматически.",
        )
        return True

    reason = str(body.get("reason") or "unknown")
    copy_map = {
        "unknown_token": "Эта ссылка недействительна или уже использована.",
        "already_used": "Эта ссылка уже была использована.",
        "expired": "Срок действия ссылки истёк. Запроси новую на сайте.",
        "telegram_taken": "Этот Telegram уже привязан к другому аккаунту на сайте.",
        "bad_secret": "Внутренняя ошибка авторизации (BOT_SYNC_SECRET).",
        "not_configured": "Привязка не настроена на сервере.",
        "po_required": (
            "Для входа через Telegram сначала нужно зарегистрироваться на сайте — "
            "там потребуется PocketOption Trader ID и подтверждённый депозит."
        ),
    }
    await message.answer(
        f"⚠️ {copy_map.get(reason, 'Не удалось привязать. Попробуй позже.')}",
    )
    return True


@router.message(CommandStart())
async def cmd_start(message: Message, state: FSMContext) -> None:
    await state.clear()
    user_id = message.from_user.id
    first_name = message.from_user.first_name or "Трейдер"
    username = message.from_user.username

    # Parse deep-link payload
    referred_by: int | None = None
    click_id: str | None = None
    parts = (message.text or "").split(maxsplit=1)
    if len(parts) > 1:
        payload = parts[1].strip()
        if payload.startswith("link_"):
            # Web-to-bot account-link handshake. Short-circuits the normal
            # /start flow — we only need to redeem the token and reply.
            handled = await _redeem_link_token(message, payload[5:])
            if handled:
                return
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
        "<b>SpaceSignal — справка</b>\n"
        "\n"
        "<b>Основные команды:</b>\n"
        "/start — запуск бота и онбординг\n"
        "/signal — получить торговый сигнал\n"
        "/ref — реферальная программа + ссылка\n"
        "/calc — калькулятор размера сделки\n"
        "/leaderboard — топ-10 трейдеров\n"
        "/cancel — отменить текущее действие\n"
        "\n"
        "<b>Как это работает:</b>\n"
        "1. Зарегистрируйся на PocketOption по нашей ссылке\n"
        "2. Привяжи свой Trader ID через /start\n"
        "3. Нажми «🎯 Получить сигнал» в меню\n"
        "\n"
        "<b>Уровни:</b>\n"
        "• Free — 3 OTC-сигнала/день\n"
        "• Basic ($20+) — 10 сигналов/день\n"
        "• Pro ($100+) — безлимит\n"
        "\n"
        "<i>Не финансовый совет. Торговля бинарными опционами "
        "сопряжена с высоким риском.</i>"
    )
    await message.answer(text, parse_mode=ParseMode.HTML, reply_markup=MAIN_MENU)
