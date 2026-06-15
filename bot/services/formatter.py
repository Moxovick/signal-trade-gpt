from constants import TIER_DAILY_LIMITS, TIER_DEPOSIT_THRESHOLDS, TIER_NAMES, TIER_SIGNAL_TYPES
from database.models import Signal
from services import web_sync


DIRECTION_ARROW = {"CALL": "⬆", "PUT": "⬇"}
DIRECTION_TAG = {"CALL": "call", "PUT": "put"}
DIRECTION_WORD = {"CALL": "ВВЕРХ", "PUT": "ВНИЗ"}

# Payout percentages per pair (from PocketOption)
PAIR_PAYOUTS: dict[str, int] = {
    "EUR/USD (OTC)": 76, "GBP/USD (OTC)": 92, "USD/JPY (OTC)": 33,
    "AUD/USD (OTC)": 56, "EUR/GBP (OTC)": 32, "USD/CHF (OTC)": 85,
    "NZD/USD (OTC)": 92, "EUR/JPY (OTC)": 49, "AUD/CHF (OTC)": 72,
    "AUD/NZD (OTC)": 69, "EUR/CHF (OTC)": 57, "GBP/JPY (OTC)": 49,
    "USD/CAD (OTC)": 82, "CAD/JPY (OTC)": 65, "GBP/AUD (OTC)": 92,
    "EUR/NZD (OTC)": 47,
    "Bitcoin (OTC)": 92, "Ethereum (OTC)": 92, "Solana (OTC)": 80,
    "Dogecoin (OTC)": 92, "Cardano (OTC)": 92, "Toncoin (OTC)": 66,
    "BNB (OTC)": 71, "Litecoin (OTC)": 92,
    "Gold (OTC)": 80, "Silver (OTC)": 80, "Brent Oil (OTC)": 80, "WTI Oil (OTC)": 80,
    "Apple (OTC)": 92, "Tesla (OTC)": 88, "Amazon (OTC)": 84,
    "Microsoft (OTC)": 55, "Meta (OTC)": 66, "Netflix (OTC)": 62,
    "S&P 500 (OTC)": 45, "NASDAQ 100 (OTC)": 45, "Dow Jones (OTC)": 45,
    "EUR/USD": 82, "GBP/USD": 85, "USD/JPY": 43, "AUD/USD": 38,
    "EUR/GBP": 58, "USD/CHF": 75, "USD/CAD": 87, "EUR/JPY": 77,
    "GBP/JPY": 83, "EUR/CHF": 85, "AUD/CAD": 62, "EUR/AUD": 32,
    "GBP/AUD": 77, "AUD/JPY": 45, "CAD/JPY": 72, "CHF/JPY": 76,
    "AAPL": 92, "TSLA": 88, "AMZN": 84, "MSFT": 55, "META": 66,
    "NFLX": 62, "NVDA": 80, "GOLD": 80, "SILVER": 80,
    "BTC/USD": 15, "ETH/USD": 80, "SOL/USD": 80, "SP500": 45, "US100": 45,
}


def _payout_line(pair: str) -> str:
    """Return payout line if we have data for this pair."""
    pct = PAIR_PAYOUTS.get(pair)
    if pct is None:
        return ""
    return f"Выплата: <b>+{pct}%</b>\n"


def _render_admin_template(template: str, signal: Signal, entry_price: float | None) -> str:
    """Substitute {placeholders} in admin-defined signal template."""
    arrow = DIRECTION_ARROW.get(signal.direction, "")
    word = DIRECTION_WORD.get(signal.direction, signal.direction)
    entry_line = (
        f"<b>Цена входа:</b> {entry_price:.5f}\n" if entry_price is not None else ""
    )
    analysis_line = (
        f"<b>Анализ:</b> <i>{signal.analysis}</i>\n" if signal.analysis else ""
    )
    pct = PAIR_PAYOUTS.get(signal.pair)
    payout_str = f"+{pct}%" if pct else "—"
    payout_line = f"Выплата: <b>+{pct}%</b>\n" if pct else ""
    return (
        template
        .replace("{pair}", signal.pair)
        .replace("{direction}", signal.direction)
        .replace("{direction_word}", word)
        .replace("{direction_emoji}", arrow)
        .replace("{expiration}", signal.expiration)
        .replace("{confidence}", str(signal.confidence))
        .replace("{entry_price}", f"{entry_price:.5f}" if entry_price is not None else "—")
        .replace("{entry_line}", entry_line)
        .replace("{analysis_line}", analysis_line)
        .replace("{payout}", payout_str)
        .replace("{payout_line}", payout_line)
        .replace("{tier}", (signal.tier or "otc").upper())
    )

