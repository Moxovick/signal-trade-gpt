import logging
from datetime import datetime, timezone
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
        await db.commit()


async def init_db() -> None:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(CREATE_USERS_TABLE)
        await db.execute(CREATE_SIGNALS_TABLE)
        # v2 migrations on existing dbs.
        await _ensure_column(db, "users", "tier", "tier INTEGER DEFAULT 0")
        await _ensure_column(db, "users", "po_trader_id", "po_trader_id TEXT")
        await _ensure_column(db, "users", "click_id", "click_id TEXT")
        await _ensure_column(db, "users", "deposit_total", "deposit_total REAL DEFAULT 0")
        await _ensure_column(
            db, "users", "notifications_enabled", "notifications_enabled INTEGER DEFAULT 1"
        )
        await _ensure_column(db, "users", "wins", "wins INTEGER DEFAULT 0")
        await _ensure_column(db, "users", "losses", "losses INTEGER DEFAULT 0")
        await _ensure_column(db, "users", "banned", "banned INTEGER DEFAULT 0")
        # v3: on-demand signal daily limits
        await _ensure_column(
            db, "users", "daily_signals_used", "daily_signals_used INTEGER DEFAULT 0"
        )
        await _ensure_column(
            db, "users", "daily_signals_reset_at", "daily_signals_reset_at TEXT"
        )
        await _ensure_column(db, "signals", "telegram_id", "telegram_id INTEGER")
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
    logger.info("Database initialized at %s", DB_PATH)


def _row_to_user(row: aiosqlite.Row) -> User:
    keys = row.keys()
    return User(
        telegram_id=row["telegram_id"],
        username=row["username"],
        first_name=row["first_name"],
        referral_code=row["referral_code"],
        referred_by=row["referred_by"],
        tier=row["tier"] if "tier" in keys else 0,
        po_trader_id=row["po_trader_id"] if "po_trader_id" in keys else None,
        click_id=row["click_id"] if "click_id" in keys else None,
        deposit_total=float(row["deposit_total"]) if "deposit_total" in keys else 0.0,
        notifications_enabled=bool(row["notifications_enabled"])
        if "notifications_enabled" in keys
        else True,
        is_premium=bool(row["is_premium"]),
        signals_received=row["signals_received"],
        wins=row["wins"] if "wins" in keys else 0,
        losses=row["losses"] if "losses" in keys else 0,
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


async def save_signal(signal: Signal, telegram_id: Optional[int] = None) -> int:
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute(
            """
            INSERT INTO signals (telegram_id, pair, direction, expiration, confidence, signal_type, tier, result)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                telegram_id,
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


async def set_click_id(telegram_id: int, click_id: str) -> None:
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "UPDATE users SET click_id = ? WHERE telegram_id = ?",
            (click_id, telegram_id),
        )
        await db.commit()


async def set_deposit_total(telegram_id: int, deposit_total: float) -> None:
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "UPDATE users SET deposit_total = ? WHERE telegram_id = ?",
            (deposit_total, telegram_id),
        )
        await db.commit()


async def toggle_notifications(telegram_id: int) -> bool:
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "UPDATE users SET notifications_enabled = 1 - notifications_enabled "
            "WHERE telegram_id = ?",
            (telegram_id,),
        )
        await db.commit()
        async with db.execute(
            "SELECT notifications_enabled FROM users WHERE telegram_id = ?",
            (telegram_id,),
        ) as cursor:
            row = await cursor.fetchone()
            return bool(row[0]) if row else True


async def is_user_banned(telegram_id: int) -> bool:
    """Check if a user is banned."""
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute(
            "SELECT banned FROM users WHERE telegram_id = ?", (telegram_id,)
        ) as cursor:
            row = await cursor.fetchone()
            return bool(row[0]) if row else False


async def record_signal_result(telegram_id: int, signal_id: int, result: str) -> None:
    """Mark a signal's result and bump the user's win/loss counter."""
    if result not in {"win", "loss"}:
        raise ValueError(f"Bad signal result: {result!r}")
    column = "wins" if result == "win" else "losses"
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("BEGIN")
        try:
            await db.execute(
                "UPDATE signals SET result = ? WHERE id = ?", (result, signal_id)
            )
            await db.execute(
                f"UPDATE users SET {column} = {column} + 1 WHERE telegram_id = ?",
                (telegram_id,),
            )
            await db.commit()
        except Exception:
            await db.rollback()
            raise


async def get_referral_count(telegram_id: int) -> int:
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute(
            "SELECT COUNT(*) FROM users WHERE referred_by = ?", (telegram_id,)
        ) as cursor:
            row = await cursor.fetchone()
            return row[0] if row else 0


async def get_top_users(limit: int = 10) -> list[User]:
    """Top users by tier then signals received (matches web leaderboard ranking)."""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            """
            SELECT * FROM users
            WHERE signals_received > 0
            ORDER BY tier DESC, signals_received DESC
            LIMIT ?
            """,
            (limit,),
        ) as cursor:
            rows = await cursor.fetchall()
            return [_row_to_user(r) for r in rows]


async def get_users_with_notifications() -> list[User]:
    """All users that have notifications enabled — used for per-user signal broadcast."""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            "SELECT * FROM users WHERE notifications_enabled = 1"
        ) as cursor:
            rows = await cursor.fetchall()
            return [_row_to_user(r) for r in rows]


# ── Daily signal counter (on-demand delivery) ────────────────────────────────


async def reset_daily_signals_if_expired(telegram_id: int) -> None:
    """Reset the daily signal counter if 24h have passed since reset_at."""
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute(
            "SELECT daily_signals_reset_at FROM users WHERE telegram_id = ?",
            (telegram_id,),
        ) as cur:
            row = await cur.fetchone()
        if not row or not row[0]:
            return
        try:
            reset_at = datetime.fromisoformat(row[0]).replace(tzinfo=timezone.utc)
        except (ValueError, TypeError):
            return
        now = datetime.now(timezone.utc)
        if (now - reset_at).total_seconds() >= 86400:
            await db.execute(
                "UPDATE users SET daily_signals_used = 0, daily_signals_reset_at = NULL "
                "WHERE telegram_id = ?",
                (telegram_id,),
            )
            await db.commit()


async def get_daily_signal_count(telegram_id: int, daily_limit: int | None) -> tuple[int, int | None, bool]:
    """
    Returns (used, limit, can_request).

    limit is None for unlimited tiers.
    """
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute(
            "SELECT daily_signals_used FROM users WHERE telegram_id = ?",
            (telegram_id,),
        ) as cur:
            row = await cur.fetchone()
        used = row[0] if row and row[0] else 0
    if daily_limit is None:
        return used, None, True
    return used, daily_limit, used < daily_limit


async def increment_daily_signal(telegram_id: int) -> None:
    """Increment the daily signal counter; set reset_at if this is the first signal today."""
    now_iso = datetime.now(timezone.utc).isoformat()
    async with aiosqlite.connect(DB_PATH) as db:
        # Set reset_at if not already set (first signal of the day window).
        await db.execute(
            "UPDATE users SET daily_signals_used = daily_signals_used + 1, "
            "daily_signals_reset_at = COALESCE(daily_signals_reset_at, ?) "
            "WHERE telegram_id = ?",
            (now_iso, telegram_id),
        )
        await db.commit()
