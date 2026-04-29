import random
from database.models import Signal

CURRENCY_PAIRS = [
    "EUR/USD",
    "GBP/USD",
    "USD/JPY",
    "AUD/USD",
    "EUR/GBP",
    "GBP/JPY",
    "USD/CHF",
    "NZD/USD",
    "EUR/JPY",
    "AUD/JPY",
    "USD/CAD",
    "EUR/AUD",
]

EXPIRATIONS = ["30 сек", "1 мин", "2 мин", "5 мин"]
EXPIRATIONS_RAW = ["30s", "1m", "2m", "5m"]

DIRECTIONS = ["CALL", "PUT"]


def generate_signal() -> Signal:
    pair = random.choice(CURRENCY_PAIRS)
    direction = random.choice(DIRECTIONS)
    expiration_index = random.randint(0, len(EXPIRATIONS) - 1)
    expiration = EXPIRATIONS[expiration_index]
    confidence = random.randint(73, 96)

    return Signal(
        pair=pair,
        direction=direction,
        expiration=expiration,
        confidence=confidence,
        signal_type="ai",
        result="pending",
    )


def random_interval_seconds(min_minutes: int, max_minutes: int) -> float:
    minutes = random.uniform(min_minutes, max_minutes)
    return minutes * 60
