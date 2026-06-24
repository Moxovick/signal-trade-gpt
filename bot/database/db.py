import json
import logging
import secrets
import ssl
from datetime import datetime, timezone
from typing import Any, Optional

import asyncpg

from database.models import User, Signal

logger = logging.getLogger(__name__)

_pool: Optional[asyncpg.Pool] = None


def _generate_cuid() -> str:
    """Generate a cuid-like identifier (matches Prisma CUID style)."""
    return "c" + secrets.token_urlsafe(16)


async def init_db(database_url: str) -> None:
    """Create the asyncpg connection pool. Tables are managed by Prisma."""
    global _pool
    if _pool is not None:
        return

    kwargs: dict = {"min_size": 2, "max_size": 10}
    # Neon and most cloud Postgres require SSL
    if "sslmode=require" in database_url or "sslmode=verify" in database_url:
        ssl_ctx = ssl.create_default_context()
        ssl_ctx.check_hostname = False
        ssl_ctx.verify_mode = ssl.CERT_NONE
        kwargs["ssl"] = ssl_ctx

    # asyncpg needs postgres:// not postgresql://
    dsn = database_url.replace("postgresql://", "postgres://", 1)
    # Remove channel_binding param — asyncpg doesn't support it
    dsn = dsn.replace("&channel_binding=require", "").replace("?channel_binding=require&", "?").replace("?channel_binding=require", "")

    _pool = await asyncpg.create_pool(dsn, **kwargs)
    logger.info("Postgres connection pool created")


async def close_db() -> None:
    """Gracefully close the pool."""
    global _pool
    if _pool is not None:
        await _pool.close()
        _pool = None
        logger.info("Postgres connection pool closed")


def _get_pool() -> asyncpg.Pool:
    if _pool is None:
        raise RuntimeError("Database pool not initialised — call init_db() first")
    return _pool


def _row_to_user(row: asyncpg.Record) -> User:
    return User(
        telegram_id=int(row["telegramId"]) if row["telegramId"] is not None else 0,
        username=row["username"],
        first_name=row["firstName"] or "",
        referral_code=row["referralCode"],
        referred_by=None,  # not trivially available (stored as CUID, not telegram_id)
        tier=row["tier"] or 0,
        po_trader_id=row.get("poTraderId"),
        click_id=row.get("clickId"),
        deposit_total=float(row["depositTotal"]) if row["depositTotal"] is not None else 0.0,
        notifications_enabled=True,  # TODO: read from notificationSettings JSON if added
        is_premium=(row["tier"] or 0) > 0,
        signals_received=row["signalsReceived"] or 0,
        wins=row.get("wins", 0) or 0,
        losses=row.get("losses", 0) or 0,
    )


async def get_user(telegram_id: int) -> Optional[User]:
    pool = _get_pool()
    row = await pool.fetchrow(
        """
        SELECT u.*, pa."poTraderId"
        FROM "users" u
        LEFT JOIN "po_accounts" pa ON pa."userId" = u.id
        WHERE u."telegramId" = $1
        """,
        telegram_id,
    )
    return _row_to_user(row) if row else None


async def create_user(user: User) -> None:
    pool = _get_pool()
    user_id = _generate_cuid()
    referral_code = user.referral_code or _generate_cuid()

    # Resolve referredById: if referred_by is a telegram_id, look up the CUID
    referred_by_id: Optional[str] = None
    if user.referred_by:
        ref_row = await pool.fetchrow(
            'SELECT id FROM "users" WHERE "telegramId" = $1',
            user.referred_by,
        )
        if ref_row:
            referred_by_id = ref_row["id"]

    await pool.execute(
        """
        INSERT INTO "users" (id, "telegramId", username, "firstName", "referralCode",
                             "referredById", tier, "signalsReceived", "depositTotal",
                             "createdAt", role, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0, NOW(), 'user', 'active')
        ON CONFLICT ("telegramId") DO NOTHING
        """,
        user_id,
        telegram_id_to_bigint(user.telegram_id),
        user.username,
        user.first_name,
        referral_code,
        referred_by_id,
        user.tier,
        user.signals_received,
    )


def telegram_id_to_bigint(tid: int) -> int:
    """Ensure telegram_id is passed as a plain int (asyncpg handles BigInt)."""
    return int(tid)


async def set_po_trader_id(telegram_id: int, po_trader_id: str) -> None:
    pool = _get_pool()
    # Get user CUID first
    row = await pool.fetchrow(
        'SELECT id FROM "users" WHERE "telegramId" = $1',
        telegram_id_to_bigint(telegram_id),
    )
    if not row:
        return
    user_id = row["id"]

    await pool.execute(
        """
        INSERT INTO "po_accounts" (id, "userId", "poTraderId", "createdAt", "updatedAt")
        VALUES ($1, $2, $3, NOW(), NOW())
        ON CONFLICT ("userId") DO UPDATE SET "poTraderId" = $3, "updatedAt" = NOW()
        """,
        _generate_cuid(),
        user_id,
        po_trader_id,
    )


