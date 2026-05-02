"""
In-bot admin tools.

Restricted to telegram_ids listed in env ADMIN_IDS (comma-separated). Commands:
  /admin                      — show admin panel summary
  /broadcast <message…>       — send a message to every registered user
  /set_tier <user_id> <T>     — manually override a user's tier
  /ban <user_id>              — block a user from the bot (sets tier=-1 sentinel)
  /unban <user_id>            — restore (sets tier=0)
  /stats_global               — full platform stats

The implementation is intentionally simple: no separate admin DB tables.
Bans are tracked via a `banned` flag column added by `_ensure_columns`.
"""
from __future__ import annotations

import logging

import aiosqlite
from aiogram import Router
from aiogram.filters import Command, CommandObject
from aiogram.types import Message
from aiogram.enums import ParseMode

from config import settings
from database.db import (
    DB_PATH,
    get_total_signals,
    get_total_users,
    get_user,
    set_tier,
)

logger = logging.getLogger(__name__)
router = Router()


def _admin_ids() -> set[int]:
    raw = (settings.admin_ids or "").strip()
    if not raw:
        return set()
    out: set[int] = set()
    for chunk in raw.split(","):
        chunk = chunk.strip()
        if chunk.isdigit():
            out.add(int(chunk))
    return out


def _is_admin(telegram_id: int) -> bool:
    return telegram_id in _admin_ids()


async def _ensure_banned_column() -> None:
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute("PRAGMA table_info(users)") as cur:
            cols = [r[1] for r in await cur.fetchall()]
        if "banned" not in cols:
            await db.execute("ALTER TABLE users ADD COLUMN banned INTEGER DEFAULT 0")
            await db.commit()


async def _set_banned(telegram_id: int, banned: bool) -> None:
    await _ensure_banned_column()
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "UPDATE users SET banned = ? WHERE telegram_id = ?",
            (1 if banned else 0, telegram_id),
        )
        await db.commit()


async def _all_user_ids() -> list[int]:
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute("SELECT telegram_id FROM users") as cur:
            return [r[0] for r in await cur.fetchall()]


async def _tier_breakdown() -> dict[int, int]:
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute(
            "SELECT tier, COUNT(*) FROM users GROUP BY tier"
        ) as cur:
            return {int(r[0]): int(r[1]) for r in await cur.fetchall()}


# ── handlers ──────────────────────────────────────────────────────────────────


@router.message(Command("admin"))
async def cmd_admin(message: Message) -> None:
    if not _is_admin(message.from_user.id):
        return  # silent
    total_signals = await get_total_signals()
    total_users = await get_total_users()
    breakdown = await _tier_breakdown()
    tier_lines = "\n".join(
        f"  T{t}: <b>{breakdown.get(t, 0)}</b>" for t in sorted(breakdown)
    )
    text = (
        "<b>🛠 Admin panel</b>\n"
        "\n"
        f"<b>Users:</b> {total_users:,}\n"
        f"<b>Signals:</b> {total_signals:,}\n"
        "\n"
        f"<b>Tier breakdown:</b>\n{tier_lines}\n"
        "\n"
        "Commands:\n"
        "  <code>/broadcast &lt;text&gt;</code>\n"
        "  <code>/set_tier &lt;user_id&gt; &lt;T&gt;</code>\n"
        "  <code>/ban &lt;user_id&gt;</code>\n"
        "  <code>/unban &lt;user_id&gt;</code>\n"
        "  <code>/stats_global</code>"
    )
    await message.answer(text, parse_mode=ParseMode.HTML)


