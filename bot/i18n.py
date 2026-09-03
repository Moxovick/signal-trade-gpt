"""Bot i18n — dictionary-based translations (ru/uk).

Usage:
    from i18n import t
    text = t("start.welcome", locale=user_locale, first_name="Иван")

Keys use flat dot-separated namespaces:
    start.*         — /start handler strings
    help.*          — /help strings
    menu.*          — main-menu button labels
    keyboard.*      — all keyboard / inline button labels
    signal.*        — signal flow strings
    signals.*       — signal content / analysis
    link.*          — /link + FSM strings
    onboarding.*    — onboarding flow
    stats.*         — /stats / /profile / /tier strings
    ref.*           — referral program strings
    achievements.*  — achievement titles and descriptions
    admin.*         — admin-only strings
    tier.*          — tier names and descriptions
    formatter.*     — signal caption strings
    errors.*        — generic error messages
    calc.*          — /calc strings
    leaderboard.*   — /leaderboard strings
    notifications.* — notification toggle strings
    common.*        — shared/reusable strings
"""
from __future__ import annotations

from typing import Literal

Locale = Literal["ru", "uk"]
DEFAULT_LOCALE: Locale = "ru"


# ── Russian strings ────────────────────────────────────────────────────────────

_RU: dict[str, str] = {

    # ── keyboard / persistent menu buttons ──────────────────────────────────
    "keyboard.get_signal": "🎯 Получить сигнал",
    "keyboard.link_id": "🔗 Привязать ID",
    "keyboard.referrals": "👥 Рефералы",
    "keyboard.help": "❔ Помощь",
    "keyboard.leaderboard": "🏆 Лидерборд",
    "keyboard.profile": "👤 Профиль",
    "keyboard.stats": "📈 Статистика",
    "keyboard.settings": "⚙️ Настройки",
    "keyboard.placeholder": "Выбери действие…",
    # inline buttons
    "keyboard.open_pocket_option": "💎 Открыть PocketOption",
    "keyboard.open_app": "📱 Открыть приложение",
    "keyboard.win": "✅ Win",
    "keyboard.loss": "❌ Loss",
    "keyboard.another_signal": "🎯 Ещё сигнал",
    "keyboard.share_link": "📤 Поделиться ссылкой",
    "keyboard.register_po": "🚀 Регистрация в PocketOption",
    "keyboard.already_registered_enter_id": "✏️ Я уже зарегистрирован — ввести ID",
    "keyboard.back": "⬅️ Назад",
    # onboarding inline
    "keyboard.no_account": "Нет аккаунта",
    "keyboard.has_account": "Есть аккаунт",
    "keyboard.register_on_site": "📋 Зарегистрироваться на сайте",
    "keyboard.open_pocket_option_diamond": "💎 Открыть PocketOption",
    "keyboard.done_enter_id": "✅ Готово — ввести Trader ID",
    "keyboard.create_new_po": "💎 Создать новый аккаунт PocketOption",
    "keyboard.register_po_full": "🚀 Зарегистрироваться в PocketOption",
    "keyboard.enter_another_id": "🔄 Ввести другой ID",
    "keyboard.cancel": "❌ Отменить",
    "keyboard.open_app_menu": "Открыть приложение",

    # ── tier names ────────────────────────────────────────────────────────────
    "tier.free": "Free",
    "tier.basic": "Basic",
    "tier.pro": "Pro",
    "tier.free_desc": "OTC-сигналы, 3/день",
    "tier.basic_desc": "OTC + биржа, 10/день",
    "tier.pro_desc": "всё безлимитно + Elite",
    "tier.unlimited": "безлимит",
    "tier.limit_per_day": "{limit}/день",
    "tier.max_reached": "🏆 Максимальный уровень достигнут!",
    "tier.distance_to_next": "До {next_name} осталось: ${needed:.0f}",
    "tier.per_day": "день",
    "tier.upgrade_message": (
        "<b>🎉 Уровень разблокирован: {name}!</b>\n"
        "\n"
        "Депозит на PocketOption: <b>${deposit}</b>\n"
        "\n"
        "Доступные сигналы: <b>{signal_access}</b>\n"
        "Лимит: <b>{limit_text}</b>\n"
        "\n"
        "Нажми «🎯 Получить сигнал» в меню, чтобы запросить сигнал."
    ),

    # ── common / shared ───────────────────────────────────────────────────────
    "common.trader": "Трейдер",
    "common.not_linked": "не привязан",
    "common.unlimited": "безлимит",
    "common.per_day": "/день",
    "common.start_first": "Сначала нажми /start.",
    "common.start_first_alt": "Сначала /start.",
    "common.write_start": "Напиши /start чтобы начать.",
    "common.cancelled": "Отменено.",
    "common.error_try_later": "Произошла ошибка. Попробуй позже.",
    "common.disclaimer": (
        "<i>Не финансовый совет. Бинарные опционы — высокий риск.</i>"
    ),
    "common.disclaimer_full": (
        "<i>SpaceSignal не является финансовым советником. "
        "Все сигналы предоставляются в информационных целях. "
        "Торговля бинарными опционами сопряжена с высоким риском потери средств.</i>"
    ),

    # ── start handler ────────────────────────────────────────────────────────
    "start.welcome": (
        "Привет, <b>{first_name}</b>! 👋\n"
        "\n"
        "<b>SpaceSignal</b> — AI-сигналы для PocketOption.\n"
        "Доступ открывается регистрацией, а не подпиской.\n"
        "\n"
        "<b>Как начать:</b>\n"
        "  1. Открой счёт PocketOption по нашей ссылке (/link)\n"
        "  2. Привяжи свой Trader ID командой /link\n"
        "  3. Нажми «🎯 Получить сигнал» — и получи первый сигнал\n"
        "\n"
        "<b>Уровни доступа:</b>\n"
        "  • <b>Free</b> — OTC-сигналы, 3/день\n"
        "  • <b>Basic</b> (депозит ≥ $20) — OTC + биржа, 10/день\n"
        "  • <b>Pro</b> (депозит ≥ $100) — всё безлимитно + Elite\n"
        "\n"
        "<b>Реф-ссылка</b> (5% с FTD каждого приглашённого):\n"
        "<code>{ref_link}</code>\n"
        "\n"
        "<i>Не финансовый совет. Бинарные опционы — высокий риск.</i>"
    ),
    "start.returning_with_po": (
        "С возвращением, <b>{first_name}</b>! 👋\n\n"
        "Уровень: <b>{tier_name}</b>\n"
        "PocketOption ID: <code>{po_trader_id}</code>\n\n"
        "Нажми «🎯 Получить сигнал» в меню."
    ),
    "start.returning_no_po": (
        "С возвращением, <b>{first_name}</b>! 👋\n\n"
        "Уровень: <b>{tier_name}</b>\n\n"
        "Привяжи PocketOption ID командой /link чтобы открыть сигналы.\n"
        "Нажми «🎯 Получить сигнал» в меню."
    ),
    "start.menu_active": "Меню активно — пользуйся кнопками снизу 👇",
    # link token redeem
    "start.link_not_configured": (
        "Привязка временно недоступна — связь с сайтом не настроена. "
        "Сообщи админу."
    ),
    "start.link_expired": (
        "⏰ Ссылка для привязки истекла. Запроси новую на сайте "
        "(нажми «Привязать Telegram» ещё раз)."
    ),
    "start.link_telegram_taken": (
        "⚠️ Этот Telegram уже привязан к другому аккаунту на сайте."
    ),
    "start.link_already_used": "Эта ссылка уже использована. Запроси новую на сайте.",
    "start.link_server_error": (
        "Не удалось привязать аккаунт (сервер вернул ошибку). "
        "Попробуй ещё раз позже."
    ),
    "start.link_connection_error": (
        "Не удалось связаться с сайтом для привязки. Попробуй ещё раз позже."
    ),
    "start.link_ok": (
        "✅ Telegram привязан к твоему аккаунту на сайте!\n\n"
        "Бот автоматически подтянет данные аккаунта в течение минуты.\n"
        "Нажми /start чтобы начать пользоваться ботом."
    ),
    "start.link_unknown_token": "Эта ссылка недействительна или уже использована.",
    "start.link_already_used_2": "Эта ссылка уже была использована.",
    "start.link_expired_2": "Срок действия ссылки истёк. Запроси новую на сайте.",
    "start.link_telegram_taken_2": "Этот Telegram уже привязан к другому аккаунту на сайте.",
    "start.link_bad_secret": "Внутренняя ошибка авторизации (BOT_SYNC_SECRET).",
    "start.link_not_configured_2": "Привязка не настроена на сервере.",
    "start.link_po_required": (
        "Для входа через Telegram сначала нужно зарегистрироваться на сайте — "
        "там потребуется PocketOption Trader ID и подтверждённый депозит."
    ),
    "start.link_fallback_error": "⚠️ Не удалось привязать. Попробуй позже.",

    # ── help ─────────────────────────────────────────────────────────────────
    "help.title": "<b>SpaceSignal — справка</b>",
    "help.commands_title": "<b>Основные команды:</b>",
    "help.cmd_start": "/start — запуск бота и онбординг",
    "help.cmd_signal": "/signal — получить торговый сигнал",
    "help.cmd_ref": "/ref — реферальная программа + ссылка",
    "help.cmd_calc": "/calc — калькулятор размера сделки",
    "help.cmd_leaderboard": "/leaderboard — топ-10 трейдеров",
    "help.cmd_cancel": "/cancel — отменить текущее действие",
    "help.how_it_works_title": "<b>Как это работает:</b>",
    "help.how_it_works": (
        "1. Зарегистрируйся на PocketOption по нашей ссылке\n"
        "2. Привяжи свой Trader ID через /start\n"
        "3. Нажми «🎯 Получить сигнал» в меню"
    ),
    "help.tiers_title": "<b>Уровни:</b>",
    "help.tier_free": "• Free — 3 OTC-сигнала/день",
    "help.tier_basic": "• Basic ($20+) — 10 сигналов/день",
    "help.tier_pro": "• Pro ($100+) — безлимит",
    "help.footer": (
        "<i>Не финансовый совет. Торговля бинарными опционами "
        "сопряжена с высоким риском.</i>"
    ),
    "help.full": (
        "<b>SpaceSignal — справка</b>\n"
        "\n"
        "<b>Основные команды:</b>\n"
        "/start — запуск бота и онбординг\n"
        "/signal — получить торговый сигнал\n"
        "/ref — реферальная программа + ссылка\n"
        "/calc — калькулятор размера сделки\n"
        "/leaderboard — топ-10 трейдеров\n"
        "/cancel — отменить текущее действие\n"
        "\n"
        "<b>Как это работает:</b>\n"
        "1. Зарегистрируйся на PocketOption по нашей ссылке\n"
        "2. Привяжи свой Trader ID через /start\n"
        "3. Нажми «🎯 Получить сигнал» в меню\n"
        "\n"
        "<b>Уровни:</b>\n"
        "• Free — 3 OTC-сигнала/день\n"
        "• Basic ($20+) — 10 сигналов/день\n"
        "• Pro ($100+) — безлимит\n"
        "\n"
        "<i>Не финансовый совет. Торговля бинарными опционами "
        "сопряжена с высоким риском.</i>"
    ),

    # menu button help page
    "help.commands_header": "<b>❔ Справка по командам</b>",
    "help.spacesignal_footer": "<i>SpaceSignal — AI-сигналы для PocketOption.</i>",
    # individual help command descriptions
    "help.cmd_start_desc": "запуск и онбординг",
    "help.cmd_signal_desc": "получить сигнал",
    "help.cmd_ref_desc": "реферальная ссылка + QR",
    "help.cmd_leaderboard_desc": "топ-10 трейдеров",
    "help.cmd_calc_desc": "калькулятор сделки",
    "help.cmd_cancel_desc": "отменить текущее действие",
    "help.cmd_help_desc": "эта справка",

    # ── signal flow ──────────────────────────────────────────────────────────
    "signal.choose_type": "📊 <b>Выбери тип сигнала:</b>",
    "signal.choose_category": "📂 <b>Выбери категорию:</b>",
    "signal.choose_pair": "🎯 <b>Выбери пару:</b>",
    "signal.choose_expiration": "⏱ <b>Выбери экспирацию:</b>",
    "signal.pair_payout": "🎯 <b>{pair_name}</b>  ·  Выплата: <b>+{payout}%</b>",
    "signal.no_pairs_in_category": "Нет доступных пар в этой категории.",
    "signal.search_pair": "🔍 Поиск пары",
    "signal.search_prompt": "Введите название пары (например: EUR, BTC, Gold):",
    "signal.no_search_results": "❌ Ничего не найдено. Попробуйте другой запрос.",
    "signal.search_results_count": "🔍 Найдено: {count}",
    "signal.pair_not_found": "Пара не найдена.",
    "signal.generating": "Подожди — предыдущий сигнал ещё генерируется.",
    "signal.generation_error": "Произошла ошибка при генерации сигнала. Попробуй позже.",
    "signal.unavailable_tier": "⛔ Этот тип сигналов недоступен на твоём уровне.",
    "signal.need_po_account": (
        "⚠️ Для получения сигналов нужен привязанный PocketOption аккаунт.\n\n"
        "Нажми /start чтобы пройти регистрацию."
    ),
    "signal.need_po_account_with_link": (
        "⚠️ Для получения сигналов нужен привязанный PocketOption аккаунт.\n\n"
        "Нажми /start чтобы пройти регистрацию и привязать Trader ID."
    ),
    "signal.register_first": "Сначала нажми /start, чтобы зарегистрироваться.",
    "signal.limit_exceeded_upgrade": (
        "Лимит исчерпан ({used}/{limit} сигналов сегодня).\n\n"
        "Повысь тариф до <b>{next_tier}</b> для большего количества сигналов."
    ),
    "signal.limit_exceeded": (
        "Лимит исчерпан ({used}/{limit} сигналов сегодня).\n"
        "Следующий сигнал будет доступен через несколько часов."
    ),
    "signal.user_not_found_platform": "Пользователь не найден на платформе.",
    "signal.user_not_found_register": (
        "Пользователь не найден на платформе. Зарегистрируйся на сайте."
    ),
    "signal.result_win": "✅ Записано как WIN",
    "signal.result_loss": "❌ Записано как LOSS",

    # analysis animation steps
    "signal.analyzing": "Анализируем рынок...",
    "signal.checking_indicators": "Проверяем индикаторы...",
    "signal.evaluating_entry": "Оцениваем точку входа...",
    "signal.calculating_probability": "Рассчитываем вероятность...",
    "signal.forming_signal": "Формируем сигнал...",

    # ── signal content (formatter) ────────────────────────────────────────────
    "formatter.otc_header": "<b>OTC СИГНАЛ</b>",
    "formatter.exchange_header": "<b>БИРЖЕВОЙ СИГНАЛ</b>",
    "formatter.elite_header": "<b>ELITE СИГНАЛ</b>",
    "formatter.accuracy": "Точность: <b>{confidence}%</b>  {bar}",
    "formatter.payout": "Выплата: <b>+{pct}%</b>",
    "formatter.entry_time": "Время входа: <b>{entry_time}</b>",
    "formatter.analysis": "<b>Анализ:</b>\n<i>{analysis}</i>",
    "formatter.analysis_inline": "<b>Анализ:</b> <i>{analysis}</i>",
    "formatter.volume": "Объём: 1–3% депозита",
    "formatter.entry_price": "Вход: <code>{price}</code>",
    "formatter.entry_price_label": "<b>Цена входа:</b> {price}",
    "formatter.pair_label": "<b>Пара:</b> {emoji} {pair}",
    "formatter.direction_label": "<b>Направление:</b> {direction} {arrow}",
    "formatter.expiration_label": "<b>Экспирация:</b> {expiration}",
    "formatter.accuracy_label": "<b>Точность:</b> {confidence}%  {bar}",
    "formatter.type_label": "<b>Тип:</b> {badge}",
    "formatter.open_po": "Открыть PocketOption →",
    "formatter.direction_up": "ВВЕРХ",
    "formatter.direction_down": "ВНИЗ",

    # ── signal analyses (exchange / elite) ────────────────────────────────────
    "signal_analysis.exchange_1": "Биржевой тренд: восходящий канал подтверждён",
    "signal_analysis.exchange_2": "RSI выход из перепроданности",
    "signal_analysis.exchange_3": "MACD бычье пересечение на H1",
    "signal_analysis.exchange_4": "Уровень Фибоначчи 61.8% — сильный сигнал",
    "signal_analysis.exchange_5": "Объёмы подтверждают направление",
    "signal_analysis.elite_1": "Multi-timeframe анализ: M1/M5/H1 совпадение",
    "signal_analysis.elite_2": "AI + экспертный анализ: конвергенция индикаторов",
    "signal_analysis.elite_3": "Smart Money концепт: ордер-блок подтверждён",
    "signal_analysis.elite_4": "Институциональный поток ордеров подтверждён",
    "signal_analysis.elite_5": "Кластерный анализ + дельта объёмов",
    "signal_analysis.elite_6": "AI Neural + ML модель: высокая вероятность",

    # OTC analysis dynamic parts
    "signal_analysis.otc_rsi_zone_overbought": "перекупленность",
    "signal_analysis.otc_rsi_zone_oversold": "перепроданность",
    "signal_analysis.otc_rsi_zone_neutral": "нейтральная зона",
    "signal_analysis.otc_bb_lower": "у нижней границы",
    "signal_analysis.otc_bb_upper": "у верхней границы",
    "signal_analysis.otc_bb_middle": "в середине канала",
    "signal_analysis.otc_bb_break_upper": "пробой верхней границы",
    "signal_analysis.otc_bb_break_lower": "пробой нижней границы",
    "signal_analysis.otc_trend_bullish": "бычий",
    "signal_analysis.otc_trend_bearish": "медвежий",
    "signal_analysis.otc_macd_bullish": "бычье",
    "signal_analysis.otc_macd_bearish": "медвежье",
    "signal_analysis.otc_pattern_double_bottom": "двойное дно",
    "signal_analysis.otc_pattern_double_top": "двойная вершина",
    "signal_analysis.otc_cross_golden": "золотой крест",
    "signal_analysis.otc_cross_dead": "мёртвый крест",
    "signal_analysis.otc_volatility_high": "повышенная",
    "signal_analysis.otc_volatility_moderate": "умеренная",
    "signal_analysis.otc_volume_above": "выше",
    "signal_analysis.otc_volume_below": "ниже",
    "signal_analysis.otc_bounce_oversold": "отскок от перепроданности",
    "signal_analysis.otc_momentum_confirm": "подтверждение импульса",
    "signal_analysis.otc_support_hold": "удержание поддержки",
    "signal_analysis.otc_resistance_bounce": "отбой от сопротивления",
    "signal_analysis.otc_stoch_exit_oversold": "выход из перепроданности",
    "signal_analysis.otc_stoch_impulse_zone": "зона импульса",
    "signal_analysis.otc_bb_narrow_breakout": "сужение канала → пробой",
    "signal_analysis.otc_pattern_pin_bar": "пин-бар",
    "signal_analysis.otc_pattern_engulfing": "поглощение",
    "signal_analysis.otc_key_level": "на ключевом уровне",
    "signal_analysis.otc_rsi_reversal_from": "разворот от зоны {zone}",
    "signal_analysis.otc_volume_spike": "всплеск +{pct}% при формировании свечи",
    "signal_analysis.otc_macd_rising": "растёт",
    "signal_analysis.otc_macd_falling": "снижается",

    # ── signal expiration labels ──────────────────────────────────────────────
    "expiration.30s": "30 сек",
    "expiration.60s": "1 мин",
    "expiration.1m": "1 мин",
    "expiration.2m": "2 мин",
    "expiration.5m": "5 мин",
    "expiration.15m": "15 мин",
    "expiration.1h": "1 час",

    # legacy expiration strings
    "expiration.legacy_30s": "30 сек",
    "expiration.legacy_1m": "1 мин",
    "expiration.legacy_2m": "2 мин",
    "expiration.legacy_5m": "5 мин",
    "expiration.legacy_15m": "15 мин",

    # ── subcategory labels ────────────────────────────────────────────────────
    "subcategory.forex": "💱 Форекс",
    "subcategory.crypto": "🪙 Крипто",
    "subcategory.stocks": "📊 Акции",
    "subcategory.commodities": "🛢 Товары",
    "subcategory.indices": "📈 Индексы",

    # ── signal tier labels ────────────────────────────────────────────────────
    "signal_tier.otc": "🎲 OTC",
    "signal_tier.exchange": "📈 Биржевые",
    "signal_tier.elite": "👑 Elite",

    # ── keyboard button aliases (for build_main_menu) ────────────────────────
    "keyboard.signal": "🎯 Получить сигнал",
    "keyboard.link": "🔗 Привязать ID",

    # ── signal formatting (locale-aware captions) ────────────────────────────
    "signal.direction.up": "ВВЕРХ",
    "signal.direction.down": "ВНИЗ",
    "signal.header.otc": "OTC СИГНАЛ",
    "signal.header.exchange": "БИРЖЕВОЙ СИГНАЛ",
    "signal.header.elite": "ELITE СИГНАЛ",
    "signal.confidence": "Точность",
    "signal.entry_time": "Время входа",
    "signal.volume": "Объём: 1–3% депозита",
    "signal.payout": "Выплата",

    # ── tier_label aliases ────────────────────────────────────────────────────
    "tier_label.otc": "🎲 OTC",
    "tier_label.exchange": "📈 Биржевые",
    "tier_label.elite": "👑 Elite",

    # ── inline button aliases ────────────────────────────────────────────────
    "inline.open_po": "💎 Открыть PocketOption",
    "inline.open_app": "📱 Открыть приложение",
    "inline.share_link": "📤 Поделиться ссылкой",
    "inline.register_po": "🚀 Регистрация в PocketOption",
    "inline.enter_id": "✏️ Я уже зарегистрирован — ввести ID",

    # ── link / FSM ────────────────────────────────────────────────────────────
    "link.already_linked": (
        "Аккаунт привязан: <code>{po_trader_id}</code>.\n"
        "Если нужно сменить — пришли новый ID (6–12 цифр)."
    ),
    "link.cancel_in_fsm": "Привязка отменена. Вернись когда будет готов — /link.",
    "link.command_cancelled": "Привязка отменена. Используй /link чтобы начать заново.",
    "link.invalid_id": (
        "Trader ID должен быть числовым, 6–12 цифр.\n"
        "Найти его можно: PocketOption → Профиль → «Мой ID».\n\n"
        "Нажми /cancel чтобы отменить."
    ),
    "link.not_found_in_network": (
        "❌ <b>Trader ID не найден</b> в нашей партнёрской сети.\n\n"
        "Убедись, что ты зарегистрировался на PocketOption "
        "<b>по нашей реферальной ссылке</b>.\n\n"
        "Если ещё не зарегистрирован — нажми кнопку ниже:"
    ),
    "link.po_api_unavailable": (
        "⚠️ PocketOption API временно недоступен. Попробуй через минуту.\n"
        "Нажми /cancel чтобы отменить."
    ),
    "link.verified_deposit": "\n✅ <b>Подтверждено</b> — депозит: ${deposit:,.0f}",
    "link.success_onboarding": (
        "<b>✅ Готово — PocketOption привязан!</b>\n"
        "\n"
        "Trader ID: <code>{trader_id}</code>{verify_line}\n"
        "Уровень: <b>Free</b> — OTC-сигналы, 3/день\n"
        "\n"
        "Нажми «🎯 Получить сигнал» в меню, чтобы запросить сигнал.\n"
        "Депозит ≥ $20 → <b>Basic</b> (10/день), ≥ $100 → <b>Pro</b> (безлимит).\n"
        "\n"
        "Реф-ссылка (5% с FTD приглашённых):\n"
        "<code>{ref_link}</code>"
    ),
    "link.success": (
        "<b>✅ PocketOption привязан.</b>\n\n"
        "Trader ID: <code>{trader_id}</code>{verify_line}\n"
        "Уровень обновится автоматически после депозита."
    ),
    "link.enter_id_prompt": (
        "Пришли свой PocketOption Trader ID (только цифры, 6–12 знаков).\n"
        "Найти его можно в профиле PocketOption → раздел «Мой ID»."
    ),
    "link.enter_id_prompt_short": (
        "Пришли свой PocketOption Trader ID (6–12 цифр).\n"
        "Найти: PocketOption → Профиль → «Мой ID»."
    ),
    "link.cancelled": "Отменено.",
    "link.already_taken": (
        "❌ Этот Trader ID уже привязан к другому аккаунту.\n"
        "Проверь правильность ID или обратись в поддержку."
    ),

    # ── onboarding ────────────────────────────────────────────────────────────
    "onboarding.welcome": (
        "Приветствую, <b>{first_name}</b>!\n"
        "\n"
        "Ты в <b>SpaceSignal</b> — пространстве, где технологии, "
        "аналитика и скорость принятия решений объединены в одной системе.\n"
        "\n"
        "SpaceSignal создан для тех, кто хочет работать с рынком не на "
        "эмоциях, а на данных, структуре и современных AI-инструментах.\n"
        "\n"
        "У тебя уже есть действующий аккаунт в системе?"
    ),
    "onboarding.no_account": (
        "<b>Регистрация нового аккаунта</b>\n"
        "\n"
        "Для начала работы нужно:\n"
        "\n"
        "1️⃣ <b>Зарегистрируйся на нашем сайте</b>\n"
        "   → <a href=\"{site_url}/register\">spacesignal.net/register</a>\n"
        "\n"
        "2️⃣ <b>Открой счёт на PocketOption</b> по нашей реф-ссылке\n"
        "   (это обязательно — именно так система знает, что ты от нас)\n"
        "\n"
        "3️⃣ <b>Привяжи свой Trader ID</b> — его можно найти в PocketOption:\n"
        "   Профиль → раздел «Мой ID» (6–12 цифр)\n"
        "\n"
        "После привязки ты сразу получаешь уровень <b>Free</b> — "
        "3 OTC-сигнала в день. Депозит открывает больше."
    ),
    "onboarding.has_account": (
        "<b>Важно: нужен новый аккаунт PocketOption</b>\n"
        "\n"
        "Даже если у тебя уже есть аккаунт на PocketOption — "
        "для работы с нашей системой нужен аккаунт, "
        "зарегистрированный <b>по нашей реферальной ссылке</b>.\n"
        "\n"
        "Это обязательное условие — именно так PocketOption "
        "передаёт нам данные о твоих сделках и мы можем "
        "предоставить тебе доступ к сигналам.\n"
        "\n"
        "<b>Что делать:</b>\n"
        "1️⃣ Зарегистрируйся на нашем сайте\n"
        "2️⃣ Создай <b>новый</b> аккаунт PocketOption по кнопке ниже\n"
        "3️⃣ Вернись сюда и введи свой новый Trader ID\n"
        "\n"
        "<i>Trader ID можно найти: PocketOption → Профиль → «Мой ID»</i>"
    ),
    "onboarding.enter_id": (
        "Пришли свой PocketOption Trader ID (6–12 цифр).\n"
        "Найти: PocketOption → Профиль → «Мой ID»."
    ),
    "onboarding.cancelled": (
        "Привязка отложена.\n\n"
        "Без привязанного PocketOption ID сигналы недоступны.\n"
        "Когда будешь готов — нажми /start."
    ),

    # ── stats / profile ───────────────────────────────────────────────────────
    "stats.profile_header": "<b>👤 Профиль</b>",
    "stats.level": "Уровень: <b>{tier_name}</b>",
    "stats.deposit": "Депозит: <b>${deposit:.0f}</b>",
    "stats.signal_limit": "Лимит сигналов: <b>{limit} / день</b>",
    "stats.distance": "{distance}",
    "stats.full_profile": (
        "<b>👤 Профиль</b>\n\n"
        "Уровень: <b>{tier_name}</b>\n"
        "Депозит: <b>${deposit:.0f}</b>\n"
        "Лимит сигналов: <b>{limit} / день</b>\n\n"
        "{distance}"
    ),
    "stats.name": "<b>Имя:</b> {name}",
    "stats.po_id": "<b>PocketOption ID:</b> {po_line}",
    "stats.section_stats": "<b>📊 Статистика</b>",
    "stats.signals_received": "Сигналов получено: <b>{count}</b>",
    "stats.limit": "Лимит: <b>{limit}</b>",
    "stats.wins_losses": "Побед: <b>{wins}</b>  |  Поражений: <b>{losses}</b>",
    "stats.winrate": "Винрейт: <b>{winrate:.0f}%</b>",
    "stats.to_next_tier": "<i>До уровня {next_tier}: депозит ≥ ${threshold} на PocketOption.</i>",
    "stats.no_po": "не привязан",
    "stats.detailed_profile": (
        "<b>👤 Профиль</b>\n"
        "\n"
        "<b>Имя:</b> {name}\n"
        "<b>Уровень:</b> {tier_name}\n"
        "<b>PocketOption ID:</b> {po_line}\n"
        "\n"
        "<b>📊 Статистика</b>\n"
        "Сигналов получено: <b>{signals_received}</b>\n"
        "Лимит: <b>{limit}</b>\n"
        "Побед: <b>{wins}</b>  |  Поражений: <b>{losses}</b>\n"
        "Винрейт: <b>{winrate:.0f}%</b>\n"
    ),

    # ── referral ──────────────────────────────────────────────────────────────
    "ref.header": "<b>👥 Реферальная программа</b>",
    "ref.description": (
        "Получай <b>5% sub-affiliate</b> от FTD каждого приглашённого — "
        "после его первого депозита на PocketOption по ТВОЕЙ ссылке."
    ),
    "ref.link_label": "<b>Ссылка:</b> <code>{ref_link}</code>",
    "ref.caption": (
        "<b>👥 Реферальная программа</b>\n"
        "\n"
        "Получай <b>5% sub-affiliate</b> от FTD каждого приглашённого — "
        "после его первого депозита на PocketOption по ТВОЕЙ ссылке.\n"
        "\n"
        "<b>Ссылка:</b> <code>{ref_link}</code>"
    ),
    "ref.your_link": "<b>Твоя реферальная ссылка:</b>\n<code>{ref_link}</code>",
    "ref.ftd_bonus": (
        "Когда твой друг зарегистрируется по ссылке и сделает депозит на PocketOption, "
        "мы начислим тебе 5% от его FTD как sub-affiliate бонус."
    ),

    # ── achievements ──────────────────────────────────────────────────────────
    "achievements.header": "<b>🏅 Достижения</b> — открыто {earned} из {total}",
    "achievements.unlocked": "<b>🏅 Достижение разблокировано</b>\n\n<b>{title}</b>\n<i>{description}</i>",
    # individual achievement titles
    "achievement.po_linked.title": "🔗 Подключился",
    "achievement.po_linked.description": "Привязал PocketOption к боту",
    "achievement.first_deposit.title": "💰 Первый депозит",
    "achievement.first_deposit.description": "Зачислил первый депозит на PocketOption",
    "achievement.five_wins.title": "🥉 Пятая победа",
    "achievement.five_wins.description": "Закрыл 5 сигналов в плюс",
    "achievement.ten_wins.title": "🥈 Десятка",
    "achievement.ten_wins.description": "Закрыл 10 сигналов в плюс",
    "achievement.winrate_70.title": "🎯 Снайпер",
    "achievement.winrate_70.description": "Винрейт 70%+ на 10+ сделках",
    "achievement.tier_basic.title": "⭐ Basic-доступ",
    "achievement.tier_basic.description": "Открыл Basic — депозит от $20 на PocketOption",
    "achievement.tier_pro.title": "🚀 Pro-доступ",
    "achievement.tier_pro.description": "Открыл Pro — депозит от $100 на PocketOption",
    "achievement.three_referrals.title": "🤝 Тройка",
    "achievement.three_referrals.description": "Привёл 3 трейдеров по рефке",
    "achievement.ten_referrals.title": "🌐 Магнат",
    "achievement.ten_referrals.description": "Привёл 10+ трейдеров — лидер по рефке",

    # ── tier upgrade notification ─────────────────────────────────────────────
    "tier_sync.upgrade": (
        "<b>🎉 Уровень разблокирован: {name}!</b>\n"
        "\n"
        "Депозит на PocketOption: <b>${deposit:,.2f}</b>\n"
        "\n"
        "Доступные сигналы: <b>{signal_access}</b>\n"
        "Лимит: <b>{limit}</b>\n"
        "\n"
        "Нажми «🎯 Получить сигнал» в меню, чтобы запросить сигнал."
    ),

    # ── calc ─────────────────────────────────────────────────────────────────
    "calc.invalid_format": (
        "Неверный формат. Используй: <code>/calc 500 2 82</code>"
    ),
    "calc.positive_values": "Все значения должны быть положительными.",
    "calc.result": (
        "<b>📐 Калькулятор сделки</b>\n"
        "\n"
        "<b>Депозит:</b> ${deposit:,.2f}\n"
        "<b>Размер сделки:</b> {pct:g}% = <code>${bet:,.2f}</code>\n"
        "<b>Payout:</b> {payout:g}%\n"
        "<b>Прибыль при WIN:</b> <code>+${profit:,.2f}</code>\n"
        "<b>Убыток при LOSS:</b> <code>-${bet:,.2f}</code>\n"
        "\n"
        "<i>Формат: /calc &lt;депозит&gt; &lt;%&gt; &lt;payout%&gt;</i>"
    ),

    # ── leaderboard ───────────────────────────────────────────────────────────
    "leaderboard.empty": (
        "Лидерборд пока пуст — нужно хотя бы 1 полученный сигнал, "
        "чтобы попасть в рейтинг."
    ),
    "leaderboard.header": "<b>🏆 Лидерборд — топ по активности</b>",

    # ── notifications ─────────────────────────────────────────────────────────
    "notifications.enabled": "✅ включены",
    "notifications.disabled": "❌ отключены",
    "notifications.status": "Уведомления о новых сигналах: <b>{state}</b>",

    # ── admin ─────────────────────────────────────────────────────────────────
    "admin.access_denied": "⛔ Доступ запрещён.",
    "admin.panel": (
        "<b>🛠 Admin panel</b>\n"
        "\n"
        "<b>Users:</b> {total_users:,}\n"
        "<b>Signals:</b> {total_signals:,}\n"
        "\n"
        "<b>Tier breakdown:</b>\n{tier_lines}\n"
        "\n"
        "Commands:\n"
        "  <code>/broadcast &lt;text&gt;</code>\n"
        "  <code>/set_tier &lt;user_id&gt; &lt;T&gt;</code>\n"
        "  <code>/ban &lt;user_id&gt;</code>\n"
        "  <code>/unban &lt;user_id&gt;</code>\n"
        "  <code>/stats_global</code>"
    ),
    "admin.broadcast_done": "<b>Broadcast done</b>\nsent: {sent}, failed: {failed}",
    "admin.tier_must_be_0_4": "Tier must be 0..4",
    "admin.user_not_found": "User {user_id} not found",
    "admin.set_tier_ok": "User <code>{user_id}</code> → T{tier}",
    "admin.banned": "User <code>{user_id}</code> banned",
    "admin.unbanned": "User <code>{user_id}</code> unbanned",
    "admin.global_stats": (
        "<b>📊 Global stats</b>\n"
        "\n"
        "<b>Users:</b> {total_users:,}  ·  Linked PO: {linked:,}\n"
        "<b>Signals:</b> {total_signals:,}\n"
        "<b>Total deposits (PO):</b> ${sum_dep:,.2f}\n"
        "<b>Wins / Losses:</b> {sum_wins:,} / {sum_losses:,}\n"
        "<b>Aggregate winrate:</b> {wr:.1f}%\n"
        "\n"
        "<b>By tier:</b>\n{tier_lines}"
    ),
    "admin.test_as_header": (
        "<b>👤 Просмотр от лица:</b>\n"
        "  <code>{telegram_id}</code> @{username}\n"
        "  T{tier} · ${deposit:,.0f} · {signals_received} сигналов\n"
        "  W/L: {wins}/{losses}"
    ),
    "admin.reset_ok": (
        "<b>♻️ Сброшено.</b>\nWins/Losses/Signals/Achievements обнулены для тебя."
    ),
    "admin.seed_ok": (
        "<b>🌱 Seed готов.</b>\nДобавлено фейк-юзеров: {inserted} (из {total})"
    ),
    "admin.demo_signal_caption": "<b>🧪 DEMO SIGNAL</b>",
    "admin.demo_analysis": "DEMO · Тестовый сигнал (admin /demo_signal)",
    "admin.preview_tier_not_impl": "Preview tier: not implemented yet",
    "admin.command_removed": "Команда убрана.",

    # ── formatter extended ────────────────────────────────────────────────────
    "formatter.stats": (
        "<b>Статистика SpaceSignal</b>\n"
        "\n"
        "<b>Точность сигналов:</b> {win_rate:.1f}%\n"
        "<b>Всего сигналов:</b> {total_signals:,}\n"
        "<b>Пользователей:</b> {total_users:,}\n"
        "<b>Режим работы:</b> 24/7 (OTC) / 08:00-22:00 UTC (биржа)\n"
        "\n"
        "<b>Уровни доступа:</b>\n"
        "  • <b>Free</b> — OTC-сигналы, 3/день\n"
        "  • <b>Basic</b> (депозит ≥ $20) — OTC + биржа, 10/день\n"
        "  • <b>Pro</b> (депозит ≥ $100) — всё: OTC + биржа + Elite, безлимит\n"
        "\n"
        "<i>Данные обновляются в режиме реального времени</i>"
    ),
    "formatter.welcome": (
        "Привет, <b>{first_name}</b>!\n"
        "\n"
        "<b>SpaceSignal</b> — AI-сигналы для PocketOption.\n"
        "Доступ открывается регистрацией по нашей ссылке, не подпиской.\n"
        "\n"
        "<b>Как начать:</b>\n"
        "1. Открой счёт PocketOption по нашей реф-ссылке (/link)\n"
        "   и пришли свой PocketOption Trader ID.\n"
        "2. Сразу после привязки — уровень <b>Free</b>: OTC-сигналы, 3/день.\n"
        "3. Депозит ≥ $20 — <b>Basic</b>: OTC + биржа, 10/день.\n"
        "4. Депозит ≥ $100 — <b>Pro</b>: всё безлимитно.\n"
        "\n"
        "<b>Команды:</b>\n"
        "/signal — запросить сигнал\n"
        "/tier — твой текущий уровень\n"
        "/link — привязать аккаунт PocketOption\n"
        "/stats — статистика платформы\n"
        "/ref — реферальная программа\n"
        "\n"
        "<b>Твоя реферальная ссылка:</b>\n"
        "<code>{ref_link}</code>\n"
        "\n"
        "<i>SpaceSignal не является финансовым советником. "
        "Все сигналы предоставляются в информационных целях. "
        "Торговля бинарными опционами сопряжена с высоким риском потери средств.</i>"
    ),
    "formatter.tier_info_header": "<b>Твой уровень: {name}</b>",
    "formatter.tier_available_signals": "<b>Доступные сигналы:</b> {signal_access}",
    "formatter.tier_limit": "<b>Лимит:</b> {limit}",
    "formatter.tier_received": "<b>Сигналов получено:</b> {count}",
    "formatter.tier_po_id": "<b>PocketOption ID:</b> <code>{po_trader_id}</code>",
    "formatter.tier_po_not_linked": "<b>PocketOption:</b> не привязан — /link",
    "formatter.tier_to_basic": "<i>До уровня Basic: депозит ≥ $20 на PocketOption.</i>",
    "formatter.tier_to_pro": "<i>До уровня Pro: депозит ≥ $100 на PocketOption.</i>",

    # ── imagegen card strings ─────────────────────────────────────────────────
    "imagegen.chart_conf": "увер.",
    "imagegen.chart_exp": "эксп.",
    "imagegen.deposit_label": "Депозит: ${deposit:,.0f}",
    "imagegen.to_next_tier": "До {next_name}: ещё ${remaining:,}",
    "imagegen.full_access": "Полный доступ открыт",
    "imagegen.personal_cabinet": "Личный кабинет",
    "imagegen.tier_label": "ТИР",
    "imagegen.deposit_stat_label": "ДЕПОЗИТ",
    "imagegen.signals_label": "СИГНАЛОВ",
    "imagegen.ref_program": "РЕФ-ПРОГРАММА",
    "imagegen.sub_affiliate": "5% sub-affiliate",
    "imagegen.ref_from_ftd": "От FTD каждого приглашённого. Без потолка.",
    "imagegen.your_ref_code": "Твой реф-код",
    "imagegen.invited_total": "приглашено всего",
    "imagegen.for_name": "для {name}",
    "imagegen.achievements_eyebrow": "ДОСТИЖЕНИЯ",
    "imagegen.achievements_title": "КОЛЛЕКЦИЯ ТРОФЕЕВ",
    "imagegen.leaderboard_eyebrow": "ЛИДЕРБОРД",
    "imagegen.leaderboard_title": "ТОП ТРЕЙДЕРОВ",
    "imagegen.col_rank": "#",
    "imagegen.col_trader": "ТРЕЙДЕР",
    "imagegen.col_signals": "СИГНАЛОВ",
    "imagegen.col_earnings": "ЗАРАБОТОК",
    "imagegen.settings_eyebrow": "НАСТРОЙКИ",
    "imagegen.settings_title": "ПРОФИЛЬ",
    "imagegen.tier_access_label": "Уровень доступа",
    "imagegen.po_id_label": "PocketOption ID",
    "imagegen.notifications_label": "Уведомления",
    "imagegen.notifications_on": "включены",
    "imagegen.notifications_off": "отключены",
    "imagegen.not_linked_short": "не привязан",
    "imagegen.help_eyebrow": "СПРАВКА",
    "imagegen.help_title": "КОМАНДЫ БОТА",

    # ── /lang ──
    "lang.choose": "🌐 Выберите язык интерфейса:",
    "lang.changed": "✓ Язык изменён",
}


