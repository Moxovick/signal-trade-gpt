/**
 * Dashboard — Бонусы и награды.
 *
 * Shows deposit milestones: what the user has unlocked and what's next.
 * Prizes are admin-managed in /admin/giveaway.
 */
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import {
  Gift,
  Lock,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Zap,
  Star,
} from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";

const TIER_META: Record<number, { name: string; color: string; bg: string }> = {
  0: { name: "Free", color: "#b6a586", bg: "rgba(110,96,76,0.12)" },
  1: { name: "Basic", color: "#8888ff", bg: "rgba(136,136,255,0.10)" },
  2: { name: "Pro", color: "#d4a017", bg: "rgba(212,160,23,0.10)" },
};

export default async function DashboardBonusesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const [account, prizes] = await Promise.all([
    prisma.pocketOptionAccount.findUnique({ where: { userId } }),
    prisma.prize.findMany({
      where: { isActive: true },
      orderBy: [{ tier: "asc" }, { position: "asc" }],
    }),
  ]);

  const totalDeposit = account?.totalDeposit ? Number(account.totalDeposit) : 0;

  // Group by tier (0, 1, 2)
  const grouped = new Map<number, typeof prizes>();
  for (const p of prizes) {
    const t = Math.min(p.tier, 2); // clamp to 3-tier model
    if (!grouped.has(t)) grouped.set(t, []);
    grouped.get(t)!.push(p);
  }
  const tiers = [0, 1, 2];

  // Current and next tier
  const userTier = totalDeposit >= 100 ? 2 : totalDeposit >= 20 ? 1 : 0;
  const nextTier = userTier < 2 ? userTier + 1 : null;
  const thresholds: Record<number, number> = { 0: 0, 1: 20, 2: 100 };
  const nextThreshold = nextTier !== null ? thresholds[nextTier] : null;
  const gap = nextThreshold !== null ? Math.max(0, nextThreshold - totalDeposit) : 0;
  const progressPct = nextThreshold !== null
    ? Math.min(100, Math.round((totalDeposit / nextThreshold) * 100))
    : 100;

  const TIER_ICONS = [Zap, TrendingUp, Star];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--brand-gold)] mb-1">
          Бонусная программа
        </p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Бонусы и награды
        </h1>
        <p className="text-sm text-[var(--t-2)] mt-2 max-w-lg">
          Депозит на PocketOption открывает доступ к бонусам.
          Чем выше уровень — тем больше привилегий.
        </p>
      </div>

      {/* Progress card */}
      <Card padding="lg">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          {/* Current status */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{
                  background: TIER_META[userTier].bg,
                  border: `1px solid ${TIER_META[userTier].color}30`,
                }}
              >
                <Gift size={22} style={{ color: TIER_META[userTier].color }} />
              </div>
              <div>
                <div className="text-xs text-[var(--t-3)] uppercase tracking-wider">
                  Твой уровень
                </div>
                <div className="text-lg font-bold" style={{ color: TIER_META[userTier].color }}>
                  {TIER_META[userTier].name}
                </div>
              </div>
            </div>
            <div
              className="text-2xl font-bold"
              style={{ fontFamily: "var(--font-jetbrains)" }}
            >
              ${totalDeposit.toLocaleString()}
              <span className="text-sm font-normal text-[var(--t-3)] ml-2">
                общий депозит
              </span>
            </div>
          </div>

          {/* Progress to next tier */}
          {nextTier !== null && nextThreshold !== null ? (
            <div className="md:w-72 w-full">
              <div className="flex items-center justify-between text-xs text-[var(--t-3)] mb-2">
                <span>
                  До уровня{" "}
                  <span style={{ color: TIER_META[nextTier].color, fontWeight: 600 }}>
                    {TIER_META[nextTier].name}
                  </span>
                </span>
                <span
                  className="font-semibold"
                  style={{ fontFamily: "var(--font-jetbrains)", color: "var(--brand-gold)" }}
                >
                  ${gap}
                </span>
              </div>
              <div className="h-2 rounded-full bg-[var(--bg-2)] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${progressPct}%`,
                    background: "linear-gradient(90deg, var(--brand-gold-deep), var(--brand-gold-bright))",
                  }}
                />
              </div>
              <div
                className="mt-1.5 text-[10px] text-[var(--t-3)] flex justify-between"
                style={{ fontFamily: "var(--font-jetbrains)" }}
              >
                <span>${totalDeposit}</span>
                <span>${nextThreshold}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm" style={{ color: "var(--green)" }}>
              <CheckCircle2 size={16} />
              Максимальный уровень
            </div>
          )}
        </div>
      </Card>

      {/* Tier rewards */}
      <div className="space-y-4">
        {tiers.map((t) => {
          const tierPrizes = grouped.get(t) ?? [];
          const meta = TIER_META[t];
          const isUnlocked = userTier >= t;
          const isCurrent = userTier === t;
          const TierIcon = TIER_ICONS[t];

          return (
            <div
              key={t}
              className="rounded-2xl border overflow-hidden transition-opacity"
              style={{
                borderColor: isCurrent ? `${meta.color}40` : "var(--b-soft)",
                background: isCurrent ? meta.bg : "var(--bg-1)",
                opacity: isUnlocked ? 1 : 0.55,
              }}
            >
              {/* Tier header */}
              <div className="flex items-center gap-3 px-5 py-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: meta.bg, color: meta.color }}
                >
                  <TierIcon size={18} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold" style={{ color: meta.color }}>
                      {meta.name}
                    </span>
                    <span className="text-xs text-[var(--t-3)]">
                      {t === 0 ? "Регистрация на PO" : `от $${thresholds[t]} депозита`}
                    </span>
                  </div>
                </div>
                {isUnlocked ? (
                  <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--green)" }}>
                    <CheckCircle2 size={14} />
                    <span className="hidden sm:inline">Открыто</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-[var(--t-3)]">
                    <Lock size={14} />
                    <span className="hidden sm:inline">Заблокировано</span>
                  </div>
                )}
              </div>

              {/* Prizes list */}
              {tierPrizes.length > 0 ? (
                <div className="border-t border-[var(--b-soft)]">
                  {tierPrizes.map((p, idx) => (
                    <div
                      key={p.id}
                      className="flex items-center gap-4 px-5 py-3.5"
                      style={{
                        borderTop: idx > 0 ? "1px solid var(--b-soft)" : "none",
                      }}
                    >
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                        style={{
                          background: isUnlocked ? "rgba(212,160,23,0.08)" : "var(--bg-2)",
                        }}
                      >
                        <Gift
                          size={16}
                          style={{
                            color: isUnlocked ? "var(--brand-gold)" : "var(--t-3)",
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold truncate">{p.title}</span>
                          <span
                            className="text-xs font-bold shrink-0"
                            style={{
                              fontFamily: "var(--font-jetbrains)",
                              color: isUnlocked ? "var(--brand-gold)" : "var(--t-3)",
                            }}
                          >
                            {p.valueLabel}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--t-3)] truncate mt-0.5">
                          {p.description}
                        </p>
                      </div>
                      {isUnlocked ? (
                        <CheckCircle2 size={16} className="text-[var(--green)] shrink-0" />
                      ) : (
                        <Lock size={14} className="text-[var(--t-3)] shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border-t border-[var(--b-soft)] px-5 py-4">
                  <p className="text-xs text-[var(--t-3)]">
                    Бонусы для этого уровня ещё не добавлены.
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* How it works */}
      <Card padding="lg">
        <h3 className="text-sm font-semibold mb-3">Как получить бонусы?</h3>
        <div className="space-y-2.5">
          {[
            "Зарегистрируйся на PocketOption по нашей реферальной ссылке",
            "Внеси депозит — уровень повышается автоматически",
            "Бонусы начисляются сразу после подтверждения депозита",
          ].map((text, i) => (
            <div key={i} className="flex items-start gap-3">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold"
                style={{
                  background: "rgba(212,160,23,0.12)",
                  color: "var(--brand-gold)",
                }}
              >
                {i + 1}
              </div>
              <span className="text-sm text-[var(--t-2)] pt-0.5">{text}</span>
            </div>
          ))}
        </div>
      </Card>

      <div className="text-center">
        <Link
          href="/giveaway"
          className="inline-flex items-center gap-1 text-sm text-[var(--brand-gold)] hover:text-[var(--brand-gold-bright)] transition-colors"
        >
          Подробнее о бонусной программе <ChevronRight size={14} />
        </Link>
      </div>
    </div>
  );
}
