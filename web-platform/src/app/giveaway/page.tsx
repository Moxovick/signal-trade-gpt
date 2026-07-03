/**
 * Public — Бонусная программа.
 *
 * Explains the deposit-based reward tiers. Logged-in users see their progress.
 */
import Link from "next/link";
import { ArrowRight, Gift, Zap, TrendingUp, Star, CheckCircle2, Lock, Laptop, Smartphone, Headphones, Watch } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { SiteHeader, SiteFooter } from "@/components/shared/SiteHeader";
import { Card } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { getDictionary, getDictionaryForUser, getLocaleFromCookies, getLocaleForUser } from "@/lib/i18n";

const BOT_URL = process.env["NEXT_PUBLIC_BOT_URL"] ?? "";

export const dynamic = "force-dynamic";

/** Map common prize keywords to Lucide icons for visual appeal. */
function PrizeIcon({ title }: { title: string }) {
  const tl = title.toLowerCase();
  if (tl.includes("macbook") || tl.includes("ноутбук") || tl.includes("laptop")) {
    return (
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3"
        style={{ background: "rgba(212,160,23,0.10)", border: "1px solid rgba(212,160,23,0.15)" }}>
        <Laptop size={28} className="text-[var(--brand-gold)]" />
      </div>
    );
  }
  if (tl.includes("iphone") || tl.includes("телефон") || tl.includes("смартфон") || tl.includes("phone")) {
    return (
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3"
        style={{ background: "rgba(136,136,255,0.10)", border: "1px solid rgba(136,136,255,0.15)" }}>
        <Smartphone size={28} style={{ color: "#8888ff" }} />
      </div>
    );
  }
  if (tl.includes("airpods") || tl.includes("наушники") || tl.includes("headphone")) {
    return (
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3"
        style={{ background: "rgba(76,195,138,0.10)", border: "1px solid rgba(76,195,138,0.15)" }}>
        <Headphones size={28} style={{ color: "#8ee06b" }} />
      </div>
    );
  }
  if (tl.includes("watch") || tl.includes("часы")) {
    return (
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3"
        style={{ background: "rgba(212,160,23,0.10)", border: "1px solid rgba(212,160,23,0.15)" }}>
        <Watch size={28} className="text-[var(--brand-gold)]" />
      </div>
    );
  }
  return null;
}