@router.message(Command("broadcast"))
async def cmd_broadcast(message: Message, command: CommandObject) -> None:
    if not _is_admin(message.from_user.id):
        return
    text = (command.args or "").strip()
    if not text:
        await message.answer("Usage: /broadcast &lt;text&gt;", parse_mode=ParseMode.HTML)
        return

    user_ids = await _all_user_ids()
    sent = 0
    failed = 0
    for uid in user_ids:
        try:
            await message.bot.send_message(uid, text, parse_mode=ParseMode.HTML)
            sent += 1
        except Exception:  # noqa: BLE001
            failed += 1
    await message.answer(
        f"<b>Broadcast done</b>\nsent: {sent}, failed: {failed}",
        parse_mode=ParseMode.HTML,
    )


@router.message(Command("set_tier"))
async def cmd_set_tier(message: Message, command: CommandObject) -> None:
    if not _is_admin(message.from_user.id):
        return
    parts = (command.args or "").split()
    if len(parts) != 2 or not all(p.lstrip("-").isdigit() for p in parts):
        await message.answer(
            "Usage: <code>/set_tier &lt;user_id&gt; &lt;T 0..4&gt;</code>",
            parse_mode=ParseMode.HTML,
        )
        return
    target_id = int(parts[0])
    new_tier = int(parts[1])
    if not (0 <= new_tier <= 4):
        await message.answer("Tier must be 0..4")
        return
    target = await get_user(target_id)
    if target is None:
        await message.answer(f"User {target_id} not found")
        return
    await set_tier(target_id, new_tier)
    await message.answer(
        f"User <code>{target_id}</code> → T{new_tier}", parse_mode=ParseMode.HTML
    )


@router.message(Command("ban"))
async def cmd_ban(message: Message, command: CommandObject) -> None:
    if not _is_admin(message.from_user.id):
        return
    raw = (command.args or "").strip()
    if not raw.lstrip("-").isdigit():
        await message.answer("Usage: /ban &lt;user_id&gt;", parse_mode=ParseMode.HTML)
        return
    target_id = int(raw)
    target = await get_user(target_id)
    if target is None:
        await message.answer(f"User {target_id} not found")
        return
    await _set_banned(target_id, True)
    await message.answer(f"User <code>{target_id}</code> banned", parse_mode=ParseMode.HTML)


@router.message(Command("unban"))
async def cmd_unban(message: Message, command: CommandObject) -> None:
    if not _is_admin(message.from_user.id):
        return
    raw = (command.args or "").strip()
    if not raw.lstrip("-").isdigit():
        await message.answer("Usage: /unban &lt;user_id&gt;", parse_mode=ParseMode.HTML)
        return
    target_id = int(raw)
    await _set_banned(target_id, False)
    await message.answer(
        f"User <code>{target_id}</code> unbanned", parse_mode=ParseMode.HTML
    )


@router.message(Command("stats_global"))
async def cmd_stats_global(message: Message) -> None:
    if not _is_admin(message.from_user.id):
        return
    total_signals = await get_total_signals()
    total_users = await get_total_users()
    breakdown = await _tier_breakdown()
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute(
            "SELECT SUM(deposit_total), SUM(wins), SUM(losses), COUNT(po_trader_id) "
            "FROM users WHERE po_trader_id IS NOT NULL"
        ) as cur:
            row = await cur.fetchone()
            sum_dep = float(row[0] or 0.0)
            sum_wins = int(row[1] or 0)
            sum_losses = int(row[2] or 0)
            linked = int(row[3] or 0)
    total_results = sum_wins + sum_losses
    wr = (sum_wins / total_results * 100) if total_results else 0
    text = (
        "<b>📊 Global stats</b>\n"
        "\n"
        f"<b>Users:</b> {total_users:,}  ·  Linked PO: {linked:,}\n"
        f"<b>Signals:</b> {total_signals:,}\n"
        f"<b>Total deposits (PO):</b> ${sum_dep:,.2f}\n"
        f"<b>Wins / Losses:</b> {sum_wins:,} / {sum_losses:,}\n"
        f"<b>Aggregate winrate:</b> {wr:.1f}%\n"
        "\n"
        "<b>By tier:</b>\n"
        + "\n".join(
            f"  T{t}: <b>{breakdown.get(t, 0):,}</b>" for t in sorted(breakdown)
        )
    )
    await message.answer(text, parse_mode=ParseMode.HTML)


