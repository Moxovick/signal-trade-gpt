import Link from "next/link";
import { Logo } from "@/components/shared/Logo";

const BOT_URL = process.env.NEXT_PUBLIC_BOT_URL ?? "https://t.me/traitsignaltsest_bot";

const PLANS = [
  {
    name: "FREE", desc: "Начни торговать бесплатно", price: "0", badge: null, color: "#888",
    features: [
      "3–5 OTC сигналов в день",
      "4 основных пары",
      "Базовый AI Confidence",
      "Telegram уведомления",
      "Реферальная программа 10%",
    ],
    limitations: ["Биржевые сигналы", "Elite анализ", "Приоритетная поддержка"],
    cta: "Начать бесплатно",
  },
  {
    name: "PREMIUM", desc: "Серьёзная торговля", price: "29", badge: "ПОПУЛЯРНЫЙ", color: "#00e5a0",
    features: [
      "15–25 сигналов OTC + Биржа",
      "Все 12 валютных пар",
      "Расширенный AI Confidence",
      "Анализ и reasoning",
      "Email поддержка",
      "Реферальная программа 15%",
    ],
    limitations: ["Elite сигналы"],
    cta: "Подключить Premium →",
  },
  {
    name: "VIP", desc: "Максимум возможностей", price: "79", badge: null, color: "#f5c518",
    features: [
      "Безлимит OTC + Биржа",
      "Все пары + экзотика",
      "Полная AI аналитика",
      "Детальный reasoning",
      "Приоритет 24/7",
      "Реферальная 20%",
      "Elite (при депозите $500+)",
    ],
    limitations: [],
    cta: "Подключить VIP →",
  },
];

