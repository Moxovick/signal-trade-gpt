"""Shared httpx.AsyncClient for the bot.

Import ``get_http_client()`` wherever you need to make HTTP requests.
Call ``close_http_client()`` on shutdown.
"""
from __future__ import annotations

import httpx

_client: httpx.AsyncClient | None = None


def get_http_client() -> httpx.AsyncClient:
    """Return (and lazily create) the shared async HTTP client."""
    global _client
    if _client is None or _client.is_closed:
        _client = httpx.AsyncClient(timeout=15.0, follow_redirects=True)
    return _client


async def close_http_client() -> None:
    """Gracefully close the shared client (call on bot shutdown)."""
    global _client
    if _client is not None and not _client.is_closed:
        await _client.close()
        _client = None