# ── Ukrainian strings ──────────────────────────────────────────────────────────

_UK: dict[str, str] = {

    # ── keyboard / persistent menu buttons ──────────────────────────────────
    "keyboard.get_signal": "🎯 Отримати сигнал",
    "keyboard.link_id": "🔗 Прив'язати ID",
    "keyboard.referrals": "👥 Реферали",
    "keyboard.help": "❔ Допомога",
    "keyboard.leaderboard": "🏆 Лідерборд",
    "keyboard.profile": "👤 Профіль",
    "keyboard.stats": "📈 Статистика",
    "keyboard.settings": "⚙️ Налаштування",
    "keyboard.placeholder": "Обери дію…",
    # inline buttons
    "keyboard.open_pocket_option": "💎 Відкрити PocketOption",
    "keyboard.open_app": "📱 Відкрити застосунок",
    "keyboard.win": "✅ Win",
    "keyboard.loss": "❌ Loss",
    "keyboard.another_signal": "🎯 Ще сигнал",
    "keyboard.share_link": "📤 Поділитися посиланням",
    "keyboard.register_po": "🚀 Реєстрація в PocketOption",
    "keyboard.already_registered_enter_id": "✏️ Я вже зареєстрований — ввести ID",
    "keyboard.back": "⬅️ Назад",
    # onboarding inline
    "keyboard.no_account": "Немає акаунту",
    "keyboard.has_account": "Є акаунт",
    "keyboard.register_on_site": "📋 Зареєструватися на сайті",
    "keyboard.open_pocket_option_diamond": "💎 Відкрити PocketOption",
    "keyboard.done_enter_id": "✅ Готово — ввести Trader ID",
    "keyboard.create_new_po": "💎 Створити новий акаунт PocketOption",
    "keyboard.register_po_full": "🚀 Зареєструватися в PocketOption",
    "keyboard.enter_another_id": "🔄 Ввести інший ID",
    "keyboard.cancel": "❌ Скасувати",
    "keyboard.open_app_menu": "Відкрити застосунок",

    # ── tier names ────────────────────────────────────────────────────────────
    "tier.free": "Free",
    "tier.basic": "Basic",
    "tier.pro": "Pro",
    "tier.free_desc": "OTC-сигнали, 3/день",
    "tier.basic_desc": "OTC + біржа, 10/день",
    "tier.pro_desc": "все безлімітно + Elite",
    "tier.unlimited": "безліміт",
    "tier.limit_per_day": "{limit}/день",
    "tier.max_reached": "🏆 Максимальний рівень досягнуто!",
    "tier.distance_to_next": "До {next_name} залишилось: ${needed:.0f}",
    "tier.per_day": "день",
    "tier.upgrade_message": (
        "<b>🎉 Рівень розблоковано: {name}!</b>\n"
        "\n"
        "Депозит на PocketOption: <b>${deposit}</b>\n"
        "\n"
        "Доступні сигнали: <b>{signal_access}</b>\n"
        "Ліміт: <b>{limit_text}</b>\n"
        "\n"
        "Натисни «🎯 Отримати сигнал» у меню, щоб запросити сигнал."
    ),

    # ── common / shared ───────────────────────────────────────────────────────
    "common.trader": "Трейдер",
    "common.not_linked": "не прив'язано",
    "common.unlimited": "безліміт",
    "common.per_day": "/день",
    "common.start_first": "Спочатку натисни /start.",
    "common.start_first_alt": "Спочатку /start.",
    "common.write_start": "Напиши /start щоб почати.",
    "common.cancelled": "Скасовано.",
    "common.error_try_later": "Сталася помилка. Спробуй пізніше.",
    "common.disclaimer": (
        "<i>Не фінансова порада. Бінарні опціони — високий ризик.</i>"
    ),
    "common.disclaimer_full": (
        "<i>SpaceSignal не є фінансовим радником. "
        "Усі сигнали надаються в інформаційних цілях. "
        "Торгівля бінарними опціонами пов'язана з високим ризиком втрати коштів.</i>"
    ),

    # ── start handler ────────────────────────────────────────────────────────
    "start.welcome": (
        "Привіт, <b>{first_name}</b>! 👋\n"
        "\n"
        "<b>SpaceSignal</b> — AI-сигнали для PocketOption.\n"
        "Доступ відкривається реєстрацією, а не підпискою.\n"
        "\n"
        "<b>Як почати:</b>\n"
        "  1. Відкрий рахунок PocketOption за нашим посиланням (/link)\n"
        "  2. Прив'яжи свій Trader ID командою /link\n"
        "  3. Натисни «🎯 Отримати сигнал» — і отримай перший сигнал\n"
        "\n"
        "<b>Рівні доступу:</b>\n"
        "  • <b>Free</b> — OTC-сигнали, 3/день\n"
        "  • <b>Basic</b> (депозит ≥ $20) — OTC + біржа, 10/день\n"
        "  • <b>Pro</b> (депозит ≥ $100) — все безлімітно + Elite\n"
        "\n"
        "<b>Реф-посилання</b> (5% з FTD кожного запрошеного):\n"
        "<code>{ref_link}</code>\n"
        "\n"
        "<i>Не фінансова порада. Бінарні опціони — високий ризик.</i>"
    ),
    "start.returning_with_po": (
        "З поверненням, <b>{first_name}</b>! 👋\n\n"
        "Рівень: <b>{tier_name}</b>\n"
        "PocketOption ID: <code>{po_trader_id}</code>\n\n"
        "Натисни «🎯 Отримати сигнал» у меню."
    ),
    "start.returning_no_po": (
        "З поверненням, <b>{first_name}</b>! 👋\n\n"
        "Рівень: <b>{tier_name}</b>\n\n"
        "Прив'яжи PocketOption ID командою /link щоб відкрити сигнали.\n"
        "Натисни «🎯 Отримати сигнал» у меню."
    ),
    "start.menu_active": "Меню активне — користуйся кнопками знизу 👇",
    # link token redeem
    "start.link_not_configured": (
        "Прив'язка тимчасово недоступна — зв'язок із сайтом не налаштовано. "
        "Повідом адміну."
    ),
    "start.link_expired": (
        "⏰ Посилання для прив'язки закінчилось. Запроси нове на сайті "
        "(натисни «Прив'язати Telegram» ще раз)."
    ),
    "start.link_telegram_taken": (
        "⚠️ Цей Telegram вже прив'язаний до іншого акаунту на сайті."
    ),
    "start.link_already_used": "Це посилання вже використано. Запроси нове на сайті.",
    "start.link_server_error": (
        "Не вдалося прив'язати акаунт (сервер повернув помилку). "
        "Спробуй ще раз пізніше."
    ),
    "start.link_connection_error": (
        "Не вдалося зв'язатися із сайтом для прив'язки. Спробуй ще раз пізніше."
    ),
    "start.link_ok": (
        "✅ Telegram прив'язаний до твого акаунту на сайті!\n\n"
        "Бот автоматично підтягне дані акаунту протягом хвилини.\n"
        "Натисни /start щоб почати користуватися ботом."
    ),
    "start.link_unknown_token": "Це посилання недійсне або вже використано.",
    "start.link_already_used_2": "Це посилання вже було використано.",
    "start.link_expired_2": "Термін дії посилання закінчився. Запроси нове на сайті.",
    "start.link_telegram_taken_2": "Цей Telegram вже прив'язаний до іншого акаунту на сайті.",
    "start.link_bad_secret": "Внутрішня помилка авторизації (BOT_SYNC_SECRET).",
    "start.link_not_configured_2": "Прив'язка не налаштована на сервері.",
    "start.link_po_required": (
        "Для входу через Telegram спочатку потрібно зареєструватися на сайті — "
        "там знадобиться PocketOption Trader ID та підтверджений депозит."
    ),
    "start.link_fallback_error": "⚠️ Не вдалося прив'язати. Спробуй пізніше.",

    # ── help ─────────────────────────────────────────────────────────────────
    "help.title": "<b>SpaceSignal — довідка</b>",
    "help.commands_title": "<b>Основні команди:</b>",
    "help.cmd_start": "/start — запуск бота та онбординг",
    "help.cmd_signal": "/signal — отримати торговий сигнал",
    "help.cmd_ref": "/ref — реферальна програма + посилання",
    "help.cmd_calc": "/calc — калькулятор розміру угоди",
    "help.cmd_leaderboard": "/leaderboard — топ-10 трейдерів",
    "help.cmd_cancel": "/cancel — скасувати поточну дію",
    "help.how_it_works_title": "<b>Як це працює:</b>",
    "help.how_it_works": (
        "1. Зареєструйся на PocketOption за нашим посиланням\n"
        "2. Прив'яжи свій Trader ID через /start\n"
        "3. Натисни «🎯 Отримати сигнал» у меню"
    ),
    "help.tiers_title": "<b>Рівні:</b>",
    "help.tier_free": "• Free — 3 OTC-сигнали/день",
    "help.tier_basic": "• Basic ($20+) — 10 сигналів/день",
    "help.tier_pro": "• Pro ($100+) — безліміт",
    "help.footer": (
        "<i>Не фінансова порада. Торгівля бінарними опціонами "
        "пов'язана з високим ризиком.</i>"
    ),
    "help.full": (
        "<b>SpaceSignal — довідка</b>\n"
        "\n"
        "<b>Основні команди:</b>\n"
        "/start — запуск бота та онбординг\n"
        "/signal — отримати торговий сигнал\n"
        "/ref — реферальна програма + посилання\n"
        "/calc — калькулятор розміру угоди\n"
        "/leaderboard — топ-10 трейдерів\n"
        "/cancel — скасувати поточну дію\n"
        "\n"
        "<b>Як це працює:</b>\n"
        "1. Зареєструйся на PocketOption за нашим посиланням\n"
        "2. Прив'яжи свій Trader ID через /start\n"
        "3. Натисни «🎯 Отримати сигнал» у меню\n"
        "\n"
        "<b>Рівні:</b>\n"
        "• Free — 3 OTC-сигнали/день\n"
        "• Basic ($20+) — 10 сигналів/день\n"
        "• Pro ($100+) — безліміт\n"
        "\n"
        "<i>Не фінансова порада. Торгівля бінарними опціонами "
        "пов'язана з високим ризиком.</i>"
    ),
    "help.commands_header": "<b>❔ Довідка по командах</b>",
    "help.spacesignal_footer": "<i>SpaceSignal — AI-сигнали для PocketOption.</i>",
    "help.cmd_start_desc": "запуск та онбординг",
    "help.cmd_signal_desc": "отримати сигнал",
    "help.cmd_ref_desc": "реферальне посилання + QR",
    "help.cmd_leaderboard_desc": "топ-10 трейдерів",
    "help.cmd_calc_desc": "калькулятор угоди",
    "help.cmd_cancel_desc": "скасувати поточну дію",
    "help.cmd_help_desc": "ця довідка",

    # ── signal flow ──────────────────────────────────────────────────────────
    "signal.choose_type": "📊 <b>Обери тип сигналу:</b>",
    "signal.choose_category": "📂 <b>Обери категорію:</b>",
    "signal.choose_pair": "🎯 <b>Обери пару:</b>",
    "signal.choose_expiration": "⏱ <b>Обери експірацію:</b>",
    "signal.pair_payout": "🎯 <b>{pair_name}</b>  ·  Виплата: <b>+{payout}%</b>",
    "signal.no_pairs_in_category": "Немає доступних пар у цій категорії.",
    "signal.search_pair": "🔍 Пошук пари",
    "signal.search_prompt": "Введіть назву пари (наприклад: EUR, BTC, Gold):",
    "signal.no_search_results": "❌ Нічого не знайдено. Спробуйте інший запит.",
    "signal.search_results_count": "🔍 Знайдено: {count}",
    "signal.pair_not_found": "Пару не знайдено.",
    "signal.generating": "Зачекай — попередній сигнал ще генерується.",
    "signal.generation_error": "Сталася помилка при генерації сигналу. Спробуй пізніше.",
    "signal.unavailable_tier": "⛔ Цей тип сигналів недоступний на твоєму рівні.",
    "signal.need_po_account": (
        "⚠️ Для отримання сигналів потрібен прив'язаний акаунт PocketOption.\n\n"
        "Натисни /start щоб пройти реєстрацію."
    ),
    "signal.need_po_account_with_link": (
        "⚠️ Для отримання сигналів потрібен прив'язаний акаунт PocketOption.\n\n"
        "Натисни /start щоб пройти реєстрацію та прив'язати Trader ID."
    ),
    "signal.register_first": "Спочатку натисни /start, щоб зареєструватися.",
    "signal.limit_exceeded_upgrade": (
        "Ліміт вичерпано ({used}/{limit} сигналів сьогодні).\n\n"
        "Підвищ тариф до <b>{next_tier}</b> для більшої кількості сигналів."
    ),
    "signal.limit_exceeded": (
        "Ліміт вичерпано ({used}/{limit} сигналів сьогодні).\n"
        "Наступний сигнал буде доступний за кілька годин."
    ),
    "signal.user_not_found_platform": "Користувача не знайдено на платформі.",
    "signal.user_not_found_register": (
        "Користувача не знайдено на платформі. Зареєструйся на сайті."
    ),
    "signal.result_win": "✅ Записано як WIN",
    "signal.result_loss": "❌ Записано як LOSS",

    # analysis animation steps
    "signal.analyzing": "Аналізуємо ринок...",
    "signal.checking_indicators": "Перевіряємо індикатори...",
    "signal.evaluating_entry": "Оцінюємо точку входу...",
    "signal.calculating_probability": "Розраховуємо ймовірність...",
    "signal.forming_signal": "Формуємо сигнал...",

    # ── signal content (formatter) ────────────────────────────────────────────
    "formatter.otc_header": "<b>OTC СИГНАЛ</b>",
    "formatter.exchange_header": "<b>БІРЖОВИЙ СИГНАЛ</b>",
    "formatter.elite_header": "<b>ELITE СИГНАЛ</b>",
    "formatter.accuracy": "Точність: <b>{confidence}%</b>  {bar}",
    "formatter.payout": "Виплата: <b>+{pct}%</b>",
    "formatter.entry_time": "Час входу: <b>{entry_time}</b>",
    "formatter.analysis": "<b>Аналіз:</b>\n<i>{analysis}</i>",
    "formatter.analysis_inline": "<b>Аналіз:</b> <i>{analysis}</i>",
    "formatter.volume": "Обсяг: 1–3% депозиту",
    "formatter.entry_price": "Вхід: <code>{price}</code>",
    "formatter.entry_price_label": "<b>Ціна входу:</b> {price}",
    "formatter.pair_label": "<b>Пара:</b> {emoji} {pair}",
    "formatter.direction_label": "<b>Напрямок:</b> {direction} {arrow}",
    "formatter.expiration_label": "<b>Експірація:</b> {expiration}",
    "formatter.accuracy_label": "<b>Точність:</b> {confidence}%  {bar}",
    "formatter.type_label": "<b>Тип:</b> {badge}",
    "formatter.open_po": "Відкрити PocketOption →",
    "formatter.direction_up": "ВГОРУ",
    "formatter.direction_down": "ВНИЗ",

    # ── signal analyses (exchange / elite) ────────────────────────────────────
    "signal_analysis.exchange_1": "Біржовий тренд: висхідний канал підтверджено",
    "signal_analysis.exchange_2": "RSI вихід із перепроданості",
    "signal_analysis.exchange_3": "MACD бичаче перетинання на H1",
    "signal_analysis.exchange_4": "Рівень Фібоначчі 61.8% — сильний сигнал",
    "signal_analysis.exchange_5": "Обсяги підтверджують напрямок",
    "signal_analysis.elite_1": "Multi-timeframe аналіз: M1/M5/H1 збіг",
    "signal_analysis.elite_2": "AI + експертний аналіз: конвергенція індикаторів",
    "signal_analysis.elite_3": "Smart Money концепт: ордер-блок підтверджено",
    "signal_analysis.elite_4": "Інституційний потік ордерів підтверджено",
    "signal_analysis.elite_5": "Кластерний аналіз + дельта обсягів",
    "signal_analysis.elite_6": "AI Neural + ML модель: висока ймовірність",

    # OTC analysis dynamic parts
    "signal_analysis.otc_rsi_zone_overbought": "перекупленість",
    "signal_analysis.otc_rsi_zone_oversold": "перепроданість",
    "signal_analysis.otc_rsi_zone_neutral": "нейтральна зона",
    "signal_analysis.otc_bb_lower": "біля нижньої межі",
    "signal_analysis.otc_bb_upper": "біля верхньої межі",
    "signal_analysis.otc_bb_middle": "в середині каналу",
    "signal_analysis.otc_bb_break_upper": "пробій верхньої межі",
    "signal_analysis.otc_bb_break_lower": "пробій нижньої межі",
    "signal_analysis.otc_trend_bullish": "бичачий",
    "signal_analysis.otc_trend_bearish": "ведмежий",
    "signal_analysis.otc_macd_bullish": "бичаче",
    "signal_analysis.otc_macd_bearish": "ведмеже",
    "signal_analysis.otc_pattern_double_bottom": "подвійне дно",
    "signal_analysis.otc_pattern_double_top": "подвійна вершина",
    "signal_analysis.otc_cross_golden": "золотий хрест",
    "signal_analysis.otc_cross_dead": "мертвий хрест",
    "signal_analysis.otc_volatility_high": "підвищена",
    "signal_analysis.otc_volatility_moderate": "помірна",
    "signal_analysis.otc_volume_above": "вище",
    "signal_analysis.otc_volume_below": "нижче",
    "signal_analysis.otc_bounce_oversold": "відскок від перепроданості",
    "signal_analysis.otc_momentum_confirm": "підтвердження імпульсу",
    "signal_analysis.otc_support_hold": "утримання підтримки",
    "signal_analysis.otc_resistance_bounce": "відбій від опору",
    "signal_analysis.otc_stoch_exit_oversold": "вихід із перепроданості",
    "signal_analysis.otc_stoch_impulse_zone": "зона імпульсу",
    "signal_analysis.otc_bb_narrow_breakout": "звуження каналу → пробій",
    "signal_analysis.otc_pattern_pin_bar": "пін-бар",
    "signal_analysis.otc_pattern_engulfing": "поглинання",
    "signal_analysis.otc_key_level": "на ключовому рівні",
    "signal_analysis.otc_rsi_reversal_from": "розворот від зони {zone}",
    "signal_analysis.otc_volume_spike": "сплеск +{pct}% при формуванні свічки",
    "signal_analysis.otc_macd_rising": "зростає",
    "signal_analysis.otc_macd_falling": "знижується",

    # ── signal expiration labels ──────────────────────────────────────────────
    "expiration.30s": "30 сек",
    "expiration.60s": "1 хв",
    "expiration.1m": "1 хв",
    "expiration.2m": "2 хв",
    "expiration.5m": "5 хв",
    "expiration.15m": "15 хв",
    "expiration.1h": "1 год",

    "expiration.legacy_30s": "30 сек",
    "expiration.legacy_1m": "1 хв",
    "expiration.legacy_2m": "2 хв",
    "expiration.legacy_5m": "5 хв",
    "expiration.legacy_15m": "15 хв",

    # ── subcategory labels ────────────────────────────────────────────────────
    "subcategory.forex": "💱 Форекс",
    "subcategory.crypto": "🪙 Крипто",
    "subcategory.stocks": "📊 Акції",
    "subcategory.commodities": "🛢 Товари",
    "subcategory.indices": "📈 Індекси",

    # ── signal tier labels ────────────────────────────────────────────────────
    "signal_tier.otc": "🎲 OTC",
    "signal_tier.exchange": "📈 Біржові",
    "signal_tier.elite": "👑 Elite",

    # ── keyboard button aliases (for build_main_menu) ────────────────────────
    "keyboard.signal": "🎯 Отримати сигнал",
    "keyboard.link": "🔗 Прив'язати ID",

    # ── signal formatting (locale-aware captions) ────────────────────────────
    "signal.direction.up": "ВГОРУ",
    "signal.direction.down": "ВНИЗ",
    "signal.header.otc": "OTC СИГНАЛ",
    "signal.header.exchange": "БІРЖОВИЙ СИГНАЛ",
    "signal.header.elite": "ELITE СИГНАЛ",
    "signal.confidence": "Точність",
    "signal.entry_time": "Час входу",
    "signal.volume": "Об'єм: 1–3% депозиту",
    "signal.payout": "Виплата",

    # ── tier_label aliases ────────────────────────────────────────────────────
    "tier_label.otc": "🎲 OTC",
    "tier_label.exchange": "📈 Біржові",
    "tier_label.elite": "👑 Elite",

    # ── inline button aliases ────────────────────────────────────────────────
    "inline.open_po": "💎 Відкрити PocketOption",
    "inline.open_app": "📱 Відкрити додаток",
    "inline.share_link": "📤 Поділитися посиланням",
    "inline.register_po": "🚀 Реєстрація в PocketOption",
    "inline.enter_id": "✏️ Я вже зареєстрований — ввести ID",

    # ── link / FSM ────────────────────────────────────────────────────────────
    "link.already_linked": (
        "Акаунт прив'язано: <code>{po_trader_id}</code>.\n"
        "Якщо потрібно змінити — надішли новий ID (6–12 цифр)."
    ),
    "link.cancel_in_fsm": "Прив'язку скасовано. Повернись коли будеш готовий — /link.",
    "link.command_cancelled": "Прив'язку скасовано. Використай /link щоб почати заново.",
    "link.invalid_id": (
        "Trader ID має бути числовим, 6–12 цифр.\n"
        "Знайти його можна: PocketOption → Профіль → «Мій ID».\n\n"
        "Натисни /cancel щоб скасувати."
    ),
    "link.not_found_in_network": (
        "❌ <b>Trader ID не знайдено</b> в нашій партнерській мережі.\n\n"
        "Переконайся, що ти зареєструвався на PocketOption "
        "<b>за нашим реферальним посиланням</b>.\n\n"
        "Якщо ще не зареєстрований — натисни кнопку нижче:"
    ),
    "link.po_api_unavailable": (
        "⚠️ PocketOption API тимчасово недоступний. Спробуй через хвилину.\n"
        "Натисни /cancel щоб скасувати."
    ),
    "link.verified_deposit": "\n✅ <b>Підтверджено</b> — депозит: ${deposit:,.0f}",
    "link.success_onboarding": (
        "<b>✅ Готово — PocketOption прив'язано!</b>\n"
        "\n"
        "Trader ID: <code>{trader_id}</code>{verify_line}\n"
        "Рівень: <b>Free</b> — OTC-сигнали, 3/день\n"
        "\n"
        "Натисни «🎯 Отримати сигнал» у меню, щоб запросити сигнал.\n"
        "Депозит ≥ $20 → <b>Basic</b> (10/день), ≥ $100 → <b>Pro</b> (безліміт).\n"
        "\n"
        "Реф-посилання (5% з FTD запрошених):\n"
        "<code>{ref_link}</code>"
    ),
    "link.success": (
        "<b>✅ PocketOption прив'язано.</b>\n\n"
        "Trader ID: <code>{trader_id}</code>{verify_line}\n"
        "Рівень оновиться автоматично після депозиту."
    ),
    "link.enter_id_prompt": (
        "Надішли свій PocketOption Trader ID (тільки цифри, 6–12 знаків).\n"
        "Знайти його можна в профілі PocketOption → розділ «Мій ID»."
    ),
    "link.enter_id_prompt_short": (
        "Надішли свій PocketOption Trader ID (6–12 цифр).\n"
        "Знайти: PocketOption → Профіль → «Мій ID»."
    ),
    "link.cancelled": "Скасовано.",
    "link.already_taken": (
        "❌ Цей Trader ID вже прив'язаний до іншого акаунту.\n"
        "Перевір правильність ID або зверніся до підтримки."
    ),

    # ── onboarding ────────────────────────────────────────────────────────────
    "onboarding.welcome": (
        "Вітаю, <b>{first_name}</b>!\n"
        "\n"
        "Ти в <b>SpaceSignal</b> — просторі, де технології, "
        "аналітика та швидкість прийняття рішень об'єднані в одній системі.\n"
        "\n"
        "SpaceSignal створено для тих, хто хоче працювати з ринком не на "
        "емоціях, а на даних, структурі та сучасних AI-інструментах.\n"
        "\n"
        "У тебе вже є чинний акаунт у системі?"
    ),
    "onboarding.no_account": (
        "<b>Реєстрація нового акаунту</b>\n"
        "\n"
        "Для початку роботи потрібно:\n"
        "\n"
        "1️⃣ <b>Зареєструйся на нашому сайті</b>\n"
        "   → <a href=\"{site_url}/register\">spacesignal.net/register</a>\n"
        "\n"
        "2️⃣ <b>Відкрий рахунок на PocketOption</b> за нашим реф-посиланням\n"
        "   (це обов'язково — саме так система знає, що ти від нас)\n"
        "\n"
        "3️⃣ <b>Прив'яжи свій Trader ID</b> — його можна знайти в PocketOption:\n"
        "   Профіль → розділ «Мій ID» (6–12 цифр)\n"
        "\n"
        "Після прив'язки ти одразу отримуєш рівень <b>Free</b> — "
        "3 OTC-сигнали на день. Депозит відкриває більше."
    ),
    "onboarding.has_account": (
        "<b>Важливо: потрібен новий акаунт PocketOption</b>\n"
        "\n"
        "Навіть якщо у тебе вже є акаунт на PocketOption — "
        "для роботи з нашою системою потрібен акаунт, "
        "зареєстрований <b>за нашим реферальним посиланням</b>.\n"
        "\n"
        "Це обов'язкова умова — саме так PocketOption "
        "передає нам дані про твої угоди і ми можемо "
        "надати тобі доступ до сигналів.\n"
        "\n"
        "<b>Що робити:</b>\n"
        "1️⃣ Зареєструйся на нашому сайті\n"
        "2️⃣ Створи <b>новий</b> акаунт PocketOption за кнопкою нижче\n"
        "3️⃣ Повернись сюди і введи свій новий Trader ID\n"
        "\n"
        "<i>Trader ID можна знайти: PocketOption → Профіль → «Мій ID»</i>"
    ),
    "onboarding.enter_id": (
        "Надішли свій PocketOption Trader ID (6–12 цифр).\n"
        "Знайти: PocketOption → Профіль → «Мій ID»."
    ),
    "onboarding.cancelled": (
        "Прив'язку відкладено.\n\n"
        "Без прив'язаного PocketOption ID сигнали недоступні.\n"
        "Коли будеш готовий — натисни /start."
    ),

    # ── stats / profile ───────────────────────────────────────────────────────
    "stats.profile_header": "<b>👤 Профіль</b>",
    "stats.level": "Рівень: <b>{tier_name}</b>",
    "stats.deposit": "Депозит: <b>${deposit:.0f}</b>",
    "stats.signal_limit": "Ліміт сигналів: <b>{limit} / день</b>",
    "stats.distance": "{distance}",
    "stats.full_profile": (
        "<b>👤 Профіль</b>\n\n"
        "Рівень: <b>{tier_name}</b>\n"
        "Депозит: <b>${deposit:.0f}</b>\n"
        "Ліміт сигналів: <b>{limit} / день</b>\n\n"
        "{distance}"
    ),
    "stats.name": "<b>Ім'я:</b> {name}",
    "stats.po_id": "<b>PocketOption ID:</b> {po_line}",
    "stats.section_stats": "<b>📊 Статистика</b>",
    "stats.signals_received": "Сигналів отримано: <b>{count}</b>",
    "stats.limit": "Ліміт: <b>{limit}</b>",
    "stats.wins_losses": "Перемог: <b>{wins}</b>  |  Поразок: <b>{losses}</b>",
    "stats.winrate": "Вінрейт: <b>{winrate:.0f}%</b>",
    "stats.to_next_tier": "<i>До рівня {next_tier}: депозит ≥ ${threshold} на PocketOption.</i>",
    "stats.no_po": "не прив'язано",
    "stats.detailed_profile": (
        "<b>👤 Профіль</b>\n"
        "\n"
        "<b>Ім'я:</b> {name}\n"
        "<b>Рівень:</b> {tier_name}\n"
        "<b>PocketOption ID:</b> {po_line}\n"
        "\n"
        "<b>📊 Статистика</b>\n"
        "Сигналів отримано: <b>{signals_received}</b>\n"
        "Ліміт: <b>{limit}</b>\n"
        "Перемог: <b>{wins}</b>  |  Поразок: <b>{losses}</b>\n"
        "Вінрейт: <b>{winrate:.0f}%</b>\n"
    ),

    # ── referral ──────────────────────────────────────────────────────────────
    "ref.header": "<b>👥 Реферальна програма</b>",
    "ref.description": (
        "Отримуй <b>5% sub-affiliate</b> від FTD кожного запрошеного — "
        "після його першого депозиту на PocketOption за ТВОЇМ посиланням."
    ),
    "ref.link_label": "<b>Посилання:</b> <code>{ref_link}</code>",
    "ref.caption": (
        "<b>👥 Реферальна програма</b>\n"
        "\n"
        "Отримуй <b>5% sub-affiliate</b> від FTD кожного запрошеного — "
        "після його першого депозиту на PocketOption за ТВОЇМ посиланням.\n"
        "\n"
        "<b>Посилання:</b> <code>{ref_link}</code>"
    ),
    "ref.your_link": "<b>Твоє реферальне посилання:</b>\n<code>{ref_link}</code>",
    "ref.ftd_bonus": (
        "Коли твій друг зареєструється за посиланням і зробить депозит на PocketOption, "
        "ми нарахуємо тобі 5% від його FTD як sub-affiliate бонус."
    ),

    # ── achievements ──────────────────────────────────────────────────────────
    "achievements.header": "<b>🏅 Досягнення</b> — відкрито {earned} з {total}",
    "achievements.unlocked": "<b>🏅 Досягнення розблоковано</b>\n\n<b>{title}</b>\n<i>{description}</i>",
    "achievement.po_linked.title": "🔗 Підключився",
    "achievement.po_linked.description": "Прив'язав PocketOption до бота",
    "achievement.first_deposit.title": "💰 Перший депозит",
    "achievement.first_deposit.description": "Зарахував перший депозит на PocketOption",
    "achievement.five_wins.title": "🥉 П'ята перемога",
    "achievement.five_wins.description": "Закрив 5 сигналів у плюс",
    "achievement.ten_wins.title": "🥈 Десятка",
    "achievement.ten_wins.description": "Закрив 10 сигналів у плюс",
    "achievement.winrate_70.title": "🎯 Снайпер",
    "achievement.winrate_70.description": "Вінрейт 70%+ на 10+ угодах",
    "achievement.tier_basic.title": "⭐ Basic-доступ",
    "achievement.tier_basic.description": "Відкрив Basic — депозит від $20 на PocketOption",
    "achievement.tier_pro.title": "🚀 Pro-доступ",
    "achievement.tier_pro.description": "Відкрив Pro — депозит від $100 на PocketOption",
    "achievement.three_referrals.title": "🤝 Трійка",
    "achievement.three_referrals.description": "Привів 3 трейдерів за рефкою",
    "achievement.ten_referrals.title": "🌐 Магнат",
    "achievement.ten_referrals.description": "Привів 10+ трейдерів — лідер за рефкою",

    # ── tier upgrade notification ─────────────────────────────────────────────
    "tier_sync.upgrade": (
        "<b>🎉 Рівень розблоковано: {name}!</b>\n"
        "\n"
        "Депозит на PocketOption: <b>${deposit:,.2f}</b>\n"
        "\n"
        "Доступні сигнали: <b>{signal_access}</b>\n"
        "Ліміт: <b>{limit}</b>\n"
        "\n"
        "Натисни «🎯 Отримати сигнал» у меню, щоб запросити сигнал."
    ),

    # ── calc ─────────────────────────────────────────────────────────────────
    "calc.invalid_format": (
        "Невірний формат. Використовуй: <code>/calc 500 2 82</code>"
    ),
    "calc.positive_values": "Усі значення мають бути позитивними.",
    "calc.result": (
        "<b>📐 Калькулятор угоди</b>\n"
        "\n"
        "<b>Депозит:</b> ${deposit:,.2f}\n"
        "<b>Розмір угоди:</b> {pct:g}% = <code>${bet:,.2f}</code>\n"
        "<b>Payout:</b> {payout:g}%\n"
        "<b>Прибуток при WIN:</b> <code>+${profit:,.2f}</code>\n"
        "<b>Збиток при LOSS:</b> <code>-${bet:,.2f}</code>\n"
        "\n"
        "<i>Формат: /calc &lt;депозит&gt; &lt;%&gt; &lt;payout%&gt;</i>"
    ),

    # ── leaderboard ───────────────────────────────────────────────────────────
    "leaderboard.empty": (
        "Лідерборд поки порожній — потрібен хоча б 1 отриманий сигнал, "
        "щоб потрапити до рейтингу."
    ),
    "leaderboard.header": "<b>🏆 Лідерборд — топ за активністю</b>",

    # ── notifications ─────────────────────────────────────────────────────────
    "notifications.enabled": "✅ увімкнено",
    "notifications.disabled": "❌ вимкнено",
    "notifications.status": "Сповіщення про нові сигнали: <b>{state}</b>",

    # ── admin (admin panel stays in English/Russian for operators) ─────────────
    "admin.access_denied": "⛔ Доступ заборонено.",
    "admin.panel": (
        "<b>🛠 Admin panel</b>\n"
        "\n"
        "<b>Users:</b> {total_users:,}\n"
        "<b>Signals:</b> {total_signals:,}\n"
        "\n"
        "<b>Tier breakdown:</b>\n{tier_lines}\n"
        "\n"
        "Commands:\n"
        "  <code>/broadcast &lt;text&gt;</code>\n"
        "  <code>/set_tier &lt;user_id&gt; &lt;T&gt;</code>\n"
        "  <code>/ban &lt;user_id&gt;</code>\n"
        "  <code>/unban &lt;user_id&gt;</code>\n"
        "  <code>/stats_global</code>"
    ),
    "admin.broadcast_done": "<b>Broadcast done</b>\nsent: {sent}, failed: {failed}",
    "admin.tier_must_be_0_4": "Tier must be 0..4",
    "admin.user_not_found": "User {user_id} not found",
    "admin.set_tier_ok": "User <code>{user_id}</code> → T{tier}",
    "admin.banned": "User <code>{user_id}</code> banned",
    "admin.unbanned": "User <code>{user_id}</code> unbanned",
    "admin.global_stats": (
        "<b>📊 Global stats</b>\n"
        "\n"
        "<b>Users:</b> {total_users:,}  ·  Linked PO: {linked:,}\n"
        "<b>Signals:</b> {total_signals:,}\n"
        "<b>Total deposits (PO):</b> ${sum_dep:,.2f}\n"
        "<b>Wins / Losses:</b> {sum_wins:,} / {sum_losses:,}\n"
        "<b>Aggregate winrate:</b> {wr:.1f}%\n"
        "\n"
        "<b>By tier:</b>\n{tier_lines}"
    ),
    "admin.test_as_header": (
        "<b>👤 Перегляд від імені:</b>\n"
        "  <code>{telegram_id}</code> @{username}\n"
        "  T{tier} · ${deposit:,.0f} · {signals_received} сигналів\n"
        "  W/L: {wins}/{losses}"
    ),
    "admin.reset_ok": (
        "<b>♻️ Скинуто.</b>\nWins/Losses/Signals/Achievements обнулено для тебе."
    ),
    "admin.seed_ok": (
        "<b>🌱 Seed готово.</b>\nДодано фейк-юзерів: {inserted} (з {total})"
    ),
    "admin.demo_signal_caption": "<b>🧪 DEMO SIGNAL</b>",
    "admin.demo_analysis": "DEMO · Тестовий сигнал (admin /demo_signal)",
    "admin.preview_tier_not_impl": "Preview tier: not implemented yet",
    "admin.command_removed": "Команду прибрано.",

    # ── formatter extended ────────────────────────────────────────────────────
    "formatter.stats": (
        "<b>Статистика SpaceSignal</b>\n"
        "\n"
        "<b>Точність сигналів:</b> {win_rate:.1f}%\n"
        "<b>Всього сигналів:</b> {total_signals:,}\n"
        "<b>Користувачів:</b> {total_users:,}\n"
        "<b>Режим роботи:</b> 24/7 (OTC) / 08:00-22:00 UTC (біржа)\n"
        "\n"
        "<b>Рівні доступу:</b>\n"
        "  • <b>Free</b> — OTC-сигнали, 3/день\n"
        "  • <b>Basic</b> (депозит ≥ $20) — OTC + біржа, 10/день\n"
        "  • <b>Pro</b> (депозит ≥ $100) — все: OTC + біржа + Elite, безліміт\n"
        "\n"
        "<i>Дані оновлюються в режимі реального часу</i>"
    ),
    "formatter.welcome": (
        "Привіт, <b>{first_name}</b>!\n"
        "\n"
        "<b>SpaceSignal</b> — AI-сигнали для PocketOption.\n"
        "Доступ відкривається реєстрацією за нашим посиланням, не підпискою.\n"
        "\n"
        "<b>Як почати:</b>\n"
        "1. Відкрий рахунок PocketOption за нашим реф-посиланням (/link)\n"
        "   і надішли свій PocketOption Trader ID.\n"
        "2. Одразу після прив'язки — рівень <b>Free</b>: OTC-сигнали, 3/день.\n"
        "3. Депозит ≥ $20 — <b>Basic</b>: OTC + біржа, 10/день.\n"
        "4. Депозит ≥ $100 — <b>Pro</b>: все безлімітно.\n"
        "\n"
        "<b>Команди:</b>\n"
        "/signal — запросити сигнал\n"
        "/tier — твій поточний рівень\n"
        "/link — прив'язати акаунт PocketOption\n"
        "/stats — статистика платформи\n"
        "/ref — реферальна програма\n"
        "\n"
        "<b>Твоє реферальне посилання:</b>\n"
        "<code>{ref_link}</code>\n"
        "\n"
        "<i>SpaceSignal не є фінансовим радником. "
        "Усі сигнали надаються в інформаційних цілях. "
        "Торгівля бінарними опціонами пов'язана з високим ризиком втрати коштів.</i>"
    ),
    "formatter.tier_info_header": "<b>Твій рівень: {name}</b>",
    "formatter.tier_available_signals": "<b>Доступні сигнали:</b> {signal_access}",
    "formatter.tier_limit": "<b>Ліміт:</b> {limit}",
    "formatter.tier_received": "<b>Сигналів отримано:</b> {count}",
    "formatter.tier_po_id": "<b>PocketOption ID:</b> <code>{po_trader_id}</code>",
    "formatter.tier_po_not_linked": "<b>PocketOption:</b> не прив'язано — /link",
    "formatter.tier_to_basic": "<i>До рівня Basic: депозит ≥ $20 на PocketOption.</i>",
    "formatter.tier_to_pro": "<i>До рівня Pro: депозит ≥ $100 на PocketOption.</i>",

    # ── imagegen card strings ─────────────────────────────────────────────────
    "imagegen.chart_conf": "впевн.",
    "imagegen.chart_exp": "експ.",
    "imagegen.deposit_label": "Депозит: ${deposit:,.0f}",
    "imagegen.to_next_tier": "До {next_name}: ще ${remaining:,}",
    "imagegen.full_access": "Повний доступ відкрито",
    "imagegen.personal_cabinet": "Особистий кабінет",
    "imagegen.tier_label": "ТИР",
    "imagegen.deposit_stat_label": "ДЕПОЗИТ",
    "imagegen.signals_label": "СИГНАЛІВ",
    "imagegen.ref_program": "РЕФ-ПРОГРАМА",
    "imagegen.sub_affiliate": "5% sub-affiliate",
    "imagegen.ref_from_ftd": "Від FTD кожного запрошеного. Без стелі.",
    "imagegen.your_ref_code": "Твій реф-код",
    "imagegen.invited_total": "запрошено всього",
    "imagegen.for_name": "для {name}",
    "imagegen.achievements_eyebrow": "ДОСЯГНЕННЯ",
    "imagegen.achievements_title": "КОЛЕКЦІЯ ТРОФЕЇВ",
    "imagegen.leaderboard_eyebrow": "ЛІДЕРБОРД",
    "imagegen.leaderboard_title": "ТОП ТРЕЙДЕРІВ",
    "imagegen.col_rank": "#",
    "imagegen.col_trader": "ТРЕЙДЕР",
    "imagegen.col_signals": "СИГНАЛІВ",
    "imagegen.col_earnings": "ЗАРОБІТОК",
    "imagegen.settings_eyebrow": "НАЛАШТУВАННЯ",
    "imagegen.settings_title": "ПРОФІЛЬ",
    "imagegen.tier_access_label": "Рівень доступу",
    "imagegen.po_id_label": "PocketOption ID",
    "imagegen.notifications_label": "Сповіщення",
    "imagegen.notifications_on": "увімкнено",
    "imagegen.notifications_off": "вимкнено",
    "imagegen.not_linked_short": "не прив'язано",
    "imagegen.help_eyebrow": "ДОВІДКА",
    "imagegen.help_title": "КОМАНДИ БОТА",

    # ── /lang ──
    "lang.choose": "🌐 Оберіть мову інтерфейсу:",
    "lang.changed": "✓ Мову змінено",
}


# ── Lookup table ──────────────────────────────────────────────────────────────

_DICTS: dict[Locale, dict[str, str]] = {"ru": _RU, "uk": _UK}


def t(key: str, locale: Locale = DEFAULT_LOCALE, **kwargs: object) -> str:
    """Get a translated string.

    Falls back to Russian if the key is missing from the requested locale,
    then falls back to the key itself if missing from Russian too.

    Supports {placeholder} formatting via **kwargs.

    Examples:
        t("keyboard.get_signal")                       → "🎯 Получить сигнал"
        t("keyboard.get_signal", locale="uk")          → "🎯 Отримати сигнал"
        t("signal.limit_exceeded", used=2, limit=3)    → "Лимит исчерпан (2/3…)"
    """
    d = _DICTS.get(locale, _RU)
    template = d.get(key) or _RU.get(key, key)
    if kwargs:
        try:
            return template.format(**kwargs)
        except (KeyError, IndexError, ValueError):
            # Return unformatted string rather than crashing
            return template
    return template
