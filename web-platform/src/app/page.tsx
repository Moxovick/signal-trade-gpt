/**
 * Landing — v2
 *
 * Public-facing entry. Pitches the partnership flow:
 *   1. Открой PocketOption по нашей ссылке
 *   2. Внеси депозит — открой tier
 *   3. Получай сигналы в Telegram-боте
 *
 * No subscription pricing. No emojis in headings. CTA: Telegram bot deep-link.
 */
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  Layers,
  TrendingUp,
  ShieldCheck,
  Users,
  CircleDollarSign,
  Bot,
  ChevronRight,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TierBadge } from "@/components/ui/TierBadge";
import { Stat } from "@/components/ui/Stat";

const BOT_URL =
  process.env["NEXT_PUBLIC_BOT_URL"] ?? "https://t.me/traitsignaltsest_bot";

const TIERS = [
  {
    tier: 0,
    deposit: "$0",
    name: "Демо",
    perks: ["2 демо-сигнала за всё время", "Просмотр интерфейса бота"],
  },
  {
    tier: 1,
    deposit: "$100",
    name: "Starter",
    perks: ["5 OTC-сигналов в день", "4 базовые пары", "Реферальная программа"],
  },
  {
    tier: 2,
    deposit: "$500",
    name: "Active",
    perks: ["15 сигналов в день", "OTC + биржевые", "Все 12 пар"],
  },
  {
    tier: 3,
    deposit: "$2 000",
    name: "Pro",
    perks: ["25 сигналов в день", "Elite-уровень с confidence ≥90%", "Расширенная аналитика"],
  },
  {
    tier: 4,
    deposit: "$10 000",
    name: "VIP",
    perks: ["Безлимит сигналов", "Ранний доступ −60 сек", "Персональный менеджер"],
  },
];

const STEPS = [
  {
    n: "01",
    title: "Открой счёт PocketOption",
    desc: "По нашей реферальной ссылке. Бесплатно, 60 секунд.",
    icon: ChevronRight,
  },
  {
    n: "02",
    title: "Внеси депозит",
    desc: "Чем выше депозит — тем сильнее перки. От $100 — Starter, от $500 — Active.",
    icon: CircleDollarSign,
  },
  {
    n: "03",
    title: "Открой Telegram-бота",
    desc: "Авторизация через Telegram. Бот сам подтянет твой счёт через PocketOption API.",
    icon: Bot,
  },
  {
    n: "04",
    title: "Получай сигналы",
    desc: "AI-анализ + реальные данные с PO. Открывай сделки прямо в один клик.",
    icon: TrendingUp,
  },
];

const FEATURES = [
  {
    icon: Sparkles,
    title: "AI Confidence на сигналах",
    desc: "Каждый сигнал помечен уверенностью 73–96%. T3+ видят только ≥90%.",
  },
  {
    icon: Layers,
    title: "Tier по депозиту",
    desc: "Никаких подписок. Внёс на свой счёт PO — открыл новый тир в боте.",
  },
  {
    icon: ShieldCheck,
    title: "Прозрачно и автоматически",
    desc: "PocketOption присылает нам Postback — мы видим твой депозит и сразу прокачиваем доступ.",
  },
  {
    icon: Users,
    title: "Реферальная 5%",
    desc: "Приглашай друзей по своей ссылке — получай 5% от их депозитов вторым уровнем.",
  },
];

const FAQS = [
  {
    q: "Я плачу подписку?",
    a: "Нет. У нас нет подписок. Доступ к боту открывается автоматически по сумме твоего депозита на PocketOption.",
  },
  {
    q: "Что если у меня уже есть аккаунт PocketOption?",
    a: "Можно привязать существующий ID в личном кабинете — мы свяжемся с PocketOption и проверим. Но бонусы тира откроются только после нового депозита через нашу ссылку.",
  },
  {
    q: "Откуда такие сигналы?",
    a: "AI-сигналы — генерируются на основе технического анализа и исторических данных. Это не финансовая рекомендация. Торговля бинарными опционами сопряжена с риском.",
  },
  {
    q: "Как считается тир?",
    a: "По общей сумме депозита: $100 — Starter, $500 — Active, $2 000 — Pro, $10 000 — VIP. Пороги настраивает админ.",
  },
];

