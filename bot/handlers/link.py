"""
/link command — finite-state attach flow for PocketOption trader ID.

The bot stores the ID locally (SQLite); the web platform Postback service is
the source of truth for tier, but storing the ID locally lets us prefill the
website form and answer /tier with at least the linked-status hint.
"""
import logging
import re

from aiogram import Router, F
from aiogram.filters import Command
from aiogram.types import Message
from aiogram.enums import ParseMode
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import StatesGroup, State

from database.db import get_user, set_po_trader_id  # noqa: F401

logger = logging.getLogger(__name__)
router = Router()

PO_ID_RE = re.compile(r"^\d{4,12}$")


class LinkPo(StatesGroup):
    waiting_for_id = State()


@router.message(Command("link"))
async def cmd_link(message: Message, state: FSMContext) -> None:
    user = await get_user(message.from_user.id)
    if user is None:
        await message.answer("Сначала /start.")
        return

    if user.po_trader_id:
        await message.answer(
            f"Аккаунт уже привязан: <code>{user.po_trader_id}</code>.\n"
            f"Если нужно сменить — пришли новый ID цифрами в ответ.",
            parse_mode=ParseMode.HTML,
        )
    else:
        await message.answer(
            "Пришли свой PocketOption Trader ID (только цифры, 4–12 знаков).\n"
            "Найти его можно в профиле PocketOption → раздел «Мой ID».",
        )
    await state.set_state(LinkPo.waiting_for_id)


@router.message(LinkPo.waiting_for_id, F.text)
async def receive_id(message: Message, state: FSMContext) -> None:
    candidate = (message.text or "").strip()
    if not PO_ID_RE.match(candidate):
        await message.answer(
            "Неверный формат. Жду только цифры, 4–12 знаков. /cancel чтобы отменить.",
        )
        return

    # Phase Q — best-effort verification + deposit refresh.
    verified_msg = ""
    try:
        from services.po_api import fetch_trader_info

        info = await fetch_trader_info(candidate)
        if info is not None:
            from database.db import set_deposit_total

            try:
                await set_deposit_total(message.from_user.id, info.deposit_total)
            except Exception:  # noqa: BLE001
                logger.warning("Could not store deposit_total from PO API", exc_info=True)
            verified_msg = (
                f"\n\n✅ <b>Подтверждено в PocketOption</b> — "
                f"депозит: ${info.deposit_total:,.0f}"
            )
    except Exception as exc:  # noqa: BLE001
        logger.warning("PO verification skipped: %s", exc)

    await set_po_trader_id(message.from_user.id, candidate)
    data = await state.get_data()
    is_onboarding = bool(data.get("onboarding"))
    await state.clear()

    if is_onboarding:
        bot_info = await message.bot.get_me()
        user = await get_user(message.from_user.id)
        ref_code = user.referral_code if user else "??"
        ref_link = f"https://t.me/{bot_info.username}?start=ref_{ref_code}"
        await message.answer(
            f"<b>✅ Готово — обучение пройдено</b>\n"
            f"\n"
            f"PocketOption ID: <code>{candidate}</code>\n"
            f"Текущий тир: <b>T0 · Демо</b> (2 сигнала за всё время)\n"
            f"\n"
            f"Как только PocketOption пришлёт нам postback о депозите ≥ $100 — "
            f"тир обновится автоматически и я напишу сюда.\n"
            f"\n"
            f"Попробуй первый сигнал — нажми «📊 Сигнал» внизу.\n"
            f"\n"
            f"Реф-ссылка (5% sub-affiliate с FTD друзей):\n"
            f"<code>{ref_link}</code>"
            + verified_msg,
            parse_mode=ParseMode.HTML,
        )
    else:
        await message.answer(
            f"<b>Привязано.</b>\n\n"
            f"PocketOption ID: <code>{candidate}</code>\n"
            f"Tier пересчитается, как только PocketOption пришлёт нам postback "
            f"о депозите."
            + verified_msg,
            parse_mode=ParseMode.HTML,
        )


@router.message(Command("cancel"))
async def cmd_cancel(message: Message, state: FSMContext) -> None:
    await state.clear()
    await message.answer("Отменено.")
