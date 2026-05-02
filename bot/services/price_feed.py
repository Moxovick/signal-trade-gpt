"""
Price feed — fetch current price for a trading pair from the configured
provider (admin choice via /admin/bot-config).

Providers:
  - twelvedata:   https://api.twelvedata.com/price?symbol=EUR/USD&apikey=...
                  (free tier: 8 req/min, 800/day, realtime forex)
  - yahoo:        https://query1.finance.yahoo.com/v7/finance/quote?symbols=EURUSD=X
                  (no key, ~15-min delay, suitable for chart anchors)
  - binance:      https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT
                  (no key, crypto-only)
  - pocketoption: placeholder until support provides API endpoint.
  - off:          returns None (caller falls back to random anchor).

All functions return a price as float or None on any failure. Callers MUST
handle None gracefully.
"""
from __future__ import annotations

import logging
from typing import Any

import httpx

from services import web_sync

logger = logging.getLogger(__name__)

_HTTP_TIMEOUT = 6.0


def _normalize_pair(pair: str) -> str:
    """Strip OTC tag and normalise for upstream APIs (e.g. 'EUR/USD OTC' → 'EUR/USD')."""
    return pair.replace(" OTC", "").replace("-OTC", "").strip()


async def _twelvedata(pair: str, api_key: str, endpoint: str) -> float | None:
    base = (endpoint or "https://api.twelvedata.com").rstrip("/")
    symbol = _normalize_pair(pair)
    url = f"{base}/price"
    params = {"symbol": symbol, "apikey": api_key}
    async with httpx.AsyncClient(timeout=_HTTP_TIMEOUT) as client:
        resp = await client.get(url, params=params)
        resp.raise_for_status()
        body: Any = resp.json()
        price = body.get("price") if isinstance(body, dict) else None
        return float(price) if price is not None else None


async def _yahoo(pair: str, endpoint: str) -> float | None:
    base = (endpoint or "https://query1.finance.yahoo.com").rstrip("/")
    symbol = _normalize_pair(pair).replace("/", "") + "=X"
    url = f"{base}/v7/finance/quote"
    params = {"symbols": symbol}
    async with httpx.AsyncClient(
        timeout=_HTTP_TIMEOUT,
        headers={"User-Agent": "Mozilla/5.0 SignalTradeGPT-Bot"},
    ) as client:
        resp = await client.get(url, params=params)
        resp.raise_for_status()
        body = resp.json()
        results = body.get("quoteResponse", {}).get("result") or []
        if not results:
            return None
        price = results[0].get("regularMarketPrice")
        return float(price) if price is not None else None


async def _binance(pair: str, endpoint: str) -> float | None:
    base = (endpoint or "https://api.binance.com").rstrip("/")
    symbol = _normalize_pair(pair).replace("/", "").upper()
    url = f"{base}/api/v3/ticker/price"
    params = {"symbol": symbol}
    async with httpx.AsyncClient(timeout=_HTTP_TIMEOUT) as client:
        resp = await client.get(url, params=params)
        resp.raise_for_status()
        body = resp.json()
        price = body.get("price") if isinstance(body, dict) else None
        return float(price) if price is not None else None


async def fetch_price(pair: str) -> float | None:
    """
    Fetch current price for `pair` using admin-configured provider.

    Returns None if provider is 'off', mis-configured, or upstream errors.
    Callers should treat None as a soft-failure (e.g. fall back to a synthetic
    anchor) rather than abort the user-facing flow.
    """
    src = web_sync.get_price_source()
    provider = src.get("provider", "off")
    endpoint = src.get("endpoint") or ""
    api_key = src.get("apiKey") or ""

    try:
        if provider == "twelvedata":
            if not api_key:
                logger.debug("price_feed: twelvedata requires apiKey")
                return None
            return await _twelvedata(pair, api_key, endpoint)
        if provider == "yahoo":
            return await _yahoo(pair, endpoint)
        if provider == "binance":
            return await _binance(pair, endpoint)
        if provider == "pocketoption":
            # PocketOption API not yet wired — endpoint is reserved.
            logger.debug("price_feed: pocketoption not yet implemented")
            return None
        return None
    except Exception as exc:  # noqa: BLE001
        logger.warning("price_feed[%s] failed for %s: %s", provider, pair, exc)
        return None
