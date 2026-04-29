import Link from "next/link";

const CATEGORIES = [
  {
    title: "Общие вопросы",
    items: [
      { q: "Что такое Signal Trade GPT?", a: "Signal Trade GPT — это AI-платформа, которая анализирует финансовые рынки и генерирует торговые сигналы для бинарных опционов на Pocket Option. Сигналы отправляются в Telegram-бот и доступны в личном кабинете на сайте." },
      { q: "Как работает AI-анализ?", a: "Наша нейросеть непрерывно сканирует 12 валютных пар, анализирует графические паттерны, уровни поддержки/сопротивления и волатильность. При обнаружении торговой возможности генерируется сигнал с указанием направления (CALL/PUT), экспирации и уровня уверенности AI (Confidence)." },
      { q: "Какая точность сигналов?", a: "Средняя точность за последние 30 дней — 87.3%. Это верифицированный результат по всем сигналам. На уровнях AI Confidence 90%+ точность превышает 92%." },
      { q: "Это финансовый совет?", a: "Нет. Signal Trade GPT не является финансовым советником и не предоставляет инвестиционных рекомендаций. Все сигналы носят информационный характер. Торговля бинарными опционами сопряжена с высоким риском потери средств." },
    ],
  },
  {
    title: "Подписки и оплата",
    items: [
      { q: "Сколько стоит подписка?", a: "Free — бесплатно (3-5 сигналов/день, 4 пары). Premium — $29/мес (15-25 сигналов, все 12 пар). VIP — $79/мес (безлимитные сигналы + персональный менеджер)." },
      { q: "Как оплатить подписку?", a: "Оплата принимается в криптовалюте через Cryptomus/NOWPayments. Поддерживаются Bitcoin, Ethereum, USDT и другие популярные монеты." },
      { q: "Могу ли я отменить подписку?", a: "Да, отмена в 1 клик. Нет скрытых платежей и привязки карты. Подписка действует до конца оплаченного периода. Возврат средств возможен в течение 24 часов после оплаты." },
      { q: "Есть ли пробный период?", a: "Да! Free-тариф — это по сути бесплатный пробный период без ограничения по времени. Вы получаете 3-5 сигналов в день на 4 основных парах." },
    ],
  },
  {
    title: "Сигналы и торговля",
    items: [
      { q: "Какие валютные пары поддерживаются?", a: "Free: EUR/USD, GBP/USD, USD/JPY, AUD/USD. Premium и VIP: все 12 пар включая EUR/GBP, GBP/JPY, USD/CHF, NZD/USD, EUR/JPY, AUD/JPY, USD/CAD, EUR/AUD." },
      { q: "Как часто приходят сигналы?", a: "Сигналы генерируются каждые 5-15 минут в рабочее время (08:00 — 22:00 UTC). Количество зависит от тарифа: 3-5 (Free), 15-25 (Premium), безлимит (VIP)." },
      { q: "Что означает AI Confidence?", a: "AI Confidence — это уровень уверенности нейросети в прогнозе (от 73% до 96%). Чем выше значение, тем выше вероятность правильного прогноза. Рекомендуем обращать внимание на сигналы с Confidence 85%+." },
      { q: "Какой рекомендуемый объём сделки?", a: "Мы рекомендуем использовать 1-3% от депозита на каждую сделку. Это стандартное правило управления рисками, которое защитит ваш капитал." },
    ],
  },
  {
    title: "Реферальная программа",
    items: [
      { q: "Как работает реферальная программа?", a: "Поделитесь своей реферальной ссылкой с друзьями. Когда они оформят платную подписку, вы получаете комиссию: 10% (Free), 15% (Premium), 20% (VIP) от каждого платежа." },
      { q: "Как получить реферальную ссылку?", a: "Реферальная ссылка доступна в личном кабинете в разделе «Партнёрская программа». Также бот выдаёт ссылку по команде /start." },
      { q: "Как выводить реферальный доход?", a: "Реферальные выплаты обрабатываются ежемесячно. Минимальная сумма для вывода — $10. Выплаты производятся в криптовалюте." },
    ],
  },
];

export default function FaqPage() {
  return (
    <main className="min-h-screen bg-[#07070d] pt-8 pb-20 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-sm text-[#555] hover:text-[#888] transition-colors">
          ← На главную
        </Link>

        <div className="text-center mt-8 mb-12">
          <span className="inline-block px-4 py-1 rounded-full text-xs font-semibold mb-4" style={{ background: "rgba(245,197,24,0.1)", color: "#f5c518" }}>
            FAQ
          </span>
          <h1 className="text-5xl md:text-6xl font-black tracking-wider mb-4" style={{ fontFamily: "var(--font-bebas)" }}>
            ЧАСТО ЗАДАВАЕМЫЕ <span style={{ color: "#f5c518" }}>ВОПРОСЫ</span>
          </h1>
          <p className="text-[#888]">Ответы на самые популярные вопросы о Signal Trade GPT</p>
        </div>

        {CATEGORIES.map((cat) => (
          <div key={cat.title} className="mb-8">
            <h2 className="text-lg font-semibold mb-4 text-[#f5c518]">{cat.title}</h2>
            <div className="space-y-3">
              {cat.items.map((faq) => (
                <details key={faq.q} className="group rounded-2xl border overflow-hidden" style={{ background: "#0d0d18", borderColor: "rgba(255,255,255,0.07)" }}>
                  <summary className="flex items-center justify-between p-5 cursor-pointer text-sm font-medium hover:text-[#f5c518] transition-colors list-none">
                    {faq.q}
                    <span className="text-[#555] group-open:rotate-45 transition-transform text-lg shrink-0 ml-4">+</span>
                  </summary>
                  <div className="px-5 pb-5 text-sm text-[#888] leading-relaxed">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        ))}

        <div className="text-center mt-12 p-6 rounded-2xl border" style={{ background: "#0d0d18", borderColor: "rgba(255,255,255,0.07)" }}>
          <h3 className="font-semibold mb-2">Не нашли ответ?</h3>
          <p className="text-sm text-[#888] mb-4">Свяжитесь с нами через Telegram-бот — мы поможем!</p>
          <a
            href={process.env.NEXT_PUBLIC_BOT_URL ?? "https://t.me/traitsignaltsest_bot"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
            style={{ background: "#f5c518", color: "#07070d" }}
          >
            Написать в бот →
          </a>
        </div>
      </div>
    </main>
  );
}