export default async function BonusProgramPage() {
  const session = await auth();
  const locale = session?.user?.id
    ? await getLocaleForUser(session.user.id)
    : await getLocaleFromCookies();
  const t = await getDictionary(locale);

  const giveaway = t.giveaway as {
    heroTitle: string;
    heroSubtitle: string;
    progressLabel: string;
    depositLabel: string;
    maxLevelReached: string;
    tiersTitle: string;
    tiersSubtitle: string;
    prizesLabel: string;
    tierUnlocked: string;
    tierLocked: string;
    tierStart: string;
    howItWorksTitle: string;
    howItWorksSteps: Array<{ num: string; title: string; desc: string }>;
    ctaTitle: string;
    ctaSubtitle: string;
    ctaOpenBot: string;
    ctaDashboard: string;
    tiers: Array<{
      tier: number;
      name: string;
      deposit: string;
      perks: string[];
    }>;
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

  const TIERS_CONFIG = [
    { color: "#b6a586", bg: "rgba(110,96,76,0.12)", icon: Zap },
    { color: "#8888ff", bg: "rgba(136,136,255,0.10)", icon: TrendingUp },
    { color: "#d4a017", bg: "rgba(212,160,23,0.10)", icon: Star },
  ];

  const THRESHOLDS: Record<number, number> = { 0: 0, 1: 20, 2: 100 };

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
    const tier = Math.min(p.tier, 2);
    if (!grouped.has(tier)) grouped.set(tier, []);
    grouped.get(tier)!.push(p);
  }

  return (
    <>
      <SiteHeader translations={siteTranslations} locale={locale} />
      <main className="relative">
        {/* Hero */}
        <section className="max-w-5xl mx-auto px-6 pt-16 pb-12 text-center">
          <Link
            href="/"
            className="text-xs uppercase tracking-widest text-[var(--t-3)] hover:text-[var(--brand-gold)] transition-colors"
          >
            {(t.common as { backToHome: string }).backToHome}
          </Link>
          <h1 className="mt-8 text-4xl md:text-6xl font-bold leading-[1.1]">
            {giveaway.heroTitle}
          </h1>
          <p className="mt-5 text-[var(--t-2)] max-w-2xl mx-auto text-lg leading-relaxed">
            {giveaway.heroSubtitle}
          </p>
        </section>

        {/* User progress (if logged in) */}
        {session?.user && (
          <section className="max-w-4xl mx-auto px-6 pb-10">
            <Card variant="highlight" padding="lg">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex-1">
                  <div className="text-xs uppercase tracking-widest text-[var(--brand-gold)] mb-2">
                    {giveaway.progressLabel}
                  </div>
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className="text-sm font-semibold px-2.5 py-1 rounded-lg"
                      style={{
                        background: TIERS_CONFIG[userTier].bg,
                        color: TIERS_CONFIG[userTier].color,
                      }}
                    >
                      {giveaway.tiers[userTier]?.name ?? ""}
                    </span>
                  </div>
                  <div
                    className="text-2xl font-bold"
                    style={{ fontFamily: "var(--font-jetbrains)" }}
                  >
                    ${userDeposit.toLocaleString()}
                    <span className="text-sm font-normal text-[var(--t-3)] ml-2">{giveaway.depositLabel}</span>
                  </div>
                </div>
                {userTier < 2 && (
                  <div className="md:w-64 w-full">
                    <div className="text-xs text-[var(--t-3)] mb-2">
                      {giveaway.tierLocked
                        .replace("{deposit}", `$${Math.max(0, THRESHOLDS[userTier + 1] - userDeposit)}`)
                        .replace("{nextTierName}", giveaway.tiers[userTier + 1]?.name ?? "")}
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
                    {giveaway.maxLevelReached}
                  </div>
                )}
              </div>
            </Card>
          </section>
        )}

        {/* Tier comparison */}
        <section className="max-w-6xl mx-auto px-6 pb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold">{giveaway.tiersTitle}</h2>
            <p className="mt-3 text-[var(--t-2)]">
              {giveaway.tiersSubtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {giveaway.tiers.map((tierData) => {
              const config = TIERS_CONFIG[tierData.tier] ?? TIERS_CONFIG[0];
              const isUnlocked = session?.user ? userTier >= tierData.tier : false;
              const tierPrizes = grouped.get(tierData.tier) ?? [];
              const TierIcon = config.icon;

              return (
                <div
                  key={tierData.tier}
                  className="rounded-2xl border overflow-hidden flex flex-col"
                  style={{
                    borderColor: tierData.tier === 2 ? `${config.color}50` : "var(--b-soft)",
                    background: "var(--bg-1)",
                  }}
                >
                  {/* Tier header */}
                  <div
                    className="px-6 py-6 text-center"
                    style={{ background: config.bg }}
                  >
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
                      style={{
                        background: `${config.color}20`,
                        color: config.color,
                      }}
                    >
                      <TierIcon size={24} />
                    </div>
                    <h3 className="text-xl font-bold" style={{ color: config.color }}>
                      {tierData.name}
                    </h3>
                    <div className="text-sm text-[var(--t-2)] mt-1">{tierData.deposit}</div>
                  </div>

                  {/* Perks */}
                  <div className="px-6 py-5 flex-1 space-y-2.5">
                    {tierData.perks.map((perk) => (
                      <div key={perk} className="flex items-start gap-2.5">
                        <CheckCircle2 size={14} className="mt-0.5 shrink-0" style={{ color: config.color }} />
                        <span className="text-sm text-[var(--t-2)]">{perk}</span>
                      </div>
                    ))}

                    {/* Prizes from DB */}
                    {tierPrizes.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-[var(--b-soft)] space-y-3">
                        <div className="text-[10px] uppercase tracking-widest text-[var(--brand-gold)] font-semibold">
                          {giveaway.prizesLabel}
                        </div>
                        {tierPrizes.map((p) => (
                          <div key={p.id} className="text-center">
                            <PrizeIcon title={p.title} />
                            <div className="flex items-center justify-center gap-2">
                              <Gift size={14} className="shrink-0 text-[var(--brand-gold)]" />
                              <span className="text-sm text-[var(--t-1)] font-medium">{p.title}</span>
                            </div>
                            {p.valueLabel && (
                              <span
                                className="text-xs font-semibold block mt-0.5"
                                style={{ color: "var(--brand-gold)", fontFamily: "var(--font-jetbrains)" }}
                              >
                                {p.valueLabel}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Status / CTA */}
                  <div className="px-6 py-4 border-t border-[var(--b-soft)]">
                    {session?.user ? (
                      isUnlocked ? (
                        <div className="flex items-center justify-center gap-2 text-sm text-[var(--green)]">
                          <CheckCircle2 size={14} />
                          {giveaway.tierUnlocked}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2 text-sm text-[var(--t-3)]">
                          <Lock size={14} />
                          {tierData.deposit} {giveaway.tierLocked.split("{deposit}")[1]?.split("{nextTierName}")[0] ?? "для доступа"}
                        </div>
                      )
                    ) : (
                      <Link
                        href="/register"
                        className="flex items-center justify-center gap-2 text-sm font-semibold transition-colors"
                        style={{ color: config.color }}
                      >
                        {giveaway.tierStart}
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
            <h2 className="text-3xl md:text-4xl font-bold">{giveaway.howItWorksTitle}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {giveaway.howItWorksSteps.map((s) => (
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
              <h2 className="text-3xl md:text-4xl font-bold">{giveaway.ctaTitle}</h2>
              <p className="mt-4 text-[var(--t-2)] max-w-lg mx-auto">
                {giveaway.ctaSubtitle}
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <ButtonLink href={BOT_URL} external size="lg" iconRight={<ArrowRight size={18} />}>
                  {giveaway.ctaOpenBot}
                </ButtonLink>
                <ButtonLink href="/dashboard" variant="secondary" size="lg">
                  {giveaway.ctaDashboard}
                </ButtonLink>
              </div>
            </div>
          </Card>
        </section>
      </main>
      <SiteFooter translations={siteTranslations} locale={locale} />
    </>
  );
}
