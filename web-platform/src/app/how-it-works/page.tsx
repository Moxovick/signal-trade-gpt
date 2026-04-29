import Link from "next/link";
import { Logo } from "@/components/shared/Logo";

const BOT_URL = process.env.NEXT_PUBLIC_BOT_URL ?? "https://t.me/traitsignaltsest_bot";

const STEPS = [
  {
    num: "01", title: "ПОДКЛЮЧИ БОТА", icon: "📱",
    desc: "Нажми /start в Telegram-боте Signal Trade GPT. Регистрация занимает 10 секунд — только email и пароль.",
    details: ["Мгновенная активация", "Бесплатный OTC-доступ сразу", "Промо-код = неделя Premium"],
  },
  {
    num: "02", title: "ВЫБЕРИ ТАРИФ", icon: "💎",
    desc: "Free, Premium, VIP или Elite — каждый тариф открывает новые типы сигналов и расширяет аналитику.",
    details: ["Free: 3-5 OTC сигналов/день", "Premium: OTC + Биржевые, 15-25/день", "VIP/Elite: Безлимит + экспертный анализ"],
  },
  {
    num: "03", title: "ПОЛУЧИ СИГНАЛ", icon: "📊",
    desc: "AI анализирует рынок и присылает CALL/PUT прямо в Telegram. Каждый сигнал с AI Confidence и reasoning.",
    details: ["Пара + направление + экспирация", "AI Confidence 73-96%", "Анализ: почему вверх/вниз"],
  },
  {
    num: "04", title: "ТОРГУЙ И ЗАРАБАТЫВАЙ", icon: "📈",
    desc: "Открой сделку в Pocket Option по полученному сигналу. Рекомендуемый объём — 1-3% депозита.",
    details: ["Pocket Option — лучший брокер", "1-3% депозита на сделку", "Результат: WIN/LOSS фиксируется"],
  },
];

const TIERS_INFO = [
  { name: "OTC Угоди", tier: "otc", color: "#8888ff", access: "Free+", desc: "Внебиржевой рынок 24/7. Торгуй даже когда биржи закрыты. 4 основных пары.", accuracy: "82-85%" },
  { name: "Біржеві Угоди", tier: "exchange", color: "#00e5a0", access: "Premium+", desc: "Реальный биржевой рынок. Все 12 пар. Расширенный AI-анализ и reasoning.", accuracy: "85-89%" },
  { name: "Еліт Угоди", tier: "elite", color: "#f5c518", access: "VIP + $500", desc: "Максимальный анализ. AI + экспертная аналитика. Персональный менеджер.", accuracy: "90-96%" },
];

