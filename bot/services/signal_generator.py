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
    "otc": ["30 сек", "1 мин", "2 мин", "3 мин", "5 мин", "30 мин"],
    "exchange": ["2 мин", "3 мин", "5 мин", "30 мин"],
    "elite": ["2 мин", "3 мин", "5 мин", "30 мин"],
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
    """Generate detailed OTC analysis with beginner-friendly explanations."""
    rsi_val = round(random.uniform(18, 82), 1)
    stoch_k = round(random.uniform(10, 90), 1)
    stoch_d = round(stoch_k + random.uniform(-8, 8), 1)
    ma_fast = random.choice(["EMA(9)", "EMA(12)", "SMA(10)"])
    ma_slow = random.choice(["EMA(21)", "SMA(20)", "EMA(26)"])
    volume_pct = random.randint(5, 45)
    fib_level = random.choice(["23.6%", "38.2%", "50.0%", "61.8%", "78.6%"])

    call_templates = [
        (
            f"🟢 Почему ВВЕРХ:\n\n"
            f"RSI(14) = {rsi_val} — индикатор в зоне перепроданности, продавцы устали. "
            f"Когда RSI низкий, цена часто разворачивается вверх.\n\n"
            f"Stochastic (%K={stoch_k}) пересёк %D снизу вверх — покупатели возвращаются.\n\n"
            f"💡 Простыми словами: актив «перепродан» — слишком много людей продавали, "
            f"и теперь наступает отскок вверх, как мячик от пола."
        ),
        (
            f"🟢 Почему ВВЕРХ:\n\n"
            f"{ma_fast} пересекла {ma_slow} снизу вверх — «золотой крест». "
            f"Один из самых известных сигналов на покупку.\n\n"
            f"RSI(14) = {rsi_val} — подтверждает бычий настрой.\n"
            f"Объём вырос на +{volume_pct}% — крупные игроки заходят в покупки.\n\n"
            f"💡 Простыми словами: быстрый тренд обгоняет медленный — "
            f"как машина, которая начинает ускоряться. Направление — вверх."
        ),
        (
            f"🟢 Почему ВВЕРХ:\n\n"
            f"На графике «двойное дно» — цена дважды коснулась одного уровня и отскочила. "
            f"Сильный сигнал разворота.\n\n"
            f"RSI = {rsi_val}, Stochastic %K = {stoch_k} — оба индикатора растут.\n\n"
            f"💡 Простыми словами: мячик дважды ударился об пол. "
            f"После второго удара он отскакивает сильнее — так и цена."
        ),
        (
            f"🟢 Почему ВВЕРХ:\n\n"
            f"Bollinger Bands сузились — рынок «затих». После затишья обычно идёт резкий прорыв.\n"
            f"Цена у нижней границы канала — статистически отскакивает вверх.\n"
            f"RSI(14) = {rsi_val} — не перекуплен, запас для роста.\n\n"
            f"💡 Простыми словами: рынок «сжался как пружина» у нижней границы. "
            f"Пружина разжимается — цена стреляет вверх."
        ),
        (
            f"🟢 Почему ВВЕРХ:\n\n"
            f"Цена откатилась к Фибоначчи {fib_level} и получила отскок. "
            f"Этот уровень работает как «невидимая поддержка».\n"
            f"MACD гистограмма растёт — импульс покупателей нарастает.\n"
            f"Объём: +{volume_pct}% от среднего.\n\n"
            f"💡 Простыми словами: цена «отдохнула» после роста, откатилась до важного уровня "
            f"и теперь готова продолжить движение вверх."
        ),
        (
            f"🟢 Почему ВВЕРХ:\n\n"
            f"На графике «пин-бар» с длинной нижней тенью — покупатели агрессивно выкупают снижение.\n"
            f"RSI(14) = {rsi_val} — разворачивается из перепроданности.\n"
            f"Stochastic: %K={stoch_k}, %D={stoch_d} — бычье пересечение.\n\n"
            f"💡 Простыми словами: свеча с длинным «хвостом» вниз — "
            f"цена пыталась упасть, но покупатели не дали. Сигнал на рост."
        ),
        (
            f"🟢 Почему ВВЕРХ:\n\n"
            f"MACD пересёкся в бычьем направлении. Начало восходящего тренда.\n"
            f"{ma_fast} > {ma_slow} — тренд бычий.\n"
            f"RSI = {rsi_val} — в зоне роста.\n\n"
            f"💡 Простыми словами: два главных индикатора тренда одновременно говорят «ВВЕРХ». "
            f"Когда они совпадают — сигнал сильный."
        ),
        (
            f"🟢 Почему ВВЕРХ:\n\n"
            f"Объём торгов вырос на {volume_pct}% при движении вверх — "
            f"рост подтверждён реальными деньгами.\n"
            f"RSI(14) = {rsi_val} — здоровый бычий импульс.\n\n"
            f"💡 Простыми словами: когда цена растёт и объём растёт вместе — "
            f"это «настоящий» рост. Крупные деньги ставят на повышение."
        ),
        (
            f"🟢 Почему ВВЕРХ:\n\n"
            f"«Утренняя звезда» — три свечи: красная → маленькая → большая зелёная. "
            f"Классический разворот.\n"
            f"RSI = {rsi_val} — выходит из перепроданности.\n\n"
            f"💡 Простыми словами: после падения появился «рассвет» — маленькая свеча, "
            f"за ней сильная покупка. Разворот вверх."
        ),
        (
            f"🟢 Почему ВВЕРХ:\n\n"
            f"Дивергенция RSI — цена делает новый минимум, а RSI растёт. "
            f"Падение теряет силу изнутри.\n"
            f"RSI = {rsi_val}, Stochastic = {stoch_k}.\n\n"
            f"💡 Простыми словами: цена ещё падает, но «внутренняя сила» уже растёт. "
            f"Как машина, которая тормозит перед разворотом. Скоро поедет вверх."
        ),
        (
            f"🟢 Почему ВВЕРХ:\n\n"
            f"Свеча «молот» — маленькое тело, длинная нижняя тень на уровне поддержки.\n"
            f"RSI(14) = {rsi_val} — подтверждает разворот.\n"
            f"Объём: +{volume_pct}% — покупатели вступили в игру.\n\n"
            f"💡 Простыми словами: «молот» — цена сильно упала внутри свечи, "
            f"но покупатели вернули её обратно. Они сильнее."
        ),
        (
            f"🟢 Почему ВВЕРХ:\n\n"
            f"Восходящий треугольник — минимумы растут, приближаясь к сопротивлению. "
            f"Пробой вверх наиболее вероятен.\n"
            f"RSI = {rsi_val} — растёт. {ma_fast} направлена вверх.\n\n"
            f"💡 Простыми словами: покупатели с каждым разом «поднимают планку». "
            f"Они всё ближе к прорыву вверх — и скорее всего, прорвутся."
        ),
        (
            f"🟢 Почему ВВЕРХ:\n\n"
            f"Три белых солдата — три зелёные свечи подряд с увеличивающимся телом. "
            f"Сильнейший бычий паттерн.\n"
            f"RSI = {rsi_val} — без перекупленности. Объём растёт.\n\n"
            f"💡 Простыми словами: три зелёные свечи подряд, каждая больше предыдущей — "
            f"покупатели набирают обороты. Тренд вверх сильный."
        ),
        (
            f"🟢 Почему ВВЕРХ:\n\n"
            f"Цена закрепилась выше {ma_fast} после коррекции — "
            f"скользящая работает как «трамплин».\n"
            f"RSI(14) = {rsi_val}. Fibonacci {fib_level} отработал как поддержка.\n\n"
            f"💡 Простыми словами: цена «опёрлась» на среднюю, как на ступеньку, "
            f"и оттолкнулась вверх. Тренд продолжается."
        ),
        (
            f"🟢 Почему ВВЕРХ:\n\n"
            f"Цена пробила 200-периодную среднюю снизу вверх — "
            f"один из самых сильных долгосрочных сигналов на покупку.\n"
            f"RSI(14) = {rsi_val}. Stochastic: %K={stoch_k} > %D={stoch_d}.\n\n"
            f"💡 Простыми словами: 200-дневная средняя — «главная дорога». "
            f"Цена пересекла её снизу вверх — выезд на трассу в правильном направлении."
        ),
    ]

    put_templates = [
        (
            f"🔴 Почему ВНИЗ:\n\n"
            f"RSI(14) = {rsi_val} — индикатор в зоне перекупленности, покупатели устали. "
            f"Когда RSI высокий, цена часто разворачивается вниз.\n\n"
            f"Stochastic (%K={stoch_k}) пересёк %D сверху вниз — продавцы берут контроль.\n\n"
            f"💡 Простыми словами: актив «перекуплен» — слишком много людей покупали, "
            f"теперь откат вниз. Как маятник, качнувшийся слишком далеко."
        ),
        (
            f"🔴 Почему ВНИЗ:\n\n"
            f"{ma_fast} пересекла {ma_slow} сверху вниз — «мёртвый крест». "
            f"Известный сигнал на продажу.\n\n"
            f"RSI(14) = {rsi_val} — подтверждает медвежий настрой.\n"
            f"Объём вырос на +{volume_pct}% — крупные фиксируют прибыль.\n\n"
            f"💡 Простыми словами: быстрый тренд «нырнул» под медленный — "
            f"машина начинает тормозить и разворачиваться. Направление — вниз."
        ),
        (
            f"🔴 Почему ВНИЗ:\n\n"
            f"«Двойная вершина» — цена дважды не смогла пробить один уровень. "
            f"Мощный разворотный паттерн вниз.\n\n"
            f"RSI = {rsi_val}, Stochastic %K = {stoch_k} — оба снижаются.\n\n"
            f"💡 Простыми словами: цена дважды «бьётся головой об потолок» и не может пробить. "
            f"После второй попытки — падает."
        ),
        (
            f"🔴 Почему ВНИЗ:\n\n"
            f"Bollinger Bands расширяются вниз — волатильность растёт в пользу продавцов.\n"
            f"Цена у верхней границы канала — отскок вниз вероятен.\n"
            f"RSI(14) = {rsi_val} — приближается к перекупленности.\n\n"
            f"💡 Простыми словами: цена достигла «потолка» ценового коридора. "
            f"Этот потолок редко пробивается — цена возвращается к середине."
        ),
        (
            f"🔴 Почему ВНИЗ:\n\n"
            f"Цена откатилась вверх к Фибоначчи {fib_level} и получила отбой. "
            f"Коррекция завершена — нисходящий тренд продолжается.\n"
            f"MACD гистограмма снижается. Объём: +{volume_pct}%.\n\n"
            f"💡 Простыми словами: после падения цена попыталась «подпрыгнуть», "
            f"но добралась только до ключевого уровня и развернулась обратно вниз."
        ),
        (
            f"🔴 Почему ВНИЗ:\n\n"
            f"«Падающая звезда» — свеча с длинной верхней тенью. "
            f"Покупатели пытались, но продавцы вернули цену.\n"
            f"RSI(14) = {rsi_val} — разворот из перекупленности.\n"
            f"Stochastic: %K={stoch_k}, %D={stoch_d} — медвежье пересечение.\n\n"
            f"💡 Простыми словами: длинный «хвост» вверху — цена пыталась вырасти, "
            f"но её «прибили». Продавцы сильнее."
        ),
        (
            f"🔴 Почему ВНИЗ:\n\n"
            f"MACD пересёкся в медвежьем направлении. Нисходящий тренд набирает силу.\n"
            f"{ma_fast} < {ma_slow} — подтверждение.\n"
            f"RSI = {rsi_val} — давление продавцов.\n\n"
            f"💡 Простыми словами: два индикатора тренда одновременно говорят «ВНИЗ». "
            f"Двойное подтверждение = сильный сигнал."
        ),
        (
            f"🔴 Почему ВНИЗ:\n\n"
            f"Объём вырос на {volume_pct}% при движении вниз — "
            f"падение подтверждено реальными деньгами.\n"
            f"RSI(14) = {rsi_val} — медвежий импульс.\n\n"
            f"💡 Простыми словами: когда цена падает и объём растёт — "
            f"это серьёзное падение. Крупные игроки активно продают."
        ),
        (
            f"🔴 Почему ВНИЗ:\n\n"
            f"«Вечерняя звезда» — три свечи: зелёная → маленькая → большая красная. "
            f"Классический разворот вниз.\n"
            f"RSI = {rsi_val} — снижается. Stochastic: %K={stoch_k} ↓.\n\n"
            f"💡 Простыми словами: после роста появился «закат» — покупатели потеряли силу, "
            f"продавцы перехватили инициативу мощной красной свечой."
        ),
        (
            f"🔴 Почему ВНИЗ:\n\n"
            f"Дивергенция RSI — цена делает новый максимум, а RSI падает. "
            f"Рост теряет силу изнутри.\n"
            f"RSI = {rsi_val}, Stochastic = {stoch_k}.\n\n"
            f"💡 Простыми словами: цена ещё растёт, но «энергия» иссякает. "
            f"Как мяч, подброшенный вверх — ещё летит, но замедляется перед падением."
        ),
        (
            f"🔴 Почему ВНИЗ:\n\n"
            f"«Повешенный» — свеча с маленьким телом и длинной нижней тенью после роста.\n"
            f"RSI(14) = {rsi_val} — ослабление покупателей.\n"
            f"Объём: +{volume_pct}% — фиксация прибыли.\n\n"
            f"💡 Простыми словами: после роста появилась подозрительная свеча — "
            f"покупатели начали сомневаться. Предвестник разворота вниз."
        ),
        (
            f"🔴 Почему ВНИЗ:\n\n"
            f"Нисходящий треугольник — максимумы снижаются к горизонтальной поддержке. "
            f"Пробой вниз наиболее вероятен.\n"
            f"RSI = {rsi_val} — падает. {ma_fast} направлена вниз.\n\n"
            f"💡 Простыми словами: продавцы с каждым разом «опускают потолок». "
            f"Рано или поздно цена пробьёт пол — и полетит вниз."
        ),
        (
            f"🔴 Почему ВНИЗ:\n\n"
            f"Три чёрных вороны — три красные свечи подряд с увеличивающимся телом. "
            f"Мощнейший медвежий паттерн.\n"
            f"RSI = {rsi_val} — без перепроданности. Объём растёт.\n\n"
            f"💡 Простыми словами: три красные свечи подряд, каждая больше предыдущей — "
            f"продавцы набирают обороты. Падение сильное."
        ),
        (
            f"🔴 Почему ВНИЗ:\n\n"
            f"Цена не удержалась выше {ma_fast} — скользящая стала «потолком».\n"
            f"RSI(14) = {rsi_val}. Fibonacci {fib_level} отработал как сопротивление.\n\n"
            f"💡 Простыми словами: цена попыталась «залезть» выше средней, но не смогла. "
            f"Средняя давит сверху — путь вниз."
        ),
        (
            f"🔴 Почему ВНИЗ:\n\n"
            f"Цена пробила 200-периодную среднюю сверху вниз — "
            f"сильнейший долгосрочный медвежий сигнал.\n"
            f"RSI(14) = {rsi_val}. Stochastic: %K={stoch_k} < %D={stoch_d}.\n\n"
            f"💡 Простыми словами: 200-дневная средняя — «главная дорога». "
            f"Цена нырнула под неё — серьёзный сигнал на снижение."
        ),
    ]

    if direction == "CALL":
        return random.choice(call_templates)
    return random.choice(put_templates)


