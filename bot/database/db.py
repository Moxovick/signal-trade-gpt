import logging
from pathlib import Path
from typing import Optional

import aiosqlite

from database.models import CREATE_USERS_TABLE, CREATE_SIGNALS_TABLE, User, Signal

logger = logging.getLogger(__name__)

DB_PATH = Path("data/bot.db")


async def init_db() -> None:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(CREATE_USERS_TABLE)
        await db.execute(CREATE_SIGNALS_TABLE)
        await db.commit()
    logger.info("Database initialized at %s", DB_PATH)


async def get_user(telegram_id: int) -> Optional[User]:
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            "SELECT * FROM users WHERE telegram_id = ?", (telegram_id,)
        ) as cursor:
            row = await cursor.fetchone()
            if row is None:
                return None
            return User(
                telegram_id=row["telegram_id"],
                username=row["username"],
                first_name=row["first_name"],
                referral_code=row["referral_code"],
                referred_by=row["referred_by"],
                is_premium=bool(row["is_premium"]),
                signals_received=row["signals_received"],
            )


async def create_user(user: User) -> None:
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            """
            INSERT OR IGNORE INTO users
                (telegram_id, username, first_name, referral_code, referred_by, is_premium, signals_received)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                user.telegram_id,
                user.username,
                user.first_name,
                user.referral_code,
                user.referred_by,
                user.is_premium,
                user.signals_received,
            ),
        )
        await db.commit()


async def increment_signals_received(telegram_id: int) -> None:
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "UPDATE users SET signals_received = signals_received + 1 WHERE telegram_id = ?",
            (telegram_id,),
        )
        await db.commit()


async def save_signal(signal: Signal) -> int:
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute(
            """
            INSERT INTO signals (pair, direction, expiration, confidence, signal_type, result)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                signal.pair,
                signal.direction,
                signal.expiration,
                signal.confidence,
                signal.signal_type,
                signal.result or "pending",
            ),
        ) as cursor:
            signal_id = cursor.lastrowid
        await db.commit()
        return signal_id


async def get_total_signals() -> int:
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute("SELECT COUNT(*) FROM signals") as cursor:
            row = await cursor.fetchone()
            return row[0] if row else 0


async def get_total_users() -> int:
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute("SELECT COUNT(*) FROM users") as cursor:
            row = await cursor.fetchone()
            return row[0] if row else 0


async def get_user_by_referral_code(code: str) -> Optional[User]:
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            "SELECT * FROM users WHERE referral_code = ?", (code,)
        ) as cursor:
            row = await cursor.fetchone()
            if row is None:
                return None
            return User(
                telegram_id=row["telegram_id"],
                username=row["username"],
                first_name=row["first_name"],
                referral_code=row["referral_code"],
                referred_by=row["referred_by"],
                is_premium=bool(row["is_premium"]),
                signals_received=row["signals_received"],
            )
