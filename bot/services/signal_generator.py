import random
from datetime import datetime, timedelta, timezone

from database.models import Signal
from constants import get_expiration_label

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

LEGACY_EXPIRATIONS: dict[str, dict[str, list[str]]] = {
    "ru": {
        "otc": ["30 сек", "1 мин", "2 мин", "3 мин", "5 мин", "30 мин"],
        "exchange": ["2 мин", "3 мин", "5 мин", "30 мин"],
        "elite": ["2 мин", "3 мин", "5 мин", "30 мин"],
    },
    "uk": {
        "otc": ["30 сек", "1 хв", "2 хв", "3 хв", "5 хв", "30 хв"],
        "exchange": ["2 хв", "3 хв", "5 хв", "30 хв"],
        "elite": ["2 хв", "3 хв", "5 хв", "30 хв"],
    },
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


def _get_legacy_expirations(tier: str, locale: str = "ru") -> list[str]:
    """Return legacy expiration labels for a tier in the given locale."""
    loc = locale if locale in LEGACY_EXPIRATIONS else "ru"
    return LEGACY_EXPIRATIONS[loc].get(tier, LEGACY_EXPIRATIONS[loc]["otc"])


# ---------------------------------------------------------------------------
# Locale-aware analysis text helpers
# ---------------------------------------------------------------------------

_L: dict[str, dict[str, str]] = {
    "why_up": {"ru": "Почему ВВЕРХ", "uk": "Чому ВГОРУ"},
    "why_down": {"ru": "Почему ВНИЗ", "uk": "Чому ВНИЗ"},
    "simple": {"ru": "Простыми словами", "uk": "Простими словами"},
    "in_oversold": {
        "ru": "индикатор в зоне перепроданности, продавцы устали",
        "uk": "індикатор у зоні перепроданості, продавці втомилися",
    },
    "in_overbought": {
        "ru": "индикатор в зоне перекупленности, покупатели устали",
        "uk": "індикатор у зоні перекупленості, покупці втомилися",
    },
    "buyers_return": {"ru": "покупатели возвращаются", "uk": "покупці повертаються"},
    "sellers_control": {
        "ru": "продавцы берут контроль",
        "uk": "продавці беруть контроль",
    },
    "crossed": {"ru": "пересёк", "uk": "перетнув"},
    "crossed_f": {"ru": "пересекла", "uk": "перетнула"},
    "bounce_up_ball": {
        "ru": "и теперь наступает отскок вверх, как мячик от пола",
        "uk": "і тепер настає відскок вгору, як м'ячик від підлоги",
    },
    "golden_cross": {"ru": "золотой крест", "uk": "золотий хрест"},
    "dead_cross": {"ru": "мёртвый крест", "uk": "мертвий хрест"},
    "bullish_mood": {"ru": "подтверждает бычий настрой", "uk": "підтверджує бичачий настрій"},
    "bearish_mood": {"ru": "подтверждает медвежий настрой", "uk": "підтверджує ведмежий настрій"},
    "big_players_buy": {
        "ru": "крупные игроки заходят в покупки",
        "uk": "великі гравці заходять у покупки",
    },
    "big_players_sell": {
        "ru": "крупные игроки активно продают",
        "uk": "великі гравці активно продають",
    },
    "car_accelerate": {
        "ru": "как машина, которая начинает ускоряться. Направление — вверх",
        "uk": "як машина, що починає прискорюватися. Напрямок — вгору",
    },
    "car_brake": {
        "ru": "машина начинает тормозить и разворачиваться. Направление — вниз",
        "uk": "машина починає гальмувати і розвертатися. Напрямок — вниз",
    },
    "ball_floor_twice": {
        "ru": "мячик дважды ударился об пол. После второго удара он отскакивает сильнее — так и цена",
        "uk": "м'ячик двічі вдарився об підлогу. Після другого удару він відскакує сильніше — так і ціна",
    },
    "ceiling_twice": {
        "ru": "цена дважды «бьётся головой об потолок» и не может пробить. После второй попытки — падает",
        "uk": "ціна двічі «б'ється головою об стелю» і не може пробити. Після другої спроби — падає",
    },
    "bb_narrow": {"ru": "Bollinger Bands сузились", "uk": "Bollinger Bands звузились"},
    "spring_up": {
        "ru": "рынок «сжался как пружина» у нижней границы. Пружина разжимается — цена стреляет вверх",
        "uk": "ринок «стиснувся як пружина» біля нижньої межі. Пружина розтискається — ціна стріляє вгору",
    },
    "ceiling_returns": {
        "ru": "цена достигла «потолка» ценового коридора. Этот потолок редко пробивается — цена возвращается к середине",
        "uk": "ціна досягла «стелі» цінового коридору. Ця стеля рідко пробивається — ціна повертається до середини",
    },
    "fib_bounce_up": {
        "ru": "цена «отдохнула» после роста, откатилась до важного уровня и теперь готова продолжить движение вверх",
        "uk": "ціна «відпочила» після зростання, відкотилася до важливого рівня і тепер готова продовжити рух вгору",
    },
    "fib_bounce_down": {
        "ru": "после падения цена попыталась «подпрыгнуть», но добралась только до ключевого уровня и развернулась обратно вниз",
        "uk": "після падіння ціна спробувала «підстрибнути», але дісталася лише до ключового рівня і розвернулася назад вниз",
    },
    "pin_bar_up": {
        "ru": "свеча с длинным «хвостом» вниз — цена пыталась упасть, но покупатели не дали. Сигнал на рост",
        "uk": "свічка з довгим «хвостом» вниз — ціна намагалася впасти, але покупці не дали. Сигнал на зростання",
    },
    "shooting_star_down": {
        "ru": "длинный «хвост» вверху — цена пыталась вырасти, но её «прибили». Продавцы сильнее",
        "uk": "довгий «хвост» вгорі — ціна намагалася зрости, але її «прибили». Продавці сильніші",
    },
    "two_trend_up": {
        "ru": "два главных индикатора тренда одновременно говорят «ВВЕРХ». Когда они совпадают — сигнал сильный",
        "uk": "два головних індикатори тренду одночасно кажуть «ВГОРУ». Коли вони збігаються — сигнал сильний",
    },
    "two_trend_down": {
        "ru": "два индикатора тренда одновременно говорят «ВНИЗ». Двойное подтверждение = сильный сигнал",
        "uk": "два індикатори тренду одночасно кажуть «ВНИЗ». Подвійне підтвердження = сильний сигнал",
    },
    "real_growth": {
        "ru": "когда цена растёт и объём растёт вместе — это «настоящий» рост. Крупные деньги ставят на повышение",
        "uk": "коли ціна зростає і об'єм зростає разом — це «справжнє» зростання. Великі гроші ставлять на підвищення",
    },
    "real_fall": {
        "ru": "когда цена падает и объём растёт — это серьёзное падение. Крупные игроки активно продают",
        "uk": "коли ціна падає і об'єм зростає — це серйозне падіння. Великі гравці активно продають",
    },
    "morning_star": {
        "ru": "после падения появился «рассвет» — маленькая свеча, за ней сильная покупка. Разворот вверх",
        "uk": "після падіння з'явився «світанок» — маленька свічка, за нею сильна покупка. Розворот вгору",
    },
    "evening_star": {
        "ru": "после роста появился «закат» — покупатели потеряли силу, продавцы перехватили инициативу мощной красной свечой",
        "uk": "після зростання з'явився «захід» — покупці втратили силу, продавці перехопили ініціативу потужною червоною свічкою",
    },
    "divergence_up": {
        "ru": "цена ещё падает, но «внутренняя сила» уже растёт. Как машина, которая тормозит перед разворотом. Скоро поедет вверх",
        "uk": "ціна ще падає, але «внутрішня сила» вже зростає. Як машина, що гальмує перед розворотом. Скоро поїде вгору",
    },
    "divergence_down": {
        "ru": "цена ещё растёт, но «энергия» иссякает. Как мяч, подброшенный вверх — ещё летит, но замедляется перед падением",
        "uk": "ціна ще зростає, але «енергія» вичерпується. Як м'яч, підкинутий вгору — ще летить, але сповільнюється перед падінням",
    },
    "hammer_up": {
        "ru": "«молот» — цена сильно упала внутри свечи, но покупатели вернули её обратно. Они сильнее",
        "uk": "«молот» — ціна сильно впала всередині свічки, але покупці повернули її назад. Вони сильніші",
    },
    "hanging_man_down": {
        "ru": "после роста появилась подозрительная свеча — покупатели начали сомневаться. Предвестник разворота вниз",
        "uk": "після зростання з'явилася підозріла свічка — покупці почали сумніватися. Провісник розвороту вниз",
    },
    "asc_triangle": {
        "ru": "покупатели с каждым разом «поднимают планку». Они всё ближе к прорыву вверх — и скорее всего, прорвутся",
        "uk": "покупці щоразу «піднімають планку». Вони все ближче до прориву вгору — і швидше за все, прорвуться",
    },
    "desc_triangle": {
        "ru": "продавцы с каждым разом «опускают потолок». Рано или поздно цена пробьёт пол — и полетит вниз",
        "uk": "продавці щоразу «опускають стелю». Рано чи пізно ціна проб'є підлогу — і полетить вниз",
    },
    "three_soldiers": {
        "ru": "три зелёные свечи подряд, каждая больше предыдущей — покупатели набирают обороты. Тренд вверх сильный",
        "uk": "три зелені свічки поспіль, кожна більша за попередню — покупці набирають оберти. Тренд вгору сильний",
    },
    "three_crows": {
        "ru": "три красные свечи подряд, каждая больше предыдущей — продавцы набирают обороты. Падение сильное",
        "uk": "три червоні свічки поспіль, кожна більша за попередню — продавці набирають оберти. Падіння сильне",
    },
    "trampoline_up": {
        "ru": "цена «опёрлась» на среднюю, как на ступеньку, и оттолкнулась вверх. Тренд продолжается",
        "uk": "ціна «оперлася» на середню, як на сходинку, і відштовхнулася вгору. Тренд продовжується",
    },
    "ceiling_ma_down": {
        "ru": "цена попыталась «залезть» выше средней, но не смогла. Средняя давит сверху — путь вниз",
        "uk": "ціна спробувала «залізти» вище середньої, але не змогла. Середня тисне зверху — шлях вниз",
    },
    "highway_up": {
        "ru": "200-дневная средняя — «главная дорога». Цена пересекла её снизу вверх — выезд на трассу в правильном направлении",
        "uk": "200-денна середня — «головна дорога». Ціна перетнула її знизу вгору — виїзд на трасу у правильному напрямку",
    },
    "highway_down": {
        "ru": "200-дневная средняя — «главная дорога». Цена нырнула под неё — серьёзный сигнал на снижение",
        "uk": "200-денна середня — «головна дорога». Ціна пірнула під неї — серйозний сигнал на зниження",
    },
    # Exchange analysis
    "bullish": {"ru": "бычий", "uk": "бичачий"},
    "bearish": {"ru": "медвежий", "uk": "ведмежий"},
    "bullish_n": {"ru": "бычье", "uk": "бичаче"},
    "bearish_n": {"ru": "медвежье", "uk": "ведмеже"},
    "trend_confirmed": {"ru": "тренд подтверждён", "uk": "тренд підтверджений"},
    "up": {"ru": "вверх", "uk": "вгору"},
    "down": {"ru": "вниз", "uk": "вниз"},
    "growth": {"ru": "рост", "uk": "зростання"},
    "fall": {"ru": "падение", "uk": "падіння"},
    "volume_avg": {"ru": "от среднего", "uk": "від середнього"},
    "trend_strong": {
        "ru": "все основные индикаторы указывают в одну сторону",
        "uk": "всі основні індикатори вказують в один бік",
    },
    "fib_support_bounce": {
        "ru": "отскочила от поддержки",
        "uk": "відскочила від підтримки",
    },
    "fib_resistance_reject": {
        "ru": "отбилась от сопротивления",
        "uk": "відбилася від опору",
    },
    "confirms_growth": {"ru": "подтверждает рост", "uk": "підтверджує зростання"},
    "confirms_fall": {"ru": "подтверждает падение", "uk": "підтверджує падіння"},
    "volumes_grow_up": {
        "ru": "Объёмы растут при движении вверх",
        "uk": "Об'єми зростають при русі вгору",
    },
    "volumes_grow_down": {
        "ru": "Объёмы увеличиваются при движении вниз",
        "uk": "Об'єми збільшуються при русі вниз",
    },
    "floor_fib": {"ru": "пол", "uk": "підлога"},
    "ceiling_fib": {"ru": "потолок", "uk": "стеля"},
    "fib_simple_up": {
        "ru": "цена отскочила от важного уровня вверх",
        "uk": "ціна відскочила від важливого рівня вгору",
    },
    "fib_simple_down": {
        "ru": "цена не смогла пробить важный уровень и пошла вниз",
        "uk": "ціна не змогла пробити важливий рівень і пішла вниз",
    },
    "multi_tf_all_confirm": {
        "ru": "на всех временных промежутках картина одинаковая",
        "uk": "на всіх часових проміжках картина однакова",
    },
    "ascending": {"ru": "восходящий", "uk": "висхідний"},
    "descending": {"ru": "нисходящий", "uk": "низхідний"},
    "buyers_control": {"ru": "покупатели контролируют рынок", "uk": "покупці контролюють ринок"},
    "sellers_control_market": {"ru": "продавцы контролируют рынок", "uk": "продавці контролюють ринок"},
    "growth_zone": {"ru": "в зоне роста", "uk": "у зоні зростання"},
    "fall_zone": {"ru": "в зоне падения", "uk": "у зоні падіння"},
}


def _t(key: str, locale: str) -> str:
    """Quick lookup in the local translations dict."""
    entry = _L.get(key)
    if entry is None:
        return key
    return entry.get(locale, entry.get("ru", key))


def _gen_otc_analysis(direction: str, locale: str = "ru") -> str:
    """Generate detailed OTC analysis with beginner-friendly explanations."""
    rsi_val = round(random.uniform(18, 82), 1)
    stoch_k = round(random.uniform(10, 90), 1)
    stoch_d = round(stoch_k + random.uniform(-8, 8), 1)
    ma_fast = random.choice(["EMA(9)", "EMA(12)", "SMA(10)"])
    ma_slow = random.choice(["EMA(21)", "SMA(20)", "EMA(26)"])
    volume_pct = random.randint(5, 45)
    fib_level = random.choice(["23.6%", "38.2%", "50.0%", "61.8%", "78.6%"])

    L = _t  # shorthand
    why_up = L("why_up", locale)
    why_down = L("why_down", locale)
    simple = L("simple", locale)
    vol = "Объём" if locale == "ru" else "Об'єм"
    vol_grew = "Объём вырос на" if locale == "ru" else "Об'єм зріс на"
    vol_trade_grew = "Объём торгов вырос на" if locale == "ru" else "Об'єм торгів зріс на"
    no_overbought_vol = "без перекупленности. Объём растёт." if locale == "ru" else "без перекупленості. Об'єм зростає."
    no_oversold_vol = "без перепроданности. Объём растёт." if locale == "ru" else "без перепроданості. Об'єм зростає."

    call_templates = [
        (
            f"🟢 {why_up}:\n\n"
            f"RSI(14) = {rsi_val} — {L('in_oversold', locale)}. "
            f"{'Когда RSI низкий, цена часто разворачивается вверх.' if locale == 'ru' else 'Коли RSI низький, ціна часто розвертається вгору.'}\n\n"
            f"Stochastic (%K={stoch_k}) {L('crossed', locale)} %D {'снизу вверх' if locale == 'ru' else 'знизу вгору'} — {L('buyers_return', locale)}.\n\n"
            f"💡 {simple}: {'актив «перепродан» — слишком много людей продавали, ' if locale == 'ru' else 'актив «перепроданий» — занадто багато людей продавали, '}"
            f"{L('bounce_up_ball', locale)}."
        ),
        (
            f"🟢 {why_up}:\n\n"
            f"{ma_fast} {L('crossed_f', locale)} {ma_slow} {'снизу вверх' if locale == 'ru' else 'знизу вгору'} — «{L('golden_cross', locale)}». "
            f"{'Один из самых известных сигналов на покупку.' if locale == 'ru' else 'Один з найвідоміших сигналів на покупку.'}\n\n"
            f"RSI(14) = {rsi_val} — {L('bullish_mood', locale)}.\n"
            f"{vol_grew} +{volume_pct}% — {L('big_players_buy', locale)}.\n\n"
            f"💡 {simple}: {'быстрый тренд обгоняет медленный — ' if locale == 'ru' else 'швидкий тренд обганяє повільний — '}"
            f"{L('car_accelerate', locale)}."
        ),
        (
            f"🟢 {why_up}:\n\n"
            f"{'На графике «двойное дно» — цена дважды коснулась одного уровня и отскочила. Сильный сигнал разворота.' if locale == 'ru' else 'На графіку «подвійне дно» — ціна двічі торкнулася одного рівня і відскочила. Сильний сигнал розвороту.'}\n\n"
            f"RSI = {rsi_val}, Stochastic %K = {stoch_k} — {'оба индикатора растут' if locale == 'ru' else 'обидва індикатори зростають'}.\n\n"
            f"💡 {simple}: {L('ball_floor_twice', locale)}."
        ),
        (
            f"🟢 {why_up}:\n\n"
            f"{L('bb_narrow', locale)} — {'рынок «затих». После затишья обычно идёт резкий прорыв.' if locale == 'ru' else 'ринок «затих». Після затишшя зазвичай іде різкий прорив.'}\n"
            f"{'Цена у нижней границы канала — статистически отскакивает вверх.' if locale == 'ru' else 'Ціна біля нижньої межі каналу — статистично відскакує вгору.'}\n"
            f"RSI(14) = {rsi_val} — {'не перекуплен, запас для роста.' if locale == 'ru' else 'не перекуплений, запас для зростання.'}\n\n"
            f"💡 {simple}: {L('spring_up', locale)}."
        ),
        (
            f"🟢 {why_up}:\n\n"
            f"{'Цена откатилась к Фибоначчи' if locale == 'ru' else 'Ціна відкотилася до Фібоначчі'} {fib_level} {'и получила отскок. Этот уровень работает как «невидимая поддержка».' if locale == 'ru' else 'і отримала відскок. Цей рівень працює як «невидима підтримка».'}\n"
            f"MACD {'гистограмма растёт — импульс покупателей нарастает.' if locale == 'ru' else 'гістограма зростає — імпульс покупців наростає.'}\n"
            f"{vol}: +{volume_pct}% {L('volume_avg', locale)}.\n\n"
            f"💡 {simple}: {L('fib_bounce_up', locale)}."
        ),
        (
            f"🟢 {why_up}:\n\n"
            f"{'На графике «пин-бар» с длинной нижней тенью — покупатели агрессивно выкупают снижение.' if locale == 'ru' else 'На графіку «пін-бар» з довгою нижньою тінню — покупці агресивно викуповують зниження.'}\n"
            f"RSI(14) = {rsi_val} — {'разворачивается из перепроданности.' if locale == 'ru' else 'розвертається з перепроданості.'}\n"
            f"Stochastic: %K={stoch_k}, %D={stoch_d} — {L('bullish_n', locale)} {'пересечение' if locale == 'ru' else 'перетинання'}.\n\n"
            f"💡 {simple}: {L('pin_bar_up', locale)}."
        ),
        (
            f"🟢 {why_up}:\n\n"
            f"MACD {L('crossed', locale)}{'ся' if locale == 'ru' else ''} {'в бычьем направлении. Начало восходящего тренда.' if locale == 'ru' else 'у бичачому напрямку. Початок висхідного тренду.'}\n"
            f"{ma_fast} > {ma_slow} — {'тренд бычий' if locale == 'ru' else 'тренд бичачий'}.\n"
            f"RSI = {rsi_val} — {L('growth_zone', locale)}.\n\n"
            f"💡 {simple}: {L('two_trend_up', locale)}."
        ),
        (
            f"🟢 {why_up}:\n\n"
            f"{vol_trade_grew} {volume_pct}% {'при движении вверх — рост подтверждён реальными деньгами.' if locale == 'ru' else 'при русі вгору — зростання підтверджене реальними грошима.'}\n"
            f"RSI(14) = {rsi_val} — {'здоровый бычий импульс.' if locale == 'ru' else 'здоровий бичачий імпульс.'}\n\n"
            f"💡 {simple}: {L('real_growth', locale)}."
        ),
        (
            f"🟢 {why_up}:\n\n"
            f"{'«Утренняя звезда» — три свечи: красная → маленькая → большая зелёная. Классический разворот.' if locale == 'ru' else '«Ранкова зірка» — три свічки: червона → маленька → велика зелена. Класичний розворот.'}\n"
            f"RSI = {rsi_val} — {'выходит из перепроданности.' if locale == 'ru' else 'виходить з перепроданості.'}\n\n"
            f"💡 {simple}: {L('morning_star', locale)}."
        ),
        (
            f"🟢 {why_up}:\n\n"
            f"{'Дивергенция RSI — цена делает новый минимум, а RSI растёт. Падение теряет силу изнутри.' if locale == 'ru' else 'Дивергенція RSI — ціна робить новий мінімум, а RSI зростає. Падіння втрачає силу зсередини.'}\n"
            f"RSI = {rsi_val}, Stochastic = {stoch_k}.\n\n"
            f"💡 {simple}: {L('divergence_up', locale)}."
        ),
        (
            f"🟢 {why_up}:\n\n"
            f"{'Свеча «молот» — маленькое тело, длинная нижняя тень на уровне поддержки.' if locale == 'ru' else 'Свічка «молот» — маленьке тіло, довга нижня тінь на рівні підтримки.'}\n"
            f"RSI(14) = {rsi_val} — {'подтверждает разворот.' if locale == 'ru' else 'підтверджує розворот.'}\n"
            f"{vol}: +{volume_pct}% — {'покупатели вступили в игру.' if locale == 'ru' else 'покупці вступили в гру.'}\n\n"
            f"💡 {simple}: {L('hammer_up', locale)}."
        ),
        (
            f"🟢 {why_up}:\n\n"
            f"{'Восходящий треугольник — минимумы растут, приближаясь к сопротивлению. Пробой вверх наиболее вероятен.' if locale == 'ru' else 'Висхідний трикутник — мінімуми зростають, наближаючись до опору. Пробій вгору найбільш ймовірний.'}\n"
            f"RSI = {rsi_val} — {'растёт' if locale == 'ru' else 'зростає'}. {ma_fast} {'направлена вверх' if locale == 'ru' else 'спрямована вгору'}.\n\n"
            f"💡 {simple}: {L('asc_triangle', locale)}."
        ),
        (
            f"🟢 {why_up}:\n\n"
            f"{'Три белых солдата — три зелёные свечи подряд с увеличивающимся телом. Сильнейший бычий паттерн.' if locale == 'ru' else 'Три білих солдати — три зелені свічки поспіль зі збільшуваним тілом. Найсильніший бичачий патерн.'}\n"
            f"RSI = {rsi_val} — {no_overbought_vol}\n\n"
            f"💡 {simple}: {L('three_soldiers', locale)}."
        ),
        (
            f"🟢 {why_up}:\n\n"
            f"{'Цена закрепилась выше' if locale == 'ru' else 'Ціна закріпилася вище'} {ma_fast} {'после коррекции — скользящая работает как «трамплин».' if locale == 'ru' else 'після корекції — ковзна працює як «трамплін».'}\n"
            f"RSI(14) = {rsi_val}. Fibonacci {fib_level} {'отработал как поддержка.' if locale == 'ru' else 'відпрацював як підтримка.'}\n\n"
            f"💡 {simple}: {L('trampoline_up', locale)}."
        ),
        (
            f"🟢 {why_up}:\n\n"
            f"{'Цена пробила 200-периодную среднюю снизу вверх — один из самых сильных долгосрочных сигналов на покупку.' if locale == 'ru' else 'Ціна пробила 200-періодну середню знизу вгору — один з найсильніших довгострокових сигналів на покупку.'}\n"
            f"RSI(14) = {rsi_val}. Stochastic: %K={stoch_k} > %D={stoch_d}.\n\n"
            f"💡 {simple}: {L('highway_up', locale)}."
        ),
    ]

    put_templates = [
        (
            f"🔴 {why_down}:\n\n"
            f"RSI(14) = {rsi_val} — {L('in_overbought', locale)}. "
            f"{'Когда RSI высокий, цена часто разворачивается вниз.' if locale == 'ru' else 'Коли RSI високий, ціна часто розвертається вниз.'}\n\n"
            f"Stochastic (%K={stoch_k}) {L('crossed', locale)} %D {'сверху вниз' if locale == 'ru' else 'зверху вниз'} — {L('sellers_control', locale)}.\n\n"
            f"💡 {simple}: {'актив «перекуплен» — слишком много людей покупали, теперь откат вниз. Как маятник, качнувшийся слишком далеко.' if locale == 'ru' else 'актив «перекуплений» — занадто багато людей купували, тепер відкат вниз. Як маятник, що хитнувся занадто далеко.'}"
        ),
        (
            f"🔴 {why_down}:\n\n"
            f"{ma_fast} {L('crossed_f', locale)} {ma_slow} {'сверху вниз' if locale == 'ru' else 'зверху вниз'} — «{L('dead_cross', locale)}». "
            f"{'Известный сигнал на продажу.' if locale == 'ru' else 'Відомий сигнал на продаж.'}\n\n"
            f"RSI(14) = {rsi_val} — {L('bearish_mood', locale)}.\n"
            f"{vol_grew} +{volume_pct}% — {'крупные фиксируют прибыль.' if locale == 'ru' else 'великі фіксують прибуток.'}\n\n"
            f"💡 {simple}: {'быстрый тренд «нырнул» под медленный — ' if locale == 'ru' else 'швидкий тренд «пірнув» під повільний — '}"
            f"{L('car_brake', locale)}."
        ),
        (
            f"🔴 {why_down}:\n\n"
            f"{'«Двойная вершина» — цена дважды не смогла пробить один уровень. Мощный разворотный паттерн вниз.' if locale == 'ru' else '«Подвійна вершина» — ціна двічі не змогла пробити один рівень. Потужний розворотний патерн вниз.'}\n\n"
            f"RSI = {rsi_val}, Stochastic %K = {stoch_k} — {'оба снижаются' if locale == 'ru' else 'обидва знижуються'}.\n\n"
            f"💡 {simple}: {L('ceiling_twice', locale)}."
        ),
        (
            f"🔴 {why_down}:\n\n"
            f"Bollinger Bands {'расширяются вниз — волатильность растёт в пользу продавцов.' if locale == 'ru' else 'розширюються вниз — волатильність зростає на користь продавців.'}\n"
            f"{'Цена у верхней границы канала — отскок вниз вероятен.' if locale == 'ru' else 'Ціна біля верхньої межі каналу — відскок вниз ймовірний.'}\n"
            f"RSI(14) = {rsi_val} — {'приближается к перекупленности.' if locale == 'ru' else 'наближається до перекупленості.'}\n\n"
            f"💡 {simple}: {L('ceiling_returns', locale)}."
        ),
        (
            f"🔴 {why_down}:\n\n"
            f"{'Цена откатилась вверх к Фибоначчи' if locale == 'ru' else 'Ціна відкотилася вгору до Фібоначчі'} {fib_level} {'и получила отбой. Коррекция завершена — нисходящий тренд продолжается.' if locale == 'ru' else 'і отримала відбій. Корекція завершена — низхідний тренд продовжується.'}\n"
            f"MACD {'гистограмма снижается' if locale == 'ru' else 'гістограма знижується'}. {vol}: +{volume_pct}%.\n\n"
            f"💡 {simple}: {L('fib_bounce_down', locale)}."
        ),
        (
            f"🔴 {why_down}:\n\n"
            f"{'«Падающая звезда» — свеча с длинной верхней тенью. Покупатели пытались, но продавцы вернули цену.' if locale == 'ru' else '«Падаюча зірка» — свічка з довгою верхньою тінню. Покупці намагалися, але продавці повернули ціну.'}\n"
            f"RSI(14) = {rsi_val} — {'разворот из перекупленности.' if locale == 'ru' else 'розворот з перекупленості.'}\n"
            f"Stochastic: %K={stoch_k}, %D={stoch_d} — {L('bearish_n', locale)} {'пересечение' if locale == 'ru' else 'перетинання'}.\n\n"
            f"💡 {simple}: {L('shooting_star_down', locale)}."
        ),
        (
            f"🔴 {why_down}:\n\n"
            f"MACD {L('crossed', locale)}{'ся' if locale == 'ru' else ''} {'в медвежьем направлении. Нисходящий тренд набирает силу.' if locale == 'ru' else 'у ведмежому напрямку. Низхідний тренд набирає сили.'}\n"
            f"{ma_fast} < {ma_slow} — {'подтверждение' if locale == 'ru' else 'підтвердження'}.\n"
            f"RSI = {rsi_val} — {'давление продавцов' if locale == 'ru' else 'тиск продавців'}.\n\n"
            f"💡 {simple}: {L('two_trend_down', locale)}."
        ),
        (
            f"🔴 {why_down}:\n\n"
            f"{vol_grew} {volume_pct}% {'при движении вниз — падение подтверждено реальными деньгами.' if locale == 'ru' else 'при русі вниз — падіння підтверджене реальними грошима.'}\n"
            f"RSI(14) = {rsi_val} — {L('bearish', locale)} {'импульс' if locale == 'ru' else 'імпульс'}.\n\n"
            f"💡 {simple}: {L('real_fall', locale)}."
        ),
        (
            f"🔴 {why_down}:\n\n"
            f"{'«Вечерняя звезда» — три свечи: зелёная → маленькая → большая красная. Классический разворот вниз.' if locale == 'ru' else '«Вечірня зірка» — три свічки: зелена → маленька → велика червона. Класичний розворот вниз.'}\n"
            f"RSI = {rsi_val} — {'снижается' if locale == 'ru' else 'знижується'}. Stochastic: %K={stoch_k} ↓.\n\n"
            f"💡 {simple}: {L('evening_star', locale)}."
        ),
        (
            f"🔴 {why_down}:\n\n"
            f"{'Дивергенция RSI — цена делает новый максимум, а RSI падает. Рост теряет силу изнутри.' if locale == 'ru' else 'Дивергенція RSI — ціна робить новий максимум, а RSI падає. Зростання втрачає силу зсередини.'}\n"
            f"RSI = {rsi_val}, Stochastic = {stoch_k}.\n\n"
            f"💡 {simple}: {L('divergence_down', locale)}."
        ),
        (
            f"🔴 {why_down}:\n\n"
            f"{'«Повешенный» — свеча с маленьким телом и длинной нижней тенью после роста.' if locale == 'ru' else '«Повішений» — свічка з маленьким тілом і довгою нижньою тінню після зростання.'}\n"
            f"RSI(14) = {rsi_val} — {'ослабление покупателей.' if locale == 'ru' else 'ослаблення покупців.'}\n"
            f"{vol}: +{volume_pct}% — {'фиксация прибыли.' if locale == 'ru' else 'фіксація прибутку.'}\n\n"
            f"💡 {simple}: {L('hanging_man_down', locale)}."
        ),
        (
            f"🔴 {why_down}:\n\n"
            f"{'Нисходящий треугольник — максимумы снижаются к горизонтальной поддержке. Пробой вниз наиболее вероятен.' if locale == 'ru' else 'Низхідний трикутник — максимуми знижуються до горизонтальної підтримки. Пробій вниз найбільш ймовірний.'}\n"
            f"RSI = {rsi_val} — {'падает' if locale == 'ru' else 'падає'}. {ma_fast} {'направлена вниз' if locale == 'ru' else 'спрямована вниз'}.\n\n"
            f"💡 {simple}: {L('desc_triangle', locale)}."
        ),
        (
            f"🔴 {why_down}:\n\n"
            f"{'Три чёрных вороны — три красные свечи подряд с увеличивающимся телом. Мощнейший медвежий паттерн.' if locale == 'ru' else 'Три чорні ворони — три червоні свічки поспіль зі збільшуваним тілом. Найпотужніший ведмежий патерн.'}\n"
            f"RSI = {rsi_val} — {no_oversold_vol}\n\n"
            f"💡 {simple}: {L('three_crows', locale)}."
        ),
        (
            f"🔴 {why_down}:\n\n"
            f"{'Цена не удержалась выше' if locale == 'ru' else 'Ціна не втрималася вище'} {ma_fast} — {'скользящая стала «потолком».' if locale == 'ru' else 'ковзна стала «стелею».'}\n"
            f"RSI(14) = {rsi_val}. Fibonacci {fib_level} {'отработал как сопротивление.' if locale == 'ru' else 'відпрацював як опір.'}\n\n"
            f"💡 {simple}: {L('ceiling_ma_down', locale)}."
        ),
        (
            f"🔴 {why_down}:\n\n"
            f"{'Цена пробила 200-периодную среднюю сверху вниз — сильнейший долгосрочный медвежий сигнал.' if locale == 'ru' else 'Ціна пробила 200-періодну середню зверху вниз — найсильніший довгостроковий ведмежий сигнал.'}\n"
            f"RSI(14) = {rsi_val}. Stochastic: %K={stoch_k} < %D={stoch_d}.\n\n"
            f"💡 {simple}: {L('highway_down', locale)}."
        ),
    ]

    if direction == "CALL":
        return random.choice(call_templates)
    return random.choice(put_templates)


def _gen_exchange_analysis(direction: str, locale: str = "ru") -> str:
    """Generate detailed exchange analysis with beginner-friendly explanations."""
    rsi_val = round(random.uniform(25, 75), 1)
    ma_fast = random.choice(["EMA(9)", "EMA(12)", "SMA(10)"])
    ma_slow = random.choice(["EMA(21)", "SMA(20)", "EMA(26)"])
    volume_pct = random.randint(5, 40)
    fib_level = random.choice(["38.2%", "50.0%", "61.8%"])
    is_call = direction == "CALL"

    L = _t  # shorthand
    vol = "Объём" if locale == "ru" else "Об'єм"
    why = L("why_up", locale) if is_call else L("why_down", locale)
    simple = L("simple", locale)
    icon = "🟢" if is_call else "🔴"
    impulse = L("bullish", locale) if is_call else L("bearish", locale)
    impulse_n = L("bullish_n", locale) if is_call else L("bearish_n", locale)
    dir_label = L("up", locale) if is_call else L("down", locale)
    templates = [
        (
            f"{icon} {why}:\n\n"
            f"RSI(14) = {rsi_val} — {impulse} {'импульс' if locale == 'ru' else 'імпульс'}.\n"
            f"{ma_fast} {'>' if is_call else '<'} {ma_slow} — {L('trend_confirmed', locale)}.\n"
            f"MACD: {impulse_n} {'пересечение на H1' if locale == 'ru' else 'перетинання на H1'}.\n"
            f"{vol}: +{volume_pct}% {L('volume_avg', locale)}.\n\n"
            f"💡 {simple}: {L('trend_strong', locale)} — "
            f"{dir_label}. {'Тренд сильный.' if locale == 'ru' else 'Тренд сильний.'}"
        ),
        (
            f"{icon} {why}:\n\n"
            f"Fibonacci {fib_level}: {'цена' if locale == 'ru' else 'ціна'} {L('fib_support_bounce', locale) if is_call else L('fib_resistance_reject', locale)}.\n"
            f"RSI = {rsi_val} — {L('confirms_growth', locale) if is_call else L('confirms_fall', locale)}.\n"
            f"{L('volumes_grow_up', locale) if is_call else L('volumes_grow_down', locale)}.\n\n"
            f"💡 {simple}: {L('fib_simple_up', locale) if is_call else L('fib_simple_down', locale)}. "
            f"{'Уровень Фибоначчи работает как' if locale == 'ru' else 'Рівень Фібоначчі працює як'} «{L('floor_fib', locale) if is_call else L('ceiling_fib', locale)}»."
        ),
        (
            f"{icon} {why}:\n\n"
            f"{'Мультитаймфреймовый анализ' if locale == 'ru' else 'Мультитаймфреймовий аналіз'}: M5, M15, H1 — {'все подтверждают' if locale == 'ru' else 'всі підтверджують'} "
            f"{L('ascending', locale) if is_call else L('descending', locale)} {'тренд' if locale == 'ru' else 'тренд'}.\n"
            f"RSI(14) = {rsi_val}. Stochastic {L('growth_zone', locale) if is_call else L('fall_zone', locale)}.\n\n"
            f"💡 {simple}: {L('multi_tf_all_confirm', locale)} — "
            f"{L('buyers_control', locale) if is_call else L('sellers_control_market', locale)}."
        ),
    ]
    return random.choice(templates)


ANALYSES: dict[str, list[str]] = {
    "otc": [],  # generated dynamically via _gen_otc_analysis()
    "exchange": [],  # generated dynamically via _gen_exchange_analysis()
    "elite": [],  # generated dynamically via _gen_exchange_analysis()
}


def generate_signal(tier: str = "otc", locale: str = "ru") -> Signal:
    """Generate a random signal (legacy, no user choice)."""
    if tier == "otc":
        pair = random.choice(ALL_OTC_PAIRS)
    else:
        pair = random.choice(CURRENCY_PAIRS)

    direction = random.choice(DIRECTIONS)
    expirations = _get_legacy_expirations(tier, locale)
    expiration = random.choice(expirations)
    conf_min, conf_max = CONFIDENCE_RANGES.get(tier, (73, 88))
    confidence = random.randint(conf_min, conf_max)
    if tier == "otc":
        analysis = _gen_otc_analysis(direction, locale)
    else:
        analysis = _gen_exchange_analysis(direction, locale)

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
    locale: str = "ru",
) -> Signal:
    """Generate a signal for a specific user-chosen pair and expiration."""
    direction = random.choice(DIRECTIONS)
    conf_min, conf_max = CONFIDENCE_RANGES.get(tier, (73, 88))
    confidence = random.randint(conf_min, conf_max)
    expiration_label = get_expiration_label(expiration_code, locale)
    if tier == "otc":
        analysis = _gen_otc_analysis(direction, locale)
    else:
        analysis = _gen_exchange_analysis(direction, locale)

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
