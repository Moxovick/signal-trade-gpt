import Link from "next/link";
import { Logo } from "@/components/shared/Logo";

const BOT_URL = process.env.NEXT_PUBLIC_BOT_URL ?? "https://t.me/traitsignaltsest_bot";

const PAIRS = [
  "EUR/USD +0.34%", "GBP/USD -0.12%", "USD/JPY +0.08%", "AUD/USD +0.22%",
  "EUR/GBP -0.05%", "GBP/JPY +0.41%", "USD/CHF -0.18%", "NZD/USD +0.15%",
  "EUR/JPY +0.28%", "AUD/JPY -0.09%", "USD/CAD +0.11%", "EUR/AUD -0.20%",
];

const TIERS = [
  {
    id: "otc",
    name: "OTC Угоди",
    badge: "ДОСТУПНО",
    desc: "Сигналы для OTC-рынка. Торгуйте когда биржи закрыты — 24/7 без ограничений.",
    signals: [
      { pair: "EUR/USD OTC", dir: "CALL", conf: 84, exp: "1 мин" },
      { pair: "GBP/USD OTC", dir: "PUT", conf: 79, exp: "2 мин" },
    ],
    color: "#8888ff",
    plan: "Free+",
  },
  {
    id: "exchange",
    name: "Біржеві Угоди",
    badge: "PREMIUM",
    desc: "Реальные биржевые сигналы. Расширенный AI-анализ по 12 парам с повышенной точностью.",
    signals: [
      { pair: "EUR/USD", dir: "CALL", conf: 91, exp: "5 мин" },
      { pair: "USD/JPY", dir: "PUT", conf: 88, exp: "2 мин" },
    ],
    color: "#00e5a0",
    plan: "Premium",
  },
  {
    id: "elite",
    name: "Еліт Угоди",
    badge: "ELITE",
    desc: "Максимальный анализ. AI + экспертная аналитика. Персональный менеджер. Депозит от $500.",
    signals: [
      { pair: "EUR/USD", dir: "CALL", conf: 96, exp: "30 сек" },
      { pair: "GBP/JPY", dir: "CALL", conf: 94, exp: "1 мин" },
    ],
    color: "#f5c518",
    plan: "Elite ($500+)",
  },
];

const STEPS = [
  { num: "01", title: "ПОДКЛЮЧИ БОТА", desc: "Нажми /start в Telegram-боте. Регистрация за 10 секунд.", icon: "📱" },
  { num: "02", title: "ВЫБЕРИ ТАРИФ", desc: "Free, Premium, VIP или Elite — каждый тариф раскрывает новые возможности.", icon: "💎" },
  { num: "03", title: "ПОЛУЧИ СИГНАЛ", desc: "AI анализирует рынок и присылает CALL/PUT с AI Confidence в Telegram.", icon: "📊" },
  { num: "04", title: "ТОРГУЙ И ЗАРАБАТЫВАЙ", desc: "Открывай сделку в Pocket Option. 1-3% депозита на сделку.", icon: "📈" },
];

const PLANS = [
  {
    name: "FREE", desc: "Знакомство", price: "0", badge: null,
    features: [
      { text: "3–5 OTC сигналов в день", ok: true },
      { text: "4 основных пары", ok: true },
      { text: "Telegram уведомления", ok: true },
      { text: "Реферальная 10%", ok: true },
      { text: "Биржевые сигналы", ok: false },
      { text: "Elite анализ", ok: false },
    ],
    featured: false, btnText: "Начать бесплатно",
  },
  {
    name: "PREMIUM", desc: "Серьёзный трейдинг", price: "29", badge: "ПОПУЛЯРНЫЙ",
    features: [
      { text: "15–25 сигналов OTC + Биржа", ok: true },
      { text: "Все 12 валютных пар", ok: true },
      { text: "Расширенный AI Confidence", ok: true },
      { text: "Email поддержка", ok: true },
      { text: "Реферальная 15%", ok: true },
      { text: "Elite анализ", ok: false },
    ],
    featured: true, btnText: "Подключить Premium →",
  },
  {
    name: "VIP", desc: "Полный доступ", price: "79", badge: null,
    features: [
      { text: "Безлимит OTC + Биржа", ok: true },
      { text: "Все пары + экзотика", ok: true },
      { text: "Полная AI аналитика", ok: true },
      { text: "Приоритет 24/7", ok: true },
      { text: "Реферальная 20%", ok: true },
      { text: "Elite (при депозите $500+)", ok: true },
    ],
    featured: false, btnText: "Подключить VIP →",
  },
];

