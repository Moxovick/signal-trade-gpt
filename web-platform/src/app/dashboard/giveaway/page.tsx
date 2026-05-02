/**
 * Dashboard — Giveaway page.
 *
 * Shows user's current eligibility for prizes (admin-controlled in /admin/giveaway):
 *   - Current locked-in prize (highest tier whose minDeposit ≤ user.totalDeposit)
 *   - Next prize and dollar gap
 *   - Full prize list with locked/unlocked state
 */
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { TierBadge } from "@/components/ui/TierBadge";
import { Gift, Lock, CheckCircle2, ArrowRight } from "lucide-react";

export default async function DashboardGiveawayPage() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const userId = session.user.id;

  const [account, prizes] = await Promise.all([
    prisma.pocketOptionAccount.findUnique({ where: { userId } }),
    prisma.prize.findMany({
      where: { isActive: true },
      orderBy: { position: "asc" },
    }),
  ]);

  const totalDeposit = account?.totalDeposit ? Number(account.totalDeposit) : 0;

  // Highest unlocked prize, plus next-target prize
  const sorted = [...prizes].sort(
    (a, b) => Number(a.minDeposit) - Number(b.minDeposit),
  );
  const unlocked = sorted.filter((p) => totalDeposit >= Number(p.minDeposit));
  const current = unlocked[unlocked.length - 1] ?? null;
  const next = sorted.find((p) => Number(p.minDeposit) > totalDeposit) ?? null;

  const gap = next ? Number(next.minDeposit) - totalDeposit : 0;
  const baseDeposit = current ? Number(current.minDeposit) : 0;
  const span = next ? Number(next.minDeposit) - baseDeposit : 1;
  const progressPct = next
    ? Math.max(0, Math.min(100, ((totalDeposit - baseDeposit) / span) * 100))
    : 100;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-[var(--brand-gold)] mb-1 inline-flex items-center gap-1.5">
          <Gift size={12} /> Розыгрыш месяца
        </p>
        <h1 className="text-3xl md:text-4xl font-bold">Твои призы</h1>
        <p className="text-[var(--t-2)] mt-2">
          Чем больше депозит — тем круче приз. Призы и пороги настраивает админ
          в <code className="text-[var(--brand-gold)]">/admin/giveaway</code>.
        </p>
      </div>

      {/* Hero — current + next */}
      <Card variant="highlight" padding="lg">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="text-xs uppercase tracking-widest text-[var(--t-3)] mb-2">
              Текущий приз
            </div>
            {current ? (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <TierBadge tier={current.tier} size="md" />
                  <div className="text-sm text-[var(--green)] inline-flex items-center gap-1">
                    <CheckCircle2 size={14} /> Доступен тебе
                  </div>
                </div>
                <div
                  className="text-3xl font-bold text-[var(--brand-gold)]"
                  style={{ fontFamily: "var(--font-jetbrains)" }}
                >
                  {current.valueLabel}
                </div>
                <div className="mt-2 text-base font-semibold">{current.title}</div>
                <p className="mt-2 text-sm text-[var(--t-2)] leading-relaxed">
                  {current.description}
                </p>
              </>
            ) : (
              <>
                <div className="text-sm text-[var(--t-3)] inline-flex items-center gap-1 mb-3">
                  <Lock size={14} /> Пока ничего
                </div>
                <p className="text-sm text-[var(--t-2)] leading-relaxed">
                  Внеси первый депозит на PocketOption, чтобы открыть стартовый
                  приз.
                </p>
              </>
            )}
          </div>

          <div className="md:border-l md:border-[var(--b-soft)] md:pl-6">
            <div className="text-xs uppercase tracking-widest text-[var(--t-3)] mb-2">
              Следующий уровень
            </div>
            {next ? (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <TierBadge tier={next.tier} size="md" />
                  <div className="text-sm text-[var(--brand-gold)] inline-flex items-center gap-1">
                    +${gap.toLocaleString()} до открытия
                  </div>
                </div>
                <div
                  className="text-3xl font-bold"
                  style={{ fontFamily: "var(--font-jetbrains)" }}
                >
                  {next.valueLabel}
                </div>
                <div className="mt-2 text-base font-semibold">{next.title}</div>
                <p className="mt-2 text-sm text-[var(--t-2)] leading-relaxed">
                  {next.description}
                </p>
                <div className="mt-4 h-2 rounded-full overflow-hidden bg-[var(--bg-2)] border border-[var(--b-soft)]">
                  <div
                    className="h-full transition-all duration-700"
                    style={{
                      width: `${progressPct}%`,
                      background:
                        "linear-gradient(90deg, var(--brand-gold-deep), var(--brand-gold), var(--brand-gold-bright))",
                      boxShadow: "0 0 12px rgba(212, 160, 23, 0.45)",
                    }}
                  />
                </div>
                <div className="mt-2 text-xs text-[var(--t-3)] flex justify-between">
                  <span>${baseDeposit.toLocaleString()}</span>
                  <span>${Number(next.minDeposit).toLocaleString()}</span>
                </div>
              </>
            ) : (
              <>
                <div className="text-sm text-[var(--green)] inline-flex items-center gap-1 mb-3">
                  <CheckCircle2 size={14} /> Максимальный уровень
                </div>
                <p className="text-sm text-[var(--t-2)] leading-relaxed">
                  Ты открыл самый большой приз — больше нечего разблокировать.
                </p>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Full prize list */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Все призы</h2>
        {prizes.length === 0 ? (
          <Card padding="lg">
            <p className="text-[var(--t-2)] text-center">
              Призы пока не настроены — админ добавит их в{" "}
              <Link
                href="/admin/giveaway"
                className="text-[var(--brand-gold)] hover:underline"
              >
                /admin/giveaway
              </Link>
              .
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {prizes.map((p) => {
              const isUnlocked = totalDeposit >= Number(p.minDeposit);
              return (
                <Card
                  key={p.id}
                  padding="md"
                  className={`flex flex-col transition-opacity ${
                    isUnlocked ? "" : "opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <TierBadge tier={p.tier} size="sm" />
                    {isUnlocked ? (
                      <CheckCircle2 size={14} className="text-[var(--green)]" />
                    ) : (
                      <Lock size={14} className="text-[var(--t-3)]" />
                    )}
                  </div>
                  <div
                    className="text-xl font-bold leading-tight"
                    style={{ fontFamily: "var(--font-jetbrains)" }}
                  >
                    {p.valueLabel}
                  </div>
                  <h3 className="mt-2 text-sm font-semibold">{p.title}</h3>
                  <p className="mt-1 text-xs text-[var(--t-3)] flex-1 leading-relaxed">
                    {p.description}
                  </p>
                  <div className="mt-3 text-xs uppercase tracking-wider text-[var(--t-3)]">
                    От ${Number(p.minDeposit).toLocaleString()}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <div className="text-center pt-2">
        <Link
          href="/giveaway"
          className="inline-flex items-center gap-1 text-sm text-[var(--brand-gold)] hover:text-[var(--t-1)] transition-colors"
        >
          Подробнее о розыгрыше <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
