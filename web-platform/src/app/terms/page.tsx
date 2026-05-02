import { redirect } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { prisma } from "@/lib/prisma";
import { SiteHeader, SiteFooter } from "@/components/shared/SiteHeader";

export const dynamic = "force-dynamic";

export default async function TermsPage() {
  const page = await prisma.legalPage.findUnique({ where: { slug: "terms" } });
  if (!page || !page.isActive) {
    redirect("/");
  }
  return (
    <>
      <SiteHeader />
      <main className="relative">
        <section className="max-w-3xl mx-auto px-6 pt-16 pb-6 text-center">
          <Link
            href="/"
            className="text-xs uppercase tracking-widest text-[var(--t-3)] hover:text-[var(--brand-gold)] transition-colors"
          >
            ← На главную
          </Link>
          <div className="inline-flex items-center gap-2 px-3 h-8 mt-8 rounded-full text-xs uppercase tracking-widest border border-[var(--b-soft)] text-[var(--brand-gold)] bg-[var(--bg-1)]">
            Legal
          </div>
          <h1 className="mt-6 text-4xl md:text-5xl font-bold text-shimmer">{page.title}</h1>
          <p className="mt-4 text-xs text-[var(--t-3)]">
            Обновлено{" "}
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
      <SiteFooter />
    </>
  );
}
