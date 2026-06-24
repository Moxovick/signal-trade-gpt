/**
 * Landing.
 *
 * Top nav: only "Как это работает", "Про нас", and a Register CTA.
 * Hero: big "Зарегистрироваться" button (primary), Telegram bot link is secondary.
 * Tiers: 3 уровня (v3) — Free (3 OTC/день), Basic (от $20, 10/день),
 * Pro (от $100, безлимит).
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
import { HeroCTA } from "@/components/shared/HeroCTA";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getDictionary, getDictionaryForUser, getLocaleFromCookies, getLocaleForUser } from "@/lib/i18n";

const STEP_ICONS = [UserPlus, CircleDollarSign, TrendingUp];
const FEATURE_ICONS = [Sparkles, Layers, BarChart3, ShieldCheck];

export default async function LandingPage() {
  const session = await auth();
  const locale = session?.user?.id
    ? await getLocaleForUser(session.user.id)
    : await getLocaleFromCookies();
  const t = await getDictionary(locale);

  const landing = t.landing as {
    partnerBadge: string;
    heroTitle: string;
    heroSubtitle: string;
    heroSecondary: string;
    signalMockup: {
      liveBadge: string;
      otcLabel: string;
      directionUp: string;
      confidenceLabel: string;
      expiresLabel: string;
    };
    stats: Array<{ value: string; label: string }>;
    stepsLabel: string;
    stepsTitle: string;
    steps: Array<{ n: string; title: string; desc: string }>;
    tiersLabel: string;
    tiersTitle: string;
    tiersSubtitle: string;
    tiers: Array<{ tier: number; deposit: string; name: string; perks: string[] }>;
    features: Array<{ title: string; desc: string }>;
    reviewsLabel: string;
    reviewsTitle: string;
    faqLabel: string;
    faqTitle: string;
    faqAllLink: string;
    fallbackFaqs: Array<{ q: string; a: string }>;
    ctaTitle: string;
    ctaSubtitle: string;
  };

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
    : landing.fallbackFaqs;

  const siteTranslations = {
    nav: t.nav as {
      howItWorks: string;
      aboutUs: string;
      login: string;
      register: string;
      closeMenu: string;
      openMenu: string;
      cabinetFallback: string;
      avatarAlt: string;
    },
    footer: t.footer as {
      disclaimer: string;
      sectionPlatform: string;
      sectionSupport: string;
      links: {
        howItWorks: string;
        aboutUs: string;
        register: string;
        login: string;
        faq: string;
        terms: string;
        privacy: string;
        dashboard: string;
      };
    },
  };

  const heroCTATranslations = {
    register: (t.heroCta as { register: string; dashboard: string }).register,
    dashboard: (t.heroCta as { register: string; dashboard: string }).dashboard,
  };

  return (
    <>
      <SiteHeader translations={siteTranslations} locale={locale} />

      <main className="relative">
        {/* Hero */}
        <section className="relative max-w-6xl mx-auto px-6 pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="grid md:grid-cols-[1fr_auto] gap-12 items-center">
            {/* Left — text */}
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 h-8 rounded-full text-xs uppercase tracking-widest border border-[var(--b-soft)] text-[var(--brand-gold)] bg-[var(--bg-1)]">
                <Sparkles size={12} />
                <span>{landing.partnerBadge}</span>
              </div>
              <h1 className="mt-8 text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] text-shimmer">
                {landing.heroTitle.split("\n").map((line, i, arr) => (
                  <span key={i}>
                    {line}
                    {i < arr.length - 1 && <br />}
                  </span>
                ))}
              </h1>
              <p className="mt-6 max-w-xl text-lg text-[var(--t-2)] md:mx-0 mx-auto">
                {landing.heroSubtitle}
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-3 md:justify-start justify-center items-center">
                <HeroCTA translations={heroCTATranslations} />
                <ButtonLink href="/how-it-works" variant="secondary" size="lg">
                  {landing.heroSecondary}
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
                    {landing.signalMockup.liveBadge}
                  </div>
                  <span className="text-[10px] text-[var(--t-3)]">{landing.signalMockup.otcLabel}</span>
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
                      <span className="text-[8px] font-bold mt-0.5">{landing.signalMockup.directionUp}</span>
                    </div>
                    <div>
                      <div className="text-2xl font-bold" style={{ fontFamily: "var(--font-jetbrains)" }}>
                        EUR/USD
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[var(--t-2)] mt-0.5">
                        {landing.signalMockup.confidenceLabel}
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
                      {landing.signalMockup.expiresLabel}
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
            {landing.stats.map((s) => (
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
              {landing.stepsLabel}
            </div>
            <h2 className="text-4xl md:text-5xl font-bold">{landing.stepsTitle}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {landing.steps.map((s, i) => {
              const Icon = STEP_ICONS[i] ?? UserPlus;
              return (
                <Card key={s.n} hover padding="md">
                  <div
                    className="text-xs font-mono text-[var(--t-3)] mb-4"
                    style={{ fontFamily: "var(--font-jetbrains)" }}
                  >
                    {s.n}
                  </div>
                  <Icon size={28} className="text-[var(--brand-gold)] mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
                  <p className="text-sm text-[var(--t-2)] leading-relaxed">{s.desc}</p>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Tiers */}
        <section id="tiers" className="max-w-6xl mx-auto px-6 py-24 fade-up-section">
          <div className="text-center mb-16">
            <div className="text-xs uppercase tracking-widest text-[var(--brand-gold)] mb-3">
              {landing.tiersLabel}
            </div>
            <h2 className="text-4xl md:text-5xl font-bold">{landing.tiersTitle}</h2>
            <p className="mt-4 text-[var(--t-2)] max-w-xl mx-auto">
              {landing.tiersSubtitle}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {landing.tiers.map((tier) => (
              <Card
                key={tier.tier}
                variant={tier.tier === 2 ? "highlight" : "default"}
                hover
                padding="lg"
                className="flex flex-col"
              >
                <TierBadge tier={tier.tier} size="sm" />
                <div
                  className="mt-4 text-3xl font-bold"
                  style={{ fontFamily: "var(--font-jetbrains)" }}
                >
                  {tier.deposit}
                </div>
                <div className="mt-1 text-xs uppercase tracking-wider text-[var(--t-3)]">
                  {tier.name}
                </div>
                <ul className="mt-5 space-y-2 text-sm flex-1">
                  {tier.perks.map((p) => (
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
            {landing.features.map((f, i) => {
              const Icon = FEATURE_ICONS[i] ?? Sparkles;
              return (
                <Card key={f.title} padding="lg" hover>
                  <div className="flex items-start gap-4">
                    <div
                      className="flex items-center justify-center w-12 h-12 rounded-xl shrink-0"
                      style={{
                        background: "rgba(212, 160, 23, 0.08)",
                        border: "1px solid var(--b-soft)",
                      }}
                    >
                      <Icon size={22} className="text-[var(--brand-gold)]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-1">{f.title}</h3>
                      <p className="text-[var(--t-2)] leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Reviews — admin-controlled */}
        {featuredReviews.length > 0 && (
          <section id="reviews" className="max-w-6xl mx-auto px-6 py-20">
            <div className="text-center mb-12">
              <div className="text-xs uppercase tracking-widest text-[var(--brand-gold)] mb-3">
                {landing.reviewsLabel}
              </div>
              <h2 className="text-4xl md:text-5xl font-bold">{landing.reviewsTitle}</h2>
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
              {landing.faqLabel}
            </div>
            <h2 className="text-4xl md:text-5xl font-bold">{landing.faqTitle}</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-3 items-start">
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
                <div className="px-6 pb-6 text-[var(--t-2)] leading-relaxed whitespace-pre-line">{f.a}</div>
              </details>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/faq"
              className="inline-flex items-center gap-1 text-sm text-[var(--brand-gold)] hover:text-[var(--t-1)] transition-colors"
            >
              {landing.faqAllLink} <ArrowRight size={14} />
            </Link>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto px-6 py-20 text-center">
          <Card variant="highlight" padding="lg">
            <h2 className="text-3xl md:text-4xl font-bold">{landing.ctaTitle}</h2>
            <p className="mt-4 text-[var(--t-2)]">
              {landing.ctaSubtitle}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <HeroCTA translations={heroCTATranslations} />
            </div>
          </Card>
        </section>
      </main>

      <SiteFooter translations={siteTranslations} locale={locale} />
    </>
  );
}
