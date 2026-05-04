/**
 * Landing — v3 (simplified per supervisor feedback).
 *
 * Top nav: only "Как это работает", "Про нас", and a Register CTA.
 * Hero: big "Зарегистрироваться" button (primary), Telegram bot link is secondary.
 * Tiers: deposit-driven (no per-day signal limits — those didn't match how
 * traders actually use the platform).
 */
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  Layers,
  TrendingUp,
  ShieldCheck,
  CircleDollarSign,
  ChevronRight,
  Star,
  Quote,
  UserPlus,
  BarChart3,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TierBadge } from "@/components/ui/TierBadge";
import { Stat } from "@/components/ui/Stat";
import { LiveChart } from "@/components/market/LiveChart";
import { SiteHeader, SiteFooter } from "@/components/shared/SiteHeader";
import { prisma } from "@/lib/prisma";

const TIERS = [
  {
    tier: 0,
    deposit: "$0",
    name: "Демо",
    perks: ["2 пробных сигнала", "Просмотр интерфейса"],
  },
  {
    tier: 1,
    deposit: "от $100",
    name: "Базовый",
    perks: ["Безлимит сигналов", "Все валютные пары", "OTC + биржа"],
  },
  {
    tier: 2,
    deposit: "от $1000",
    name: "Трейдер",
    perks: [
      "Всё из «Базовый»",
      "Графики с RSI / MACD / объём",
      "Углублённый разбор каждого сигнала",
    ],
  },
  {
    tier: 3,
    deposit: "от $5000",
    name: "Pro",
    perks: [
      "Всё из «Трейдер»",
      "Ранний доступ к сигналам −60 сек",
      "Расширенная аналитика",
    ],
  },
  {
    tier: 4,
    deposit: "от $10000",
    name: "Elite",
    perks: [
      "Всё из «Pro»",
      "Elite-пары (≥90% уверенность)",
      "Приоритет в очереди публикации",
    ],
  },
];

const STEPS = [
  {
    n: "01",
    title: "Зарегистрируйся на сайте",
    desc: "Email + пароль. 30 секунд. Без регистрации в Telegram.",
    icon: UserPlus,
  },
  {
    n: "02",
    title: "Открой счёт PocketOption",
    desc: "По нашей реферальной ссылке. Внеси депозит — открой свой тир.",
    icon: CircleDollarSign,
  },
  {
    n: "03",
    title: "Получай сигналы",
    desc: "Сигналы приходят в личный кабинет и в Telegram-бота, если привяжешь его.",
    icon: TrendingUp,
  },
];

const FEATURES = [
  {
    icon: Sparkles,
    title: "AI Confidence на каждом сигнале",
    desc: "Уверенность 73–96%. Чем выше — тем сильнее сигнал.",
  },
  {
    icon: Layers,
    title: "Тир по депозиту, не по подписке",
    desc: "Никаких ежемесячных платежей. Внёс на свой счёт PO — открыл новый тир.",
  },
  {
    icon: BarChart3,
    title: "Углублённый анализ от $1000",
    desc: "RSI, MACD, объём, support/resistance — прямо в карточке сигнала.",
  },
  {
    icon: ShieldCheck,
    title: "Прозрачно и автоматически",
    desc: "PocketOption присылает нам Postback — мы видим депозит и сразу обновляем тир.",
  },
];

const FALLBACK_FAQS = [
  {
    q: "Я плачу подписку?",
    a: "Нет. У нас нет подписок. Доступ к сигналам открывается автоматически по сумме твоего депозита на PocketOption.",
  },
  {
    q: "С какого депозита уже видно сигналы?",
    a: "От $100 — все сигналы безлимитом. От $1000 — добавляется углублённый анализ с индикаторами. Демо-режим (без депа) — 2 пробных сигнала.",
  },
  {
    q: "Что если у меня уже есть аккаунт PocketOption?",
    a: "Можно привязать существующий ID в личном кабинете — мы свяжемся с PocketOption и проверим. Бонусы тира откроются после нового депозита через нашу ссылку.",
  },
  {
    q: "Как считается тир?",
    a: "По общей сумме депозита: $100 — Базовый, $1000 — Трейдер, $5000 — Pro, $10000 — Elite. Пороги настраиваются админом.",
  },
];