const COMPARE = [
  { feature: "OTC сигналов в день", free: "3–5", premium: "15–25", vip: "Безлимит", elite: "Безлимит" },
  { feature: "Биржевые сигналы", free: "—", premium: "✓", vip: "✓", elite: "✓" },
  { feature: "Elite сигналы", free: "—", premium: "—", vip: "При депозите", elite: "✓" },
  { feature: "Валютных пар", free: "4", premium: "12", vip: "12+", elite: "12+" },
  { feature: "AI Confidence", free: "Базовый", premium: "Расширенный", vip: "Полный", elite: "Максимальный" },
  { feature: "Анализ и reasoning", free: "—", premium: "Краткий", vip: "Детальный", elite: "Экспертный" },
  { feature: "Экспирация", free: "1–5 мин", premium: "30с–5 мин", vip: "30с–15 мин", elite: "30с–15 мин" },
  { feature: "Реферальная %", free: "10%", premium: "15%", vip: "20%", elite: "25%" },
  { feature: "Поддержка", free: "FAQ", premium: "Email", vip: "Приоритет 24/7", elite: "Персональный менеджер" },
  { feature: "Минимальный депозит", free: "—", premium: "—", vip: "—", elite: "$500" },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen relative z-10">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 md:px-6 py-3 glass">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/"><Logo size="md" glow /></Link>
          <div className="hidden md:flex items-center gap-6 text-sm text-[#888]">
            <Link href="/" className="hover:text-[#f5c518] transition-colors">Главная</Link>
            <Link href="/how-it-works" className="hover:text-[#f5c518] transition-colors">Как работает</Link>
            <Link href="/faq" className="hover:text-[#f5c518] transition-colors">FAQ</Link>
          </div>
          <a href={BOT_URL} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-xl text-sm font-semibold" style={{ background: "#f5c518", color: "#08081a" }}>Подключить →</a>
        </div>
      </nav>

      <section className="pt-28 md:pt-36 pb-12 px-4 text-center">
        <span className="inline-block px-4 py-1 rounded-full text-xs font-semibold mb-4 tier-elite">Тарифы</span>
        <h1 className="text-5xl md:text-7xl font-black tracking-wider mb-4" style={{ fontFamily: "var(--font-bebas)" }}>
          ВЫБЕРИ СВОЙ <span className="text-gold-gradient">ПЛАН</span>
        </h1>
        <p className="text-[#888] max-w-lg mx-auto">
          Начни бесплатно. Масштабируйся до Elite когда будешь готов.
          Промо-код при регистрации — неделя Premium бесплатно.
        </p>
      </section>

      {/* Plans */}
      <section className="px-4 pb-16">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <div key={plan.name} className={`relative rounded-2xl p-6 border flex flex-col ${plan.badge ? "signal-card-elite" : ""}`} style={{ background: plan.badge ? "linear-gradient(180deg, rgba(245,197,24,0.06) 0%, var(--card-bg) 100%)" : "var(--card-bg)", borderColor: plan.badge ? "rgba(245,197,24,0.3)" : "var(--border)" }}>
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold" style={{ background: "linear-gradient(135deg, #f5c518, #f0a500)", color: "#08081a" }}>⚡ {plan.badge}</div>
              )}
              <h3 className="text-2xl font-black tracking-wider mt-2" style={{ fontFamily: "var(--font-bebas)", color: plan.color }}>{plan.name}</h3>
              <p className="text-xs text-[#666] mb-4">{plan.desc}</p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-sm text-[#888]">$</span>
                <span className="text-5xl font-bold text-gold-gradient" style={{ fontFamily: "var(--font-jetbrains)" }}>{plan.price}</span>
                <span className="text-sm text-[#666]">/мес</span>
              </div>
              <div className="space-y-2 flex-1 mb-6">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-start gap-2 text-sm">
                    <span style={{ color: "#00e5a0" }}>✓</span>
                    <span className="text-[#ccc]">{f}</span>
                  </div>
                ))}
                {plan.limitations.map((f) => (
                  <div key={f} className="flex items-start gap-2 text-sm">
                    <span style={{ color: "#333" }}>✗</span>
                    <span className="text-[#333]">{f}</span>
                  </div>
                ))}
              </div>
              <a href={BOT_URL} target="_blank" rel="noopener noreferrer" className="block text-center py-3 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02]" style={{ background: plan.badge ? "linear-gradient(135deg, #f5c518, #f0a500)" : "transparent", color: plan.badge ? "#08081a" : "#f5c518", border: plan.badge ? "none" : "1px solid rgba(245,197,24,0.2)" }}>{plan.cta}</a>
            </div>
          ))}
        </div>

        {/* Elite block */}
        <div className="max-w-5xl mx-auto mt-8">
          <div className="signal-card-elite rounded-2xl p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#f5c518] to-transparent" />
            <span className="inline-block px-4 py-1 rounded-full text-xs font-bold mb-4 tier-elite">ELITE</span>
            <h3 className="text-3xl md:text-4xl font-black tracking-wider mb-3" style={{ fontFamily: "var(--font-bebas)" }}>
              <span className="text-gold-gradient">ELITE УГОДИ</span>
            </h3>
            <p className="text-[#888] max-w-xl mx-auto mb-6 text-sm">
              Максимальный уровень анализа. AI + экспертная аналитика. Персональный менеджер.
              Для доступа к Elite оформите VIP подписку и внесите депозит от $500 на Pocket Option
              через нашу партнёрскую ссылку.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: "Точность", value: "90-96%", icon: "🎯" },
                { label: "Reasoning", value: "Экспертный", icon: "🧠" },
                { label: "Менеджер", value: "Персональный", icon: "👤" },
                { label: "Депозит", value: "от $500", icon: "💰" },
              ].map(({ label, value, icon }) => (
                <div key={label} className="card-premium rounded-xl p-3">
                  <div className="text-lg mb-1">{icon}</div>
                  <div className="text-sm font-bold text-gold-gradient">{value}</div>
                  <div className="text-xs text-[#555]">{label}</div>
                </div>
              ))}
            </div>
            <a href={BOT_URL} target="_blank" rel="noopener noreferrer" className="inline-block px-8 py-3 rounded-xl font-bold text-sm transition-all hover:scale-[1.02]" style={{ background: "linear-gradient(135deg, #f5c518, #f0a500)", color: "#08081a" }}>Подключить Elite →</a>
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section className="px-4 pb-16" style={{ background: "var(--surface)" }}>
        <div className="max-w-5xl mx-auto py-12">
          <h2 className="text-3xl md:text-4xl font-black tracking-wider text-center mb-8" style={{ fontFamily: "var(--font-bebas)" }}>
            ПОЛНОЕ <span className="text-gold-gradient">СРАВНЕНИЕ</span>
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(245,197,24,0.1)" }}>
                  <th className="text-left py-3 px-3 text-[#888] font-medium">Функция</th>
                  <th className="py-3 px-3 text-center text-[#888] font-medium">Free</th>
                  <th className="py-3 px-3 text-center font-medium" style={{ color: "#00e5a0" }}>Premium</th>
                  <th className="py-3 px-3 text-center font-medium" style={{ color: "#f5c518" }}>VIP</th>
                  <th className="py-3 px-3 text-center font-medium text-gold-gradient">Elite</th>
                </tr>
              </thead>
              <tbody>
                {COMPARE.map((row) => (
                  <tr key={row.feature} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                    <td className="py-3 px-3 text-[#ccc]">{row.feature}</td>
                    <td className="py-3 px-3 text-center text-[#888]">{row.free}</td>
                    <td className="py-3 px-3 text-center text-[#ccc]">{row.premium}</td>
                    <td className="py-3 px-3 text-center text-[#ccc]">{row.vip}</td>
                    <td className="py-3 px-3 text-center text-gold-gradient font-semibold">{row.elite}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Promo CTA */}
      <section className="px-4 py-12 text-center">
        <div className="card-premium rounded-2xl p-8 max-w-lg mx-auto">
          <h3 className="text-2xl font-black tracking-wider mb-3" style={{ fontFamily: "var(--font-bebas)" }}>
            ЕСТЬ <span className="text-gold-gradient">ПРОМО-КОД?</span>
          </h3>
          <p className="text-sm text-[#888] mb-4">
            Введите промо-код при регистрации и получите неделю Premium-сигналов бесплатно!
          </p>
          <Link href="/register" className="inline-block px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02]" style={{ background: "linear-gradient(135deg, #f5c518, #f0a500)", color: "#08081a" }}>
            Зарегистрироваться с промо-кодом →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-8 glass">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo size="sm" />
          <p className="text-xs text-[#333]">Signal Trade GPT не является финансовым советником. Торговля сопряжена с риском.</p>
        </div>
      </footer>
    </main>
  );
}
