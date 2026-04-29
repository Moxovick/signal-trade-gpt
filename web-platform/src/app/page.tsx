import Link from "next/link";

const BOT_URL = process.env.NEXT_PUBLIC_BOT_URL ?? "https://t.me/traitsignaltsest_bot";

const PAIRS = [
  "EUR/USD +0.34%",
  "GBP/USD -0.12%",
  "USD/JPY +0.08%",
  "AUD/USD +0.22%",
  "EUR/GBP -0.05%",
  "GBP/JPY +0.41%",
  "USD/CHF -0.18%",
  "NZD/USD +0.15%",
  "EUR/JPY +0.28%",
  "AUD/JPY -0.09%",
  "USD/CAD +0.11%",
  "EUR/AUD -0.20%",
];

const STEPS = [
  {
    num: "01",
    title: "ПОДКЛЮЧИ БОТА",
    desc: "Нажми /start в Telegram-боте. Регистрация за 10 секунд — никаких документов и паролей.",
    icon: "📱",
  },
  {
    num: "02",
    title: "AI АНАЛИЗ",
    desc: "Нейросеть непрерывно сканирует 12 валютных пар, находит паттерны и генерирует точные сигналы.",
    icon: "🧠",
  },
  {
    num: "03",
    title: "ПОЛУЧИ СИГНАЛ",
    desc: "Пуш в Telegram: пара, направление CALL/PUT, экспирация и AI Confidence. Всё что нужно для входа.",
    icon: "📊",
  },
  {
    num: "04",
    title: "ТОРГУЙ",
    desc: "Открывай сделку в Pocket Option. Рекомендованный объём — 1-3% депозита. Фиксируй результат.",
    icon: "📈",
  },
];

const PLANS = [
  {
    name: "FREE",
    desc: "Для знакомства с платформой",
    price: "0",
    features: [
      { text: "3–5 сигналов в день", ok: true },
      { text: "4 основных пары", ok: true },
      { text: "Экспирация 1–5 мин", ok: true },
      { text: "Telegram уведомления", ok: true },
      { text: "Реферальная программа 10%", ok: true },
      { text: "Все торговые пары", ok: false },
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
      { text: "Приоритет 24/7", ok: false },
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
    ],
    featured: false,
    btnText: "Подключить VIP →",
  },
];

const REVIEWS = [
  { name: "Алексей К.", plan: "VIP", text: "За 2 месяца вышел в стабильный плюс. Сигналы приходят моментально, AI confidence реально работает — на 90%+ практически всегда в деньгах.", rating: 5 },
  { name: "Марина Р.", plan: "Premium", text: "Раньше торговала по интуиции — сливала. С Signal Trade GPT наконец-то начала зарабатывать. Бот удобный, всё понятно с первого сигнала.", rating: 5 },
  { name: "Дмитрий В.", plan: "Premium", text: "Попробовал бесплатные сигналы — удивился точности. Перешёл на Premium через неделю. Рекомендую всем, кто торгует на Pocket Option.", rating: 5 },
  { name: "Сергей П.", plan: "VIP", text: "Лучший бот для бинарных опционов. Пользуюсь 3 месяца, реферальная программа тоже приносит доход. Спасибо команде!", rating: 5 },
  { name: "Елена М.", plan: "Premium", text: "Удобный формат — сигнал пришёл, открыла сделку, заработала. Никакого стресса и анализа графиков. AI делает всё за тебя.", rating: 4 },
  { name: "Игорь Т.", plan: "Free", text: "Даже на бесплатном тарифе можно неплохо заработать. 3-5 сигналов в день — этого хватает для начала. Рекомендую попробовать.", rating: 5 },
];

