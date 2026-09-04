"""Shared constants for the SpaceSignal bot."""
from typing import TypedDict

from i18n import t


# 3-tier model: Free (0), Basic (1), Pro (2).
TIER_NAMES: dict[int, str] = {0: "Free", 1: "Basic", 2: "Pro"}

TIER_DEPOSIT_THRESHOLDS: dict[int, int] = {
    1: 20,
    2: 100,
}

# Daily signal limits per tier. None = unlimited.
TIER_DAILY_LIMITS: dict[int, int | None] = {0: 3, 1: 10, 2: None}

# Signal types available per tier.
TIER_SIGNAL_TYPES: dict[int, list[str]] = {
    0: ["otc"],
    1: ["otc", "exchange"],
    2: ["otc", "exchange", "elite"],
}


class PairInfo(TypedDict):
    name: str
    symbol: str
    category: str


# ── OTC pairs (tier 0+) ─────────────────────────────────────────────────────

OTC_PAIRS: list[PairInfo] = [
    # Forex (55 OTC pairs)
    {"name": "AED/CNY", "symbol": "AED/CNY (OTC)", "category": "forex"},
    {"name": "AUD/CAD", "symbol": "AUD/CAD (OTC)", "category": "forex"},
    {"name": "CAD/JPY", "symbol": "CAD/JPY (OTC)", "category": "forex"},
    {"name": "EUR/GBP", "symbol": "EUR/GBP (OTC)", "category": "forex"},
    {"name": "EUR/JPY", "symbol": "EUR/JPY (OTC)", "category": "forex"},
    {"name": "GBP/JPY", "symbol": "GBP/JPY (OTC)", "category": "forex"},
    {"name": "NZD/USD", "symbol": "NZD/USD (OTC)", "category": "forex"},
    {"name": "OMR/CNY", "symbol": "OMR/CNY (OTC)", "category": "forex"},
    {"name": "USD/CNH", "symbol": "USD/CNH (OTC)", "category": "forex"},
    {"name": "USD/MYR", "symbol": "USD/MYR (OTC)", "category": "forex"},
    {"name": "USD/PHP", "symbol": "USD/PHP (OTC)", "category": "forex"},
    {"name": "USD/SGD", "symbol": "USD/SGD (OTC)", "category": "forex"},
    {"name": "YER/USD", "symbol": "YER/USD (OTC)", "category": "forex"},
    {"name": "USD/ARS", "symbol": "USD/ARS (OTC)", "category": "forex"},
    {"name": "USD/PKR", "symbol": "USD/PKR (OTC)", "category": "forex"},
    {"name": "EUR/NZD", "symbol": "EUR/NZD (OTC)", "category": "forex"},
    {"name": "AUD/NZD", "symbol": "AUD/NZD (OTC)", "category": "forex"},
    {"name": "USD/CLP", "symbol": "USD/CLP (OTC)", "category": "forex"},
    {"name": "CHF/JPY", "symbol": "CHF/JPY (OTC)", "category": "forex"},
    {"name": "LBP/USD", "symbol": "LBP/USD (OTC)", "category": "forex"},
    {"name": "USD/THB", "symbol": "USD/THB (OTC)", "category": "forex"},
    {"name": "AUD/USD", "symbol": "AUD/USD (OTC)", "category": "forex"},
    {"name": "AUD/JPY", "symbol": "AUD/JPY (OTC)", "category": "forex"},
    {"name": "NGN/USD", "symbol": "NGN/USD (OTC)", "category": "forex"},
    {"name": "QAR/CNY", "symbol": "QAR/CNY (OTC)", "category": "forex"},
    {"name": "BHD/CNY", "symbol": "BHD/CNY (OTC)", "category": "forex"},
    {"name": "USD/JPY", "symbol": "USD/JPY (OTC)", "category": "forex"},
    {"name": "NZD/JPY", "symbol": "NZD/JPY (OTC)", "category": "forex"},
    {"name": "USD/INR", "symbol": "USD/INR (OTC)", "category": "forex"},
    {"name": "EUR/HUF", "symbol": "EUR/HUF (OTC)", "category": "forex"},
    {"name": "MAD/USD", "symbol": "MAD/USD (OTC)", "category": "forex"},
    {"name": "CAD/CHF", "symbol": "CAD/CHF (OTC)", "category": "forex"},
    {"name": "USD/EGP", "symbol": "USD/EGP (OTC)", "category": "forex"},
    {"name": "ZAR/USD", "symbol": "ZAR/USD (OTC)", "category": "forex"},
    {"name": "EUR/USD", "symbol": "EUR/USD (OTC)", "category": "forex"},
    {"name": "GBP/USD", "symbol": "GBP/USD (OTC)", "category": "forex"},
    {"name": "AUD/CHF", "symbol": "AUD/CHF (OTC)", "category": "forex"},
    {"name": "USD/BRL", "symbol": "USD/BRL (OTC)", "category": "forex"},
    {"name": "USD/BDT", "symbol": "USD/BDT (OTC)", "category": "forex"},
    {"name": "EUR/CHF", "symbol": "EUR/CHF (OTC)", "category": "forex"},
    {"name": "KES/USD", "symbol": "KES/USD (OTC)", "category": "forex"},
    {"name": "USD/COP", "symbol": "USD/COP (OTC)", "category": "forex"},
    {"name": "CHF/NOK", "symbol": "CHF/NOK (OTC)", "category": "forex"},
    {"name": "USD/VND", "symbol": "USD/VND (OTC)", "category": "forex"},
    {"name": "JOD/CNY", "symbol": "JOD/CNY (OTC)", "category": "forex"},
    {"name": "TND/USD", "symbol": "TND/USD (OTC)", "category": "forex"},
    {"name": "USD/IDR", "symbol": "USD/IDR (OTC)", "category": "forex"},
    {"name": "USD/DZD", "symbol": "USD/DZD (OTC)", "category": "forex"},
    {"name": "UAH/USD", "symbol": "UAH/USD (OTC)", "category": "forex"},
    {"name": "USD/MXN", "symbol": "USD/MXN (OTC)", "category": "forex"},
    {"name": "GBP/AUD", "symbol": "GBP/AUD (OTC)", "category": "forex"},
    {"name": "USD/CHF", "symbol": "USD/CHF (OTC)", "category": "forex"},
    {"name": "EUR/TRY", "symbol": "EUR/TRY (OTC)", "category": "forex"},
    {"name": "USD/CAD", "symbol": "USD/CAD (OTC)", "category": "forex"},
    {"name": "SAR/CNY", "symbol": "SAR/CNY (OTC)", "category": "forex"},
    # Crypto
    {"name": "Bitcoin ETF", "symbol": "Bitcoin ETF (OTC)", "category": "crypto"},
    {"name": "BNB", "symbol": "BNB (OTC)", "category": "crypto"},
    {"name": "Polkadot", "symbol": "Polkadot (OTC)", "category": "crypto"},
    {"name": "Litecoin", "symbol": "Litecoin (OTC)", "category": "crypto"},
    {"name": "Toncoin", "symbol": "Toncoin (OTC)", "category": "crypto"},
    {"name": "Ethereum", "symbol": "Ethereum (OTC)", "category": "crypto"},
    {"name": "Avalanche", "symbol": "Avalanche (OTC)", "category": "crypto"},
    {"name": "Chainlink", "symbol": "Chainlink (OTC)", "category": "crypto"},
    {"name": "Polygon", "symbol": "Polygon (OTC)", "category": "crypto"},
    {"name": "Bitcoin", "symbol": "Bitcoin (OTC)", "category": "crypto"},
    {"name": "Cardano", "symbol": "Cardano (OTC)", "category": "crypto"},
    {"name": "TRON", "symbol": "TRON (OTC)", "category": "crypto"},
    {"name": "Solana", "symbol": "Solana (OTC)", "category": "crypto"},
    {"name": "Dogecoin", "symbol": "Dogecoin (OTC)", "category": "crypto"},
    # Commodities
    {"name": "Brent Oil", "symbol": "Brent Oil (OTC)", "category": "commodities"},
    {"name": "WTI Oil", "symbol": "WTI Oil (OTC)", "category": "commodities"},
    {"name": "Silver", "symbol": "Silver (OTC)", "category": "commodities"},
    {"name": "Gold", "symbol": "Gold (OTC)", "category": "commodities"},
    {"name": "Natural Gas", "symbol": "Natural Gas (OTC)", "category": "commodities"},
    {"name": "Palladium", "symbol": "Palladium (OTC)", "category": "commodities"},
    {"name": "Platinum", "symbol": "Platinum (OTC)", "category": "commodities"},
    # Stocks
    {"name": "Apple", "symbol": "Apple (OTC)", "category": "stocks"},
    {"name": "GameStop", "symbol": "GameStop (OTC)", "category": "stocks"},
    {"name": "VISA", "symbol": "VISA (OTC)", "category": "stocks"},
    {"name": "American Express", "symbol": "American Express (OTC)", "category": "stocks"},
    {"name": "VIX", "symbol": "VIX (OTC)", "category": "stocks"},
    {"name": "Pfizer", "symbol": "Pfizer (OTC)", "category": "stocks"},
    {"name": "AMD", "symbol": "AMD (OTC)", "category": "stocks"},
    {"name": "J&J", "symbol": "Johnson & Johnson (OTC)", "category": "stocks"},
    {"name": "Marathon Digital", "symbol": "Marathon Digital (OTC)", "category": "stocks"},
    {"name": "Amazon", "symbol": "Amazon (OTC)", "category": "stocks"},
    {"name": "Netflix", "symbol": "Netflix (OTC)", "category": "stocks"},
    {"name": "ExxonMobil", "symbol": "ExxonMobil (OTC)", "category": "stocks"},
    {"name": "Coinbase", "symbol": "Coinbase (OTC)", "category": "stocks"},
    {"name": "Cisco", "symbol": "Cisco (OTC)", "category": "stocks"},
    {"name": "Alibaba", "symbol": "Alibaba (OTC)", "category": "stocks"},
    {"name": "Citigroup", "symbol": "Citigroup (OTC)", "category": "stocks"},
    {"name": "FedEx", "symbol": "FedEx (OTC)", "category": "stocks"},
    {"name": "Meta", "symbol": "Meta (OTC)", "category": "stocks"},
    {"name": "Intel", "symbol": "Intel (OTC)", "category": "stocks"},
    {"name": "Palantir", "symbol": "Palantir (OTC)", "category": "stocks"},
    {"name": "McDonald's", "symbol": "McDonald's (OTC)", "category": "stocks"},
    {"name": "Tesla", "symbol": "Tesla (OTC)", "category": "stocks"},
    {"name": "Microsoft", "symbol": "Microsoft (OTC)", "category": "stocks"},
    # Indices
    {"name": "AUS 200", "symbol": "AUS 200 (OTC)", "category": "indices"},
    {"name": "FTSE 100", "symbol": "FTSE 100 (OTC)", "category": "indices"},
    {"name": "DAX 30", "symbol": "DAX 30 (OTC)", "category": "indices"},
    {"name": "Dow Jones", "symbol": "Dow Jones (OTC)", "category": "indices"},
    {"name": "Euro Stoxx 35", "symbol": "E35EUR (OTC)", "category": "indices"},
    {"name": "Euro Stoxx 50", "symbol": "E50EUR (OTC)", "category": "indices"},
    {"name": "CAC 40", "symbol": "CAC 40 (OTC)", "category": "indices"},
    {"name": "Nikkei 225", "symbol": "Nikkei 225 (OTC)", "category": "indices"},
    {"name": "NASDAQ 100", "symbol": "NASDAQ 100 (OTC)", "category": "indices"},
    {"name": "S&P 500", "symbol": "S&P 500 (OTC)", "category": "indices"},
]