const PAIRS = [
  "EUR/USD", "GBP/USD", "USD/JPY", "AUD/USD", "EUR/GBP", "GBP/JPY",
  "USD/CHF", "NZD/USD", "EUR/JPY", "AUD/JPY", "USD/CAD", "EUR/AUD",
];

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen relative z-10">
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 md:px-6 py-3 glass">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/"><Logo size="md" glow /></Link>
          <div className="hidden md:flex items-center gap-6 text-sm text-[#888]">
            <Link href="/" className="hover:text-[#f5c518] transition-colors">Главная</Link>
            <Link href="/pricing" className="hover:text-[#f5c518] transition-colors">Тарифы</Link>
            <Link href="/faq" className="hover:text-[#f5c518] transition-colors">FAQ</Link>
          </div>
          <a href={BOT_URL} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-xl text-sm font-semibold" style={{ background: "#f5c518", color: "#08081a" }}>Подключить →</a>
        </div>
      </nav>

      <section className="pt-28 md:pt-36 pb-12 px-4 text-center">
        <span className="inline-block px-4 py-1 rounded-full text-xs font-semibold mb-4 tier-exchange">Как работает</span>
        <h1 className="text-5xl md:text-7xl font-black tracking-wider mb-4" style={{ fontFamily: "var(--font-bebas)" }}>
          4 ШАГА ДО <span className="text-gold-gradient">ПРОФИТА</span>
        </h1>
        <p className="text-[#888] max-w-lg mx-auto">От подключения бота до первой прибыльной сделки — меньше 5 минут</p>
      </section>

      {/* Steps */}
      <section className="px-4 pb-16">
        <div className="max-w-4xl mx-auto space-y-6">
          {STEPS.map((step, i) => (
            <div key={step.num} className="card-premium rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start">
              <div className="shrink-0 text-center">
                <div className="text-4xl mb-2">{step.icon}</div>
                <div className="text-xs font-mono text-gold-gradient font-bold">{step.num}</div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-black tracking-wider mb-2" style={{ fontFamily: "var(--font-bebas)", color: "#f5c518" }}>{step.title}</h3>
                <p className="text-sm text-[#888] mb-3">{step.desc}</p>
                <div className="space-y-1">
                  {step.details.map((d) => (
                    <div key={d} className="flex items-center gap-2 text-xs text-[#ccc]">
                      <span style={{ color: "#00e5a0" }}>✓</span> {d}
                    </div>
                  ))}
                </div>
              </div>
              {i < STEPS.length - 1 && <div className="hidden md:block text-[#333] text-2xl self-center">→</div>}
            </div>
          ))}
        </div>
      </section>

      {/* Signal example */}
      <section className="px-4 pb-16" style={{ background: "var(--surface)" }}>
        <div className="max-w-4xl mx-auto py-12">
          <h2 className="text-3xl md:text-4xl font-black tracking-wider text-center mb-8" style={{ fontFamily: "var(--font-bebas)" }}>
            КАК ВЫГЛЯДИТ <span className="text-gold-gradient">СИГНАЛ</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {TIERS_INFO.map((tier) => (
              <div key={tier.tier} className="card-premium rounded-2xl p-5 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: tier.color }} />
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold mb-3 inline-block tier-${tier.tier}`}>{tier.access}</span>
                <h3 className="text-lg font-bold mb-2" style={{ fontFamily: "var(--font-bebas)", color: tier.color, letterSpacing: "0.05em" }}>{tier.name}</h3>
                <p className="text-xs text-[#888] mb-3">{tier.desc}</p>

                <div className="rounded-xl p-3 mb-3" style={{ background: "rgba(0,0,0,0.3)" }}>
                  <div className="text-xs text-[#555] mb-1 font-mono">Пример сигнала:</div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-bold text-sm">EUR/USD</span>
                    <span className="text-xs px-1.5 py-0.5 rounded font-bold" style={{ background: "rgba(0,229,160,0.15)", color: "#00e5a0" }}>CALL ⬆</span>
                  </div>
                  <div className="text-xs text-[#666]">Экспирация: 1 мин · AI: <span style={{ color: tier.color }}>{tier.accuracy.split("-")[1]}</span></div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#555]">Точность:</span>
                  <span className="text-sm font-bold" style={{ color: tier.color }}>{tier.accuracy}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported pairs */}
      <section className="px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black tracking-wider text-center mb-8" style={{ fontFamily: "var(--font-bebas)" }}>
            ПОДДЕРЖИВАЕМЫЕ <span className="text-gold-gradient">ПАРЫ</span>
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
            {PAIRS.map((pair) => (
              <div key={pair} className="card-premium rounded-xl p-3 text-center hover:scale-[1.02] transition-transform">
                <span className="font-mono font-bold text-sm text-gold-gradient">{pair}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-12 text-center">
        <h2 className="text-4xl md:text-5xl font-black tracking-wider mb-6" style={{ fontFamily: "var(--font-bebas)" }}>
          ГОТОВ <span className="text-gold-gradient">НАЧАТЬ?</span>
        </h2>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
          <a href={BOT_URL} target="_blank" rel="noopener noreferrer" className="px-8 py-4 rounded-2xl font-bold transition-all hover:scale-105" style={{ background: "linear-gradient(135deg, #f5c518, #f0a500)", color: "#08081a" }}>🚀 Подключить бота</a>
          <Link href="/register" className="px-8 py-4 rounded-2xl font-bold card-premium transition-all" style={{ color: "#f5c518" }}>Создать аккаунт →</Link>
        </div>
        <p className="text-xs text-[#555]">✓ Промо-код при регистрации · ✓ Бесплатный старт · ✓ 24/7</p>
      </section>

      <footer className="px-4 py-8 glass">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo size="sm" />
          <p className="text-xs text-[#333]">Signal Trade GPT не является финансовым советником. Торговля сопряжена с риском.</p>
        </div>
      </footer>
    </main>
  );
}
