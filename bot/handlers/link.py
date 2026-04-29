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

from database.db import get_user, set_po_trader_id

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

    await set_po_trader_id(message.from_user.id, candidate)
    await state.clear()
    await message.answer(
        f"<b>Привязано.</b>\n\n"
        f"PocketOption ID: <code>{candidate}</code>\n"
        f"Tier пересчитается, как только PocketOption пришлёт нам postback "
        f"о депозите.",
        parse_mode=ParseMode.HTML,
    )


@router.message(Command("cancel"))
async def cmd_cancel(message: Message, state: FSMContext) -> None:
    await state.clear()
    await message.answer("Отменено.")