# ── Exchange pairs (tier 1+) ────────────────────────────────────────────────

EXCHANGE_PAIRS: list[PairInfo] = [
    {"name": "CHF/JPY", "symbol": "CHF/JPY", "category": "forex"},
    {"name": "EUR/CAD", "symbol": "EUR/CAD", "category": "forex"},
    {"name": "AUD/JPY", "symbol": "AUD/JPY", "category": "forex"},
    {"name": "CAD/JPY", "symbol": "CAD/JPY", "category": "forex"},
    {"name": "AUD/CHF", "symbol": "AUD/CHF", "category": "forex"},
    {"name": "EUR/USD", "symbol": "EUR/USD", "category": "forex"},
    {"name": "EUR/CHF", "symbol": "EUR/CHF", "category": "forex"},
    {"name": "AUD/CAD", "symbol": "AUD/CAD", "category": "forex"},
    {"name": "EUR/AUD", "symbol": "EUR/AUD", "category": "forex"},
    {"name": "GBP/JPY", "symbol": "GBP/JPY", "category": "forex"},
    {"name": "USD/JPY", "symbol": "USD/JPY", "category": "forex"},
    {"name": "EUR/JPY", "symbol": "EUR/JPY", "category": "forex"},
    {"name": "EUR/GBP", "symbol": "EUR/GBP", "category": "forex"},
    {"name": "GBP/USD", "symbol": "GBP/USD", "category": "forex"},
    {"name": "GBP/CAD", "symbol": "GBP/CAD", "category": "forex"},
    {"name": "USD/CAD", "symbol": "USD/CAD", "category": "forex"},
    {"name": "GBP/CHF", "symbol": "GBP/CHF", "category": "forex"},
    {"name": "AUD/USD", "symbol": "AUD/USD", "category": "forex"},
    {"name": "USD/CHF", "symbol": "USD/CHF", "category": "forex"},
    {"name": "CAD/CHF", "symbol": "CAD/CHF", "category": "forex"},
    {"name": "GBP/AUD", "symbol": "GBP/AUD", "category": "forex"},
    # Crypto
    {"name": "Bitcoin", "symbol": "BTC/USD", "category": "crypto"},
]

