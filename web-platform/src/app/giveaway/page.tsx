/**
 * Public — Бонусная программа.
 *
 * Explains the deposit-based reward tiers. Logged-in users see their progress.
 */
import Link from "next/link";
import { ArrowRight, Gift, Zap, TrendingUp, Star, CheckCircle2, Lock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { SiteHeader, SiteFooter } from "@/components/shared/SiteHeader";
import { Card } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";

const BOT_URL =
  process.env["NEXT_PUBLIC_BOT_URL"] ?? "https://t.me/traitsignaltsest_bot";

export const dynamic = "force-dynamic";

const TIERS = [
  {
    tier: 0,
    name: "Free",
    deposit: "Регистрация",
    color: "#b6a586",
    bg: "rgba(110,96,76,0.12)",
    icon: Zap,
    perks: [
      "3 OTC-сигнала в день",
      "Доступ к дашборду",
      "Базовые достижения",
    ],
  },
  {
    tier: 1,
    name: "Basic",
    deposit: "от $20",
    color: "#8888ff",
    bg: "rgba(136,136,255,0.10)",
    icon: TrendingUp,
    perks: [
      "10 сигналов в день",
      "OTC + биржевые сигналы",
      "Расширенная аналитика",
    ],
  },
  {
    tier: 2,
    name: "Pro",
    deposit: "от $100",
    color: "#d4a017",
    bg: "rgba(212,160,23,0.10)",
    icon: Star,
    perks: [
      "Безлимитные сигналы",
      "OTC + биржа + Elite",
      "Приоритетная поддержка",
    ],
  },
];

const THRESHOLDS: Record<number, number> = { 0: 0, 1: 20, 2: 100 };

export default async function BonusProgramPage() {
  const session = await auth();
  const [prizes, userAccount] = await Promise.all([
    prisma.prize.findMany({
      where: { isActive: true },
      orderBy: [{ tier: "asc" }, { position: "asc" }],
    }),
    session?.user.id
      ? prisma.pocketOptionAccount.findUnique({ where: { userId: session.user.id } })
      : Promise.resolve(null),
  ]);

  const userDeposit = userAccount?.totalDeposit ? Number(userAccount.totalDeposit) : 0;
  const userTier = userDeposit >= 100 ? 2 : userDeposit >= 20 ? 1 : 0;

  // Group prizes by tier
  const grouped = new Map<number, typeof prizes>();
  for (const p of prizes) {
    const t = Math.min(p.tier, 2);
    if (!grouped.has(t)) grouped.set(t, []);
    grouped.get(t)!.push(p);
  }

  return (
    <>
      <SiteHeader />
      <main className="relative">
        {/* Hero */}
        <section className="max-w-5xl mx-auto px-6 pt-16 pb-12 text-center">
          <Link
            href="/"
            className="text-xs uppercase tracking-widest text-[var(--t-3)] hover:text-[var(--brand-gold)] transition-colors"
          >
            ← На главную
          </Link>
          <h1 className="mt-8 text-4xl md:text-6xl font-bold leading-[1.1]">
            Бонусная программа
          </h1>
          <p className="mt-5 text-[var(--t-2)] max-w-2xl mx-auto text-lg leading-relaxed">
            Каждый депозит на PocketOption повышает твой уровень и открывает
            новые привилегии. Без подписок — только результат.
          </p>
        </section>

        {/* User progress (if logged in) */}
        {session?.user && (
          <section className="max-w-4xl mx-auto px-6 pb-10">
            <Card variant="highlight" padding="lg">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex-1">
                  <div className="text-xs uppercase tracking-widest text-[var(--brand-gold)] mb-2">
                    Твой прогресс
                  </div>
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className="text-sm font-semibold px-2.5 py-1 rounded-lg"
                      style={{
                        background: TIERS[userTier].bg,
                        color: TIERS[userTier].color,
                      }}
                    >
                      {TIERS[userTier].name}
                    </span>
                  </div>
                  <div
                    className="text-2xl font-bold"
                    style={{ fontFamily: "var(--font-jetbrains)" }}
                  >
                    ${userDeposit.toLocaleString()}
                    <span className="text-sm font-normal text-[var(--t-3)] ml-2">депозит</span>
                  </div>
                </div>
                {userTier < 2 && (
                  <div className="md:w-64 w-full">
                    <div className="text-xs text-[var(--t-3)] mb-2">
                      До{" "}
                      <span style={{ color: TIERS[userTier + 1].color, fontWeight: 600 }}>
                        {TIERS[userTier + 1].name}
                      </span>
                      {" — "}
                      <span className="text-[var(--brand-gold)] font-semibold" style={{ fontFamily: "var(--font-jetbrains)" }}>
                        ${Math.max(0, THRESHOLDS[userTier + 1] - userDeposit)}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-[var(--bg-2)] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[var(--brand-gold)]"
                        style={{
                          width: `${Math.min(100, (userDeposit / THRESHOLDS[userTier + 1]) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
                {userTier >= 2 && (
                  <div className="flex items-center gap-2 text-sm text-[var(--green)]">
                    <CheckCircle2 size={16} />
                    Максимальный уровень
                  </div>
                )}
              </div>
            </Card>
          </section>
        )}

        {/* Tier comparison */}
        <section className="max-w-6xl mx-auto px-6 pb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold">Уровни доступа</h2>
            <p className="mt-3 text-[var(--t-2)]">
              Три уровня — от бесплатного до безлимитного
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {TIERS.map((t) => {
              const isUnlocked = session?.user ? userTier >= t.tier : false;
              const tierPrizes = grouped.get(t.tier) ?? [];
              const TierIcon = t.icon;

              return (
                <div
                  key={t.tier}
                  className="rounded-2xl border overflow-hidden flex flex-col"
                  style={{
                    borderColor: t.tier === 2 ? `${t.color}50` : "var(--b-soft)",
                    background: "var(--bg-1)",
                  }}
                >
                  {/* Tier header */}
                  <div
                    className="px-6 py-6 text-center"
                    style={{ background: t.bg }}
                  >
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
                      style={{
                        background: `${t.color}20`,
                        color: t.color,
                      }}
                    >
                      <TierIcon size={24} />
                    </div>
                    <h3 className="text-xl font-bold" style={{ color: t.color }}>
                      {t.name}
                    </h3>
                    <div className="text-sm text-[var(--t-2)] mt-1">{t.deposit}</div>
                  </div>

                  {/* Perks */}
                  <div className="px-6 py-5 flex-1 space-y-2.5">
                    {t.perks.map((perk) => (
                      <div key={perk} className="flex items-start gap-2.5">
                        <CheckCircle2 size={14} className="mt-0.5 shrink-0" style={{ color: t.color }} />
                        <span className="text-sm text-[var(--t-2)]">{perk}</span>
                      </div>
                    ))}

                    {/* Prizes from DB */}
                    {tierPrizes.map((p) => (
                      <div key={p.id} className="flex items-start gap-2.5">
                        <Gift size={14} className="mt-0.5 shrink-0 text-[var(--brand-gold)]" />
                        <div>
                          <span className="text-sm text-[var(--t-1)]">{p.title}</span>
                          <span
                            className="text-xs ml-1.5 font-semibold"
                            style={{ color: "var(--brand-gold)", fontFamily: "var(--font-jetbrains)" }}
                          >
                            {p.valueLabel}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Status / CTA */}
                  <div className="px-6 py-4 border-t border-[var(--b-soft)]">
                    {session?.user ? (
                      isUnlocked ? (
                        <div className="flex items-center justify-center gap-2 text-sm text-[var(--green)]">
                          <CheckCircle2 size={14} />
                          Доступно
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2 text-sm text-[var(--t-3)]">
                          <Lock size={14} />
                          {t.deposit} для доступа
                        </div>
                      )
                    ) : (
                      <Link
                        href="/register"
                        className="flex items-center justify-center gap-2 text-sm font-semibold transition-colors"
                        style={{ color: t.color }}
                      >
                        Начать
                        <ArrowRight size={14} />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* How it works */}
        <section className="max-w-4xl mx-auto px-6 py-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold">Как это работает</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                num: "1",
                title: "Регистрация",
                desc: "Создай аккаунт на PocketOption по нашей реферальной ссылке и привяжи ID.",
              },
              {
                num: "2",
                title: "Депозит",
                desc: "Уровень повышается автоматически при пополнении. От $20 — Basic, от $100 — Pro.",
              },
              {
                num: "3",
                title: "Бонусы",
                desc: "Получай больше сигналов, аналитику и бонусные награды на каждом уровне.",
              },
            ].map((s) => (
              <Card key={s.num} padding="lg" hover>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 text-lg font-bold"
                  style={{
                    background: "rgba(212,160,23,0.12)",
                    color: "var(--brand-gold)",
                  }}
                >
                  {s.num}
                </div>
                <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-[var(--t-2)] leading-relaxed">{s.desc}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto px-6 py-16">
          <Card variant="highlight" padding="lg">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold">Готов начать?</h2>
              <p className="mt-4 text-[var(--t-2)] max-w-lg mx-auto">
                Присоединяйся к платформе и начни получать торговые сигналы бесплатно.
                Повышай уровень для доступа к премиум-аналитике.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <ButtonLink href={BOT_URL} external size="lg" iconRight={<ArrowRight size={18} />}>
                  Открыть бота
                </ButtonLink>
                <ButtonLink href="/dashboard" variant="secondary" size="lg">
                  Личный кабинет
                </ButtonLink>
              </div>
            </div>
          </Card>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
