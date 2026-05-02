import Link from "next/link";
import { ArrowRight, Trophy, Gift, Sparkles, ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { SiteHeader, SiteFooter } from "@/components/shared/SiteHeader";
import { Card } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { TierBadge } from "@/components/ui/TierBadge";

const BOT_URL =
  process.env["NEXT_PUBLIC_BOT_URL"] ?? "https://t.me/traitsignaltsest_bot";

export const dynamic = "force-dynamic";

const TIER_NAME: Record<number, string> = {
  1: "Starter",
  2: "Active",
  3: "Pro",
  4: "VIP",
};

export default async function GiveawayPage() {
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

  const grouped = new Map<number, typeof prizes>();
  for (const p of prizes) {
    if (!grouped.has(p.tier)) grouped.set(p.tier, []);
    grouped.get(p.tier)!.push(p);
  }
  const tiers = [...grouped.keys()].sort((a, b) => a - b);

  // Find current tier user qualifies for
  const eligibleTiers = tiers.filter((t) =>
    grouped.get(t)!.some((p) => userDeposit >= Number(p.minDeposit)),
  );
  const currentTier = eligibleTiers[eligibleTiers.length - 1] ?? 0;
  const nextTier = tiers.find((t) => t > currentTier);
  const nextThreshold = nextTier
    ? Math.min(...grouped.get(nextTier)!.map((p) => Number(p.minDeposit)))
    : null;
  const progressPct = nextThreshold
    ? Math.min(100, Math.round((userDeposit / nextThreshold) * 100))
    : 100;

  return (
    <>
      <SiteHeader />
      <main className="relative">
        {/* Hero */}
        <section className="max-w-5xl mx-auto px-6 pt-16 pb-10 text-center">
          <Link
            href="/"
            className="text-xs uppercase tracking-widest text-[var(--t-3)] hover:text-[var(--brand-gold)] transition-colors"
          >
            ← На главную
          </Link>
          <div className="inline-flex items-center gap-2 px-3 h-8 mt-8 rounded-full text-xs uppercase tracking-widest border border-[var(--b-soft)] text-[var(--brand-gold)] bg-[var(--bg-1)]">
            <Trophy size={12} /> Розыгрыш месяца
          </div>
          <h1 className="mt-6 text-5xl md:text-7xl font-bold leading-[1.05] text-shimmer">
            Чем больше депозит —
            <br />
            тем выше приз
          </h1>
          <p className="mt-6 text-[var(--t-2)] max-w-2xl mx-auto text-lg">
            Каждый месяц мы разыгрываем призы среди активных трейдеров. Твой тир
            определяет к каким наградам у тебя доступ. От кешбэка $10 до MacBook Pro и
            $2&nbsp;000 на счёт.
          </p>
        </section>

        {/* Personal progress (if logged in) */}
        {session?.user && (
          <section className="max-w-4xl mx-auto px-6 pb-10">
            <Card variant="highlight" padding="lg">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex-1">
                  <div className="text-xs uppercase tracking-widest text-[var(--brand-gold)] mb-2">
                    Твой прогресс
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    {currentTier > 0 ? (
                      <>
                        <TierBadge tier={currentTier} size="sm" />
                        <span className="text-[var(--t-2)] text-sm">
                          ты участвуешь в розыгрыше {TIER_NAME[currentTier]}
                        </span>
                      </>
                    ) : (
                      <span className="text-[var(--t-2)] text-sm">
                        Внеси первый депозит чтобы попасть в розыгрыш
                      </span>
                    )}
                  </div>
                  <div className="text-2xl font-bold" style={{ fontFamily: "var(--font-jetbrains)" }}>
                    ${userDeposit.toLocaleString()}
                    <span className="text-sm font-normal text-[var(--t-3)] ml-2">депозит</span>
                  </div>
                </div>
                {nextThreshold && (
                  <div className="md:w-72 w-full">
                    <div className="flex items-center justify-between text-xs text-[var(--t-3)] mb-2">
                      <span>До следующей лиги</span>
                      <span className="text-[var(--brand-gold)] font-semibold">
                        {progressPct}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-[var(--bg-2)] overflow-hidden">
                      <div
                        className="h-full bg-[var(--brand-gold)] rounded-full transition-all"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <div className="mt-2 text-xs text-[var(--t-3)]">
                      Осталось внести{" "}
                      <span className="text-[var(--t-1)] font-semibold">
                        ${(nextThreshold - userDeposit).toLocaleString()}
                      </span>{" "}
                      → {TIER_NAME[nextTier!]} {grouped.get(nextTier!)![0].title}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </section>
        )}

        {/* Prize tiers */}
        <section className="max-w-6xl mx-auto px-6 pb-16 space-y-12">
          {tiers.map((tier) => {
            const tierPrizes = grouped.get(tier)!;
            const minDeposit = Math.min(...tierPrizes.map((p) => Number(p.minDeposit)));
            const eligible = userDeposit >= minDeposit;
            return (
              <div key={tier}>
                <div className="flex items-center gap-4 mb-6">
                  <TierBadge tier={tier} size="md" />
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold">{TIER_NAME[tier]}</h2>
                    <div className="text-sm text-[var(--t-3)] mt-0.5">
                      от ${minDeposit.toLocaleString()} депозита
                    </div>
                  </div>
                  {session?.user && (
                    <div
                      className={`ml-auto text-xs px-3 py-1 rounded-full font-semibold ${
                        eligible
                          ? "bg-[rgba(142,224,107,0.12)] text-[#8ee06b]"
                          : "bg-[var(--bg-2)] text-[var(--t-3)]"
                      }`}
                    >
                      {eligible ? "Ты участвуешь" : "Заблокировано"}
                    </div>
                  )}
                </div>
                <div className="grid md:grid-cols-2 gap-5">
                  {tierPrizes.map((p) => (
                    <Card
                      key={p.id}
                      variant={tier === 4 ? "highlight" : "default"}
                      padding="lg"
                      hover
                      className="flex flex-col"
                    >
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div
                          className="flex items-center justify-center w-12 h-12 rounded-xl shrink-0"
                          style={{
                            background: "rgba(212, 160, 23, 0.08)",
                            border: "1px solid var(--b-soft)",
                          }}
                        >
                          <Gift size={22} className="text-[var(--brand-gold)]" />
                        </div>
                        <div
                          className="text-2xl font-bold text-[var(--brand-gold)]"
                          style={{ fontFamily: "var(--font-jetbrains)" }}
                        >
                          {p.valueLabel}
                        </div>
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{p.title}</h3>
                      <p className="text-[var(--t-2)] leading-relaxed flex-1">
                        {p.description}
                      </p>
                      <div className="mt-5 pt-4 border-t border-[var(--b-soft)] flex items-center justify-between text-sm">
                        <span className="text-[var(--t-3)]">Минимальный депозит</span>
                        <span
                          className="font-bold text-[var(--t-1)]"
                          style={{ fontFamily: "var(--font-jetbrains)" }}
                        >
                          ${Number(p.minDeposit).toLocaleString()}
                        </span>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}

          {prizes.length === 0 && (
            <div className="text-center py-20 text-[var(--t-3)]">
              Призы скоро появятся.
            </div>
          )}
        </section>

        {/* How it works */}
        <section className="max-w-5xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <div className="text-xs uppercase tracking-widest text-[var(--brand-gold)] mb-3">
              Как это работает
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">3 шага до приза</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                icon: Sparkles,
                title: "Привяжи аккаунт",
                desc: "Зарегистрируйся на PocketOption по нашей ссылке или привяжи существующий ID в боте.",
              },
              {
                icon: Trophy,
                title: "Активно торгуй",
                desc: "Минимум 5 сделок за 30 дней. Винрейт не важен — мы хотим видеть активность.",
              },
              {
                icon: ShieldCheck,
                title: "Жди розыгрыша",
                desc: "Победители определяются 1-го числа каждого месяца. Уведомление приходит в бот.",
              },
            ].map((s) => (
              <Card key={s.title} padding="lg" hover>
                <s.icon size={28} className="text-[var(--brand-gold)] mb-4" />
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
              <h2 className="text-3xl md:text-4xl font-bold">Хочешь поднять свой приз?</h2>
              <p className="mt-4 text-[var(--t-2)]">
                Чем выше депозит — тем выше тир и тем дороже призы в розыгрыше.
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