export default function LandingPage() {
  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md border-b border-[var(--b-soft)] bg-[rgba(8,6,10,0.75)]">
        <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo size="md" />
          <div className="hidden md:flex items-center gap-8 text-sm text-[var(--t-2)]">
            <Link href="#how" className="hover:text-[var(--t-1)] transition-colors">
              Как работает
            </Link>
            <Link href="#tiers" className="hover:text-[var(--t-1)] transition-colors">
              Тиры
            </Link>
            <Link href="#faq" className="hover:text-[var(--t-1)] transition-colors">
              FAQ
            </Link>
            <Link href="/login" className="hover:text-[var(--t-1)] transition-colors">
              Войти
            </Link>
          </div>
          <ButtonLink href={BOT_URL} external size="sm" iconRight={<ArrowRight size={16} />}>
            В Telegram
          </ButtonLink>
        </nav>
      </header>

      <main className="relative">
        {/* Hero */}
        <section className="relative max-w-6xl mx-auto px-6 pt-20 pb-28 text-center">
          <div className="inline-flex items-center gap-2 px-3 h-8 rounded-full text-xs uppercase tracking-widest border border-[var(--b-soft)] text-[var(--brand-gold)] bg-[var(--bg-1)]">
            <Sparkles size={12} />
            <span>RevShare partnership · PocketOption</span>
          </div>
          <h1 className="mt-8 text-5xl md:text-7xl font-bold leading-[1.05] text-shimmer">
            Сигналы, открытые
            <br />
            твоим депозитом
          </h1>
          <p className="mt-6 max-w-xl mx-auto text-lg text-[var(--t-2)]">
            Никаких подписок. Открой счёт PocketOption по нашей ссылке —
            и автоматически получай AI-сигналы в Telegram. Чем выше депозит — тем сильнее перки.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center items-center">
            <ButtonLink
              href={BOT_URL}
              external
              size="lg"
              iconRight={<ArrowRight size={18} />}
            >
              Перейти в Telegram-бота
            </ButtonLink>
            <ButtonLink href="#tiers" variant="secondary" size="lg">
              Посмотреть тиры
            </ButtonLink>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
            <Stat value="87.3%" label="средняя точность" delta={{ value: "+1.2% за неделю" }} />
            <Stat value="12 800+" label="трейдеров в боте" />
            <Stat value="24/7" label="OTC-сигналы" />
            <Stat value="5%" label="реферальный доход" />
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="max-w-6xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <div className="text-xs uppercase tracking-widest text-[var(--brand-gold)] mb-3">
              Процесс
            </div>
            <h2 className="text-4xl md:text-5xl font-bold">Как это работает</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {STEPS.map((s) => (
              <Card key={s.n} hover padding="md">
                <div
                  className="text-xs font-mono text-[var(--t-3)] mb-4"
                  style={{ fontFamily: "var(--font-jetbrains)" }}
                >
                  {s.n}
                </div>
                <s.icon size={28} className="text-[var(--brand-gold)] mb-4" />
                <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-[var(--t-2)] leading-relaxed">{s.desc}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Tiers */}
        <section id="tiers" className="max-w-6xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <div className="text-xs uppercase tracking-widest text-[var(--brand-gold)] mb-3">
              Перки по депозиту
            </div>
            <h2 className="text-4xl md:text-5xl font-bold">5 тиров доступа</h2>
            <p className="mt-4 text-[var(--t-2)] max-w-xl mx-auto">
              Каждый тир открывает новые возможности бота. Тиры и пороги — гибкие, админ может их менять.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {TIERS.map((t) => (
              <Card
                key={t.tier}
                variant={t.tier === 4 ? "highlight" : "default"}
                hover
                padding="md"
                className="flex flex-col"
              >
                <TierBadge tier={t.tier} size="sm" />
                <div
                  className="mt-4 text-3xl font-bold"
                  style={{ fontFamily: "var(--font-jetbrains)" }}
                >
                  {t.deposit}
                </div>
                <div className="mt-1 text-xs uppercase tracking-wider text-[var(--t-3)]">
                  Депозит
                </div>
                <ul className="mt-5 space-y-2 text-sm flex-1">
                  {t.perks.map((p) => (
                    <li key={p} className="flex gap-2 text-[var(--t-2)]">
                      <span className="text-[var(--brand-gold)] mt-0.5">•</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="max-w-6xl mx-auto px-6 py-24">
          <div className="grid md:grid-cols-2 gap-5">
            {FEATURES.map((f) => (
              <Card key={f.title} padding="lg" hover>
                <div className="flex items-start gap-4">
                  <div
                    className="flex items-center justify-center w-12 h-12 rounded-xl shrink-0"
                    style={{
                      background: "rgba(212, 160, 23, 0.08)",
                      border: "1px solid var(--b-soft)",
                    }}
                  >
                    <f.icon size={22} className="text-[var(--brand-gold)]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-1">{f.title}</h3>
                    <p className="text-[var(--t-2)] leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="max-w-3xl mx-auto px-6 py-24">
          <div className="text-center mb-12">
            <div className="text-xs uppercase tracking-widest text-[var(--brand-gold)] mb-3">
              FAQ
            </div>
            <h2 className="text-4xl md:text-5xl font-bold">Частые вопросы</h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((f) => (
              <details
                key={f.q}
                className="group rounded-2xl border border-[var(--b-soft)] bg-[var(--bg-1)] open:border-[var(--b-hard)] transition-colors"
              >
                <summary className="cursor-pointer list-none px-6 py-5 flex items-center justify-between gap-4 text-[var(--t-1)] font-medium">
                  <span>{f.q}</span>
                  <ChevronRight
                    size={18}
                    className="shrink-0 text-[var(--brand-gold)] transition-transform group-open:rotate-90"
                  />
                </summary>
                <div className="px-6 pb-6 text-[var(--t-2)] leading-relaxed">{f.a}</div>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto px-6 py-20 text-center">
          <Card variant="highlight" padding="lg">
            <h2 className="text-3xl md:text-4xl font-bold">Готов начать?</h2>
            <p className="mt-4 text-[var(--t-2)]">
              Открой счёт PocketOption и сразу получишь демо-сигналы в боте.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <ButtonLink href={BOT_URL} external size="lg" iconRight={<ArrowRight size={18} />}>
                Перейти в Telegram
              </ButtonLink>
              <ButtonLink href="/register" variant="secondary" size="lg">
                Регистрация на сайте
              </ButtonLink>
            </div>
          </Card>
        </section>

        {/* Footer */}
        <footer className="border-t border-[var(--b-soft)] mt-24">
          <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
            <Logo size="sm" />
            <p className="text-xs text-[var(--t-3)] max-w-md leading-relaxed">
              Signal Trade GPT не является финансовым советником. Сигналы предоставляются в информационных целях. Торговля бинарными опционами сопряжена с высоким риском потери средств.
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}