# ── Elite pairs (tier 2) — removed, all assets are OTC or Exchange now ─────

ELITE_PAIRS: list[PairInfo] = []

# Lookup: signal_tier → list of pairs
PAIRS_BY_TIER: dict[str, list[PairInfo]] = {
    "otc": OTC_PAIRS,
    "exchange": EXCHANGE_PAIRS,
    "elite": ELITE_PAIRS,
}

# Sub-category display names
SUBCATEGORY_LABELS: dict[str, str] = {
    "forex": "💱 Форекс",
    "crypto": "🪙 Крипто",
    "stocks": "📊 Акции",
    "commodities": "🛢 Товары",
    "indices": "📈 Индексы",
}

# Signal-tier display names (default Russian, use signal_tier_label() for locale-aware)
SIGNAL_TIER_LABELS: dict[str, str] = {
    "otc": "🎲 OTC",
    "exchange": "📈 Биржевые",
    "elite": "👑 Elite",
}


def subcategory_label(key: str, locale: str = "ru") -> str:
    """Return locale-aware subcategory label."""
    return t(f"subcategory.{key}", locale)


def signal_tier_label(key: str, locale: str = "ru") -> str:
    """Return locale-aware signal tier label."""
    return t(f"tier_label.{key}", locale)

# Expirations per signal tier (locale-aware)
_EXPIRATIONS_I18N: dict[str, dict[str, list[tuple[str, str]]]] = {
    "ru": {
        "otc": [("30 сек", "30s"), ("1 мин", "60s"), ("2 мин", "2m"), ("3 мин", "3m"), ("5 мин", "5m"), ("30 мин", "30m")],
        "exchange": [("2 мин", "2m"), ("3 мин", "3m"), ("5 мин", "5m"), ("30 мин", "30m")],
        "elite": [("2 мин", "2m"), ("3 мин", "3m"), ("5 мин", "5m"), ("30 мин", "30m")],
    },
    "uk": {
        "otc": [("30 сек", "30s"), ("1 хв", "60s"), ("2 хв", "2m"), ("3 хв", "3m"), ("5 хв", "5m"), ("30 хв", "30m")],
        "exchange": [("2 хв", "2m"), ("3 хв", "3m"), ("5 хв", "5m"), ("30 хв", "30m")],
        "elite": [("2 хв", "2m"), ("3 хв", "3m"), ("5 хв", "5m"), ("30 хв", "30m")],
    },
}

