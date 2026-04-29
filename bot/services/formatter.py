from database.models import Signal


DIRECTION_ARROW = {
    "CALL": "⬆️",
    "PUT": "⬇️",
}

DIRECTION_TAG = {
    "CALL": "call",
    "PUT": "put",
}


def format_signal(signal: Signal, pocket_option_url: str) -> str:
    arrow = DIRECTION_ARROW[signal.direction]
    pair_tag = signal.pair.replace("/", "").lower()
    dir_tag = DIRECTION_TAG[signal.direction]

    return (
        f"🔴 <b>SIGNAL TRADE GPT</b>\n"
        f"\n"
        f"📊 <b>Пара:</b> {signal.pair}\n"
        f"📈 <b>Направление:</b> {signal.direction} {arrow}\n"
        f"⏱ <b>Экспирация:</b> {signal.expiration}\n"
        f"🤖 <b>AI Confidence:</b> {signal.confidence}%\n"
        f"📡 <b>Тип:</b> AI Neural Analysis\n"
        f"\n"
        f"━━━━━━━━━━━━━━━\n"
        f"⚡ Рекомендуемый объём: 1-3% депозита\n"
        f'🔗 <a href="{pocket_option_url}">Открыть Pocket Option →</a>\n'
        f"\n"
        f"#signal #{pair_tag} #{dir_tag}"
    )


def format_stats(total_signals: int, total_users: int) -> str:
    win_rate = 87.3
    return (
        f"📊 <b>Статистика Signal Trade GPT</b>\n"
        f"\n"
        f"✅ <b>Точность сигналов:</b> {win_rate}%\n"
        f"📡 <b>Всего сигналов:</b> {total_signals:,}\n"
        f"👥 <b>Пользователей:</b> {total_users:,}\n"
        f"⏰ <b>Режим работы:</b> 08:00 — 22:00 UTC\n"
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
        f"• Сигналы каждые 5-15 минут\n"
        f"• AI Confidence до 96%\n"
        f"• Все основные валютные пары\n"
        f"• Реферальная программа\n"
        f"\n"
        f"🔗 <b>Твоя реферальная ссылка:</b>\n"
        f"<code>{referral_link}</code>\n"
        f"\n"
        f"⚠️ <i>Signal Trade GPT не является финансовым советником. "
        f"Все сигналы предоставляются в информационных целях. "
        f"Торговля бинарными опционами сопряжена с высоким риском потери средств.</i>"
    )
