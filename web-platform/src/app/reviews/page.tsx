import Link from "next/link";
import { Star, ArrowRight, Quote } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { SiteHeader, SiteFooter } from "@/components/shared/SiteHeader";
import { Card } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";

const BOT_URL =
  process.env["NEXT_PUBLIC_BOT_URL"] ?? "https://t.me/traitsignaltsest_bot";

export const dynamic = "force-dynamic";

export default async function ReviewsPage() {
  const reviews = await prisma.review.findMany({
    where: { isPublic: true, status: "published" },
    orderBy: [{ isFeatured: "desc" }, { position: "asc" }, { createdAt: "desc" }],
  });

  const featured = reviews.filter((r) => r.isFeatured);
  const rest = reviews.filter((r) => !r.isFeatured);

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : "—";

  return (
    <>
      <SiteHeader />
      <main className="relative">
        <section className="max-w-5xl mx-auto px-6 pt-16 pb-10 text-center">
          <Link
            href="/"
            className="text-xs uppercase tracking-widest text-[var(--t-3)] hover:text-[var(--brand-gold)] transition-colors"
          >
            ← На главную
          </Link>
          <div className="inline-flex items-center gap-2 px-3 h-8 mt-8 rounded-full text-xs uppercase tracking-widest border border-[var(--b-soft)] text-[var(--brand-gold)] bg-[var(--bg-1)]">
            Отзывы трейдеров
          </div>
          <h1 className="mt-6 text-5xl md:text-6xl font-bold leading-[1.05] text-shimmer">
            Что говорят трейдеры
          </h1>
          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-[var(--t-2)]">
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-[var(--brand-gold)]">{avgRating}</span>
              <span>средний рейтинг</span>
            </div>
            <div className="w-px h-8 bg-[var(--b-soft)]" />
            <div>
              <span className="text-3xl font-bold text-[var(--t-1)]">{reviews.length}</span>{" "}
              отзывов
            </div>
          </div>
        </section>

        {featured.length > 0 && (
          <section className="max-w-6xl mx-auto px-6 pb-12">
            <div className="text-xs uppercase tracking-widest text-[var(--brand-gold)] mb-5">
              Featured
            </div>
            <div className="grid md:grid-cols-3 gap-5">
              {featured.map((r) => (
                <ReviewCard key={r.id} r={r} highlight />
              ))}
            </div>
          </section>
        )}

        {rest.length > 0 && (
          <section className="max-w-6xl mx-auto px-6 pb-16">
            <div className="text-xs uppercase tracking-widest text-[var(--brand-gold)] mb-5">
              Все отзывы
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {rest.map((r) => (
                <ReviewCard key={r.id} r={r} />
              ))}
            </div>
          </section>
        )}

        {reviews.length === 0 && (
          <section className="max-w-3xl mx-auto px-6 py-20 text-center text-[var(--t-3)]">
            Отзывов пока нет — будь первым.
          </section>
        )}

        <section className="max-w-4xl mx-auto px-6 py-16">
          <Card variant="highlight" padding="lg">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold">Готов поделиться опытом?</h2>
                <p className="mt-2 text-[var(--t-2)]">
                  Напиши нам в боте после первой недели — лучшие отзывы попадут на главную.
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

type ReviewLite = {
  id: string;
  authorName: string;
  authorRole: string | null;
  rating: number;
  text: string;
  avatarUrl: string | null;
};

function ReviewCard({ r, highlight = false }: { r: ReviewLite; highlight?: boolean }) {
  return (
    <Card variant={highlight ? "highlight" : "default"} padding="lg" hover className="flex flex-col">
      <Quote size={28} className="text-[var(--brand-gold)] opacity-60 mb-4" />
      <p className="text-[var(--t-1)] leading-relaxed flex-1">{r.text}</p>
      <div className="mt-6 pt-5 border-t border-[var(--b-soft)] flex items-center justify-between">
        <div>
          <div className="font-semibold text-[var(--t-1)]">{r.authorName}</div>
          {r.authorRole && (
            <div className="text-xs text-[var(--t-3)] mt-0.5">{r.authorRole}</div>
          )}
        </div>
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }, (_, i) => (
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
      </div>
    </Card>
  );
}
