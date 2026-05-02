import Link from "next/link";
import { ChevronRight, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { SiteHeader, SiteFooter } from "@/components/shared/SiteHeader";
import { Card } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";

const BOT_URL =
  process.env["NEXT_PUBLIC_BOT_URL"] ?? "https://t.me/traitsignaltsest_bot";

const CATEGORY_LABELS: Record<string, string> = {
  general: "Общие вопросы",
  tiers: "Тиры и доступ",
  registration: "Регистрация и привязка",
  referral: "Реферальная программа",
  giveaway: "Розыгрыши и призы",
};

export const dynamic = "force-dynamic";

export default async function FaqPage() {
  const faqs = await prisma.faq.findMany({
    where: { isActive: true },
    orderBy: [{ category: "asc" }, { position: "asc" }],
  });

  const grouped = new Map<string, typeof faqs>();
  for (const f of faqs) {
    if (!grouped.has(f.category)) grouped.set(f.category, []);
    grouped.get(f.category)!.push(f);
  }
  const orderedCategories = Object.keys(CATEGORY_LABELS).filter((c) =>
    grouped.has(c),
  );
  for (const c of grouped.keys()) {
    if (!orderedCategories.includes(c)) orderedCategories.push(c);
  }

  return (
    <>
      <SiteHeader />
      <main className="relative">
        <section className="max-w-3xl mx-auto px-6 pt-16 pb-10 text-center">
          <Link
            href="/"
            className="text-xs uppercase tracking-widest text-[var(--t-3)] hover:text-[var(--brand-gold)] transition-colors"
          >
            ← На главную
          </Link>
          <div className="inline-flex items-center gap-2 px-3 h-8 mt-8 rounded-full text-xs uppercase tracking-widest border border-[var(--b-soft)] text-[var(--brand-gold)] bg-[var(--bg-1)]">
            FAQ
          </div>
          <h1 className="mt-6 text-5xl md:text-6xl font-bold leading-[1.05] text-shimmer">
            Частые вопросы
          </h1>
          <p className="mt-5 text-[var(--t-2)] max-w-xl mx-auto">
            Всё что нужно знать о Signal Trade GPT, тирах, привязке аккаунта PocketOption и
            реферальной программе.
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
              FAQ ещё не настроены. Загляни позже.
            </div>
          )}
        </section>

        <section className="max-w-4xl mx-auto px-6 py-16">
          <Card variant="highlight" padding="lg">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold">Остались вопросы?</h2>
                <p className="mt-2 text-[var(--t-2)]">
                  Напиши нам прямо в Telegram-бота — поддержка отвечает в течение часа.
                </p>
              </div>
              <ButtonLink
                href={BOT_URL}
                external
                size="lg"
                iconRight={<ArrowRight size={18} />}
              >
                Открыть бота
              </ButtonLink>
            </div>
          </Card>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
