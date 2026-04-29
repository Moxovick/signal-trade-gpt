import Link from "next/link";

const BOT_URL = process.env.NEXT_PUBLIC_BOT_URL ?? "https://t.me/traitsignaltsest_bot";

const PLANS = [
  {
    name: "FREE",
    desc: "Для знакомства с платформой",
    price: "0",
    features: [
      { text: "3–5 сигналов в день", ok: true },
      { text: "4 основных пары (EUR/USD, GBP/USD, USD/JPY, AUD/USD)", ok: true },
      { text: "Экспирация 1–5 мин", ok: true },
      { text: "Telegram уведомления", ok: true },
      { text: "Реферальная программа 10%", ok: true },
      { text: "Все торговые пары", ok: false },
      { text: "Email поддержка", ok: false },
      { text: "Поддержка 24/7", ok: false },
    ],
    featured: false,
    btnText: "Начать бесплатно",
  },
  {
    name: "PREMIUM",
    desc: "Для серьёзных трейдеров",
    price: "29",
    badge: "ПОПУЛЯРНЫЙ",
    features: [
      { text: "15–25 сигналов в день", ok: true },
      { text: "Все 12 валютных пар", ok: true },
      { text: "Экспирация 30 сек – 15 мин", ok: true },
      { text: "Расширенный AI Confidence", ok: true },
      { text: "Реферальная программа 15%", ok: true },
      { text: "Email поддержка", ok: true },
      { text: "Приоритет в обработке", ok: true },
      { text: "Приоритет 24/7 поддержка", ok: false },
    ],
    featured: true,
    btnText: "Подключить Premium →",
  },
  {
    name: "VIP",
    desc: "Максимум возможностей",
    price: "79",
    features: [
      { text: "Безлимитные сигналы", ok: true },
      { text: "Все пары + экзотика", ok: true },
      { text: "Все варианты экспирации", ok: true },
      { text: "Полная AI аналитика", ok: true },
      { text: "Реферальная программа 20%", ok: true },
      { text: "Приоритет 24/7 поддержка", ok: true },
      { text: "Персональный менеджер", ok: true },
      { text: "Ранний доступ к функциям", ok: true },
    ],
    featured: false,
    btnText: "Подключить VIP →",
  },
];

const COMPARISON = [
  { feature: "Сигналов в день", free: "3–5", premium: "15–25", vip: "Безлимит" },
  { feature: "Валютные пары", free: "4", premium: "12", vip: "12 + экзотика" },
  { feature: "Экспирация", free: "1–5 мин", premium: "30с – 15 мин", vip: "Все" },
  { feature: "AI Confidence", free: "Базовый", premium: "Расширенный", vip: "Полный" },
  { feature: "Реферальная комиссия", free: "10%", premium: "15%", vip: "20%" },
  { feature: "Поддержка", free: "—", premium: "Email", vip: "24/7 + менеджер" },
  { feature: "Telegram бот", free: "✓", premium: "✓", vip: "✓" },
  { feature: "Веб-кабинет", free: "✓", premium: "✓", vip: "✓" },
  { feature: "Аналитика", free: "—", premium: "Базовая", vip: "Полная" },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#07070d] pt-8 pb-20 px-4">
      {/* Back */}
      <div className="max-w-5xl mx-auto mb-8">
        <Link href="/" className="text-sm text-[#555] hover:text-[#888] transition-colors">
          ← На главную
        </Link>
      </div>

      {/* Header */}
      <div className="text-center mb-12">
        <span className="inline-block px-4 py-1 rounded-full text-xs font-semibold mb-4" style={{ background: "rgba(245,197,24,0.1)", color: "#f5c518" }}>
          Тарифы
        </span>
        <h1 className="text-5xl md:text-6xl font-black tracking-wider mb-4" style={{ fontFamily: "var(--font-bebas)" }}>
          ВЫБЕРИ СВОЙ <span style={{ color: "#f5c518" }}>ПЛАН</span>
        </h1>
        <p className="text-[#888] max-w-lg mx-auto">
          Начни бесплатно и масштабируйся по мере роста. Без привязки карты, отмена в 1 клик.
        </p>
      </div>

      {/* Plan cards */}
      <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6 mb-16">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className="relative rounded-2xl p-6 border flex flex-col"
            style={{
              background: plan.featured ? "linear-gradient(180deg, rgba(245,197,24,0.08) 0%, #0d0d18 100%)" : "#0d0d18",
              borderColor: plan.featured ? "rgba(245,197,24,0.3)" : "rgba(255,255,255,0.07)",
            }}
          >
            {plan.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold" style={{ background: "#f5c518", color: "#07070d" }}>
                ⚡ {plan.badge}
              </div>
            )}
            <h3 className="text-xl font-black tracking-wider mt-2" style={{ fontFamily: "var(--font-bebas)", color: plan.featured ? "#f5c518" : "#e8e8f0" }}>
              {plan.name}
            </h3>
            <p className="text-xs text-[#666] mb-4">{plan.desc}</p>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-sm text-[#888]">$</span>
              <span className="text-5xl font-bold" style={{ fontFamily: "var(--font-jetbrains)", color: "#f5c518" }}>{plan.price}</span>
              <span className="text-sm text-[#666]">/мес</span>
            </div>
            <div className="space-y-2.5 flex-1 mb-6">
              {plan.features.map(({ text, ok }) => (
                <div key={text} className="flex items-start gap-2 text-sm">
                  <span style={{ color: ok ? "#00e5a0" : "#444" }}>{ok ? "✓" : "✗"}</span>
                  <span style={{ color: ok ? "#ccc" : "#444" }}>{text}</span>
                </div>
              ))}
            </div>
            <a
              href={BOT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center py-3 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02]"
              style={{
                background: plan.featured ? "#f5c518" : "transparent",
                color: plan.featured ? "#07070d" : "#f5c518",
                border: plan.featured ? "none" : "1px solid rgba(245,197,24,0.3)",
              }}
            >
              {plan.btnText}
            </a>
          </div>
        ))}
      </div>

      {/* Comparison table */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-6">Сравнение тарифов</h2>
        <div className="rounded-2xl border overflow-hidden" style={{ background: "#0d0d18", borderColor: "rgba(255,255,255,0.07)" }}>
          <div className="grid grid-cols-4 px-5 py-3 text-xs text-[#555] border-b font-semibold" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <span>Функция</span>
            <span className="text-center">Free</span>
            <span className="text-center" style={{ color: "#f5c518" }}>Premium</span>
            <span className="text-center" style={{ color: "#00e5a0" }}>VIP</span>
          </div>
          {COMPARISON.map(({ feature, free, premium, vip }) => (
            <div key={feature} className="grid grid-cols-4 px-5 py-3 text-sm border-b items-center" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
              <span className="text-[#aaa]">{feature}</span>
              <span className="text-center text-[#666]">{free}</span>
              <span className="text-center text-[#ccc]">{premium}</span>
              <span className="text-center text-[#ccc]">{vip}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center mt-12">
        <p className="text-xs text-[#444] max-w-md mx-auto">
          Signal Trade GPT не является финансовым советником. Торговля сопряжена с риском потери средств.
        </p>
      </div>
    </main>
  );
}