def _gen_exchange_analysis(direction: str) -> str:
    """Generate detailed exchange analysis with beginner-friendly explanations."""
    rsi_val = round(random.uniform(25, 75), 1)
    ma_fast = random.choice(["EMA(9)", "EMA(12)", "SMA(10)"])
    ma_slow = random.choice(["EMA(21)", "SMA(20)", "EMA(26)"])
    volume_pct = random.randint(5, 40)
    fib_level = random.choice(["38.2%", "50.0%", "61.8%"])
    is_call = direction == "CALL"

    templates = [
        (
            f"{'🟢' if is_call else '🔴'} Почему {'ВВЕРХ' if is_call else 'ВНИЗ'}:\n\n"
            f"RSI(14) = {rsi_val} — {'бычий' if is_call else 'медвежий'} импульс.\n"
            f"{ma_fast} {'>' if is_call else '<'} {ma_slow} — тренд подтверждён.\n"
            f"MACD: {'бычье' if is_call else 'медвежье'} пересечение на H1.\n"
            f"Объём: +{volume_pct}% от среднего.\n\n"
            f"💡 Простыми словами: все основные индикаторы указывают в одну сторону — "
            f"{'вверх' if is_call else 'вниз'}. Тренд сильный."
        ),
        (
            f"{'🟢' if is_call else '🔴'} Почему {'ВВЕРХ' if is_call else 'ВНИЗ'}:\n\n"
            f"Fibonacci {fib_level}: цена {'отскочила от поддержки' if is_call else 'отбилась от сопротивления'}.\n"
            f"RSI = {rsi_val} — подтверждает {'рост' if is_call else 'падение'}.\n"
            f"Объёмы {'растут' if is_call else 'увеличиваются'} при движении {'вверх' if is_call else 'вниз'}.\n\n"
            f"💡 Простыми словами: цена {'отскочила от важного уровня вверх' if is_call else 'не смогла пробить важный уровень и пошла вниз'}. "
            f"Уровень Фибоначчи работает как {'пол' if is_call else 'потолок'}."
        ),
        (
            f"{'🟢' if is_call else '🔴'} Почему {'ВВЕРХ' if is_call else 'ВНИЗ'}:\n\n"
            f"Мультитаймфреймовый анализ: M5, M15, H1 — все подтверждают "
            f"{'восходящий' if is_call else 'нисходящий'} тренд.\n"
            f"RSI(14) = {rsi_val}. Stochastic в зоне {'роста' if is_call else 'падения'}.\n\n"
            f"💡 Простыми словами: на всех временных промежутках картина одинаковая — "
            f"{'покупатели' if is_call else 'продавцы'} контролируют рынок."
        ),
    ]
    return random.choice(templates)


ANALYSES: dict[str, list[str]] = {
    "otc": [],  # generated dynamically via _gen_otc_analysis()
    "exchange": [],  # generated dynamically via _gen_exchange_analysis()
    "elite": [],  # generated dynamically via _gen_exchange_analysis()
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
        analysis = _gen_exchange_analysis(direction)

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
        analysis = _gen_exchange_analysis(direction)

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