export default async function LandingPage() {
  const [featuredReviews, faqs] = await Promise.all([
    prisma.review
      .findMany({
        where: { isPublic: true, isFeatured: true, status: "published" },
        orderBy: [{ position: "asc" }, { createdAt: "desc" }],
        take: 3,
      })
      .catch(() => []),
    prisma.faq
      .findMany({
        where: { isActive: true },
        orderBy: [{ position: "asc" }, { createdAt: "desc" }],
        take: 6,
      })
      .catch(() => []),
  ]);
  const FAQS = faqs.length
    ? faqs.map((f) => ({ q: f.question, a: f.answer }))
    : FALLBACK_FAQS;

  return (
    <>
      <SiteHeader />

      <main className="relative">
        {/* Hero */}
        <section className="relative max-w-6xl mx-auto px-6 pt-20 pb-24 text-center">
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
            Регистрируйся, открой счёт PocketOption по нашей ссылке — и получай
            AI-сигналы безлимитом. Чем выше депозит — тем глубже анализ.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center items-center">
            <ButtonLink
              href="/register"
              size="lg"
              iconRight={<ArrowRight size={18} />}
            >
              Зарегистрироваться
            </ButtonLink>
            <ButtonLink href="/how-it-works" variant="secondary" size="lg">
              Как это работает
            </ButtonLink>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
            <Stat value="87.3%" label="средняя точность" delta={{ value: "+1.2% за неделю" }} />
            <Stat value="12 800+" label="трейдеров в системе" />
            <Stat value="24/7" label="OTC-сигналы" />
            <Stat value="5%" label="реферальный доход" />
          </div>
        </section>

        {/* Live chart */}
        <section id="live" className="max-w-6xl mx-auto px-6 -mt-6">
          <LiveChart />
        </section>

        {/* How it works */}
        <section id="how" className="max-w-6xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <div className="text-xs uppercase tracking-widest text-[var(--brand-gold)] mb-3">
              Процесс
            </div>
            <h2 className="text-4xl md:text-5xl font-bold">3 шага до первого сигнала</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
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
              Все сигналы безлимитом начиная с $100. Старшие тиры открывают
              углублённый анализ и ранний доступ.
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
                  {t.name}
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
        <section className="max-w-6xl mx-auto px-6 py-20">
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

        {/* Reviews — admin-controlled */}
        {featuredReviews.length > 0 && (
          <section id="reviews" className="max-w-6xl mx-auto px-6 py-20">
            <div className="text-center mb-12">
              <div className="text-xs uppercase tracking-widest text-[var(--brand-gold)] mb-3">
                Отзывы
              </div>
              <h2 className="text-4xl md:text-5xl font-bold">Что говорят трейдеры</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-5">
              {featuredReviews.map((r) => (
                <Card key={r.id} padding="lg" hover className="flex flex-col h-full">
                  <Quote size={28} className="text-[var(--brand-gold)] mb-4 opacity-70" />
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={
                          i < r.rating
                            ? "fill-[var(--brand-gold)] text-[var(--brand-gold)]"
                            : "text-[var(--t-3)]"
                        }
                      />
                    ))}
                  </div>
                  <p className="text-sm text-[var(--t-1)] leading-relaxed flex-1">
                    {r.text}
                  </p>
                  <div className="mt-5 pt-4 border-t border-[var(--b-soft)]">
                    <div className="text-sm font-semibold">{r.authorName}</div>
                    {r.authorRole && (
                      <div className="text-xs text-[var(--t-3)] mt-0.5">
                        {r.authorRole}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* FAQ */}
        <section id="faq" className="max-w-3xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <div className="text-xs uppercase tracking-widest text-[var(--brand-gold)] mb-3">
              FAQ
            </div>
            <h2 className="text-4xl md:text-5xl font-bold">Частые вопросы</h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((f, idx) => (
              <details
                key={`${idx}-${f.q}`}
                className="group rounded-2xl border border-[var(--b-soft)] bg-[var(--bg-1)] open:border-[var(--b-hard)] transition-colors"
              >
                <summary className="cursor-pointer list-none px-6 py-5 flex items-center justify-between gap-4 text-[var(--t-1)] font-medium">
                  <span>{f.q}</span>
                  <ChevronRight
                    size={18}
                    className="shrink-0 text-[var(--brand-gold)] transition-transform group-open:rotate-90"
                  />
                </summary>
                <div className="px-6 pb-6 text-[var(--t-2)] leading-relaxed whitespace-pre-line">{f.a}</div>
              </details>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/faq"
              className="inline-flex items-center gap-1 text-sm text-[var(--brand-gold)] hover:text-[var(--t-1)] transition-colors"
            >
              Все вопросы <ArrowRight size={14} />
            </Link>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto px-6 py-20 text-center">
          <Card variant="highlight" padding="lg">
            <h2 className="text-3xl md:text-4xl font-bold">Готов начать?</h2>
            <p className="mt-4 text-[var(--t-2)]">
              Регистрация занимает 30 секунд. Демо-сигналы доступны сразу.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <ButtonLink
                href="/register"
                size="lg"
                iconRight={<ArrowRight size={18} />}
              >
                Зарегистрироваться
              </ButtonLink>
              <ButtonLink href="/login" variant="secondary" size="lg">
                Уже есть аккаунт — войти
              </ButtonLink>
            </div>
          </Card>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
