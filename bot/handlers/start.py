"""
/start — register a user, attribute referrer, send brand card + persistent
main-menu keyboard. Deep-link payload formats supported:

  /start ref_<ref_code>     # legacy bot-internal referral
  /start <ref_code>         # bare ref code
  /start po_<click_id>      # PocketOption click_id attribution
  /start link_<token>       # web -> bot account-link handshake
"""
import asyncio
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
    get_user_web_id,
    log_activity,
    set_click_id,
)
from database.models import User
from i18n import t
from i18n_helpers import get_locale
from services.imagegen import get_brand_card_path
from services.keyboards import MAIN_MENU, start_inline

logger = logging.getLogger(__name__)
router = Router()


import re as _re


def _personalize_po_url(template_url: str, user_web_id: str) -> str:
    """Replace click_id placeholder in PO referral URL with the user's web CUID.

    Handles both ``{click_id}`` placeholders and static ``cid=VALUE`` params.
    """
    url = template_url
    # Replace {click_id} template placeholder
    if "{click_id}" in url:
        url = url.replace("{click_id}", user_web_id)
    else:
        # Replace existing static cid=VALUE with user's CUID
        url = _re.sub(r'([?&])cid=[^&]*', rf'\1cid={user_web_id}', url)
    return url


def _format_welcome(first_name: str, ref_code: str, bot_username: str, locale: str = "ru") -> str:
    ref_link = f"https://t.me/{bot_username}?start=ref_{ref_code}"
    return t("start.welcome", locale, first_name=first_name, ref_link=ref_link)


async def _get_photo_url(message: Message) -> str | None:
    """
    Download the user's Telegram profile photo and return it as a
    ``data:image/jpeg;base64,...`` URL so it can be stored in the DB
    permanently (Telegram CDN file URLs expire after ~1 hour).

    Returns None if the user has no photo or the fetch fails.
    """
    try:
        import base64
        from io import BytesIO

        photos = await message.bot.get_user_profile_photos(
            message.from_user.id, limit=1
        )
        if not photos.photos:
            return None
        file_id = photos.photos[0][-1].file_id  # largest size of first photo
        file_info = await message.bot.get_file(file_id)
        if not file_info.file_path:
            return None

        # Download the photo bytes
        photo_url = (
            f"https://api.telegram.org/file/bot{settings.bot_token}"
            f"/{file_info.file_path}"
        )
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(photo_url)
            resp.raise_for_status()

        # Convert to base64 data URL (JPEG, typically < 100 KB)
        b64 = base64.b64encode(resp.content).decode("ascii")
        return f"data:image/jpeg;base64,{b64}"
    except Exception as exc:  # noqa: BLE001
        logger.debug("Could not fetch profile photo: %s", exc)
        return None


async def _redeem_link_token(message: Message, token: str) -> bool:
    """
    Redeem a `link_<token>` deep-link by calling the web platform's
    `/api/bot/telegram-link` endpoint with the bot-sync secret. On success,
    replies to the user and returns True so cmd_start skips the normal flow.
    """
    if not settings.platform_api_url or not settings.bot_sync_secret:
        locale = get_locale(message.from_user)
        await message.answer(t("start.link_not_configured", locale))
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
            locale = get_locale(message.from_user)
            content_type = resp.headers.get("content-type", "")
            body = resp.json() if content_type.startswith("application/json") else {}
            reason = str(body.get("reason", "unknown"))
            logger.warning("link-token redeem HTTP %d: %s (url=%s)", resp.status_code, reason, url)
            if reason == "expired" or resp.status_code == 410:
                await message.answer(t("start.link_expired", locale))
            elif reason == "telegram_taken":
                await message.answer(t("start.link_telegram_taken", locale))
            elif reason == "already_used":
                await message.answer(t("start.link_already_used", locale))
            else:
                await message.answer(t("start.link_server_error", locale))
            return True
        body = resp.json()
    except Exception as exc:  # noqa: BLE001
        logger.warning("link-token redeem failed: %s", exc)
        locale = get_locale(message.from_user)
        await message.answer(t("start.link_connection_error", locale))
        return True

    if body.get("ok"):
        locale = get_locale(message.from_user)
        await message.answer(t("start.link_ok", locale))
        return True

    locale = get_locale(message.from_user)
    reason = str(body.get("reason") or "unknown")
    key_map = {
        "unknown_token": "start.link_unknown_token",
        "already_used": "start.link_already_used_2",
        "expired": "start.link_expired_2",
        "telegram_taken": "start.link_telegram_taken_2",
        "bad_secret": "start.link_bad_secret",
        "not_configured": "start.link_not_configured_2",
        "po_required": "start.link_po_required",
    }
    key = key_map.get(reason, "start.link_fallback_error")
    await message.answer(f"⚠️ {t(key, locale)}" if reason not in key_map else t(key, locale))
    return True


