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
    # Forex (55 OTC pairs)
    {"name": "AED/CNY", "symbol": "AED/CNY (OTC)", "category": "forex", "payout": 92},
    {"name": "AUD/CAD", "symbol": "AUD/CAD (OTC)", "category": "forex", "payout": 92},
    {"name": "CAD/JPY", "symbol": "CAD/JPY (OTC)", "category": "forex", "payout": 92},
    {"name": "EUR/GBP", "symbol": "EUR/GBP (OTC)", "category": "forex", "payout": 92},
    {"name": "EUR/JPY", "symbol": "EUR/JPY (OTC)", "category": "forex", "payout": 92},
    {"name": "GBP/JPY", "symbol": "GBP/JPY (OTC)", "category": "forex", "payout": 92},
    {"name": "NZD/USD", "symbol": "NZD/USD (OTC)", "category": "forex", "payout": 92},
    {"name": "OMR/CNY", "symbol": "OMR/CNY (OTC)", "category": "forex", "payout": 92},
    {"name": "USD/CNH", "symbol": "USD/CNH (OTC)", "category": "forex", "payout": 92},
    {"name": "USD/MYR", "symbol": "USD/MYR (OTC)", "category": "forex", "payout": 92},
    {"name": "USD/PHP", "symbol": "USD/PHP (OTC)", "category": "forex", "payout": 92},
    {"name": "USD/SGD", "symbol": "USD/SGD (OTC)", "category": "forex", "payout": 92},
    {"name": "YER/USD", "symbol": "YER/USD (OTC)", "category": "forex", "payout": 92},
    {"name": "USD/ARS", "symbol": "USD/ARS (OTC)", "category": "forex", "payout": 91},
    {"name": "USD/PKR", "symbol": "USD/PKR (OTC)", "category": "forex", "payout": 91},
    {"name": "EUR/NZD", "symbol": "EUR/NZD (OTC)", "category": "forex", "payout": 90},
    {"name": "AUD/NZD", "symbol": "AUD/NZD (OTC)", "category": "forex", "payout": 89},
    {"name": "USD/CLP", "symbol": "USD/CLP (OTC)", "category": "forex", "payout": 88},
    {"name": "CHF/JPY", "symbol": "CHF/JPY (OTC)", "category": "forex", "payout": 87},
    {"name": "LBP/USD", "symbol": "LBP/USD (OTC)", "category": "forex", "payout": 86},
    {"name": "USD/THB", "symbol": "USD/THB (OTC)", "category": "forex", "payout": 86},
    {"name": "AUD/USD", "symbol": "AUD/USD (OTC)", "category": "forex", "payout": 83},
    {"name": "AUD/JPY", "symbol": "AUD/JPY (OTC)", "category": "forex", "payout": 82},
    {"name": "NGN/USD", "symbol": "NGN/USD (OTC)", "category": "forex", "payout": 81},
    {"name": "QAR/CNY", "symbol": "QAR/CNY (OTC)", "category": "forex", "payout": 74},
    {"name": "BHD/CNY", "symbol": "BHD/CNY (OTC)", "category": "forex", "payout": 71},
    {"name": "USD/JPY", "symbol": "USD/JPY (OTC)", "category": "forex", "payout": 70},
    {"name": "NZD/JPY", "symbol": "NZD/JPY (OTC)", "category": "forex", "payout": 68},
    {"name": "USD/INR", "symbol": "USD/INR (OTC)", "category": "forex", "payout": 67},
    {"name": "EUR/HUF", "symbol": "EUR/HUF (OTC)", "category": "forex", "payout": 65},
    {"name": "MAD/USD", "symbol": "MAD/USD (OTC)", "category": "forex", "payout": 65},
    {"name": "CAD/CHF", "symbol": "CAD/CHF (OTC)", "category": "forex", "payout": 64},
    {"name": "USD/EGP", "symbol": "USD/EGP (OTC)", "category": "forex", "payout": 63},
    {"name": "ZAR/USD", "symbol": "ZAR/USD (OTC)", "category": "forex", "payout": 63},
    {"name": "EUR/USD", "symbol": "EUR/USD (OTC)", "category": "forex", "payout": 61},
    {"name": "GBP/USD", "symbol": "GBP/USD (OTC)", "category": "forex", "payout": 59},
    {"name": "AUD/CHF", "symbol": "AUD/CHF (OTC)", "category": "forex", "payout": 58},
    {"name": "USD/BRL", "symbol": "USD/BRL (OTC)", "category": "forex", "payout": 58},
    {"name": "USD/BDT", "symbol": "USD/BDT (OTC)", "category": "forex", "payout": 57},
    {"name": "EUR/CHF", "symbol": "EUR/CHF (OTC)", "category": "forex", "payout": 52},
    {"name": "KES/USD", "symbol": "KES/USD (OTC)", "category": "forex", "payout": 52},
    {"name": "USD/COP", "symbol": "USD/COP (OTC)", "category": "forex", "payout": 51},
    {"name": "CHF/NOK", "symbol": "CHF/NOK (OTC)", "category": "forex", "payout": 50},
    {"name": "USD/VND", "symbol": "USD/VND (OTC)", "category": "forex", "payout": 50},
    {"name": "JOD/CNY", "symbol": "JOD/CNY (OTC)", "category": "forex", "payout": 46},
    {"name": "TND/USD", "symbol": "TND/USD (OTC)", "category": "forex", "payout": 45},
    {"name": "USD/IDR", "symbol": "USD/IDR (OTC)", "category": "forex", "payout": 43},
    {"name": "USD/DZD", "symbol": "USD/DZD (OTC)", "category": "forex", "payout": 36},
    {"name": "UAH/USD", "symbol": "UAH/USD (OTC)", "category": "forex", "payout": 33},
    {"name": "USD/MXN", "symbol": "USD/MXN (OTC)", "category": "forex", "payout": 32},
    {"name": "GBP/AUD", "symbol": "GBP/AUD (OTC)", "category": "forex", "payout": 30},
    {"name": "USD/CHF", "symbol": "USD/CHF (OTC)", "category": "forex", "payout": 30},
    {"name": "EUR/TRY", "symbol": "EUR/TRY (OTC)", "category": "forex", "payout": 29},
    {"name": "USD/CAD", "symbol": "USD/CAD (OTC)", "category": "forex", "payout": 24},
    {"name": "SAR/CNY", "symbol": "SAR/CNY (OTC)", "category": "forex", "payout": 20},
    # Crypto
    {"name": "Bitcoin ETF", "symbol": "Bitcoin ETF (OTC)", "category": "crypto", "payout": 92},
    {"name": "BNB", "symbol": "BNB (OTC)", "category": "crypto", "payout": 92},
    {"name": "Polkadot", "symbol": "Polkadot (OTC)", "category": "crypto", "payout": 92},
    {"name": "Litecoin", "symbol": "Litecoin (OTC)", "category": "crypto", "payout": 92},
    {"name": "Toncoin", "symbol": "Toncoin (OTC)", "category": "crypto", "payout": 92},
    {"name": "Ethereum", "symbol": "Ethereum (OTC)", "category": "crypto", "payout": 86},
    {"name": "Avalanche", "symbol": "Avalanche (OTC)", "category": "crypto", "payout": 80},
    {"name": "Chainlink", "symbol": "Chainlink (OTC)", "category": "crypto", "payout": 77},
    {"name": "Polygon", "symbol": "Polygon (OTC)", "category": "crypto", "payout": 73},
    {"name": "Bitcoin", "symbol": "Bitcoin (OTC)", "category": "crypto", "payout": 68},
    {"name": "Cardano", "symbol": "Cardano (OTC)", "category": "crypto", "payout": 67},
    {"name": "TRON", "symbol": "TRON (OTC)", "category": "crypto", "payout": 50},
    {"name": "Solana", "symbol": "Solana (OTC)", "category": "crypto", "payout": 48},
    {"name": "Dogecoin", "symbol": "Dogecoin (OTC)", "category": "crypto", "payout": 38},
    # Commodities
    {"name": "Brent Oil", "symbol": "Brent Oil (OTC)", "category": "commodities", "payout": 80},
    {"name": "WTI Oil", "symbol": "WTI Crude Oil (OTC)", "category": "commodities", "payout": 80},
    {"name": "Silver", "symbol": "Silver (OTC)", "category": "commodities", "payout": 80},
    {"name": "Gold", "symbol": "Gold (OTC)", "category": "commodities", "payout": 80},
    {"name": "Natural Gas", "symbol": "Natural Gas (OTC)", "category": "commodities", "payout": 45},
    {"name": "Palladium", "symbol": "Palladium spot (OTC)", "category": "commodities", "payout": 45},
    {"name": "Platinum", "symbol": "Platinum spot (OTC)", "category": "commodities", "payout": 45},
    # Stocks
    {"name": "Apple", "symbol": "Apple (OTC)", "category": "stocks", "payout": 92},
    {"name": "GameStop", "symbol": "GameStop Corp (OTC)", "category": "stocks", "payout": 92},
    {"name": "VISA", "symbol": "VISA (OTC)", "category": "stocks", "payout": 92},
    {"name": "American Express", "symbol": "American Express (OTC)", "category": "stocks", "payout": 90},
    {"name": "VIX", "symbol": "VIX (OTC)", "category": "stocks", "payout": 90},
    {"name": "Pfizer", "symbol": "Pfizer Inc (OTC)", "category": "stocks", "payout": 87},
    {"name": "AMD", "symbol": "Advanced Micro Devices (OTC)", "category": "stocks", "payout": 83},
    {"name": "J&J", "symbol": "Johnson & Johnson (OTC)", "category": "stocks", "payout": 81},
    {"name": "Marathon Digital", "symbol": "Marathon Digital Holdings (OTC)", "category": "stocks", "payout": 73},
    {"name": "Amazon", "symbol": "Amazon (OTC)", "category": "stocks", "payout": 69},
    {"name": "Netflix", "symbol": "Netflix (OTC)", "category": "stocks", "payout": 63},
    {"name": "ExxonMobil", "symbol": "ExxonMobil (OTC)", "category": "stocks", "payout": 60},
    {"name": "Coinbase", "symbol": "Coinbase Global (OTC)", "category": "stocks", "payout": 59},
    {"name": "Cisco", "symbol": "Cisco (OTC)", "category": "stocks", "payout": 57},
    {"name": "Alibaba", "symbol": "Alibaba (OTC)", "category": "stocks", "payout": 52},
    {"name": "Citigroup", "symbol": "Citigroup Inc (OTC)", "category": "stocks", "payout": 50},
    {"name": "FedEx", "symbol": "FedEx (OTC)", "category": "stocks", "payout": 50},
    {"name": "Meta", "symbol": "FACEBOOK INC (OTC)", "category": "stocks", "payout": 45},
    {"name": "Intel", "symbol": "Intel (OTC)", "category": "stocks", "payout": 36},
    {"name": "Palantir", "symbol": "Palantir Technologies (OTC)", "category": "stocks", "payout": 34},
    {"name": "McDonald's", "symbol": "McDonald's (OTC)", "category": "stocks", "payout": 33},
    {"name": "Tesla", "symbol": "Tesla (OTC)", "category": "stocks", "payout": 33},
    {"name": "Microsoft", "symbol": "Microsoft (OTC)", "category": "stocks", "payout": 31},
    # Indices
    {"name": "AUS 200", "symbol": "AUS 200 (OTC)", "category": "indices", "payout": 67},
    {"name": "FTSE 100", "symbol": "100GBP (OTC)", "category": "indices", "payout": 45},
    {"name": "DAX 30", "symbol": "D30EUR (OTC)", "category": "indices", "payout": 45},
    {"name": "Dow Jones", "symbol": "DJI30 (OTC)", "category": "indices", "payout": 45},
    {"name": "Euro Stoxx 35", "symbol": "E35EUR (OTC)", "category": "indices", "payout": 45},
    {"name": "Euro Stoxx 50", "symbol": "E50EUR (OTC)", "category": "indices", "payout": 45},
    {"name": "CAC 40", "symbol": "F40EUR (OTC)", "category": "indices", "payout": 45},
    {"name": "Nikkei 225", "symbol": "JPN225 (OTC)", "category": "indices", "payout": 45},
    {"name": "NASDAQ 100", "symbol": "US100 (OTC)", "category": "indices", "payout": 45},
    {"name": "S&P 500", "symbol": "SP500 (OTC)", "category": "indices", "payout": 45},
]

