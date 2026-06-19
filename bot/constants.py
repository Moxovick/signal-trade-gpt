"""Shared constants for the SpaceSignal bot."""
from typing import TypedDict


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
    payout: int


# ── OTC pairs (tier 0+) ─────────────────────────────────────────────────────

OTC_PAIRS: list[PairInfo] = [
    # Forex
    {"name": "EUR/USD", "symbol": "EUR/USD (OTC)", "category": "forex", "payout": 76},
    {"name": "GBP/USD", "symbol": "GBP/USD (OTC)", "category": "forex", "payout": 92},
    {"name": "USD/JPY", "symbol": "USD/JPY (OTC)", "category": "forex", "payout": 33},
    {"name": "AUD/USD", "symbol": "AUD/USD (OTC)", "category": "forex", "payout": 56},
    {"name": "EUR/GBP", "symbol": "EUR/GBP (OTC)", "category": "forex", "payout": 32},
    {"name": "USD/CHF", "symbol": "USD/CHF (OTC)", "category": "forex", "payout": 85},
    {"name": "NZD/USD", "symbol": "NZD/USD (OTC)", "category": "forex", "payout": 92},
    {"name": "EUR/JPY", "symbol": "EUR/JPY (OTC)", "category": "forex", "payout": 49},
    {"name": "AUD/CHF", "symbol": "AUD/CHF (OTC)", "category": "forex", "payout": 72},
    {"name": "AUD/NZD", "symbol": "AUD/NZD (OTC)", "category": "forex", "payout": 69},
    {"name": "EUR/CHF", "symbol": "EUR/CHF (OTC)", "category": "forex", "payout": 57},
    {"name": "GBP/JPY", "symbol": "GBP/JPY (OTC)", "category": "forex", "payout": 49},
    {"name": "USD/CAD", "symbol": "USD/CAD (OTC)", "category": "forex", "payout": 82},
    {"name": "CAD/JPY", "symbol": "CAD/JPY (OTC)", "category": "forex", "payout": 65},
    {"name": "GBP/AUD", "symbol": "GBP/AUD (OTC)", "category": "forex", "payout": 92},
    {"name": "EUR/NZD", "symbol": "EUR/NZD (OTC)", "category": "forex", "payout": 47},
    # Crypto
    {"name": "Bitcoin", "symbol": "Bitcoin (OTC)", "category": "crypto", "payout": 92},
    {"name": "Ethereum", "symbol": "Ethereum (OTC)", "category": "crypto", "payout": 92},
    {"name": "Solana", "symbol": "Solana (OTC)", "category": "crypto", "payout": 80},
    {"name": "Dogecoin", "symbol": "Dogecoin (OTC)", "category": "crypto", "payout": 92},
    {"name": "Cardano", "symbol": "Cardano (OTC)", "category": "crypto", "payout": 92},
    {"name": "Toncoin", "symbol": "Toncoin (OTC)", "category": "crypto", "payout": 66},
    {"name": "BNB", "symbol": "BNB (OTC)", "category": "crypto", "payout": 71},
    {"name": "Litecoin", "symbol": "Litecoin (OTC)", "category": "crypto", "payout": 92},
    # Commodities
    {"name": "Gold", "symbol": "Gold (OTC)", "category": "commodities", "payout": 80},
    {"name": "Silver", "symbol": "Silver (OTC)", "category": "commodities", "payout": 80},
    {"name": "Brent Oil", "symbol": "Brent Oil (OTC)", "category": "commodities", "payout": 80},
    {"name": "WTI Oil", "symbol": "WTI Oil (OTC)", "category": "commodities", "payout": 80},
    # Stocks
    {"name": "Apple", "symbol": "Apple (OTC)", "category": "stocks", "payout": 92},
    {"name": "Tesla", "symbol": "Tesla (OTC)", "category": "stocks", "payout": 88},
    {"name": "Amazon", "symbol": "Amazon (OTC)", "category": "stocks", "payout": 84},
    {"name": "Microsoft", "symbol": "Microsoft (OTC)", "category": "stocks", "payout": 55},
    {"name": "Meta", "symbol": "Meta (OTC)", "category": "stocks", "payout": 66},
    {"name": "Netflix", "symbol": "Netflix (OTC)", "category": "stocks", "payout": 62},
    # Indices
    {"name": "S&P 500", "symbol": "S&P 500 (OTC)", "category": "indices", "payout": 45},
    {"name": "NASDAQ 100", "symbol": "NASDAQ 100 (OTC)", "category": "indices", "payout": 45},
    {"name": "Dow Jones", "symbol": "Dow Jones (OTC)", "category": "indices", "payout": 45},
]