const REVIEWS = [
  { name: "Алексей К.", plan: "VIP", text: "За 2 месяца вышел в стабильный плюс. AI confidence реально работает — на 90%+ практически всегда в деньгах.", rating: 5 },
  { name: "Марина Р.", plan: "Premium", text: "С Signal Trade GPT наконец-то начала зарабатывать. Бот удобный, всё понятно с первого сигнала.", rating: 5 },
  { name: "Дмитрий В.", plan: "Elite", text: "Elite сигналы — другой уровень. Анализ детальный, confidence 94%+. Окупил депозит за неделю.", rating: 5 },
  { name: "Сергей П.", plan: "VIP", text: "Лучший бот для бинарных опционов. Реферальная программа тоже приносит доход. Спасибо команде!", rating: 5 },
  { name: "Елена М.", plan: "Premium", text: "Удобный формат — сигнал пришёл, открыла сделку, заработала. AI делает всё за тебя.", rating: 4 },
  { name: "Игорь Т.", plan: "Free", text: "Даже на бесплатном тарифе OTC-сигналы дают результат. Планирую брать Premium.", rating: 5 },
];

const FAQS = [
  { q: "Чем отличаются OTC, Биржевые и Elite сигналы?", a: "OTC — сигналы для внебиржевого рынка, доступны 24/7. Биржевые — для реального рынка в торговые часы. Elite — максимальный анализ AI + экспертов, доступен при депозите от $500." },
  { q: "Как получить доступ к Elite сигналам?", a: "Оформите VIP или Elite подписку и внесите депозит от $500 на Pocket Option через нашу партнёрскую ссылку. После верификации депозита Elite-сигналы активируются автоматически." },
  { q: "Какая точность сигналов?", a: "OTC: 82-85%, Биржевые: 85-89%, Elite: 90-96%. Средняя точность за 30 дней — 87.3% по всем тарифам." },
  { q: "Есть промо-код для бесплатного доступа?", a: "Да! При регистрации введите промо-код — получите неделю бесплатных Premium-сигналов. Следите за нашим Telegram-каналом." },
  { q: "Как работает реферальная программа?", a: "Поделитесь ссылкой — получайте 10% (Free), 15% (Premium), 20% (VIP/Elite) от каждого платежа приглашённых пользователей." },
];

