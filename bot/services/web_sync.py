"""
Web sync — periodic fetch of /api/bot/sync, exposing bot config and the
current admin-published signal queue to the rest of the bot.

Two consumers:
  - tier_sync.tier_sync_loop now delegates the HTTP fetch to here so we don't
    issue two requests per minute for the same payload.
  - signal handler reads `next_pending_admin_signal()` to try admin-pushed
    signals before falling back to the local random generator.

Module state is in-memory; bot restarts re-fetch on startup.
"""
from __future__ import annotations

import asyncio
import logging
from dataclasses import dataclass, field
from typing import Any

import httpx

from config import settings

logger = logging.getLogger(__name__)

POLL_INTERVAL_SECONDS = 60


@dataclass
class WebSyncState:
    accounts: list[dict[str, Any]] = field(default_factory=list)
    signals: list[dict[str, Any]] = field(default_factory=list)
    config: dict[str, Any] = field(default_factory=dict)
    tier_thresholds: dict[str, Any] = field(default_factory=dict)
    consumed_signal_ids: set[str] = field(default_factory=set)
    last_fetched_ts: int = 0


_state = WebSyncState()


def state() -> WebSyncState:
    """Read current cached state (no I/O)."""
    return _state


def get_config() -> dict[str, Any]:
    return _state.config


def get_signal_template() -> str | None:
    tpl = _state.config.get("signalTemplate")
    return tpl if isinstance(tpl, str) and tpl.strip() else None


def get_welcome_template() -> str | None:
    tpl = _state.config.get("welcome")
    return tpl if isinstance(tpl, str) and tpl.strip() else None


def get_disclaimer() -> str | None:
    tpl = _state.config.get("disclaimer")
    return tpl if isinstance(tpl, str) and tpl.strip() else None


def get_daily_limit(tier: int) -> int | None:
    """Return daily signal limit for given tier from admin config, or None."""
    limits = _state.config.get("dailyLimits")
    if not isinstance(limits, dict):
        return None
    val = limits.get(str(tier))
    if isinstance(val, (int, float)) and val >= 0:
        return int(val)
    return None


def get_price_source() -> dict[str, Any]:
    """Returns {provider, endpoint, apiKey} dict, or default {provider: 'off'}."""
    src = _state.config.get("priceSource")
    if isinstance(src, dict):
        return src
    return {"provider": "off"}


def next_pending_admin_signal(allowed_tiers: list[str]) -> dict[str, Any] | None:
    """
    Return the most recent pending admin-published signal whose tier is in
    `allowed_tiers`. Marks the signal as consumed so each user only gets it
    once per bot session (the web side still tracks the canonical state).
    """
    for sig in _state.signals:
        if sig["id"] in _state.consumed_signal_ids:
            continue
        if not sig.get("isActive"):
            continue
        if sig.get("result") != "pending":
            continue
        if sig.get("tier") not in allowed_tiers:
            continue
        _state.consumed_signal_ids.add(sig["id"])
        return sig
    return None


async def _fetch() -> dict[str, Any] | None:
    if not settings.platform_api_url or not settings.bot_sync_secret:
        return None
    url = f"{settings.platform_api_url.rstrip('/')}/api/bot/sync"
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(
                url, headers={"X-Bot-Secret": settings.bot_sync_secret}
            )
            resp.raise_for_status()
            body = resp.json()
            if not body.get("ok"):
                logger.warning("web_sync: API returned not-ok: %s", body)
                return None
            return body
    except Exception as exc:  # noqa: BLE001
        logger.warning("web_sync: fetch failed: %s", exc)
        return None


def _apply(body: dict[str, Any]) -> None:
    _state.accounts = list(body.get("accounts") or [])
    new_signals = list(body.get("signals") or [])
    # Drop consumed-ids that no longer exist (signal was deleted server-side).
    visible = {s["id"] for s in new_signals}
    _state.consumed_signal_ids &= visible
    _state.signals = new_signals
    cfg = body.get("config")
    if isinstance(cfg, dict):
        _state.config = cfg
    thr = body.get("tierThresholds")
    if isinstance(thr, dict):
        _state.tier_thresholds = thr
    _state.last_fetched_ts = int(body.get("ts") or 0)


async def refresh_now() -> bool:
    """Force a sync fetch immediately. Returns True on success."""
    body = await _fetch()
    if body is None:
        return False
    _apply(body)
    return True


async def web_sync_loop() -> None:
    """Background task — runs forever, refreshes module state every interval."""
    if not settings.platform_api_url or not settings.bot_sync_secret:
        logger.info(
            "web_sync disabled (PLATFORM_API_URL or BOT_SYNC_SECRET unset)"
        )
        return
    logger.info(
        "web_sync loop started, poll=%ds, target=%s",
        POLL_INTERVAL_SECONDS,
        settings.platform_api_url,
    )
    while True:
        ok = await refresh_now()
        if ok:
            logger.debug(
                "web_sync ok: %d signals, %d accounts, config_keys=%s",
                len(_state.signals),
                len(_state.accounts),
                list(_state.config.keys()),
            )
        await asyncio.sleep(POLL_INTERVAL_SECONDS)
