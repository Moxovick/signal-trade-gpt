"""
Achievement engine.

Definitions are atomic; each achievement has:
  • code        — stable identifier (used to dedupe)
  • title       — short label, includes an emoji medal
  • description — one-line copy shown to the user

We persist unlocked codes per-user in the `achievements` table to ensure
each one is awarded exactly once. After every /signal Win/Loss callback
and every tier-sync upgrade, call `check_and_award(bot, user)` to evaluate
unmet achievements.
"""
from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Awaitable, Callable

import aiosqlite
from aiogram import Bot
from aiogram.enums import ParseMode

from database.db import DB_PATH, get_referral_count
from database.models import User

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class Achievement:
    code: str
    title: str
    description: str
    predicate: Callable[[User], Awaitable[bool]]


# ── predicates ────────────────────────────────────────────────────────────────


async def _has_linked_po(u: User) -> bool:
    return u.po_trader_id is not None


async def _first_deposit(u: User) -> bool:
    return u.deposit_total > 0


async def _five_wins(u: User) -> bool:
    return u.wins >= 5


async def _ten_wins(u: User) -> bool:
    return u.wins >= 10


async def _winrate_70(u: User) -> bool:
    total = u.wins + u.losses
    return total >= 10 and (u.wins / total) >= 0.7


async def _tier_t2(u: User) -> bool:
    return u.tier >= 2


async def _tier_t4(u: User) -> bool:
    return u.tier >= 4


async def _three_referrals(u: User) -> bool:
    n = await get_referral_count(u.telegram_id)
    return n >= 3


async def _ten_referrals(u: User) -> bool:
    n = await get_referral_count(u.telegram_id)
    return n >= 10


# ── catalogue ─────────────────────────────────────────────────────────────────

ACHIEVEMENTS: list[Achievement] = [
    Achievement(
        "po_linked",
        "🔗 Подключился",
        "Привязал PocketOption к боту",
        _has_linked_po,
    ),
    Achievement(
        "first_deposit",
        "💰 Первый депозит",
        "Зачислил первый депозит на PocketOption",
        _first_deposit,
    ),
    Achievement(
        "five_wins",
        "🥉 Пятая победа",
        "Закрыл 5 сигналов в плюс",
        _five_wins,
    ),
    Achievement(
        "ten_wins",
        "🥈 Десятка",
        "Закрыл 10 сигналов в плюс",
        _ten_wins,
    ),
    Achievement(
        "winrate_70",
        "🎯 Снайпер",
        "Винрейт 70%+ на 10+ сделках",
        _winrate_70,
    ),
    Achievement(
        "tier_t2",
        "📈 Active",
        "Поднял тир до T2",
        _tier_t2,
    ),
    Achievement(
        "tier_t4",
        "👑 VIP",
        "Поднял тир до T4 — топ-уровень",
        _tier_t4,
    ),
    Achievement(
        "three_referrals",
        "🤝 Тройка",
        "Привёл 3 трейдеров по рефке",
        _three_referrals,
    ),
    Achievement(
        "ten_referrals",
        "🌐 Магнат",
        "Привёл 10+ трейдеров — лидер по рефке",
        _ten_referrals,
    ),
]


# ── persistence ───────────────────────────────────────────────────────────────


async def _ensure_table() -> None:
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            """
            CREATE TABLE IF NOT EXISTS achievements (
                telegram_id INTEGER NOT NULL,
                code        TEXT    NOT NULL,
                awarded_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (telegram_id, code)
            )
            """
        )
        await db.commit()


async def _unlocked_codes(telegram_id: int) -> set[str]:
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute(
            "SELECT code FROM achievements WHERE telegram_id = ?",
            (telegram_id,),
        ) as cur:
            rows = await cur.fetchall()
            return {r[0] for r in rows}


async def _record(telegram_id: int, code: str) -> None:
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "INSERT OR IGNORE INTO achievements (telegram_id, code) VALUES (?, ?)",
            (telegram_id, code),
        )
        await db.commit()


# ── public API ────────────────────────────────────────────────────────────────


async def check_and_award(bot: Bot, user: User) -> None:
    """Evaluate every achievement for `user` and award + notify any new ones."""
    await _ensure_table()
    unlocked = await _unlocked_codes(user.telegram_id)
    for ach in ACHIEVEMENTS:
        if ach.code in unlocked:
            continue
        try:
            ok = await ach.predicate(user)
        except Exception:  # noqa: BLE001
            logger.exception("Achievement predicate failed: %s", ach.code)
            continue
        if not ok:
            continue
        await _record(user.telegram_id, ach.code)
        try:
            await bot.send_message(
                user.telegram_id,
                f"<b>🏅 Достижение разблокировано</b>\n"
                f"\n"
                f"<b>{ach.title}</b>\n"
                f"<i>{ach.description}</i>",
                parse_mode=ParseMode.HTML,
            )
        except Exception:  # noqa: BLE001
            logger.warning(
                "Could not deliver achievement %s to %s",
                ach.code,
                user.telegram_id,
            )


async def list_for_user(telegram_id: int) -> list[tuple[Achievement, bool]]:
    """Return (achievement, unlocked) pairs in catalogue order."""
    await _ensure_table()
    unlocked = await _unlocked_codes(telegram_id)
    return [(a, a.code in unlocked) for a in ACHIEVEMENTS]