export default function HomePage() {
  return (
    <main className="min-h-screen relative z-10">
      {/* ═══ NAV ═══ */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 md:px-6 py-3 glass">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/">
            <Logo size="md" glow />
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm text-[#888]">
            <a href="#signals" className="hover:text-[#f5c518] transition-colors">Сигналы</a>
            <a href="#how" className="hover:text-[#f5c518] transition-colors">Как работает</a>
            <a href="#pricing" className="hover:text-[#f5c518] transition-colors">Тарифы</a>
            <Link href="/faq" className="hover:text-[#f5c518] transition-colors">FAQ</Link>
            <Link href="/login" className="hover:text-[#f5c518] transition-colors">Войти</Link>
          </div>
          <a href={BOT_URL} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105 animate-pulse-gold" style={{ background: "#f5c518", color: "#08081a" }}>
            Подключить бота →
          </a>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="pt-28 md:pt-36 pb-16 px-4 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-8 card-premium">
          <span className="w-2 h-2 rounded-full bg-[#00e5a0] animate-pulse" />
          <span className="text-gold-gradient">AI анализирует рынок 24/7</span>
          <span className="text-[#666]">·</span>
          <span style={{ color: "#00e5a0" }}>87% точность</span>
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-wider mb-6 leading-none" style={{ fontFamily: "var(--font-bebas)" }}>
          <span className="text-[#e8e8f0]">ТОРГУЙ</span>
          <br />
          <span className="text-gold-gradient">КАК ПРОФИ</span>
          <br />
          <span className="text-[#2a2a40]">С НУЛЯ</span>
        </h1>

        <p className="text-base md:text-lg text-[#888] max-w-xl mb-8 leading-relaxed">
          Signal Trade GPT отправляет точные сигналы CALL/PUT для Pocket Option
          прямо в Telegram. <span style={{ color: "#f5c518" }}>OTC · Биржевые · Elite</span> — выбирай свой уровень.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <a href={BOT_URL} target="_blank" rel="noopener noreferrer" className="px-8 py-4 rounded-2xl font-bold text-base transition-all hover:scale-105" style={{ background: "linear-gradient(135deg, #f5c518 0%, #f0a500 100%)", color: "#08081a" }}>
            🚀 Подключить бота
          </a>
          <Link href="/register" className="px-8 py-4 rounded-2xl font-bold text-base card-premium hover:border-[#f5c518]/40 transition-all" style={{ color: "#f5c518" }}>
            Создать аккаунт →
          </Link>
        </div>

        {/* Trust block */}
        <div className="flex items-center gap-4">
          <div className="flex -space-x-2">
            {["АК", "МР", "СП", "ДВ", "+"].map((av) => (
              <div key={av} className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 border-[#08081a]" style={{ background: "#1a1a35", color: "#f5c518" }}>{av}</div>
            ))}
          </div>
          <div className="text-left text-sm">
            <span className="text-[#e8e8f0] font-semibold">4 200+</span>{" "}
            <span className="text-[#555]">трейдеров</span>
            <br />
            <span style={{ color: "#f5c518" }}>★★★★★</span>{" "}
            <span className="text-[#555]">4.9 оценка</span>
          </div>
        </div>
      </section>

      {/* ═══ TICKER ═══ */}
      <div className="overflow-hidden py-3 glass">
        <div className="flex gap-8 animate-[scroll_30s_linear_infinite] whitespace-nowrap">
          {[...PAIRS, ...PAIRS].map((p, i) => (
            <span key={i} className="text-xs font-mono shrink-0" style={{ color: p.includes("+") ? "#00e5a0" : "#f5c518" }}>{p}</span>
          ))}
        </div>
      </div>

      {/* ═══ 3 SIGNAL TIERS ═══ */}
      <section id="signals" className="py-16 md:py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1 rounded-full text-xs font-semibold mb-4 tier-elite">Типы сигналов</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-wider" style={{ fontFamily: "var(--font-bebas)" }}>
              ТРОЙНАЯ СИСТЕМА <span className="text-gold-gradient">СИГНАЛОВ</span>
            </h2>
            <p className="text-[#888] mt-3 max-w-lg mx-auto">OTC угоди, Біржеві угоди и Еліт угоди — каждый тип для своего стиля торговли</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TIERS.map((tier) => (
              <div key={tier.id} className="rounded-2xl p-6 border relative overflow-hidden group" style={{ background: "var(--card-bg)", borderColor: `${tier.color}22` }}>
                <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: tier.color }} />
                <div className="flex items-center gap-2 mb-4">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold tier-${tier.id}`}>{tier.badge}</span>
                  <span className="text-xs text-[#555]">{tier.plan}</span>
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: tier.color, fontFamily: "var(--font-bebas)", letterSpacing: "0.05em" }}>{tier.name}</h3>
                <p className="text-xs text-[#888] mb-4 leading-relaxed">{tier.desc}</p>
                <div className="space-y-2">
                  {tier.signals.map((s) => (
                    <div key={s.pair} className="rounded-lg p-3 flex items-center gap-3" style={{ background: "rgba(255,255,255,0.03)", borderLeft: `2px solid ${s.dir === "CALL" ? "#00e5a0" : "#f5c518"}` }}>
                      <div className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: `${s.dir === "CALL" ? "#00e5a0" : "#f5c518"}15`, color: s.dir === "CALL" ? "#00e5a0" : "#f5c518" }}>
                        {s.dir} {s.dir === "CALL" ? "⬆" : "⬇"}
                      </div>
                      <span className="text-sm font-mono font-semibold flex-1">{s.pair}</span>
                      <div className="text-right">
                        <div className="text-sm font-bold" style={{ color: "#f5c518" }}>{s.conf}%</div>
                        <div className="text-[10px] text-[#555]">{s.exp}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ STATS ═══ */}
      <section className="py-12 px-4" style={{ background: "var(--surface)" }}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: "4.2K+", label: "Трейдеров", sub: "Активных прямо сейчас" },
            { value: "14K+", label: "Сигналов", sub: "С момента запуска" },
            { value: "87.3%", label: "Точность", sub: "За 30 дней" },
            { value: "24/7", label: "OTC режим", sub: "Биржа: 08-22 UTC" },
          ].map(({ value, label, sub }) => (
            <div key={label} className="text-center p-5 card-premium rounded-2xl">
              <div className="text-2xl md:text-3xl font-bold mb-1 text-gold-gradient" style={{ fontFamily: "var(--font-jetbrains)" }}>{value}</div>
              <div className="text-sm font-medium text-[#ccc]">{label}</div>
              <div className="text-xs text-[#555] mt-0.5">{sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section id="how" className="py-16 md:py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1 rounded-full text-xs font-semibold mb-4 tier-exchange">Как это работает</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-wider" style={{ fontFamily: "var(--font-bebas)" }}>
              4 ШАГА ДО <span className="text-gold-gradient">ПРОФИТА</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {STEPS.map((step) => (
              <div key={step.num} className="card-premium rounded-2xl p-5 text-center hover:scale-[1.02] transition-transform">
                <div className="text-3xl mb-3">{step.icon}</div>
                <div className="text-xs font-mono mb-2 text-gold-gradient">{step.num}</div>
                <h3 className="font-bold text-sm mb-2" style={{ fontFamily: "var(--font-bebas)", letterSpacing: "0.05em" }}>{step.title}</h3>
                <p className="text-xs text-[#888] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section id="pricing" className="py-16 md:py-20 px-4" style={{ background: "var(--surface)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1 rounded-full text-xs font-semibold mb-4 tier-elite">Тарифы</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-wider" style={{ fontFamily: "var(--font-bebas)" }}>ВЫБЕРИ СВОЙ <span className="text-gold-gradient">ПЛАН</span></h2>
            <p className="text-[#888] mt-3">Начни бесплатно. Масштабируйся до Elite.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {PLANS.map((plan) => (
              <div key={plan.name} className={`relative rounded-2xl p-6 border flex flex-col ${plan.featured ? "signal-card-elite" : ""}`} style={{ background: plan.featured ? "linear-gradient(180deg, rgba(245,197,24,0.06) 0%, var(--card-bg) 100%)" : "var(--card-bg)", borderColor: plan.featured ? "rgba(245,197,24,0.3)" : "var(--border)" }}>
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold" style={{ background: "linear-gradient(135deg, #f5c518, #f0a500)", color: "#08081a" }}>⚡ {plan.badge}</div>
                )}
                <h3 className="text-xl font-black tracking-wider mt-2" style={{ fontFamily: "var(--font-bebas)", color: plan.featured ? "#f5c518" : "#e8e8f0" }}>{plan.name}</h3>
                <p className="text-xs text-[#666] mb-4">{plan.desc}</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-sm text-[#888]">$</span>
                  <span className="text-5xl font-bold text-gold-gradient" style={{ fontFamily: "var(--font-jetbrains)" }}>{plan.price}</span>
                  <span className="text-sm text-[#666]">/мес</span>
                </div>
                <div className="space-y-2 flex-1 mb-6">
                  {plan.features.map(({ text, ok }) => (
                    <div key={text} className="flex items-start gap-2 text-sm">
                      <span style={{ color: ok ? "#00e5a0" : "#333" }}>{ok ? "✓" : "✗"}</span>
                      <span style={{ color: ok ? "#ccc" : "#333" }}>{text}</span>
                    </div>
                  ))}
                </div>
                <a href={BOT_URL} target="_blank" rel="noopener noreferrer" className="block text-center py-3 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02]" style={{ background: plan.featured ? "linear-gradient(135deg, #f5c518, #f0a500)" : "transparent", color: plan.featured ? "#08081a" : "#f5c518", border: plan.featured ? "none" : "1px solid rgba(245,197,24,0.2)" }}>{plan.btnText}</a>
              </div>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link href="/pricing" className="text-sm text-[#f5c518] hover:underline">Полное сравнение тарифов →</Link>
          </div>
        </div>
      </section>

      {/* ═══ REVIEWS ═══ */}
      <section className="py-16 md:py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="mb-10">
            <span className="inline-block px-4 py-1 rounded-full text-xs font-semibold mb-4 tier-exchange">Отзывы</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-wider" style={{ fontFamily: "var(--font-bebas)" }}>
              ЧТО ГОВОРЯТ <span className="text-gold-gradient">ТРЕЙДЕРЫ</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {REVIEWS.map((r) => (
              <div key={r.name} className="card-premium rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: "linear-gradient(135deg, #f5c518, #f0a500)", color: "#08081a" }}>{r.name[0]}</div>
                  <div>
                    <p className="text-sm font-medium">{r.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold tier-${r.plan.toLowerCase()}`}>{r.plan}</span>
                  </div>
                </div>
                <div className="mb-2 text-sm" style={{ color: "#f5c518" }}>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</div>
                <p className="text-sm text-[#999] leading-relaxed">{r.text}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link href="/reviews" className="text-sm text-[#f5c518] hover:underline">Все отзывы →</Link>
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section id="faq" className="py-16 md:py-20 px-4" style={{ background: "var(--surface)" }}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <span className="inline-block px-4 py-1 rounded-full text-xs font-semibold mb-4 tier-otc">FAQ</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-wider" style={{ fontFamily: "var(--font-bebas)" }}>ЧАСТО <span className="text-gold-gradient">ЗАДАЮТ</span></h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq) => (
              <details key={faq.q} className="group card-premium rounded-2xl overflow-hidden">
                <summary className="flex items-center justify-between p-5 cursor-pointer text-sm font-medium hover:text-[#f5c518] transition-colors list-none">
                  {faq.q}
                  <span className="text-[#555] group-open:rotate-45 transition-transform text-lg shrink-0 ml-4">+</span>
                </summary>
                <div className="px-5 pb-5 text-sm text-[#888] leading-relaxed">{faq.a}</div>
              </details>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link href="/faq" className="text-sm text-[#f5c518] hover:underline">Все вопросы →</Link>
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-16 md:py-20 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[500px] h-[500px] rounded-full opacity-15" style={{ background: "radial-gradient(circle, #f5c518 0%, transparent 60%)" }} />
        </div>
        <div className="relative z-10">
          <h2 className="text-5xl md:text-7xl font-black tracking-wider mb-6" style={{ fontFamily: "var(--font-bebas)" }}>
            НАЧНИ <span className="text-gold-gradient">ТОРГОВАТЬ</span> СЕГОДНЯ
          </h2>
          <p className="text-[#888] max-w-lg mx-auto mb-8">
            4 200+ трейдеров уже получают сигналы. OTC, Биржевые, Elite — выбери свой уровень.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <a href={BOT_URL} target="_blank" rel="noopener noreferrer" className="px-8 py-4 rounded-2xl font-bold text-base transition-all hover:scale-105" style={{ background: "linear-gradient(135deg, #f5c518, #f0a500)", color: "#08081a" }}>🚀 Подключить бота</a>
            <Link href="/register" className="px-8 py-4 rounded-2xl font-bold text-base card-premium transition-all" style={{ color: "#f5c518" }}>Создать аккаунт →</Link>
          </div>
          <p className="text-xs text-[#555]">✓ Промо-код при регистрации &ensp;·&ensp; ✓ Без привязки карты &ensp;·&ensp; ✓ Поддержка 24/7</p>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="px-4 py-12 glass">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Logo size="sm" />
            <p className="text-xs text-[#555] leading-relaxed mt-3">AI-платформа для генерации торговых сигналов для Pocket Option. OTC · Биржевые · Elite.</p>
          </div>
          <div>
            <h5 className="text-sm font-semibold mb-3 text-[#888]">Продукт</h5>
            <div className="space-y-2">
              <a href="#signals" className="block text-xs text-[#555] hover:text-[#f5c518]">Сигналы</a>
              <Link href="/how-it-works" className="block text-xs text-[#555] hover:text-[#f5c518]">Как работает</Link>
              <Link href="/pricing" className="block text-xs text-[#555] hover:text-[#f5c518]">Тарифы</Link>
              <Link href="/faq" className="block text-xs text-[#555] hover:text-[#f5c518]">FAQ</Link>
            </div>
          </div>
          <div>
            <h5 className="text-sm font-semibold mb-3 text-[#888]">Поддержка</h5>
            <div className="space-y-2">
              <a href={BOT_URL} target="_blank" rel="noopener noreferrer" className="block text-xs text-[#555] hover:text-[#f5c518]">Telegram-бот</a>
              <Link href="/reviews" className="block text-xs text-[#555] hover:text-[#f5c518]">Отзывы</Link>
              <Link href="/register" className="block text-xs text-[#555] hover:text-[#f5c518]">Регистрация</Link>
            </div>
          </div>
          <div>
            <h5 className="text-sm font-semibold mb-3 text-[#888]">Партнёры</h5>
            <div className="space-y-2">
              <a href="https://pocketoption.com" target="_blank" rel="noopener noreferrer" className="block text-xs text-[#555] hover:text-[#f5c518]">Pocket Option</a>
              <Link href="/dashboard/referrals" className="block text-xs text-[#555] hover:text-[#f5c518]">Реферальная программа</Link>
            </div>
          </div>
        </div>
        <div className="max-w-5xl mx-auto mt-8 pt-6 border-t flex flex-col md:flex-row items-center justify-between gap-4" style={{ borderColor: "rgba(245,197,24,0.08)" }}>
          <div>
            <p className="text-xs text-[#555]">© 2026 Signal Trade GPT. Все права защищены.</p>
            <p className="text-[10px] text-[#333] mt-1 max-w-lg">Signal Trade GPT не является финансовым советником. Торговля сопряжена с высоким риском потери средств.</p>
          </div>
          <a href={BOT_URL} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full flex items-center justify-center text-sm card-premium hover:border-[#f5c518] transition-colors">✈</a>
        </div>
      </footer>
    </main>
  );
}
