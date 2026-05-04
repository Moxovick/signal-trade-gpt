/**
 * /how-it-works — explains the user journey end-to-end.
 *
 * Replaces the old subscription-tariff page with the v2 deposit-driven flow.
 */
import {
  ArrowRight,
  UserPlus,
  CircleDollarSign,
  Bot,
  TrendingUp,
  BarChart3,
  Zap,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TierBadge } from "@/components/ui/TierBadge";
import { SiteHeader, SiteFooter } from "@/components/shared/SiteHeader";

const STEPS = [
  {
    n: "01",
    icon: UserPlus,
    title: "Регистрация на сайте",
    desc: "Email + пароль. 30 секунд. Никаких ботов и Telegram на старте — всё на сайте. После регистрации сразу попадаешь в личный кабинет.",
  },
  {
    n: "02",
    icon: CircleDollarSign,
    title: "Открой счёт PocketOption",
    desc: "По нашей реферальной ссылке (она показывается в кабинете). Регистрация на PO бесплатная и занимает 1 минуту. Это нужно, чтобы мы могли видеть твой депозит и автоматически открывать тиры.",
  },
  {
    n: "03",
    icon: TrendingUp,
    title: "Внеси депозит",
    desc: "От $100 — открывается базовый тир, безлимит сигналов. От $1000 — углублённый анализ с индикаторами. Чем больше депозит, тем глубже инструменты.",
  },
  {
    n: "04",
    icon: Bot,
    title: "Привяжи Telegram-бота (опционально)",
    desc: "Если хочешь получать сигналы push-уведомлениями в Telegram — привяжи аккаунт через /link в боте. Без этого сигналы всё равно приходят в личный кабинет на сайте.",
  },
];

const TIERS = [
  {
    tier: 0,
    name: "Демо",
    deposit: "$0",
    desc: "2 пробных сигнала, чтобы посмотреть формат.",
  },
  {
    tier: 1,
    name: "Базовый",
    deposit: "от $100",
    desc: "Все сигналы, безлимитом. Все валютные пары. OTC + биржа.",
  },
  {
    tier: 2,
    name: "Трейдер",
    deposit: "от $1000",
    desc: "+ графики с RSI / MACD / объём, углублённый разбор.",
  },
  {
    tier: 3,
    name: "Pro",
    deposit: "от $5000",
    desc: "+ ранний доступ к сигналу за 60 секунд до публикации.",
  },
  {
    tier: 4,
    name: "Elite",
    deposit: "от $10000",
    desc: "+ Elite-пары (≥90% уверенность), приоритет в очереди публикации.",
  },
];

const FEATURES = [
  {
    icon: Zap,
    title: "Сигналы появляются автоматически",
    desc: "AI генерирует 24/7. Ты получаешь push в кабинет (и в Telegram, если привязал бота).",
  },
  {
    icon: BarChart3,
    title: "Углублённый анализ от $1000",
    desc: "Сигнал приходит с графиком: RSI, MACD, объём, уровни support/resistance. Видишь не просто 'вверх/вниз', а почему.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <SiteHeader />
      <main className="relative">
        <section className="max-w-4xl mx-auto px-6 pt-20 pb-12 text-center">
          <div className="inline-flex items-center gap-2 px-3 h-8 rounded-full text-xs uppercase tracking-widest border border-[var(--b-soft)] text-[var(--brand-gold)] bg-[var(--bg-1)]">
            Как это работает
          </div>
          <h1 className="mt-8 text-5xl md:text-6xl font-bold leading-[1.05]">
            От регистрации до первого сигнала — 5 минут
          </h1>
          <p className="mt-6 text-lg text-[var(--t-2)]">
            Ниже — каждый шаг по порядку. Без сюрпризов.
          </p>
        </section>

        <section className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-2 gap-5">
            {STEPS.map((s) => (
              <Card key={s.n} hover padding="lg">
                <div
                  className="text-xs font-mono text-[var(--t-3)] mb-4"
                  style={{ fontFamily: "var(--font-jetbrains)" }}
                >
                  {s.n}
                </div>
                <s.icon size={28} className="text-[var(--brand-gold)] mb-4" />
                <h3 className="text-xl font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-[var(--t-2)] leading-relaxed">{s.desc}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <div className="text-xs uppercase tracking-widest text-[var(--brand-gold)] mb-3">
              Что открывается на каждом тире
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">5 уровней доступа</h2>
          </div>
          <div className="space-y-3">
            {TIERS.map((t) => (
              <Card key={t.tier} padding="md" className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="shrink-0">
                  <TierBadge tier={t.tier} size="md" />
                </div>
                <div
                  className="text-2xl font-bold shrink-0 md:w-32"
                  style={{ fontFamily: "var(--font-jetbrains)" }}
                >
                  {t.deposit}
                </div>
                <div className="text-sm text-[var(--t-2)] flex-1">{t.desc}</div>
              </Card>
            ))}
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 py-16">
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

        <section className="max-w-4xl mx-auto px-6 py-20 text-center">
          <Card variant="highlight" padding="lg">
            <h2 className="text-3xl font-bold">Начни прямо сейчас</h2>
            <p className="mt-4 text-[var(--t-2)]">
              Регистрация бесплатная. Демо-режим доступен без депозита.
            </p>
            <div className="mt-8">
              <ButtonLink
                href="/register"
                size="lg"
                iconRight={<ArrowRight size={18} />}
              >
                Зарегистрироваться
              </ButtonLink>
            </div>
          </Card>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
