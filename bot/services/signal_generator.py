import random
from datetime import datetime, timedelta, timezone

from database.models import Signal
from constants import EXPIRATION_LABELS

# Flat lists for legacy random generation
CURRENCY_PAIRS = [
    "EUR/USD", "GBP/USD", "USD/JPY", "AUD/USD", "EUR/GBP", "GBP/JPY",
    "USD/CHF", "NZD/USD", "EUR/JPY", "AUD/JPY", "USD/CAD", "EUR/AUD",
    "AUD/CHF", "AUD/NZD", "EUR/CHF", "CAD/JPY", "GBP/AUD", "EUR/NZD",
    "CHF/JPY",
]

OTC_CURRENCY_PAIRS = [f"{pair} (OTC)" for pair in CURRENCY_PAIRS[:16]]

OTC_CRYPTO = [
    "Bitcoin (OTC)", "Ethereum (OTC)", "Solana (OTC)", "Dogecoin (OTC)",
    "Cardano (OTC)", "Toncoin (OTC)", "BNB (OTC)", "Litecoin (OTC)",
]

OTC_COMMODITIES = [
    "Gold (OTC)", "Silver (OTC)", "Brent Oil (OTC)", "WTI Oil (OTC)",
]

OTC_STOCKS = [
    "Apple (OTC)", "Tesla (OTC)", "Amazon (OTC)",
    "Microsoft (OTC)", "Meta (OTC)", "Netflix (OTC)",
]

OTC_INDICES = [
    "S&P 500 (OTC)", "NASDAQ 100 (OTC)", "Dow Jones (OTC)",
]

ALL_OTC_PAIRS = OTC_CURRENCY_PAIRS + OTC_CRYPTO + OTC_COMMODITIES + OTC_STOCKS + OTC_INDICES

LEGACY_EXPIRATIONS = {
    "otc": ["30 сек", "1 мин", "2 мин"],
    "exchange": ["1 мин", "2 мин", "5 мин"],
    "elite": ["30 сек", "1 мин", "2 мин", "5 мин", "15 мин"],
}

CONFIDENCE_RANGES = {
    "otc": (73, 88),
    "exchange": (80, 92),
    "elite": (88, 96),
}

DIRECTIONS = ["CALL", "PUT"]

# Moscow timezone (UTC+3) for entry time display
_MSK = timezone(timedelta(hours=3))


def _calc_entry_time() -> str:
    """Return entry time HH:MM — current Moscow time + random 1-4 minutes."""
    offset = random.randint(1, 4)
    entry = datetime.now(_MSK) + timedelta(minutes=offset)
    return entry.strftime("%H:%M")

ANALYSES = {
    "otc": [
        "Тренд: боковое движение с формированием пробоя\nRSI(14): зона перекупленности — 72.3\nОбъём: выше среднего на 15%",
        "Паттерн: двойное дно подтверждено\nПоддержка: сильный уровень удержан трижды\nRSI(14): выход из перепроданности — 28.7 → 34.1",
        "Тренд: восходящий импульс с коррекцией\nСопротивление: пробой ключевого уровня\nМАCD: бычье пересечение на M1",
        "Паттерн: пин-бар на уровне поддержки\nRSI(14): нейтральная зона — 48.5\nОбъём: всплеск при формировании свечи",
        "Тренд: нисходящий канал, отскок от нижней границы\nFibonacci 38.2%: ключевая зона разворота\nRSI(14): перепроданность — 26.1",
        "Паттерн: поглощение (бычье) на M1\nСопротивление пробито: уровень стал поддержкой\nОбъём: подтверждает направление движения",
        "Тренд: импульсное движение после консолидации\nRSI(14): выход из нейтральной зоны — 55.8\nFibonacci 61.8%: удержание уровня коррекции",
        "Паттерн: утренняя звезда на уровне поддержки\nОбъём: аномальный рост при формировании\nRSI(14): разворот от зоны перепроданности — 31.4",
    ],
    "exchange": [
        "Биржевой тренд: восходящий канал подтверждён",
        "RSI выход из перепроданности",
        "MACD бычье пересечение на H1",
        "Уровень Фибоначчи 61.8% — сильный сигнал",
        "Объёмы подтверждают направление",
    ],
    "elite": [
        "Multi-timeframe анализ: M1/M5/H1 совпадение",
        "AI + экспертный анализ: конвергенция индикаторов",
        "Smart Money концепт: ордер-блок подтверждён",
        "Институциональный поток ордеров подтверждён",
        "Кластерный анализ + дельта объёмов",
        "AI Neural + ML модель: высокая вероятность",
    ],
}


def generate_signal(tier: str = "otc") -> Signal:
    """Generate a random signal (legacy, no user choice)."""
    if tier == "otc":
        pair = random.choice(ALL_OTC_PAIRS)
    else:
        pair = random.choice(CURRENCY_PAIRS)

    direction = random.choice(DIRECTIONS)
    expiration = random.choice(LEGACY_EXPIRATIONS.get(tier, LEGACY_EXPIRATIONS["otc"]))
    conf_min, conf_max = CONFIDENCE_RANGES.get(tier, (73, 88))
    confidence = random.randint(conf_min, conf_max)
    analysis = random.choice(ANALYSES.get(tier, ANALYSES["otc"]))

    return Signal(
        pair=pair,
        direction=direction,
        expiration=expiration,
        confidence=confidence,
        signal_type="ai",
        tier=tier,
        analysis=analysis,
        result="pending",
        entry_time=_calc_entry_time(),
    )


def generate_signal_for_pair(
    tier: str,
    pair_symbol: str,
    expiration_code: str,
) -> Signal:
    """Generate a signal for a specific user-chosen pair and expiration."""
    direction = random.choice(DIRECTIONS)
    conf_min, conf_max = CONFIDENCE_RANGES.get(tier, (73, 88))
    confidence = random.randint(conf_min, conf_max)
    analysis = random.choice(ANALYSES.get(tier, ANALYSES["otc"]))
    expiration_label = EXPIRATION_LABELS.get(expiration_code, expiration_code)

    return Signal(
        pair=pair_symbol,
        direction=direction,
        expiration=expiration_label,
        confidence=confidence,
        signal_type="ai",
        tier=tier,
        analysis=analysis,
        result="pending",
        entry_time=_calc_entry_time(),
    )


def random_interval_seconds(min_minutes: int, max_minutes: int) -> float:
    minutes = random.uniform(min_minutes, max_minutes)
    return minutes * 60
