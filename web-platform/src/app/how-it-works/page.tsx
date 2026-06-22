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
import { auth } from "@/lib/auth";
import { getDictionary, getDictionaryForUser } from "@/lib/i18n";

const STEP_ICONS = [UserPlus, CircleDollarSign, TrendingUp, Bot];
const FEATURE_ICONS = [Zap, BarChart3];

export default async function HowItWorksPage() {
  const session = await auth();
  const t = session?.user?.id
    ? await getDictionaryForUser(session.user.id)
    : await getDictionary("ru");

  const hiw = t.howItWorks as {
    badge: string;
    title: string;
    subtitle: string;
    steps: Array<{ n: string; title: string; desc: string }>;
    tiersLabel: string;
    tiersTitle: string;
    tiers: Array<{ tier: number; name: string; deposit: string; desc: string }>;
    features: Array<{ title: string; desc: string }>;
    ctaTitle: string;
    ctaSubtitle: string;
    ctaRegister: string;
  };

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

  return (
    <>
      <SiteHeader translations={siteTranslations} />
      <main className="relative">
        <section className="max-w-4xl mx-auto px-6 pt-20 pb-12 text-center">
          <div className="inline-flex items-center gap-2 px-3 h-8 rounded-full text-xs uppercase tracking-widest border border-[var(--b-soft)] text-[var(--brand-gold)] bg-[var(--bg-1)]">
            {hiw.badge}
          </div>
          <h1 className="mt-8 text-5xl md:text-6xl font-bold leading-[1.05]">
            {hiw.title}
          </h1>
          <p className="mt-6 text-lg text-[var(--t-2)]">
            {hiw.subtitle}
          </p>
        </section>

        <section className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-2 gap-5">
            {hiw.steps.map((s, i) => {
              const Icon = STEP_ICONS[i] ?? UserPlus;
              return (
                <Card key={s.n} hover padding="lg">
                  <div
                    className="text-xs font-mono text-[var(--t-3)] mb-4"
                    style={{ fontFamily: "var(--font-jetbrains)" }}
                  >
                    {s.n}
                  </div>
                  <Icon size={28} className="text-[var(--brand-gold)] mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{s.title}</h3>
                  <p className="text-sm text-[var(--t-2)] leading-relaxed">{s.desc}</p>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <div className="text-xs uppercase tracking-widest text-[var(--brand-gold)] mb-3">
              {hiw.tiersLabel}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">{hiw.tiersTitle}</h2>
          </div>
          <div className="space-y-3">
            {hiw.tiers.map((tier) => (
              <Card key={tier.tier} padding="md" className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="shrink-0">
                  <TierBadge tier={tier.tier} size="md" />
                </div>
                <div
                  className="text-2xl font-bold shrink-0 md:w-32"
                  style={{ fontFamily: "var(--font-jetbrains)" }}
                >
                  {tier.deposit}
                </div>
                <div className="text-sm text-[var(--t-2)] flex-1">{tier.desc}</div>
              </Card>
            ))}
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-2 gap-5">
            {hiw.features.map((f, i) => {
              const Icon = FEATURE_ICONS[i] ?? Zap;
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

        <section className="max-w-4xl mx-auto px-6 py-20 text-center">
          <Card variant="highlight" padding="lg">
            <h2 className="text-3xl font-bold">{hiw.ctaTitle}</h2>
            <p className="mt-4 text-[var(--t-2)]">
              {hiw.ctaSubtitle}
            </p>
            <div className="mt-8">
              <ButtonLink
                href="/register"
                size="lg"
                iconRight={<ArrowRight size={18} />}
              >
                {hiw.ctaRegister}
              </ButtonLink>
            </div>
          </Card>
        </section>
      </main>
      <SiteFooter translations={siteTranslations} />
    </>
  );
}
