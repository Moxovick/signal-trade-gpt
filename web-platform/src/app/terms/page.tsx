import { redirect } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { prisma } from "@/lib/prisma";
import { SiteHeader, SiteFooter } from "@/components/shared/SiteHeader";
import { auth } from "@/lib/auth";
import { getDictionary, getDictionaryForUser, getLocaleFromCookies, getLocaleForUser } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function TermsPage() {
  const session = await auth();
  const locale = session?.user?.id
    ? await getLocaleForUser(session.user.id)
    : await getLocaleFromCookies();
  const t = await getDictionary(locale);

  const terms = t.terms as {
    badge: string;
    updatedPrefix: string;
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

  const page = await prisma.legalPage.findUnique({ where: { slug: "terms" } });
  if (!page || !page.isActive) {
    redirect("/");
  }
  return (
    <>
      <SiteHeader translations={siteTranslations} locale={locale} />
      <main className="relative">
        <section className="max-w-3xl mx-auto px-6 pt-16 pb-6 text-center">
          <Link
            href="/"
            className="text-xs uppercase tracking-widest text-[var(--t-3)] hover:text-[var(--brand-gold)] transition-colors"
          >
            {(t.common as { backToHome: string }).backToHome}
          </Link>
          <div className="inline-flex items-center gap-2 px-3 h-8 mt-8 rounded-full text-xs uppercase tracking-widest border border-[var(--b-soft)] text-[var(--brand-gold)] bg-[var(--bg-1)]">
            {terms.badge}
          </div>
          <h1 className="mt-6 text-4xl md:text-5xl font-bold text-[var(--brand-gold)]">{page.title}</h1>
          <p className="mt-4 text-xs text-[var(--t-3)]">
            {terms.updatedPrefix}{" "}
            {page.updatedAt.toLocaleDateString("ru", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </section>
        <article className="legal-prose max-w-3xl mx-auto px-6 py-10">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{page.body}</ReactMarkdown>
        </article>
      </main>
      <SiteFooter translations={siteTranslations} locale={locale} />
    </>
  );
}