# ── Phase P · admin testing helpers ──────────────────────────────────────────


@router.message(Command("test_as", "test_as_user"))
async def cmd_test_as(message: Message, command: CommandObject) -> None:
    """Show how the bot looks for another user (read-only preview).

    Usage: /test_as <telegram_id>  →  renders /tier and /stats cards for them.
    """
    if not _is_admin(message.from_user.id):
        return
    raw = (command.args or "").strip()
    if not raw.lstrip("-").isdigit():
        await message.answer(
            "Usage: <code>/test_as &lt;telegram_id&gt;</code>", parse_mode=ParseMode.HTML
        )
        return
    target = await get_user(int(raw))
    if target is None:
        await message.answer(f"User {raw} not found")
        return

    # Render cards for the target user
    from aiogram.types import BufferedInputFile

    from services.imagegen import make_stats_card, make_tier_card

    next_threshold = (
        {0: 100, 1: 100, 2: 500, 3: 2000, 4: None}[target.tier]
        if target.tier <= 4
        else None
    )
    header = (
        f"<b>👤 Просмотр от лица:</b>\n"
        f"  <code>{target.telegram_id}</code> @{target.username or '—'}\n"
        f"  T{target.tier} · ${target.deposit_total:,.0f} · {target.signals_received} сигналов\n"
        f"  W/L: {target.wins}/{target.losses}"
    )
    await message.answer(header, parse_mode=ParseMode.HTML)
    try:
        tc = make_tier_card(target.tier, target.deposit_total, next_threshold)
        await message.answer_photo(
            BufferedInputFile(tc, filename="preview_tier.png"),
            caption="(preview /tier)",
        )
        sc = make_stats_card(
            name=target.first_name,
            tier=target.tier,
            deposit=target.deposit_total,
            signals_received=target.signals_received,
            wins=target.wins,
            losses=target.losses,
        )
        await message.answer_photo(
            BufferedInputFile(sc, filename="preview_stats.png"),
            caption="(preview /stats)",
        )
    except Exception as exc:  # noqa: BLE001
        logger.warning("Could not render test_as cards: %s", exc)


@router.message(Command("demo_signal"))
async def cmd_demo_signal(message: Message, command: CommandObject) -> None:
    """Generate a custom signal: /demo_signal [pair] [CALL|PUT] [confidence%]

    Examples:
      /demo_signal                   → random
      /demo_signal EUR/USD CALL 88   → fully custom
      /demo_signal GBP/JPY PUT       → confidence random
    """
    if not _is_admin(message.from_user.id):
        return
    parts = (command.args or "").split()
    from random import choice, randint

    from aiogram.types import BufferedInputFile

    from database.models import Signal
    from services.formatter import format_signal
    from services.imagegen import make_signal_chart
    from services.signal_generator import (
        CURRENCY_PAIRS,
        DIRECTIONS,
        OTC_PAIRS,
    )

    pair = parts[0] if len(parts) >= 1 else choice(OTC_PAIRS + CURRENCY_PAIRS)
    direction = (
        parts[1].upper() if len(parts) >= 2 and parts[1].upper() in DIRECTIONS else choice(DIRECTIONS)
    )
    confidence = (
        int(parts[2]) if len(parts) >= 3 and parts[2].isdigit() else randint(75, 94)
    )
    confidence = max(50, min(99, confidence))

    sig = Signal(
        pair=pair,
        direction=direction,
        expiration="1 мин",
        confidence=confidence,
        signal_type="ai",
        tier="otc",
        analysis="DEMO · Тестовый сигнал (admin /demo_signal)",
    )
    caption = "<b>🧪 DEMO SIGNAL</b>\n\n" + format_signal(sig, settings.pocket_option_url)
    try:
        png = make_signal_chart(sig)
        await message.answer_photo(
            BufferedInputFile(png, filename="demo.png"),
            caption=caption,
            parse_mode=ParseMode.HTML,
        )
    except Exception as exc:  # noqa: BLE001
        logger.warning("Could not render demo signal: %s", exc)
        await message.answer(caption, parse_mode=ParseMode.HTML)


