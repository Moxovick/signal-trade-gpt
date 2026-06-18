"""
Step-by-step onboarding flow for new users.

Triggered automatically right after /start for users who haven't linked a
PocketOption account yet, and on demand via the "Начать обучение" button.

Flow:
  Step 1/3 — explain RevShare model + show "Открыть PocketOption" CTA
  Step 2/3 — explain tier system + show "Я зарегистрировался" button
  Step 3/3 — collect PocketOption ID via FSM (reuses LinkPo state)
  Done    — confirmation + first demo signal unlock hint
"""
from __future__ import annotations

import logging

from aiogram import F, Router
from aiogram.filters import Command
from aiogram.fsm.context import FSMContext
from aiogram.types import (
    CallbackQuery,
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    Message,
)
from aiogram.enums import ParseMode

from config import settings
from handlers.link import LinkPo

logger = logging.getLogger(__name__)
router = Router()


def _step_keyboard(po_url: str, next_cb: str | None) -> InlineKeyboardMarkup:
    rows: list[list[InlineKeyboardButton]] = [
        [InlineKeyboardButton(text="💎 Открыть PocketOption", url=po_url)],
    ]
    if next_cb:
        rows.append(
            [InlineKeyboardButton(text="Дальше →", callback_data=next_cb)]
        )
    return InlineKeyboardMarkup(inline_keyboard=rows)


@router.message(Command("onboard", "tutorial", "start_tour"))
async def cmd_onboard(message: Message) -> None:
    await _send_step1(message)


async def _send_step1(message: Message) -> None:
    text = (
        "<b>🎓 Шаг 1 из 3 · Как это работает</b>\n"
        "\n"
        "Signal Trade GPT — <b>не подписка</b>. Ты не платишь нам ни цента.\n"
        "\n"
        "Мы зарабатываем <b>RevShare</b> — процент с прибыли, которую брокер "
        "получает с твоих сделок. Поэтому нам выгодно, чтобы <b>ты зарабатывал</b>: "
        "чем дольше ты в плюсе — тем больше депозит, тем выше твой тир, тем "
        "сильнее перки бота.\n"
        "\n"
        "Жми кнопку ниже — это <b>наша партнёрская ссылка</b>. Она нужна, "
        "чтобы PocketOption знал, что ты пришёл от нас, и активировал тебе "
        "тир в боте автоматически после депозита."
    )
    await message.answer(
        text,
        parse_mode=ParseMode.HTML,
        reply_markup=_step_keyboard(settings.pocket_option_url, "onb:step2"),
    )


@router.callback_query(F.data == "onb:step2")
async def cb_step2(query: CallbackQuery) -> None:
    text = (
        "<b>🎓 Шаг 2 из 3 · Как открывается доступ</b>\n"
        "\n"
        "Как только PocketOption подтверждает регистрацию по нашей ссылке — "
        "доступ открывается автоматически.\n"
        "\n"
        "  • <b>Free</b> — OTC-сигналы, 3 в день\n"
        "  • <b>Basic</b> (депозит ≥ $20) — OTC + биржа, 10 в день\n"
        "  • <b>Pro</b> (депозит ≥ $100) — всё безлимитно + Elite\n"
        "\n"
        "Дополнительно — <b>5% sub-affiliate</b> с FTD каждого приглашённого тобой "
        "трейдера. Реф-ссылку дам в конце.\n"
        "\n"
        "Если уже зарегистрировался по нашей ссылке — жми «Я зарегистрировался» и "
        "пришли свой PocketOption Trader ID."
    )
    if query.message:
        await query.message.edit_text(
            text,
            parse_mode=ParseMode.HTML,
            reply_markup=InlineKeyboardMarkup(
                inline_keyboard=[
                    [InlineKeyboardButton(text="💎 Открыть PocketOption", url=settings.pocket_option_url)],
                    [InlineKeyboardButton(text="Я зарегистрировался — ввести ID", callback_data="onb:step3")],
                ]
            ),
        )
    await query.answer()


@router.callback_query(F.data == "onb:step3")
async def cb_step3(query: CallbackQuery, state: FSMContext) -> None:
    text = (
        "<b>🎓 Шаг 3 из 3 · Привязка ID</b>\n"
        "\n"
        "Открой PocketOption → <b>Профиль</b> → раздел <b>«Мой ID»</b>. "
        "Там 6–9-значный номер. Пришли его сюда сообщением (только цифры).\n"
        "\n"
        "<i>Если ещё не зарегистрирован — нажми кнопку ниже сначала.</i>"
    )
    if query.message:
        await query.message.edit_text(
            text,
            parse_mode=ParseMode.HTML,
            reply_markup=InlineKeyboardMarkup(
                inline_keyboard=[
                    [InlineKeyboardButton(text="💎 Открыть PocketOption", url=settings.pocket_option_url)],
                    [InlineKeyboardButton(text="❌ Отменить", callback_data="onb:cancel")],
                ]
            ),
        )
    await state.set_state(LinkPo.waiting_for_id)
    # Tag this state as onboarding so receive_id can offer post-link bonus message.
    await state.update_data(onboarding=True)
    await query.answer()


@router.callback_query(F.data == "onb:cancel")
async def cb_cancel(query: CallbackQuery, state: FSMContext) -> None:
    await state.clear()
    if query.message:
        await query.message.edit_text(
            "Обучение отложено. Запустишь заново командой /onboard.\n"
            "Привязать ID можно в любой момент — /link.",
        )
    await query.answer()


# Public helper called from start.py for brand-new users.
async def trigger_for_new_user(message: Message) -> None:
    """Launch step 1 of the onboarding for a freshly-registered user."""
    await _send_step1(message)
