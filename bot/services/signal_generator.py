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

def _gen_otc_analysis(direction: str) -> str:
    """Generate dynamic OTC analysis with random indicator values."""
    rsi_val = round(random.uniform(18, 82), 1)
    stoch_k = round(random.uniform(10, 90), 1)
    stoch_d = round(stoch_k + random.uniform(-8, 8), 1)
    bb_pos = random.choice(["у нижней границы", "у верхней границы", "в середине канала", "пробой верхней границы", "пробой нижней границы"])
    ma_fast = random.choice(["EMA(9)", "EMA(12)", "SMA(10)"])
    ma_slow = random.choice(["EMA(21)", "SMA(20)", "EMA(26)"])
    volume_pct = random.randint(5, 45)
    fib_level = random.choice(["23.6%", "38.2%", "50.0%", "61.8%", "78.6%"])

    if rsi_val > 70:
        rsi_zone = "перекупленность"
    elif rsi_val < 30:
        rsi_zone = "перепроданность"
    else:
        rsi_zone = "нейтральная зона"

    is_call = direction == "CALL"

    templates = [
        (
            f"RSI(14): {rsi_val} — {rsi_zone}\n"
            f"Stochastic: %K={stoch_k}, %D={stoch_d}\n"
            f"Bollinger: цена {bb_pos}\n"
            f"Объём: {'выше' if is_call else 'ниже'} среднего на {volume_pct}%"
        ),
        (
            f"RSI(14): {rsi_val} — {rsi_zone}\n"
            f"{ma_fast} {'выше' if is_call else 'ниже'} {ma_slow} — {'бычий' if is_call else 'медвежий'} тренд\n"
            f"MACD: {'бычье' if is_call else 'медвежье'} пересечение на M1\n"
            f"Fibonacci: отработка уровня {fib_level}"
        ),
        (
            f"RSI(14): {rsi_val} ({rsi_zone})\n"
            f"Stochastic: %K={stoch_k} {'↑' if is_call else '↓'} %D={stoch_d}\n"
            f"Паттерн: {'двойное дно' if is_call else 'двойная вершина'} подтверждён\n"
            f"Объём: всплеск +{volume_pct}% при формировании свечи"
        ),
        (
            f"Bollinger Bands: цена {bb_pos}\n"
            f"RSI(14): {rsi_val} — {'разворот от зоны ' + rsi_zone if rsi_val > 65 or rsi_val < 35 else rsi_zone}\n"
            f"{ma_fast}/{ma_slow}: {'золотой крест' if is_call else 'мёртвый крест'}\n"
            f"ATR: волатильность {'повышенная' if volume_pct > 25 else 'умеренная'}"
        ),
        (
            f"RSI(14): {rsi_val} → {'отскок от перепроданности' if rsi_val < 40 else 'подтверждение импульса'}\n"
            f"MACD гистограмма: {'растёт' if is_call else 'снижается'}\n"
            f"Fibonacci {fib_level}: {'удержание поддержки' if is_call else 'отбой от сопротивления'}\n"
            f"Объём: +{volume_pct}% от среднего"
        ),
        (
            f"Stochastic(%K={stoch_k}, %D={stoch_d}): {'выход из перепроданности' if stoch_k < 30 else 'зона импульса'}\n"
            f"RSI(14): {rsi_val}\n"
            f"Bollinger: {'сужение канала → пробой' if volume_pct > 20 else 'цена ' + bb_pos}\n"
            f"Паттерн: {'пин-бар' if is_call else 'поглощение'} на ключевом уровне"
        ),
    ]
    return random.choice(templates)


ANALYSES = {
    "otc": [],  # generated dynamically via _gen_otc_analysis()
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
    if tier == "otc":
        analysis = _gen_otc_analysis(direction)
    else:
        analysis = random.choice(ANALYSES.get(tier, ANALYSES["exchange"]))

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
    expiration_label = EXPIRATION_LABELS.get(expiration_code, expiration_code)
    if tier == "otc":
        analysis = _gen_otc_analysis(direction)
    else:
        analysis = random.choice(ANALYSES.get(tier, ANALYSES["exchange"]))

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
