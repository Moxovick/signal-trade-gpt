import Link from "next/link";
import { ChevronRight, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { SiteHeader, SiteFooter } from "@/components/shared/SiteHeader";
import { Card } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { auth } from "@/lib/auth";
import { getDictionary, getDictionaryForUser, getLocaleFromCookies, getLocaleForUser } from "@/lib/i18n";

const BOT_URL = process.env["NEXT_PUBLIC_BOT_URL"] ?? "";

export const dynamic = "force-dynamic";

export default async function FaqPage() {
  const session = await auth();
  const locale = session?.user?.id
    ? await getLocaleForUser(session.user.id)
    : await getLocaleFromCookies();
  const t = await getDictionary(locale);

  const faq = t.faq as {
    badge: string;
    title: string;
    subtitle: string;
    emptyState: string;
    categories: Record<string, string>;
    ctaTitle: string;
    ctaSubtitle: string;
    ctaButton: string;
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

  const faqs = await prisma.faq.findMany({
    where: { isActive: true },
    orderBy: [{ category: "asc" }, { position: "asc" }],
  });

  const grouped = new Map<string, typeof faqs>();
  for (const f of faqs) {
    if (!grouped.has(f.category)) grouped.set(f.category, []);
    grouped.get(f.category)!.push(f);
  }

  const CATEGORY_LABELS: Record<string, string> = faq.categories;

  const orderedCategories = Object.keys(CATEGORY_LABELS).filter((c) =>
    grouped.has(c),
  );
  for (const c of grouped.keys()) {
    if (!orderedCategories.includes(c)) orderedCategories.push(c);
  }

  return (
    <>
      <SiteHeader translations={siteTranslations} locale={locale} />
      <main className="relative">
        <section className="max-w-3xl mx-auto px-6 pt-16 pb-10 text-center">
          <Link
            href="/"
            className="text-xs uppercase tracking-widest text-[var(--t-3)] hover:text-[var(--brand-gold)] transition-colors"
          >
            {(t.common as { backToHome: string }).backToHome}
          </Link>
          <div className="inline-flex items-center gap-2 px-3 h-8 mt-8 rounded-full text-xs uppercase tracking-widest border border-[var(--b-soft)] text-[var(--brand-gold)] bg-[var(--bg-1)]">
            {faq.badge}
          </div>
          <h1 className="mt-6 text-5xl md:text-6xl font-bold leading-[1.05] text-shimmer">
            {faq.title}
          </h1>
          <p className="mt-5 text-[var(--t-2)] max-w-xl mx-auto">
            {faq.subtitle}
          </p>
        </section>

        <section className="max-w-3xl mx-auto px-6 pb-16 space-y-10">
          {orderedCategories.map((cat) => (
            <div key={cat}>
              <div className="text-xs uppercase tracking-widest text-[var(--brand-gold)] mb-4">
                {CATEGORY_LABELS[cat] ?? cat}
              </div>
              <div className="space-y-3">
                {grouped.get(cat)!.map((f) => (
                  <details
                    key={f.id}
                    className="group rounded-2xl border border-[var(--b-soft)] bg-[var(--bg-1)] open:border-[var(--b-hard)] transition-colors"
                  >
                    <summary className="cursor-pointer list-none px-6 py-5 flex items-center justify-between gap-4 text-[var(--t-1)] font-medium">
                      <span>{f.question}</span>
                      <ChevronRight
                        size={18}
                        className="shrink-0 text-[var(--brand-gold)] transition-transform group-open:rotate-90"
                      />
                    </summary>
                    <div className="px-6 pb-6 text-[var(--t-2)] leading-relaxed whitespace-pre-line">
                      {f.answer}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))}

          {faqs.length === 0 && (
            <div className="text-center py-20 text-[var(--t-3)]">
              {faq.emptyState}
            </div>
          )}
        </section>

        <section className="max-w-4xl mx-auto px-6 py-16">
          <Card variant="highlight" padding="lg">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold">{faq.ctaTitle}</h2>
                <p className="mt-2 text-[var(--t-2)]">
                  {faq.ctaSubtitle}
                </p>
              </div>
              <ButtonLink
                href={BOT_URL}
                external
                size="lg"
                iconRight={<ArrowRight size={18} />}
              >
                {faq.ctaButton}
              </ButtonLink>
            </div>
          </Card>
        </section>
      </main>
      <SiteFooter translations={siteTranslations} locale={locale} />
    </>
  );
}