const FAQS = [
  { q: "Как работает Signal Trade GPT?", a: "Наша AI-система анализирует рынок 24/7, сканируя 12 валютных пар. При обнаружении торгового паттерна генерируется сигнал с направлением (CALL/PUT), экспирацией и уровнем уверенности AI." },
  { q: "Какая точность сигналов?", a: "Средняя точность за последние 30 дней — 87.3%. Это верифицированный результат по всем сигналам. На уровнях AI Confidence 90%+ точность ещё выше." },
  { q: "Сколько стоит подписка?", a: "Free — бесплатно (3-5 сигналов/день), Premium — $29/мес (15-25 сигналов), VIP — $79/мес (безлимит + персональный менеджер). Начните бесплатно и масштабируйтесь." },
  { q: "Как получать сигналы?", a: "Подключитесь к нашему Telegram-боту, нажмите /start — и вы начнёте получать сигналы автоматически. Никакой сложной настройки не требуется." },
  { q: "Могу ли я отменить подписку?", a: "Да, отмена в 1 клик. Нет скрытых платежей и привязки карты. Подписка действует до конца оплаченного периода." },
  { q: "Какие валютные пары поддерживаются?", a: "Free: EUR/USD, GBP/USD, USD/JPY, AUD/USD. Premium и VIP: все 12 пар включая EUR/GBP, GBP/JPY, USD/CHF, NZD/USD, EUR/JPY, AUD/JPY, USD/CAD, EUR/AUD." },
  { q: "Это финансовый совет?", a: "Нет. Signal Trade GPT не является финансовым советником. Все сигналы предоставляются исключительно в информационных целях. Торговля бинарными опционами сопряжена с высоким риском." },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#07070d]">
      {/* ═══ NAV ═══ */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between" style={{ background: "rgba(7,7,13,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <Link href="/" className="text-xl font-black tracking-wider" style={{ fontFamily: "var(--font-bebas)", color: "#f5c518" }}>
          SIGNAL TRADE GPT
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm text-[#888]">
          <a href="#signals" className="hover:text-[#f5c518] transition-colors">Сигналы</a>
          <a href="#how" className="hover:text-[#f5c518] transition-colors">Как работает</a>
          <a href="#pricing" className="hover:text-[#f5c518] transition-colors">Тарифы</a>
          <a href="#faq" className="hover:text-[#f5c518] transition-colors">FAQ</a>
          <Link href="/login" className="hover:text-[#f5c518] transition-colors">Войти</Link>
        </div>
        <a href={BOT_URL} target="_blank" rel="noopener noreferrer" className="px-5 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105" style={{ background: "#f5c518", color: "#07070d" }}>
          Подключить бота →
        </a>
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="pt-32 pb-20 px-4 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-8" style={{ background: "rgba(245,197,24,0.1)", border: "1px solid rgba(245,197,24,0.25)", color: "#f5c518" }}>
          <span className="w-2 h-2 rounded-full bg-[#00e5a0] animate-pulse" /> AI анализирует рынок 24/7 · 87% точность
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-wider mb-4 leading-none" style={{ fontFamily: "var(--font-bebas)" }}>
          <span className="text-[#e8e8f0]">ТОРГУЙ</span>
          <br />
          <span style={{ color: "#f5c518" }}>КАК ПРОФИ</span>
          <br />
          <span className="text-[#333]">С НУЛЯ</span>
        </h1>

        <p className="text-lg md:text-xl text-[#888] max-w-xl mb-10 leading-relaxed">
          Signal Trade GPT отправляет точные сигналы CALL/PUT для Pocket Option
          прямо в Telegram — каждые 5–15 минут, без опыта и сложных стратегий.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          <a href={BOT_URL} target="_blank" rel="noopener noreferrer" className="px-8 py-4 rounded-2xl font-bold text-base transition-all hover:scale-105" style={{ background: "#f5c518", color: "#07070d" }}>
            🚀 Подключить бота
          </a>
          <a href="#signals" className="px-8 py-4 rounded-2xl font-bold text-base transition-all border hover:border-[#f5c518]/50" style={{ borderColor: "rgba(245,197,24,0.3)", color: "#f5c518" }}>
            📊 Смотреть сигналы
          </a>
        </div>

        {/* Trust */}
        <div className="flex items-center gap-4">
          <div className="flex -space-x-2">
            {["АК", "МР", "СП", "ДВ", "+"].map((av) => (
              <div key={av} className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 border-[#07070d]" style={{ background: "#1a1a2e", color: "#f5c518" }}>
                {av}
              </div>
            ))}
          </div>
          <div className="text-left text-sm">
            <span className="text-[#e8e8f0] font-semibold">4 200+</span>{" "}
            <span className="text-[#666]">трейдеров</span>
            <br />
            <span style={{ color: "#00e5a0" }}>★★★★★</span>{" "}
            <span className="text-[#666]">4.9 оценка</span>
          </div>
        </div>

        {/* Signal cards preview */}
        <div className="mt-16 w-full max-w-lg space-y-3" id="signals">
          {[
            { pair: "EUR/USD", dir: "CALL", dirColor: "#00e5a0", exp: "1 мин", conf: 87, time: "сейчас" },
            { pair: "GBP/USD", dir: "PUT", dirColor: "#f5c518", exp: "2 мин", conf: 82, time: "12 сек" },
            { pair: "USD/JPY", dir: "CALL", dirColor: "#00e5a0", exp: "5 мин", conf: 91, time: "34 сек" },
          ].map((s) => (
            <div key={s.pair} className="rounded-xl p-4 border flex items-center gap-4" style={{ background: "#0d0d18", borderColor: `${s.dirColor}22` }}>
              <div className="w-12 h-12 rounded-lg flex flex-col items-center justify-center text-xs font-bold shrink-0" style={{ background: `${s.dirColor}15`, color: s.dirColor }}>
                {s.dir === "CALL" ? "⬆" : "⬇"}
                <span className="text-[10px]">{s.dir}</span>
              </div>
              <div className="flex-1">
                <span className="font-bold text-sm" style={{ fontFamily: "var(--font-jetbrains)" }}>{s.pair}</span>
                <div className="text-xs text-[#666] mt-0.5">Exp: {s.exp}</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold" style={{ fontFamily: "var(--font-jetbrains)", color: "#f5c518" }}>{s.conf}%</div>
                <div className="text-[10px] text-[#555]">{s.time}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ TICKER ═══ */}
      <div className="overflow-hidden border-y py-3" style={{ borderColor: "rgba(255,255,255,0.06)", background: "#0a0a14" }}>
        <div className="flex gap-8 animate-[scroll_30s_linear_infinite] whitespace-nowrap">
          {[...PAIRS, ...PAIRS].map((p, i) => {
            const isPositive = p.includes("+");
            return (
              <span key={i} className="text-xs font-mono shrink-0" style={{ color: isPositive ? "#00e5a0" : "#f5c518" }}>
                {p}
              </span>
            );
          })}
        </div>
      </div>

      {/* ═══ STATS ═══ */}
      <section className="py-16 px-4" style={{ background: "#0a0a14" }}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: "4.2K+", label: "Активных трейдеров", sub: "На платформе прямо сейчас" },
            { value: "14K+", label: "Сигналов отправлено", sub: "С момента запуска платформы" },
            { value: "87.3%", label: "Точность за 30 дней", sub: "Верифицированный результат" },
            { value: "24/7", label: "Режим работы", sub: "08:00 — 22:00 UTC каждый день" },
          ].map(({ value, label, sub }) => (
            <div key={label} className="text-center p-6 rounded-2xl border" style={{ background: "#0d0d18", borderColor: "rgba(255,255,255,0.07)" }}>
              <div className="text-3xl md:text-4xl font-bold mb-2" style={{ fontFamily: "var(--font-jetbrains)", color: "#f5c518" }}>
                {value}
              </div>
              <div className="text-sm font-medium text-[#ccc]">{label}</div>
              <div className="text-xs text-[#555] mt-1">{sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section id="how" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1 rounded-full text-xs font-semibold mb-4" style={{ background: "rgba(245,197,24,0.1)", color: "#f5c518" }}>
              Как это работает
            </span>
            <h2 className="text-4xl md:text-5xl font-black tracking-wider" style={{ fontFamily: "var(--font-bebas)" }}>
              4 ШАГА ДО <span style={{ color: "#f5c518" }}>ПЕРВОГО СИГНАЛА</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {STEPS.map((step) => (
              <div key={step.num} className="rounded-2xl p-6 border text-center" style={{ background: "#0d0d18", borderColor: "rgba(255,255,255,0.07)" }}>
                <div className="text-4xl mb-4">{step.icon}</div>
                <div className="text-xs font-mono mb-2" style={{ color: "#f5c518" }}>{step.num}</div>
                <h3 className="font-bold text-sm mb-3" style={{ fontFamily: "var(--font-bebas)", letterSpacing: "0.05em" }}>{step.title}</h3>
                <p className="text-xs text-[#888] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section id="pricing" className="py-20 px-4" style={{ background: "#0a0a14" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1 rounded-full text-xs font-semibold mb-4" style={{ background: "rgba(245,197,24,0.1)", color: "#f5c518" }}>
              Тарифы
            </span>
            <h2 className="text-4xl md:text-5xl font-black tracking-wider" style={{ fontFamily: "var(--font-bebas)" }}>
              ВЫБЕРИ СВОЙ ПЛАН
            </h2>
            <p className="text-[#888] mt-3">Начни бесплатно. Масштабируйся по мере роста.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
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
        </div>
      </section>

      {/* ═══ REVIEWS ═══ */}
      <section id="reviews" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="mb-12">
            <span className="inline-block px-4 py-1 rounded-full text-xs font-semibold mb-4" style={{ background: "rgba(245,197,24,0.1)", color: "#f5c518" }}>
              Отзывы
            </span>
            <h2 className="text-4xl md:text-5xl font-black tracking-wider" style={{ fontFamily: "var(--font-bebas)" }}>
              ЧТО ГОВОРЯТ <span style={{ color: "#f5c518" }}>ТРЕЙДЕРЫ</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {REVIEWS.map((r) => (
              <div key={r.name} className="rounded-2xl p-5 border" style={{ background: "#0d0d18", borderColor: "rgba(255,255,255,0.07)" }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: "#f5c518", color: "#07070d" }}>
                    {r.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{r.name}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: "rgba(245,197,24,0.12)", color: "#f5c518" }}>
                      {r.plan}
                    </span>
                  </div>
                </div>
                <div className="mb-2" style={{ color: "#f5c518" }}>
                  {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                </div>
                <p className="text-sm text-[#999] leading-relaxed">{r.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section id="faq" className="py-20 px-4" style={{ background: "#0a0a14" }}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1 rounded-full text-xs font-semibold mb-4" style={{ background: "rgba(245,197,24,0.1)", color: "#f5c518" }}>
              Вопросы
            </span>
            <h2 className="text-4xl md:text-5xl font-black tracking-wider" style={{ fontFamily: "var(--font-bebas)" }}>
              ЧАСТО <span style={{ color: "#f5c518" }}>ЗАДАЮТ</span>
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq) => (
              <details key={faq.q} className="group rounded-2xl border overflow-hidden" style={{ background: "#0d0d18", borderColor: "rgba(255,255,255,0.07)" }}>
                <summary className="flex items-center justify-between p-5 cursor-pointer text-sm font-medium hover:text-[#f5c518] transition-colors list-none">
                  {faq.q}
                  <span className="text-[#555] group-open:rotate-45 transition-transform text-lg">+</span>
                </summary>
                <div className="px-5 pb-5 text-sm text-[#888] leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-20 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[600px] rounded-full opacity-10" style={{ background: "radial-gradient(circle, #f5c518 0%, transparent 70%)" }} />
        </div>
        <div className="relative z-10">
          <h2 className="text-5xl md:text-7xl font-black tracking-wider mb-6" style={{ fontFamily: "var(--font-bebas)" }}>
            НАЧНИ
            <br />
            <span style={{ color: "#f5c518" }}>ТОРГОВАТЬ</span>
            <br />
            СЕГОДНЯ
          </h2>
          <p className="text-[#888] max-w-lg mx-auto mb-8">
            Подключись к 4 200+ трейдеров. Первые сигналы — бесплатно, без привязки карты.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <a href={BOT_URL} target="_blank" rel="noopener noreferrer" className="px-8 py-4 rounded-2xl font-bold text-base transition-all hover:scale-105" style={{ background: "#f5c518", color: "#07070d" }}>
              🚀 Подключить бота
            </a>
            <Link href="/register" className="px-8 py-4 rounded-2xl font-bold text-base border transition-all hover:border-[#f5c518]/50" style={{ borderColor: "rgba(245,197,24,0.3)", color: "#f5c518" }}>
              Личный кабинет →
            </Link>
          </div>
          <p className="text-xs text-[#555]">
            ✓ Без привязки карты &ensp;·&ensp; ✓ Отмена в 1 клик &ensp;·&ensp; ✓ Поддержка 24/7
          </p>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t px-4 py-12" style={{ borderColor: "rgba(255,255,255,0.06)", background: "#0a0a14" }}>
        <div className="max-w-5xl mx-auto grid md:grid-cols-4 gap-8">
          <div>
            <div className="text-xl font-black tracking-wider mb-3" style={{ fontFamily: "var(--font-bebas)", color: "#f5c518" }}>
              SIGNAL TRADE GPT
            </div>
            <p className="text-xs text-[#666] leading-relaxed">
              AI-платформа для генерации торговых сигналов для Pocket Option. Быстро. Точно. В Telegram.
            </p>
          </div>
          <div>
            <h5 className="text-sm font-semibold mb-3 text-[#888]">Продукт</h5>
            <div className="space-y-2">
              <a href="#signals" className="block text-xs text-[#555] hover:text-[#f5c518]">Сигналы</a>
              <a href="#how" className="block text-xs text-[#555] hover:text-[#f5c518]">Как работает</a>
              <a href="#pricing" className="block text-xs text-[#555] hover:text-[#f5c518]">Тарифы</a>
              <Link href="/faq" className="block text-xs text-[#555] hover:text-[#f5c518]">FAQ</Link>
            </div>
          </div>
          <div>
            <h5 className="text-sm font-semibold mb-3 text-[#888]">Поддержка</h5>
            <div className="space-y-2">
              <a href={BOT_URL} target="_blank" rel="noopener noreferrer" className="block text-xs text-[#555] hover:text-[#f5c518]">Telegram-бот</a>
              <Link href="/reviews" className="block text-xs text-[#555] hover:text-[#f5c518]">Отзывы</Link>
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
        <div className="max-w-5xl mx-auto mt-8 pt-6 border-t flex flex-col md:flex-row items-center justify-between gap-4" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <div>
            <p className="text-xs text-[#555]">© 2026 Signal Trade GPT. Все права защищены.</p>
            <p className="text-[10px] text-[#333] mt-1 max-w-lg">
              Signal Trade GPT не является финансовым советником. Все сигналы предоставляются в информационных целях.
              Торговля бинарными опционами сопряжена с высоким риском потери средств.
            </p>
          </div>
          <a href={BOT_URL} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full flex items-center justify-center border text-sm hover:border-[#f5c518] transition-colors" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
            ✈
          </a>
        </div>
      </footer>
    </main>
  );
}