async def set_tier(telegram_id: int, tier: int) -> None:
    pool = _get_pool()
    await pool.execute(
        'UPDATE "users" SET tier = $1, "lastLogin" = NOW() WHERE "telegramId" = $2',
        tier,
        telegram_id_to_bigint(telegram_id),
    )


async def increment_signals_received(telegram_id: int) -> None:
    pool = _get_pool()
    await pool.execute(
        """UPDATE "users" SET "signalsReceived" = "signalsReceived" + 1           WHERE "telegramId" = $1""",
        telegram_id_to_bigint(telegram_id),
    )


async def set_signals_received(telegram_id: int, count: int) -> None:
    pool = _get_pool()
    await pool.execute(
        'UPDATE "users" SET "signalsReceived" = $1, "lastLogin" = NOW() WHERE "telegramId" = $2',
        count,
        telegram_id_to_bigint(telegram_id),
    )


async def save_signal(signal: Signal, telegram_id: Optional[int] = None) -> int:
    pool = _get_pool()

    signal_id = _generate_cuid()
    created_by_id: Optional[str] = None

    if telegram_id is not None:
        row = await pool.fetchrow(
            'SELECT id FROM "users" WHERE "telegramId" = $1',
            telegram_id_to_bigint(telegram_id),
        )
        if row:
            created_by_id = row["id"]

    await pool.execute(
        """
        INSERT INTO "signals" (id, pair, direction, expiration, confidence, type,
                              tier, analysis, result, "createdById", "createdAt")
        VALUES ($1, $2, $3::"SignalDirection", $4, $5, $6::"SignalType",
                $7::"SignalTier", $8, $9::"SignalResult", $10, NOW())
        """,
        signal_id,
        signal.pair,
        signal.direction,
        signal.expiration,
        signal.confidence,
        signal.signal_type,
        signal.tier,
        signal.analysis,
        signal.result or "pending",
        created_by_id,
    )
    # Return a numeric-ish id for backward compat — hash the CUID
    return hash(signal_id) & 0x7FFFFFFF


async def get_total_signals() -> int:
    pool = _get_pool()
    row = await pool.fetchrow('SELECT COUNT(*) AS cnt FROM "signals"')
    return int(row["cnt"]) if row else 0


async def get_total_users() -> int:
    pool = _get_pool()
    row = await pool.fetchrow('SELECT COUNT(*) AS cnt FROM "users"')
    return int(row["cnt"]) if row else 0


async def get_user_by_referral_code(code: str) -> Optional[User]:
    pool = _get_pool()
    row = await pool.fetchrow(
        """
        SELECT u.*, pa."poTraderId"
        FROM "users" u
        LEFT JOIN "po_accounts" pa ON pa."userId" = u.id
        WHERE u."referralCode" = $1
        """,
        code,
    )
    return _row_to_user(row) if row else None


async def set_click_id(telegram_id: int, click_id: str) -> None:
    pool = _get_pool()
    await pool.execute(
        'UPDATE "users" SET "clickId" = $1, "lastLogin" = NOW() WHERE "telegramId" = $2',
        click_id,
        telegram_id_to_bigint(telegram_id),
    )


async def get_user_locale(telegram_id: int) -> Optional[str]:
    """Read language from the user's preferences JSON. Returns 'ru'|'uk' or None."""
    pool = _get_pool()
    row = await pool.fetchrow(
        'SELECT preferences FROM "users" WHERE "telegramId" = $1',
        telegram_id_to_bigint(telegram_id),
    )
    if not row or not row["preferences"]:
        return None
    prefs = row["preferences"]
    if isinstance(prefs, str):
        prefs = json.loads(prefs)
    return prefs.get("language") if isinstance(prefs, dict) else None


async def set_user_locale(telegram_id: int, locale: str) -> None:
    """Update the language key inside the user's preferences JSON."""
    pool = _get_pool()
    tg_id = telegram_id_to_bigint(telegram_id)
    row = await pool.fetchrow(
        'SELECT preferences FROM "users" WHERE "telegramId" = $1', tg_id,
    )
    prefs: dict = {}
    if row and row["preferences"]:
        p = row["preferences"]
        if isinstance(p, str):
            prefs = json.loads(p)
        elif isinstance(p, dict):
            prefs = p
    prefs["language"] = locale
    await pool.execute(
        'UPDATE "users" SET preferences = $1::jsonb WHERE "telegramId" = $2',
        json.dumps(prefs),
        tg_id,
    )


async def set_deposit_total(telegram_id: int, deposit_total: float) -> None:
    pool = _get_pool()
    from decimal import Decimal
    await pool.execute(
        'UPDATE "users" SET "depositTotal" = $1, "lastLogin" = NOW() WHERE "telegramId" = $2',
        Decimal(str(deposit_total)),
        telegram_id_to_bigint(telegram_id),
    )


async def toggle_notifications(telegram_id: int) -> bool:
    # Notifications are not yet stored in Prisma schema as a boolean column.
    # Placeholder: always returns True until notificationSettings JSON is added.
    return True


async def is_user_banned(telegram_id: int) -> bool:
    pool = _get_pool()
    row = await pool.fetchrow(
        """SELECT status FROM "users" WHERE "telegramId" = $1""",
        telegram_id_to_bigint(telegram_id),
    )
    if not row:
        return False
    return row["status"] == "banned"


