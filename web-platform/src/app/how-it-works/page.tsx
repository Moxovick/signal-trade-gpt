import Link from "next/link";

const BOT_URL = process.env.NEXT_PUBLIC_BOT_URL ?? "https://t.me/traitsignaltsest_bot";

const STEPS = [
  {
    num: "01",
    title: "Подключи бота",
    desc: "Найдите @traitsignaltsest_bot в Telegram и нажмите /start. Регистрация занимает 10 секунд — никаких документов, верификаций и привязки карт.",
    details: [
      "Моментальная регистрация по Telegram ID",
      "Автоматическая генерация реферального кода",
      "Доступ к Free-тарифу сразу после подключения",
    ],
    icon: "📱",
  },
  {
    num: "02",
    title: "AI анализирует рынок",
    desc: "Наша нейросеть работает 24/7, сканируя 12 валютных пар в реальном времени. Система анализирует графические паттерны, волатильность и исторические данные.",
    details: [
      "12 валютных пар: EUR/USD, GBP/USD, USD/JPY и другие",
      "Анализ в реальном времени каждые 5-15 минут",
      "AI Confidence от 73% до 96%",
    ],
    icon: "🧠",
  },
  {
    num: "03",
    title: "Получи сигнал",
    desc: "Когда AI обнаруживает торговую возможность, вам мгновенно приходит push-уведомление в Telegram с полной информацией для входа в сделку.",
    details: [
      "Направление: CALL (вверх) или PUT (вниз)",
      "Экспирация: от 30 сек до 15 мин",
      "AI Confidence: уровень уверенности нейросети",
    ],
    icon: "📊",
  },
  {
    num: "04",
    title: "Открой сделку",
    desc: "Откройте Pocket Option, выберите указанную пару и направление, установите экспирацию и объём. Рекомендуемый объём — 1-3% от депозита.",
    details: [
      "Войдите на Pocket Option по ссылке в сигнале",
      "Установите экспирацию из сигнала",
      "Рекомендуемый объём: 1-3% депозита",
    ],
    icon: "📈",
  },
];

const PAIRS = [
  { pair: "EUR/USD", type: "Мажор" },
  { pair: "GBP/USD", type: "Мажор" },
  { pair: "USD/JPY", type: "Мажор" },
  { pair: "AUD/USD", type: "Мажор" },
  { pair: "EUR/GBP", type: "Кросс" },
  { pair: "GBP/JPY", type: "Кросс" },
  { pair: "USD/CHF", type: "Мажор" },
  { pair: "NZD/USD", type: "Мажор" },
  { pair: "EUR/JPY", type: "Кросс" },
  { pair: "AUD/JPY", type: "Кросс" },
  { pair: "USD/CAD", type: "Мажор" },
  { pair: "EUR/AUD", type: "Кросс" },
];

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-[#07070d] pt-8 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-sm text-[#555] hover:text-[#888] transition-colors">
          ← На главную
        </Link>

        <div className="text-center mt-8 mb-16">
          <span className="inline-block px-4 py-1 rounded-full text-xs font-semibold mb-4" style={{ background: "rgba(245,197,24,0.1)", color: "#f5c518" }}>
            Как это работает
          </span>
          <h1 className="text-5xl md:text-6xl font-black tracking-wider mb-4" style={{ fontFamily: "var(--font-bebas)" }}>
            4 ШАГА ДО <span style={{ color: "#f5c518" }}>ПЕРВОГО СИГНАЛА</span>
          </h1>
          <p className="text-[#888] max-w-lg mx-auto">
            От подключения бота до первой сделки — менее 1 минуты. Без опыта и сложных стратегий.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-8 mb-16">
          {STEPS.map((step) => (
            <div key={step.num} className="rounded-2xl p-6 md:p-8 border" style={{ background: "#0d0d18", borderColor: "rgba(255,255,255,0.07)" }}>
              <div className="flex items-start gap-6">
                <div className="shrink-0">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl" style={{ background: "rgba(245,197,24,0.1)" }}>
                    {step.icon}
                  </div>
                  <div className="text-center mt-2 text-xs font-mono" style={{ color: "#f5c518" }}>{step.num}</div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "var(--font-bebas)", letterSpacing: "0.05em" }}>{step.title}</h3>
                  <p className="text-sm text-[#888] leading-relaxed mb-4">{step.desc}</p>
                  <div className="space-y-2">
                    {step.details.map((d) => (
                      <div key={d} className="flex items-start gap-2 text-sm">
                        <span style={{ color: "#00e5a0" }}>✓</span>
                        <span className="text-[#aaa]">{d}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Signal example */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-6">Пример сигнала</h2>
          <div className="max-w-md mx-auto rounded-2xl p-6 border" style={{ background: "#0d0d18", borderColor: "rgba(0,229,160,0.2)" }}>
            <div className="text-center mb-4">
              <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: "rgba(245,197,24,0.12)", color: "#f5c518" }}>
                SIGNAL TRADE GPT
              </span>
            </div>
            <div className="space-y-3 text-sm font-mono">
              <div className="flex justify-between"><span className="text-[#888]">📊 Пара:</span><span className="font-bold">EUR/USD</span></div>
              <div className="flex justify-between"><span className="text-[#888]">📈 Направление:</span><span className="font-bold" style={{ color: "#00e5a0" }}>CALL ⬆</span></div>
              <div className="flex justify-between"><span className="text-[#888]">⏱ Экспирация:</span><span>1 мин</span></div>
              <div className="flex justify-between"><span className="text-[#888]">🤖 AI Confidence:</span><span className="font-bold" style={{ color: "#f5c518" }}>87%</span></div>
              <div className="flex justify-between"><span className="text-[#888]">📡 Тип:</span><span>AI Neural Analysis</span></div>
            </div>
            <div className="mt-4 pt-4 border-t text-xs text-[#555]" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              ⚡ Рекомендуемый объём: 1-3% депозита
            </div>
          </div>
        </div>

        {/* Supported pairs */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-6">Поддерживаемые пары</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {PAIRS.map(({ pair, type }) => (
              <div key={pair} className="rounded-xl p-4 border text-center" style={{ background: "#0d0d18", borderColor: "rgba(255,255,255,0.07)" }}>
                <div className="text-sm font-bold font-mono" style={{ color: "#f5c518" }}>{pair}</div>
                <div className="text-xs text-[#555] mt-1">{type}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center p-8 rounded-2xl border" style={{ background: "rgba(245,197,24,0.04)", borderColor: "rgba(245,197,24,0.15)" }}>
          <h3 className="text-2xl font-bold mb-3">Готов начать?</h3>
          <p className="text-sm text-[#888] mb-6">Подключи бота прямо сейчас и получи первые сигналы бесплатно</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href={BOT_URL} target="_blank" rel="noopener noreferrer" className="px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-105" style={{ background: "#f5c518", color: "#07070d" }}>
              🚀 Подключить бота
            </a>
            <Link href="/register" className="px-6 py-3 rounded-xl font-semibold text-sm border transition-all" style={{ borderColor: "rgba(245,197,24,0.3)", color: "#f5c518" }}>
              Создать аккаунт →
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