# Default (backward-compatible)
EXPIRATIONS: dict[str, list[tuple[str, str]]] = _EXPIRATIONS_I18N["ru"]


def get_expirations(tier: str, locale: str = "ru") -> list[tuple[str, str]]:
    """Return expiration options for a tier in the given locale."""
    loc = locale if locale in _EXPIRATIONS_I18N else "ru"
    return _EXPIRATIONS_I18N[loc].get(tier, _EXPIRATIONS_I18N[loc]["otc"])


# Expiration code → display label (locale-aware)
_EXPIRATION_LABELS_I18N: dict[str, dict[str, str]] = {
    "ru": {
        "30s": "30 сек",
        "60s": "1 мин",
        "2m": "2 мин",
        "3m": "3 мин",
        "5m": "5 мин",
        "30m": "30 мин",
    },
    "uk": {
        "30s": "30 сек",
        "60s": "1 хв",
        "2m": "2 хв",
        "3m": "3 хв",
        "5m": "5 хв",
        "30m": "30 хв",
    },
}

# Default (backward-compatible)
EXPIRATION_LABELS: dict[str, str] = _EXPIRATION_LABELS_I18N["ru"]


def get_expiration_label(code: str, locale: str = "ru") -> str:
    """Return display label for an expiration code in the given locale."""
    loc = locale if locale in _EXPIRATION_LABELS_I18N else "ru"
    return _EXPIRATION_LABELS_I18N[loc].get(code, code)
