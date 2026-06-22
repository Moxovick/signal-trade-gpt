/**
 * /about — "Про нас". Static content explaining what the platform is and
 * how the partnership flow with PocketOption works.
 */
import { ArrowRight, Target, Shield, Users, BarChart3 } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SiteHeader, SiteFooter } from "@/components/shared/SiteHeader";
import { auth } from "@/lib/auth";
import { getDictionary, getDictionaryForUser } from "@/lib/i18n";

const VALUE_ICONS = [Target, Shield, BarChart3, Users];

export default async function AboutPage() {
  const session = await auth();
  const t = session?.user?.id
    ? await getDictionaryForUser(session.user.id)
    : await getDictionary("ru");

  const about = t.about as {
    badge: string;
    title: string;
    subtitle: string;
    values: Array<{ title: string; desc: string }>;
    howWeEarnTitle: string;
    howWeEarnBody1: string;
    howWeEarnBody2: string;
    disclaimerTitle: string;
    disclaimerBody: string;
    ctaTitle: string;
    ctaSubtitle: string;
    ctaRegister: string;
    ctaHowItWorks: string;
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
        <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 h-8 rounded-full text-xs uppercase tracking-widest border border-[var(--b-soft)] text-[var(--brand-gold)] bg-[var(--bg-1)]">
            {about.badge}
          </div>
          <h1 className="mt-8 text-5xl md:text-6xl font-bold leading-[1.05]">
            {about.title}
          </h1>
          <p className="mt-6 text-lg text-[var(--t-2)] leading-relaxed">
            {about.subtitle}
          </p>
        </section>

        <section className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-2 gap-5">
            {about.values.map((v, i) => {
              const Icon = VALUE_ICONS[i] ?? Target;
              return (
                <Card key={v.title} padding="lg" hover>
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
                      <h3 className="text-xl font-semibold mb-1">{v.title}</h3>
                      <p className="text-[var(--t-2)] leading-relaxed">{v.desc}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="max-w-3xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-bold mb-6">{about.howWeEarnTitle}</h2>
          <div className="space-y-4 text-[var(--t-2)] leading-relaxed">
            <p>{about.howWeEarnBody1}</p>
            <p>{about.howWeEarnBody2}</p>
          </div>
        </section>

        <section className="max-w-3xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-bold mb-6">{about.disclaimerTitle}</h2>
          <div className="rounded-2xl border border-[var(--b-soft)] bg-[var(--bg-1)] p-6 text-sm text-[var(--t-2)] leading-relaxed">
            <p>{about.disclaimerBody}</p>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 py-20 text-center">
          <Card variant="highlight" padding="lg">
            <h2 className="text-3xl font-bold">{about.ctaTitle}</h2>
            <p className="mt-4 text-[var(--t-2)]">
              {about.ctaSubtitle}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <ButtonLink
                href="/register"
                size="lg"
                iconRight={<ArrowRight size={18} />}
              >
                {about.ctaRegister}
              </ButtonLink>
              <ButtonLink href="/how-it-works" variant="secondary" size="lg">
                {about.ctaHowItWorks}
              </ButtonLink>
            </div>
          </Card>
        </section>
      </main>
      <SiteFooter translations={siteTranslations} />
    </>
  );
}
