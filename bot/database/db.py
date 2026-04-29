import logging
from pathlib import Path
from typing import Optional

import aiosqlite

from database.models import (
    CREATE_USERS_TABLE,
    CREATE_SIGNALS_TABLE,
    User,
    Signal,
)

logger = logging.getLogger(__name__)

DB_PATH = Path("data/bot.db")


async def _ensure_column(db: aiosqlite.Connection, table: str, column: str, ddl: str) -> None:
    """Idempotent ALTER TABLE — SQLite has no IF NOT EXISTS for columns."""
    async with db.execute(f"PRAGMA table_info({table})") as cur:
        cols = [r[1] for r in await cur.fetchall()]
    if column not in cols:
        await db.execute(f"ALTER TABLE {table} ADD COLUMN {ddl}")


async def init_db() -> None:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(CREATE_USERS_TABLE)
        await db.execute(CREATE_SIGNALS_TABLE)
        # v2 migrations on existing dbs.
        await _ensure_column(db, "users", "tier", "tier INTEGER DEFAULT 0")
        await _ensure_column(db, "users", "po_trader_id", "po_trader_id TEXT")
        await db.commit()
    logger.info("Database initialized at %s", DB_PATH)


def _row_to_user(row: aiosqlite.Row) -> User:
    return User(
        telegram_id=row["telegram_id"],
        username=row["username"],
        first_name=row["first_name"],
        referral_code=row["referral_code"],
        referred_by=row["referred_by"],
        tier=row["tier"] if "tier" in row.keys() else 0,
        po_trader_id=row["po_trader_id"] if "po_trader_id" in row.keys() else None,
        is_premium=bool(row["is_premium"]),
        signals_received=row["signals_received"],
    )


async def get_user(telegram_id: int) -> Optional[User]:
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            "SELECT * FROM users WHERE telegram_id = ?", (telegram_id,)
        ) as cursor:
            row = await cursor.fetchone()
            return _row_to_user(row) if row else None


async def create_user(user: User) -> None:
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            """
            INSERT OR IGNORE INTO users
                (telegram_id, username, first_name, referral_code, referred_by,
                 is_premium, signals_received, tier, po_trader_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                user.telegram_id,
                user.username,
                user.first_name,
                user.referral_code,
                user.referred_by,
                user.is_premium,
                user.signals_received,
                user.tier,
                user.po_trader_id,
            ),
        )
        await db.commit()


async def set_po_trader_id(telegram_id: int, po_trader_id: str) -> None:
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "UPDATE users SET po_trader_id = ? WHERE telegram_id = ?",
            (po_trader_id, telegram_id),
        )
        await db.commit()


async def set_tier(telegram_id: int, tier: int) -> None:
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "UPDATE users SET tier = ? WHERE telegram_id = ?",
            (tier, telegram_id),
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
            INSERT INTO signals (pair, direction, expiration, confidence, signal_type, tier, result)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                signal.pair,
                signal.direction,
                signal.expiration,
                signal.confidence,
                signal.signal_type,
                signal.tier,
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
            return _row_to_user(row) if row else None
