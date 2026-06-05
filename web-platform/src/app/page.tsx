/**
 * Landing.
 *
 * Top nav: only "Как это работает", "Про нас", and a Register CTA.
 * Hero: big "Зарегистрироваться" button (primary), Telegram bot link is secondary.
 * Tiers: 2 уровня (v2.2) — T0 (безлим OTC после регистрации по нашей ссылке)
 * и T1 (полный доступ после депозита от $20).
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
  UserPlus,
  BarChart3,
  Clock,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TierBadge } from "@/components/ui/TierBadge";
import { LiveChart } from "@/components/market/LiveChart";
import { SiteHeader, SiteFooter } from "@/components/shared/SiteHeader";
import { prisma } from "@/lib/prisma";

const TIERS = [
  {
    tier: 0,
    deposit: "$0",
    name: "Обычный",
    perks: [
      "Регистрация на PocketOption по нашей ссылке",
      "Безлимит OTC-сигналов 24/7",
      "Доступ к личному кабинету и боту",
    ],
  },
  {
    tier: 1,
    deposit: "от $20",
    name: "Про",
    perks: [
      "Безлимит сигналов 24/7",
      "Все типы: OTC + биржа + Elite-пары",
      "Графики с индикаторами и углублённый разбор",
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
    title: "Доступ — через регистрацию, не через подписку",
    desc: "Никаких ежемесячных платежей. Регистрируешься на PocketOption по нашей ссылке — получаешь доступ к сигналам.",
  },
  {
    icon: BarChart3,
    title: "Полный набор инструментов от $20",
    desc: "С первым депозитом ≥ $20 открываются графики с RSI/MACD, аналитика и безлимит сигналов.",
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
    a: "Нет. У нас нет подписок. Доступ к сигналам открывается тем, кто зарегистрирован на PocketOption по нашей реферальной ссылке.",
  },
  {
    q: "Нужно ли вносить депозит, чтобы получить доступ?",
    a: "Нет. Депозит не обязателен — достаточно зарегистрироваться на PocketOption по нашей ссылке. Обычный уровень: безлимит OTC-сигналов 24/7. От $20 депозита открывается Про — все типы (OTC + биржа + Elite) + индикаторы.",
  },
  {
    q: "Что если у меня уже есть аккаунт PocketOption?",
    a: "Старые PO-аккаунты не подходят — мы не можем связать их со своей партнёркой. Нужно зарегистрироваться заново по нашей ссылке (можно на другую почту) и привязать новый Trader ID.",
  },
  {
    q: "Как открыть полный доступ?",
    a: "Зарегистрируйся на PocketOption по нашей ссылке — откроется Обычный уровень. Внеси первый депозит от $20 — автоматически поднимешься до Про.",
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
        <section className="relative max-w-6xl mx-auto px-6 pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="grid md:grid-cols-[1fr_auto] gap-12 items-center">
            {/* Left — text */}
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 h-8 rounded-full text-xs uppercase tracking-widest border border-[var(--b-soft)] text-[var(--brand-gold)] bg-[var(--bg-1)]">
                <Sparkles size={12} />
                <span>RevShare partnership · PocketOption</span>
              </div>
              <h1 className="mt-8 text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] text-shimmer">
                Сигналы, открытые
                <br />
                твоим депозитом
              </h1>
              <p className="mt-6 max-w-xl text-lg text-[var(--t-2)] md:mx-0 mx-auto">
                Регистрируйся, открой счёт PocketOption по нашей ссылке — и получай
                AI-сигналы безлимитом. Чем выше депозит — тем глубже анализ.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-3 md:justify-start justify-center items-center">
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
            </div>

            {/* Right — signal mockup card */}
            <div className="hidden md:block w-[320px] shrink-0">
              <div
                className="rounded-3xl border-2 overflow-hidden animate-float"
                style={{
                  borderColor: "var(--green)",
                  background: "linear-gradient(135deg, rgba(0,229,160,0.08), transparent 60%)",
                  boxShadow: "0 0 60px rgba(142,224,107,0.12)",
                }}
              >
                {/* Top bar */}
                <div className="px-5 py-3 flex items-center justify-between border-b border-white/[0.06]">
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[var(--brand-gold)]">
                    <span className="w-2 h-2 rounded-full bg-[var(--green)] animate-pulse" />
                    Live сигнал
                  </div>
                  <span className="text-[10px] text-[var(--t-3)]">OTC · 3m</span>
                </div>
                {/* Body */}
                <div className="px-5 py-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-14 h-14 rounded-xl flex flex-col items-center justify-center border-2"
                      style={{
                        borderColor: "var(--green)",
                        background: "rgba(142,224,107,0.10)",
                        color: "var(--green)",
                      }}
                    >
                      <TrendingUp size={24} />
                      <span className="text-[8px] font-bold mt-0.5">ВВЕРХ</span>
                    </div>
                    <div>
                      <div className="text-2xl font-bold" style={{ fontFamily: "var(--font-jetbrains)" }}>
                        EUR/USD
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[var(--t-2)] mt-0.5">
                        Уверенность
                        <span className="font-bold text-sm" style={{ color: "var(--brand-gold)" }}>
                          91%
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Confidence bar */}
                  <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden mb-4">
                    <div className="h-full rounded-full w-[91%]" style={{ background: "var(--brand-gold)" }} />
                  </div>
                  {/* Timer */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-[var(--t-3)]">
                      <Clock size={11} />
                      Истекает через
                    </div>
                    <div
                      className="text-xl font-bold tabular-nums"
                      style={{ fontFamily: "var(--font-jetbrains)", color: "var(--t-1)" }}
                    >
                      02:47
                    </div>
                  </div>
                </div>
                {/* Progress */}
                <div className="h-1 bg-white/[0.06]">
                  <div className="h-full w-[35%]" style={{ background: "var(--green)" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { value: "87.3%", label: "средняя точность" },
              { value: "12 800+", label: "трейдеров в системе" },
              { value: "24/7", label: "OTC-сигналы" },
              { value: "5%", label: "реферальный доход" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-[var(--b-soft)] bg-[var(--bg-1)] px-4 py-4 transition-all duration-200 hover:border-[var(--b-hard)]"
              >
                <div className="text-2xl font-bold" style={{ fontFamily: "var(--font-jetbrains)", color: "var(--t-1)" }}>
                  {s.value}
                </div>
                <div className="text-[12px] text-[var(--t-2)] mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Live chart */}
        <section id="live" className="max-w-6xl mx-auto px-6 -mt-6">
          <LiveChart />
        </section>

        {/* How it works */}
        <section id="how" className="max-w-6xl mx-auto px-6 py-24 fade-up-section">
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
        <section id="tiers" className="max-w-6xl mx-auto px-6 py-24 fade-up-section">
          <div className="text-center mb-16">
            <div className="text-xs uppercase tracking-widest text-[var(--brand-gold)] mb-3">
              Перки по депозиту
            </div>
            <h2 className="text-4xl md:text-5xl font-bold">2 уровня доступа</h2>
            <p className="mt-4 text-[var(--t-2)] max-w-xl mx-auto">
              Обычный — для всех, кто зарегистрировался на PocketOption
              по нашей реф-ссылке. Про (полный доступ) — с первого депозита
              от $20.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {TIERS.map((t) => (
              <Card
                key={t.tier}
                variant={t.tier === 1 ? "highlight" : "default"}
                hover
                padding="lg"
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
        <section className="max-w-6xl mx-auto px-6 py-20 fade-up-section">
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
              {featuredReviews.map((r) => {
                const initials = r.authorName
                  .split(" ")
                  .slice(0, 2)
                  .map((w) => w[0])
                  .join("")
                  .toUpperCase();
                return (
                  <Card key={r.id} padding="lg" hover className="flex flex-col h-full">
                    {/* Author header with avatar */}
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm font-bold"
                        style={{
                          background: "rgba(212,160,23,0.12)",
                          color: "var(--brand-gold)",
                          border: "1px solid var(--b-soft)",
                        }}
                      >
                        {initials}
                      </div>
                      <div>
                        <div className="text-sm font-semibold">{r.authorName}</div>
                        {r.authorRole && (
                          <div className="text-[11px] text-[var(--t-3)]">{r.authorRole}</div>
                        )}
                      </div>
                    </div>
                    {/* Stars */}
                    <div className="flex gap-0.5 mb-3">
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
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* FAQ */}
        <section id="faq" className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <div className="text-xs uppercase tracking-widest text-[var(--brand-gold)] mb-3">
              FAQ
            </div>
            <h2 className="text-4xl md:text-5xl font-bold">Частые вопросы</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {FAQS.map((f, idx) => (
              <details
                key={`${idx}-${f.q}`}
                className="group rounded-2xl border border-[var(--b-soft)] bg-[var(--bg-1)] open:border-[var(--b-hard)] transition-colors"
              >
                <summary className="cursor-pointer list-none px-6 py-5 flex items-center justify-between gap-4 text-[var(--t-1)] font-medium select-none">
                  <span>{f.q}</span>
                  <ChevronRight
                    size={18}
                    className="shrink-0 text-[var(--brand-gold)] transition-transform duration-200 group-open:rotate-90"
                  />
                </summary>
                <div className="grid grid-rows-[0fr] group-open:grid-rows-[1fr] transition-[grid-template-rows] duration-300 ease-out">
                  <div className="overflow-hidden">
                    <div className="px-6 pb-6 text-[var(--t-2)] leading-relaxed whitespace-pre-line">{f.a}</div>
                  </div>
                </div>
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
