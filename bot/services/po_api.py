"""
PocketOption Affiliate API client.

Direct GET to https://affiliate.pocketoption.com/api/user-info/{user_id}/{partner_id}/{hash}
where hash = md5("{user_id}:{partner_id}:{api_token}").

Returns parsed user info (deposit, FTD timestamp, etc.) or None when the
trader does not belong to our partner / does not exist.

Usage requires both env vars:
  POCKETOPTION_API_TOKEN  — secret API token from PO affiliate dashboard
  POCKETOPTION_PARTNER_ID — partner numeric id
"""
from __future__ import annotations

import hashlib
import logging
from dataclasses import dataclass
from typing import Any

import httpx

from config import settings

logger = logging.getLogger(__name__)

API_BASE = "https://affiliate.pocketoption.com/api/user-info"
DEFAULT_TIMEOUT = httpx.Timeout(8.0, connect=4.0)


@dataclass
class TraderInfo:
    user_id: str
    deposit_total: float
    ftd_at: str | None  # iso timestamp if known
    raw: dict[str, Any]


def _hash(user_id: str, partner_id: str, token: str) -> str:
    return hashlib.md5(f"{user_id}:{partner_id}:{token}".encode("utf-8")).hexdigest()


def _credentials() -> tuple[str, str] | None:
    token = (settings.pocket_option_api_token or "").strip()
    partner = (settings.pocket_option_partner_id or "").strip()
    if not token or not partner:
        return None
    return partner, token


async def fetch_trader_info(user_id: str) -> TraderInfo | None:
    """Hit the affiliate API.

    Returns:
        TraderInfo  — trader exists and belongs to our partner
        None        — trader missing, auth failed, or network error
                      (the specific reason is logged at WARNING level).

    Notes:
        * PocketOption redirects /api/... → /en/api/... (302), so we MUST
          follow redirects. httpx defaults to follow_redirects=False, which
          made the previous version silently break.
        * 403 means our token/partner_id is wrong (or trader is not in our
          network). 404 = trader id does not exist at all.
    """
    creds = _credentials()
    if creds is None:
        logger.warning("PocketOption API credentials missing — skipping fetch")
        return None
    partner_id, token = creds
    h = _hash(user_id, partner_id, token)
    url = f"{API_BASE}/{user_id}/{partner_id}/{h}"
    try:
        async with httpx.AsyncClient(
            timeout=DEFAULT_TIMEOUT,
            follow_redirects=True,  # PO redirects to /en/api/...
        ) as client:
            resp = await client.get(url)
    except httpx.HTTPError as exc:
        logger.warning("PO API network error for %s: %s", user_id, exc)
        return None
    if resp.status_code == 404:
        logger.info("PO API: trader %s not found (404)", user_id)
        return None
    if resp.status_code in (401, 403):
        logger.error(
            "PO API auth/permission denied for %s (HTTP %s). "
            "Check POCKETOPTION_API_TOKEN and POCKETOPTION_PARTNER_ID. body=%s",
            user_id,
            resp.status_code,
            resp.text[:200],
        )
        return None
    if resp.status_code >= 400:
        logger.warning("PO API %s for %s: %s", resp.status_code, user_id, resp.text[:200])
        return None
    try:
        data = resp.json()
    except ValueError:
        logger.warning(
            "PO API non-JSON response for %s (status %s): %s",
            user_id,
            resp.status_code,
            resp.text[:200],
        )
        return None

    # PO docs are sparse — accept several common shapes.
    payload: dict[str, Any] = data
    if isinstance(data, dict) and isinstance(data.get("data"), dict):
        # Some endpoints wrap the user object under {"data": {...}}.
        payload = data["data"]

    if isinstance(payload.get("error"), bool) and payload["error"]:
        logger.warning("PO API returned error for %s: %s", user_id, payload)
        return None

    deposit = (
        payload.get("totalDeposit")
        or payload.get("deposit")
        or payload.get("total_deposit")
        or payload.get("deposit_amount")
        or 0.0
    )
    try:
        deposit_f = float(deposit)
    except (TypeError, ValueError):
        deposit_f = 0.0
    ftd = (
        payload.get("ftdAt")
        or payload.get("ftd_at")
        or payload.get("firstDeposit")
        or payload.get("first_deposit_at")
    )
    return TraderInfo(
        user_id=str(user_id),
        deposit_total=deposit_f,
        ftd_at=str(ftd) if ftd else None,
        raw=data if isinstance(data, dict) else {"raw": data},
    )


async def verify_trader_id(user_id: str) -> bool:
    """Light verification — does this trader belong to our partner?"""
    info = await fetch_trader_info(user_id)
    return info is not None