# ── Exchange pairs (tier 1+) ────────────────────────────────────────────────

EXCHANGE_PAIRS: list[PairInfo] = [
    {"name": "CHF/JPY", "symbol": "CHF/JPY", "category": "forex", "payout": 88},
    {"name": "EUR/CAD", "symbol": "EUR/CAD", "category": "forex", "payout": 88},
    {"name": "AUD/JPY", "symbol": "AUD/JPY", "category": "forex", "payout": 86},
    {"name": "CAD/JPY", "symbol": "CAD/JPY", "category": "forex", "payout": 80},
    {"name": "AUD/CHF", "symbol": "AUD/CHF", "category": "forex", "payout": 78},
    {"name": "EUR/USD", "symbol": "EUR/USD", "category": "forex", "payout": 78},
    {"name": "EUR/CHF", "symbol": "EUR/CHF", "category": "forex", "payout": 75},
    {"name": "AUD/CAD", "symbol": "AUD/CAD", "category": "forex", "payout": 74},
    {"name": "EUR/AUD", "symbol": "EUR/AUD", "category": "forex", "payout": 73},
    {"name": "GBP/JPY", "symbol": "GBP/JPY", "category": "forex", "payout": 72},
    {"name": "USD/JPY", "symbol": "USD/JPY", "category": "forex", "payout": 68},
    {"name": "EUR/JPY", "symbol": "EUR/JPY", "category": "forex", "payout": 61},
    {"name": "EUR/GBP", "symbol": "EUR/GBP", "category": "forex", "payout": 60},
    {"name": "GBP/USD", "symbol": "GBP/USD", "category": "forex", "payout": 55},
    {"name": "GBP/CAD", "symbol": "GBP/CAD", "category": "forex", "payout": 48},
    {"name": "USD/CAD", "symbol": "USD/CAD", "category": "forex", "payout": 44},
    {"name": "GBP/CHF", "symbol": "GBP/CHF", "category": "forex", "payout": 42},
    {"name": "AUD/USD", "symbol": "AUD/USD", "category": "forex", "payout": 40},
    {"name": "USD/CHF", "symbol": "USD/CHF", "category": "forex", "payout": 35},
    {"name": "CAD/CHF", "symbol": "CAD/CHF", "category": "forex", "payout": 26},
    {"name": "GBP/AUD", "symbol": "GBP/AUD", "category": "forex", "payout": 24},
    # Crypto
    {"name": "Bitcoin", "symbol": "BTC/USD", "category": "crypto", "payout": 15},
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

# Signal-tier display names
SIGNAL_TIER_LABELS: dict[str, str] = {
    "otc": "🎲 OTC",
    "exchange": "📈 Биржевые",
    "elite": "👑 Elite",
}

# Expirations per signal tier
EXPIRATIONS: dict[str, list[tuple[str, str]]] = {
    "otc": [("30 сек", "30s"), ("1 мин", "60s"), ("2 мин", "2m"), ("3 мин", "3m"), ("5 мин", "5m"), ("30 мин", "30m")],
    "exchange": [("2 мин", "2m"), ("3 мин", "3m"), ("5 мин", "5m"), ("30 мин", "30m")],
    "elite": [("2 мин", "2m"), ("3 мин", "3m"), ("5 мин", "5m"), ("30 мин", "30m")],
}

# Expiration code → display label (for signal messages)
EXPIRATION_LABELS: dict[str, str] = {
    "30s": "30 сек",
    "60s": "1 мин",
    "2m": "2 мин",
    "3m": "3 мин",
    "5m": "5 мин",
    "30m": "30 мин",
}