@router.message(CommandStart())
async def cmd_start(message: Message, state: FSMContext) -> None:
    await state.clear()
    locale = get_locale(message.from_user)
    user_id = message.from_user.id
    first_name = message.from_user.first_name or t("common.trader", locale)
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
        asyncio.create_task(log_activity(user_id, "bot_register", {"referred_by": referred_by}))
        user = new_user
    else:
        user = existing

    asyncio.create_task(log_activity(user_id, "bot_start"))

    if click_id:
        await set_click_id(user_id, click_id)

    # Always try to sync PO data from web platform if missing locally
    if not user.po_trader_id:
        from services.tier_sync import try_sync_user
        if await try_sync_user(user_id):
            user = await get_user(user_id)

    # Returning user (was in bot DB) OR synced from web (has PO data) — short welcome
    is_returning = existing is not None or (user and user.po_trader_id)
    if is_returning:
        from constants import TIER_NAMES
        tier_name = TIER_NAMES.get(user.tier, "Free")
        if user.po_trader_id:
            await message.answer(
                t("start.returning_with_po", locale,
                  first_name=first_name,
                  tier_name=tier_name,
                  po_trader_id=user.po_trader_id),
                parse_mode=ParseMode.HTML,
                reply_markup=MAIN_MENU,
            )
        else:
            await message.answer(
                t("start.returning_no_po", locale,
                  first_name=first_name,
                  tier_name=tier_name),
                parse_mode=ParseMode.HTML,
                reply_markup=MAIN_MENU,
            )
        return

    # ── New user — full onboarding ──
    bot_info = await message.bot.get_me()

    # Build personalized PO URL with user's web ID as click_id
    web_id = await get_user_web_id(user_id)
    po_url = _personalize_po_url(settings.pocket_option_url, web_id) if web_id else settings.pocket_option_url

    try:
        card_path = get_brand_card_path()
        await message.answer_photo(
            FSInputFile(card_path),
            caption=_format_welcome(first_name, user.referral_code, bot_info.username, locale),
            parse_mode=ParseMode.HTML,
            reply_markup=start_inline(po_url, settings.webapp_url),
        )
    except Exception as exc:  # noqa: BLE001
        logger.warning("Could not render brand card: %s — falling back to text", exc)
        await message.answer(
            _format_welcome(first_name, user.referral_code, bot_info.username, locale),
            parse_mode=ParseMode.HTML,
            reply_markup=start_inline(po_url, settings.webapp_url),
        )

    await message.answer(
        t("start.menu_active", locale),
        reply_markup=MAIN_MENU,
    )

    if not user.po_trader_id:
        from handlers.onboarding import trigger_for_new_user
        await trigger_for_new_user(message, po_url=po_url)


@router.message(Command("help"))
async def cmd_help(message: Message) -> None:
    locale = get_locale(message.from_user)
    text = t("help.full", locale)
    await message.answer(text, parse_mode=ParseMode.HTML, reply_markup=MAIN_MENU)