# ── Exchange pairs (tier 1+) ────────────────────────────────────────────────

EXCHANGE_PAIRS: list[PairInfo] = [
    {"name": "EUR/USD", "symbol": "EUR/USD", "category": "forex", "payout": 82},
    {"name": "GBP/USD", "symbol": "GBP/USD", "category": "forex", "payout": 85},
    {"name": "USD/JPY", "symbol": "USD/JPY", "category": "forex", "payout": 43},
    {"name": "AUD/USD", "symbol": "AUD/USD", "category": "forex", "payout": 38},
    {"name": "EUR/GBP", "symbol": "EUR/GBP", "category": "forex", "payout": 58},
    {"name": "USD/CHF", "symbol": "USD/CHF", "category": "forex", "payout": 75},
    {"name": "USD/CAD", "symbol": "USD/CAD", "category": "forex", "payout": 87},
    {"name": "EUR/JPY", "symbol": "EUR/JPY", "category": "forex", "payout": 77},
    {"name": "GBP/JPY", "symbol": "GBP/JPY", "category": "forex", "payout": 83},
    {"name": "EUR/CHF", "symbol": "EUR/CHF", "category": "forex", "payout": 85},
    {"name": "AUD/CAD", "symbol": "AUD/CAD", "category": "forex", "payout": 62},
    {"name": "EUR/AUD", "symbol": "EUR/AUD", "category": "forex", "payout": 32},
    {"name": "GBP/AUD", "symbol": "GBP/AUD", "category": "forex", "payout": 77},
    {"name": "AUD/JPY", "symbol": "AUD/JPY", "category": "forex", "payout": 45},
    {"name": "CAD/JPY", "symbol": "CAD/JPY", "category": "forex", "payout": 72},
    {"name": "CHF/JPY", "symbol": "CHF/JPY", "category": "forex", "payout": 76},
]

# ── Elite pairs (tier 2) ────────────────────────────────────────────────────

ELITE_PAIRS: list[PairInfo] = [
    # Stocks
    {"name": "Apple", "symbol": "AAPL", "category": "stocks", "payout": 92},
    {"name": "Tesla", "symbol": "TSLA", "category": "stocks", "payout": 88},
    {"name": "Amazon", "symbol": "AMZN", "category": "stocks", "payout": 84},
    {"name": "Microsoft", "symbol": "MSFT", "category": "stocks", "payout": 55},
    {"name": "Meta", "symbol": "META", "category": "stocks", "payout": 66},
    {"name": "Netflix", "symbol": "NFLX", "category": "stocks", "payout": 62},
    {"name": "NVIDIA", "symbol": "NVDA", "category": "stocks", "payout": 80},
    # Commodities
    {"name": "Gold", "symbol": "GOLD", "category": "commodities", "payout": 80},
    {"name": "Silver", "symbol": "SILVER", "category": "commodities", "payout": 80},
    # Crypto
    {"name": "Bitcoin", "symbol": "BTC/USD", "category": "crypto", "payout": 15},
    {"name": "Ethereum", "symbol": "ETH/USD", "category": "crypto", "payout": 80},
    {"name": "Solana", "symbol": "SOL/USD", "category": "crypto", "payout": 80},
    # Indices
    {"name": "S&P 500", "symbol": "SP500", "category": "indices", "payout": 45},
    {"name": "NASDAQ", "symbol": "US100", "category": "indices", "payout": 45},
]

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

# Signal-tier display names
SIGNAL_TIER_LABELS: dict[str, str] = {
    "otc": "🎲 OTC",
    "exchange": "📈 Биржевые",
    "elite": "👑 Elite",
}

# Expirations per signal tier
EXPIRATIONS: dict[str, list[tuple[str, str]]] = {
    "otc": [("30 сек", "30s"), ("1 мин", "1m"), ("5 мин", "5m")],
    "exchange": [("1 мин", "1m"), ("5 мин", "5m"), ("15 мин", "15m"), ("1 час", "1h")],
    "elite": [("30 сек", "30s"), ("1 мин", "1m"), ("5 мин", "5m"), ("15 мин", "15m")],
}

# Expiration code → display label (for signal messages)
EXPIRATION_LABELS: dict[str, str] = {
    "30s": "30 сек",
    "1m": "1 мин",
    "5m": "5 мин",
    "15m": "15 мин",
    "1h": "1 час",
}