TIER_HEADERS = {
    # `demo` остаётся для обратной совместимости со старыми сигналами в очереди.
    "demo": "<b>OTC СИГНАЛ</b>",
    "otc": "<b>OTC СИГНАЛ</b>",
    "exchange": "<b>БИРЖЕВОЙ СИГНАЛ</b>",
    "elite": "<b>ELITE СИГНАЛ</b>",
}

TIER_BADGES = {
    "demo": "OTC",
    "otc": "OTC",
    "exchange": "EXCHANGE",
    "elite": "ELITE",
}

TIER_TAGS = {
    "demo": "#otc",
    "otc": "#otc",
    "exchange": "#exchange",
    "elite": "#elite",
}

USER_TIER_NAMES = TIER_NAMES
USER_TIER_DEPOSIT_THRESHOLDS = TIER_DEPOSIT_THRESHOLDS


def format_otc_minimal(signal: Signal) -> str:
    """
    OTC signal caption for Free-tier users.
    Clean and readable: pair, direction, expiry, confidence bar.
    """
    arrow = DIRECTION_ARROW[signal.direction]
    conf_bar_full = round(signal.confidence / 10)
    conf_bar = "▰" * conf_bar_full + "▱" * (10 - conf_bar_full)
    payout = _payout_line(signal.pair)
    return (
        f"<b>OTC СИГНАЛ</b>\n"
        f"\n"
        f"<b>{signal.pair}</b>\n"
        f"{arrow} <b>{signal.direction}</b>  ·  {signal.expiration}\n"
        f"\n"
        f"Confidence: <b>{signal.confidence}%</b>  {conf_bar}\n"
        f"{payout}"
        f"\n"
        f"Объём: 1–3% депозита\n"
        f"#otc #signal"
    )


def format_pro_signal_caption(
    signal: Signal,
    pocket_option_url: str,
    entry_price: float | None = None,
) -> str:
    """
    Full rich caption for Про users (exchange / elite signals).
    Attaches under the advanced chart image.
    Telegram captions are capped at 1024 chars; we stay well under.
    """
    admin_template = web_sync.get_signal_template()
    if admin_template:
        return _render_admin_template(admin_template, signal, entry_price)

    arrow = DIRECTION_ARROW[signal.direction]
    pair_tag = signal.pair.replace("/", "").replace(" ", "").lower()
    dir_tag = DIRECTION_TAG[signal.direction]
    tier = signal.tier or "exchange"
    header = TIER_HEADERS.get(tier, TIER_HEADERS["exchange"])
    tier_tag = TIER_TAGS.get(tier, "#exchange")
    conf_bar_full = round(signal.confidence / 10)
    conf_bar = "▰" * conf_bar_full + "▱" * (10 - conf_bar_full)

    payout = _payout_line(signal.pair)
    lines = [
        f"{header}",
        "",
        f"<b>{signal.pair}</b>  ·  {arrow} {signal.direction}  ·  {signal.expiration}",
        "",
        f"Confidence: <b>{signal.confidence}%</b>  {conf_bar}",
    ]
    if entry_price is not None:
        lines.append(f"Вход: <code>{entry_price:.5f}</code>")
    if payout:
        lines.append(payout.rstrip("\n"))
    if signal.analysis:
        lines.extend(["", f"<i>{signal.analysis}</i>"])
    lines.extend([
        "",
        "Объём: 1–3% депозита",
        f"#{pair_tag} #{dir_tag} {tier_tag} #signal",
    ])
    return "\n".join(lines)


def format_signal_caption(signal: Signal, pocket_option_url: str, entry_price: float | None = None) -> str:
    """
    Auto-selects format: minimal for OTC, rich Pro caption for exchange/elite.
    Used when posting to the channel (all tiers see it there).
    """
    tier = signal.tier or "otc"
    if tier in {"otc", "demo"}:
        return format_otc_minimal(signal)
    return format_pro_signal_caption(signal, pocket_option_url, entry_price)


def format_signal(signal: Signal, pocket_option_url: str) -> str:
    """Legacy full-text format (used by /signal command fallback)."""
    arrow = DIRECTION_ARROW[signal.direction]
    pair_tag = signal.pair.replace("/", "").replace(" ", "").lower()
    dir_tag = DIRECTION_TAG[signal.direction]
    tier = signal.tier if signal.tier else "otc"
    header = TIER_HEADERS.get(tier, TIER_HEADERS["otc"])
    badge = TIER_BADGES.get(tier, "OTC")
    tier_tag = TIER_TAGS.get(tier, "#otc")

    if tier in {"otc", "demo"}:
        return format_otc_minimal(signal)

    conf_bar_full = round(signal.confidence / 10)
    conf_bar = "▰" * conf_bar_full + "▱" * (10 - conf_bar_full)

    payout = _payout_line(signal.pair)
    lines = [
        f"{header}",
        "━━━━━━━━━━━━━━━",
        "",
        f"<b>Пара:</b> {signal.pair}",
        f"<b>Направление:</b> {signal.direction} {arrow}",
        f"<b>Экспирация:</b> {signal.expiration}",
        f"<b>Confidence:</b> {signal.confidence}%  {conf_bar}",
    ]
    if payout:
        lines.append(payout.rstrip("\n"))
    lines.append(f"<b>Тип:</b> {badge}")

    if signal.analysis:
        lines.append("")
        lines.append(f"<b>Анализ:</b> <i>{signal.analysis}</i>")

    lines.extend([
        "",
        "━━━━━━━━━━━━━━━",
        "Объём: 1–3% депозита",
        f'<a href="{pocket_option_url}">Открыть PocketOption →</a>',
        "",
        f"#{pair_tag} #{dir_tag} {tier_tag} #signal",
    ])

    return "\n".join(lines)