async def record_signal_result(telegram_id: int, signal_id: int, result: str) -> None:
    if result not in {"win", "loss"}:
        raise ValueError(f"Bad signal result: {result!r}")
    column = "wins" if result == "win" else "losses"
    pool = _get_pool()
    async with pool.acquire() as conn:
        async with conn.transaction():
            # Signal table uses CUID ids; signal_id here is a hash — skip signal update
            # if we can't resolve it. In practice the bot should store the CUID.
            await conn.execute(
                f'UPDATE "users" SET "{column}" = "{column}" + 1 '
                f'WHERE "telegramId" = $1',
                telegram_id_to_bigint(telegram_id),
            )


async def get_referral_count(telegram_id: int) -> int:
    pool = _get_pool()
    # Get user CUID, then count referrals
    row = await pool.fetchrow(
        'SELECT id FROM "users" WHERE "telegramId" = $1',
        telegram_id_to_bigint(telegram_id),
    )
    if not row:
        return 0
    count_row = await pool.fetchrow(
        'SELECT COUNT(*) AS cnt FROM "users" WHERE "referredById" = $1',
        row["id"],
    )
    return int(count_row["cnt"]) if count_row else 0


async def get_top_users(limit: int = 10) -> list[User]:
    pool = _get_pool()
    rows = await pool.fetch(
        """
        SELECT u.*, pa."poTraderId"
        FROM "users" u
        LEFT JOIN "po_accounts" pa ON pa."userId" = u.id
        WHERE u."signalsReceived" > 0
        ORDER BY u.tier DESC, u."signalsReceived" DESC
        LIMIT $1
        """,
        limit,
    )
    return [_row_to_user(r) for r in rows]


async def get_users_with_notifications() -> list[User]:
    pool = _get_pool()
    rows = await pool.fetch(
        """
        SELECT u.*, pa."poTraderId"
        FROM "users" u
        LEFT JOIN "po_accounts" pa ON pa."userId" = u.id
        WHERE u.status = 'active'
        """,
    )
    return [_row_to_user(r) for r in rows]


# ── Daily signal counter (on-demand delivery) ────────────────────────────────


async def reset_daily_signals_if_expired(telegram_id: int) -> None:
    pool = _get_pool()
    row = await pool.fetchrow(
        'SELECT "dailySignalsResetAt" FROM "users" WHERE "telegramId" = $1',
        telegram_id_to_bigint(telegram_id),
    )
    if not row or not row["dailySignalsResetAt"]:
        return
    reset_at = row["dailySignalsResetAt"]
    if not isinstance(reset_at, datetime):
        return
    if reset_at.tzinfo is None:
        reset_at = reset_at.replace(tzinfo=timezone.utc)
    now = datetime.now(timezone.utc)
    if (now - reset_at).total_seconds() >= 86400:
        await pool.execute(
            """UPDATE "users" SET "dailySignalsUsed" = 0, "dailySignalsResetAt" = NULL,
               "lastLogin" = NOW() WHERE "telegramId" = $1""",
            telegram_id_to_bigint(telegram_id),
        )


async def get_daily_signal_count(
    telegram_id: int, daily_limit: int | None
) -> tuple[int, int | None, bool]:
    pool = _get_pool()
    row = await pool.fetchrow(
        'SELECT "dailySignalsUsed" FROM "users" WHERE "telegramId" = $1',
        telegram_id_to_bigint(telegram_id),
    )
    used = int(row["dailySignalsUsed"]) if row and row["dailySignalsUsed"] else 0
    if daily_limit is None:
        return used, None, True
    return used, daily_limit, used < daily_limit


async def log_activity(
    telegram_id: int, action: str, details: dict[str, Any] | None = None
) -> None:
    """Insert a row into activity_logs. Never raises — logs warning on failure."""
    try:
        pool = _get_pool()
        row = await pool.fetchrow(
            'SELECT id FROM "users" WHERE "telegramId" = $1',
            telegram_id_to_bigint(telegram_id),
        )
        if not row:
            logger.warning("log_activity: user not found for telegramId=%s", telegram_id)
            return
        user_id: str = row["id"]
        await pool.execute(
            """
            INSERT INTO "activity_logs" (id, "userId", action, details, "createdAt")
            VALUES ($1, $2, $3, $4, NOW())
            """,
            _generate_cuid(),
            user_id,
            action,
            json.dumps(details) if details else None,
        )
    except Exception:
        logger.warning("log_activity failed for telegramId=%s action=%s", telegram_id, action, exc_info=True)


async def increment_daily_signal(telegram_id: int) -> None:
    now = datetime.utcnow()
    pool = _get_pool()
    await pool.execute(
        """UPDATE "users"
           SET "dailySignalsUsed" = "dailySignalsUsed" + 1,
               "dailySignalsResetAt" = COALESCE("dailySignalsResetAt", $1),
               "lastLogin" = NOW()
           WHERE "telegramId" = $2""",
        now,
        telegram_id_to_bigint(telegram_id),
    )