@router.message(Command("reset_my_state"))
async def cmd_reset_my_state(message: Message) -> None:
    """Wipe own wins/losses/signals counter for re-testing achievements."""
    if not _is_admin(message.from_user.id):
        return
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            """
            UPDATE users SET wins = 0, losses = 0, signals_received = 0
            WHERE telegram_id = ?
            """,
            (message.from_user.id,),
        )
        await db.execute(
            "DELETE FROM achievements WHERE telegram_id = ?",
            (message.from_user.id,),
        )
        await db.commit()
    await message.answer(
        "<b>♻️ Сброшено.</b>\nWins/Losses/Signals/Achievements обнулены для тебя.",
        parse_mode=ParseMode.HTML,
    )


@router.message(Command("seed_data"))
async def cmd_seed_data(message: Message) -> None:
    """Insert 5 fake users with different tiers, for leaderboard / preview testing."""
    if not _is_admin(message.from_user.id):
        return
    fakes = [
        (9_000_001, "alex_pro", "Alex", 4, 15000.0, 24, 6),
        (9_000_002, "maria_fx", "Maria", 3, 4500.0, 31, 9),
        (9_000_003, "john_otc", "John", 2, 800.0, 18, 8),
        (9_000_004, "lena_demo", "Lena", 1, 120.0, 9, 5),
        (9_000_005, "guest_t0", "Guest", 0, 0.0, 1, 1),
    ]
    inserted = 0
    async with aiosqlite.connect(DB_PATH) as db:
        for tg_id, uname, fname, tier, deposit, w, _l in fakes:
            ref_code = f"SEED{tg_id % 10000:04d}"
            try:
                await db.execute(
                    """
                    INSERT OR IGNORE INTO users
                      (telegram_id, username, first_name, tier, deposit_total,
                       wins, losses, referral_code, signals_received)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (tg_id, uname, fname, tier, deposit, w, _l, ref_code, w + _l),
                )
                if db.total_changes:
                    inserted += 1
            except Exception as exc:  # noqa: BLE001
                logger.warning("seed_data: %s", exc)
        await db.commit()
    await message.answer(
        f"<b>🌱 Seed готов.</b>\nДобавлено фейк-юзеров: {inserted} (из {len(fakes)})",
        parse_mode=ParseMode.HTML,
    )


@router.message(Command("preview"))
async def cmd_preview(message: Message, command: CommandObject) -> None:
    """Render any screen as image for the admin themself.

    Usage: /preview <screen>
      Screens: tier, stats, ref, ach, top, settings, help
    """
    if not _is_admin(message.from_user.id):
        return
    screen = (command.args or "").strip().lower()
    valid = {"tier", "stats", "ref", "ach", "top", "settings", "help"}
    if screen not in valid:
        await message.answer(
            "Usage: <code>/preview &lt;screen&gt;</code>\n"
            f"Screens: {', '.join(sorted(valid))}",
            parse_mode=ParseMode.HTML,
        )
        return

    # Reuse menu handlers via direct dispatch
    from aiogram.types import ReplyKeyboardRemove  # noqa: F401  (kept for parity)

    from handlers import menu  # circular-safe at runtime

    if screen == "tier":
        await menu.btn_tier(message)
    elif screen == "stats":
        await menu.btn_stats(message)
    elif screen == "ref":
        await menu.btn_ref(message)
    elif screen == "ach":
        await menu.cmd_achievements(message)
    elif screen == "top":
        await menu.cmd_leaderboard(message)
    elif screen == "settings":
        await menu.btn_settings(message)
    elif screen == "help":
        await menu.btn_help(message)