def format_stats(total_signals: int, total_users: int, win_rate: float = 0.0) -> str:
    return (
        f"<b>Статистика SpaceSignal</b>\n"
        f"\n"
        f"<b>Точность сигналов:</b> {win_rate:.1f}%\n"
        f"<b>Всего сигналов:</b> {total_signals:,}\n"
        f"<b>Пользователей:</b> {total_users:,}\n"
        f"<b>Режим работы:</b> 24/7 (OTC) / 08:00-22:00 UTC (биржа)\n"
        f"\n"
        f"<b>Уровни доступа:</b>\n"
        f"  • <b>Free</b> — OTC-сигналы, 3/день\n"
        f"  • <b>Basic</b> (депозит ≥ $20) — OTC + биржа, 10/день\n"
        f"  • <b>Pro</b> (депозит ≥ $100) — всё: OTC + биржа + Elite, безлимит\n"
        f"\n"
        f"<i>Данные обновляются в режиме реального времени</i>"
    )


def format_welcome(first_name: str, referral_code: str, bot_username: str) -> str:
    referral_link = f"https://t.me/{bot_username}?start={referral_code}"
    return (
        f"Привет, <b>{first_name}</b>!\n"
        f"\n"
        f"<b>SpaceSignal</b> — AI-сигналы для PocketOption.\n"
        f"Доступ открывается регистрацией по нашей ссылке, не подпиской.\n"
        f"\n"
        f"<b>Как начать:</b>\n"
        f"1. Открой счёт PocketOption по нашей реф-ссылке (/link)\n"
        f"   и пришли свой PocketOption Trader ID.\n"
        f"2. Сразу после привязки — уровень <b>Free</b>: OTC-сигналы, 3/день.\n"
        f"3. Депозит ≥ $20 — <b>Basic</b>: OTC + биржа, 10/день.\n"
        f"4. Депозит ≥ $100 — <b>Pro</b>: всё безлимитно.\n"
        f"\n"
        f"<b>Команды:</b>\n"
        f"/signal — запросить сигнал\n"
        f"/tier — твой текущий уровень\n"
        f"/link — привязать аккаунт PocketOption\n"
        f"/stats — статистика платформы\n"
        f"/ref — реферальная программа\n"
        f"\n"
        f"<b>Твоя реферальная ссылка:</b>\n"
        f"<code>{referral_link}</code>\n"
        f"\n"
        f"<i>SpaceSignal не является финансовым советником. "
        f"Все сигналы предоставляются в информационных целях. "
        f"Торговля бинарными опционами сопряжена с высоким риском потери средств.</i>"
    )


def format_tier_info(tier: int, po_trader_id: str | None, signals_received: int) -> str:
    name = USER_TIER_NAMES.get(tier, "Free")

    # Signal types for this tier
    types = TIER_SIGNAL_TYPES.get(tier, ["otc"])
    signal_access = " + ".join(t.upper() for t in types)

    # Daily limit
    daily_limit = TIER_DAILY_LIMITS.get(tier, 3)
    limit_text = "безлимит" if daily_limit is None else f"{daily_limit}/день"

    lines = [
        f"<b>Твой уровень: {name}</b>",
        "",
        f"<b>Доступные сигналы:</b> {signal_access}",
        f"<b>Лимит:</b> {limit_text}",
        f"<b>Сигналов получено:</b> {signals_received}",
    ]

    if po_trader_id:
        lines.append(f"<b>PocketOption ID:</b> <code>{po_trader_id}</code>")
    else:
        lines.append("<b>PocketOption:</b> не привязан — /link")

    # Show next tier info
    if tier == 0:
        lines.append("")
        lines.append(
            "<i>До уровня Basic: депозит ≥ $20 на PocketOption.</i>"
        )
    elif tier == 1:
        lines.append("")
        lines.append(
            "<i>До уровня Pro: депозит ≥ $100 на PocketOption.</i>"
        )

    return "\n".join(lines)
