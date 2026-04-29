from database.models import Signal


DIRECTION_ARROW = {"CALL": "⬆️", "PUT": "⬇️"}
DIRECTION_TAG = {"CALL": "call", "PUT": "put"}

TIER_HEADERS = {
    "otc": "🔵 <b>OTC СИГНАЛ</b>",
    "exchange": "🟢 <b>БИРЖЕВОЙ СИГНАЛ</b>",
    "elite": "🟡 <b>ELITE СИГНАЛ</b>",
}

TIER_BADGES = {
    "otc": "OTC",
    "exchange": "БИРЖА",
    "elite": "ELITE 💎",
}

TIER_TAGS = {
    "otc": "#otc",
    "exchange": "#exchange",
    "elite": "#elite",
}


def format_signal(signal: Signal, pocket_option_url: str) -> str:
    arrow = DIRECTION_ARROW[signal.direction]
    pair_tag = signal.pair.replace("/", "").replace(" ", "").lower()
    dir_tag = DIRECTION_TAG[signal.direction]
    tier = signal.tier if hasattr(signal, "tier") and signal.tier else "otc"
    header = TIER_HEADERS.get(tier, TIER_HEADERS["otc"])
    badge = TIER_BADGES.get(tier, "OTC")
    tier_tag = TIER_TAGS.get(tier, "#otc")

    lines = [
        f"{header}",
        f"━━━━━━━━━━━━━━━",
        f"",
        f"📊 <b>Пара:</b> {signal.pair}",
        f"📈 <b>Направление:</b> {signal.direction} {arrow}",
        f"⏱ <b>Экспирация:</b> {signal.expiration}",
        f"🤖 <b>AI Confidence:</b> {signal.confidence}%",
        f"🏷 <b>Тип:</b> {badge}",
    ]

    if hasattr(signal, "analysis") and signal.analysis:
        lines.append(f"")
        lines.append(f"📝 <b>Анализ:</b> {signal.analysis}")

    lines.extend([
        f"",
        f"━━━━━━━━━━━━━━━",
        f"⚡ Рекомендуемый объём: 1-3% депозита",
        f'🔗 <a href="{pocket_option_url}">Открыть Pocket Option →</a>',
        f"",
        f"#signal #{pair_tag} #{dir_tag} {tier_tag}",
    ])

    return "\n".join(lines)


def format_stats(total_signals: int, total_users: int) -> str:
    win_rate = 87.3
    return (
        f"📊 <b>Статистика Signal Trade GPT</b>\n"
        f"\n"
        f"✅ <b>Точность сигналов:</b> {win_rate}%\n"
        f"📡 <b>Всего сигналов:</b> {total_signals:,}\n"
        f"👥 <b>Пользователей:</b> {total_users:,}\n"
        f"⏰ <b>Режим работы:</b> 24/7 (OTC) / 08:00-22:00 UTC (Биржа)\n"
        f"\n"
        f"<b>Тарифы:</b>\n"
        f"  🔵 Free — OTC сигналы (3-5/день)\n"
        f"  🟢 Premium — OTC + Биржа (15-25/день)\n"
        f"  🟡 Elite — Все + экспертный анализ\n"
        f"\n"
        f"<i>Данные обновляются в режиме реального времени</i>"
    )


def format_welcome(first_name: str, referral_code: str, bot_username: str) -> str:
    referral_link = f"https://t.me/{bot_username}?start={referral_code}"
    return (
        f"👋 Привет, <b>{first_name}</b>!\n"
        f"\n"
        f"🤖 <b>Signal Trade GPT</b> — AI-система генерации торговых сигналов для Pocket Option.\n"
        f"\n"
        f"📊 <b>Что ты получаешь:</b>\n"
        f"🔵 OTC сигналы 24/7 — бесплатно\n"
        f"🟢 Биржевые сигналы — Premium\n"
        f"🟡 Elite анализ — VIP + депозит $500+\n"
        f"\n"
        f"💡 <b>Команды:</b>\n"
        f"/signals — текущие сигналы\n"
        f"/plan — твой тариф\n"
        f"/promo — активировать промо-код\n"
        f"/stats — статистика\n"
        f"/ref — реферальная ссылка\n"
        f"\n"
        f"🔗 <b>Твоя реферальная ссылка:</b>\n"
        f"<code>{referral_link}</code>\n"
        f"\n"
        f"💎 <b>Есть промо-код?</b> Используй /promo КОД для активации!\n"
        f"\n"
        f"⚠️ <i>Signal Trade GPT не является финансовым советником. "
        f"Все сигналы предоставляются в информационных целях. "
        f"Торговля бинарными опционами сопряжена с высоким риском потери средств.</i>"
    )


def format_plan_info(plan: str, is_premium: bool) -> str:
    plan_names = {
        "free": "🔵 Free",
        "premium": "🟢 Premium",
        "vip": "🟡 VIP",
        "elite": "💎 Elite",
    }
    plan_name = plan_names.get(plan, "🔵 Free")

    tiers_access = {
        "free": ["🔵 OTC (3-5/день)"],
        "premium": ["🔵 OTC (15-25/день)", "🟢 Биржевые"],
        "vip": ["🔵 OTC (безлимит)", "🟢 Биржевые", "🟡 Elite (при депозите $500+)"],
        "elite": ["🔵 OTC (безлимит)", "🟢 Биржевые", "🟡 Elite"],
    }
    access = tiers_access.get(plan, tiers_access["free"])
    access_str = "\n".join(f"  {a}" for a in access)

    return (
        f"📋 <b>Твой тариф:</b> {plan_name}\n"
        f"\n"
        f"<b>Доступные сигналы:</b>\n"
        f"{access_str}\n"
        f"\n"
        f"💎 Обновить тариф: /upgrade"
    )
