import random
from database.models import Signal

CURRENCY_PAIRS = [
    "EUR/USD", "GBP/USD", "USD/JPY", "AUD/USD", "EUR/GBP", "GBP/JPY",
    "USD/CHF", "NZD/USD", "EUR/JPY", "AUD/JPY", "USD/CAD", "EUR/AUD",
]

OTC_PAIRS = [f"{pair} OTC" for pair in CURRENCY_PAIRS[:6]]

EXPIRATIONS = {
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

ANALYSES = {
    "otc": [
        "OTC тренд: боковое движение с пробоем",
        "Сильный уровень поддержки, отскок",
        "OTC паттерн: двойное дно",
        "Объём выше среднего, движение ожидается",
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
    if tier == "otc":
        pair = random.choice(OTC_PAIRS)
    else:
        pair = random.choice(CURRENCY_PAIRS)

    direction = random.choice(DIRECTIONS)
    expiration = random.choice(EXPIRATIONS.get(tier, EXPIRATIONS["otc"]))
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
    )


def random_interval_seconds(min_minutes: int, max_minutes: int) -> float:
    minutes = random.uniform(min_minutes, max_minutes)
    return minutes * 60
