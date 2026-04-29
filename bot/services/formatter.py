from database.models import Signal


DIRECTION_ARROW = {"CALL": "⬆", "PUT": "⬇"}
DIRECTION_TAG = {"CALL": "call", "PUT": "put"}

TIER_HEADERS = {
    "demo": "<b>ДЕМО-СИГНАЛ</b>",
    "otc": "<b>OTC СИГНАЛ</b>",
    "exchange": "<b>БИРЖЕВОЙ СИГНАЛ</b>",
    "elite": "<b>ELITE СИГНАЛ</b>",
}

TIER_BADGES = {
    "demo": "DEMO",
    "otc": "OTC",
    "exchange": "EXCHANGE",
    "elite": "ELITE",
}

TIER_TAGS = {
    "demo": "#demo",
    "otc": "#otc",
    "exchange": "#exchange",
    "elite": "#elite",
}

# Human label per user-tier (0..4).
USER_TIER_NAMES = {0: "Демо", 1: "Starter", 2: "Active", 3: "Pro", 4: "VIP"}
USER_TIER_DEPOSIT_THRESHOLDS = {1: 100, 2: 500, 3: 2000, 4: 10000}


def format_signal(signal: Signal, pocket_option_url: str) -> str:
    arrow = DIRECTION_ARROW[signal.direction]
    pair_tag = signal.pair.replace("/", "").replace(" ", "").lower()
    dir_tag = DIRECTION_TAG[signal.direction]
    tier = signal.tier if signal.tier else "otc"
    header = TIER_HEADERS.get(tier, TIER_HEADERS["otc"])
    badge = TIER_BADGES.get(tier, "OTC")
    tier_tag = TIER_TAGS.get(tier, "#otc")

    lines = [
        f"{header}",
        "━━━━━━━━━━━━━━━",
        "",
        f"<b>Пара:</b> {signal.pair}",
        f"<b>Направление:</b> {signal.direction} {arrow}",
        f"<b>Экспирация:</b> {signal.expiration}",
        f"<b>AI Confidence:</b> {signal.confidence}%",
        f"<b>Тип:</b> {badge}",
    ]

    if signal.analysis:
        lines.append("")
        lines.append(f"<b>Анализ:</b> {signal.analysis}")

    lines.extend([
        "",
        "━━━━━━━━━━━━━━━",
        "Рекомендуемый объём: 1-3% депозита",
        f'<a href="{pocket_option_url}">Открыть Pocket Option →</a>',
        "",
        f"#signal #{pair_tag} #{dir_tag} {tier_tag}",
    ])

    return "\n".join(lines)


def format_stats(total_signals: int, total_users: int) -> str:
    win_rate = 87.3
    return (
        f"<b>Статистика Signal Trade GPT</b>\n"
        f"\n"
        f"<b>Точность сигналов:</b> {win_rate}%\n"
        f"<b>Всего сигналов:</b> {total_signals:,}\n"
        f"<b>Пользователей:</b> {total_users:,}\n"
        f"<b>Режим работы:</b> 24/7 (OTC) / 08:00-22:00 UTC (биржа)\n"
        f"\n"
        f"<b>Tier-перки (открываются депозитом на PocketOption):</b>\n"
        f"  • T0 — 2 демо-сигнала за всё время\n"
        f"  • T1 ≥ $100 — 5 сигналов/день, OTC\n"
        f"  • T2 ≥ $500 — 15 сигналов/день, OTC + биржа\n"
        f"  • T3 ≥ $2000 — 25 сигналов/день, аналитика\n"
        f"  • T4 ≥ $10000 — безлимит, ранний доступ\n"
        f"\n"
        f"<i>Данные обновляются в режиме реального времени</i>"
    )


def format_welcome(first_name: str, referral_code: str, bot_username: str) -> str:
    referral_link = f"https://t.me/{bot_username}?start={referral_code}"
    return (
        f"Привет, <b>{first_name}</b>!\n"
        f"\n"
        f"<b>Signal Trade GPT</b> — AI-сигналы для PocketOption.\n"
        f"Доступ открывается твоим депозитом на бирже, не подпиской.\n"
        f"\n"
        f"<b>Как начать:</b>\n"
        f"1. Открой счёт PocketOption по нашей реф-ссылке: /link\n"
        f"   или пришли свой ID существующего счёта.\n"
        f"2. Внеси депозит — tier откроется автоматически.\n"
        f"3. Получай сигналы по своему лимиту.\n"
        f"\n"
        f"<b>Команды:</b>\n"
        f"/tier — твой текущий уровень и лимиты\n"
        f"/link — привязать аккаунт PocketOption\n"
        f"/signal — запросить демо-сигнал (T0)\n"
        f"/stats — статистика платформы\n"
        f"/ref — реферальная программа\n"
        f"\n"
        f"<b>Твоя реферальная ссылка:</b>\n"
        f"<code>{referral_link}</code>\n"
        f"\n"
        f"<i>Signal Trade GPT не является финансовым советником. "
        f"Все сигналы предоставляются в информационных целях. "
        f"Торговля бинарными опционами сопряжена с высоким риском потери средств.</i>"
    )


def format_tier_info(tier: int, po_trader_id: str | None, signals_received: int) -> str:
    name = USER_TIER_NAMES.get(tier, "—")
    next_tier = tier + 1 if tier < 4 else None
    next_threshold = USER_TIER_DEPOSIT_THRESHOLDS.get(next_tier) if next_tier else None

    daily_limits = {0: "2 сигнала за всё время (демо)", 1: "5 в день", 2: "15 в день", 3: "25 в день", 4: "безлимит"}

    lines = [
        f"<b>Твой tier: T{tier} · {name}</b>",
        "",
        f"<b>Лимит сигналов:</b> {daily_limits[tier]}",
        f"<b>Сигналов получено:</b> {signals_received}",
    ]

    if po_trader_id:
        lines.append(f"<b>PocketOption ID:</b> <code>{po_trader_id}</code>")
    else:
        lines.append("<b>PocketOption:</b> не привязан — пришли /link")

    if next_threshold:
        lines.append("")
        lines.append(
            f"<i>До T{next_tier}: депозит ≥ ${next_threshold} на PocketOption.</i>"
        )

    return "\n".join(lines)
