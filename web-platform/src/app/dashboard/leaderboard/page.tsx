/**
 * Dashboard — Leaderboard page (rework v2).
 *
 * Pulls top users by signalsReceived + tier as a proxy for activity.
 * Highlights the current user's position with a gold card. If the user is
 * outside top-10, we render a dedicated "Your rank" row underneath.
 */
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { TierBadge } from "@/components/ui/TierBadge";
import { TIER_LABELS } from "@/lib/tier";
import { Trophy, Medal, Award, Crown, Gift, ChevronRight } from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LeaderboardFilters } from "./_components/LeaderboardFilters";

const MEDAL_COLORS = {
  gold: "var(--brand-gold)",
  silver: "#c0c0c0",
  bronze: "#cd7f32",
} as const;
import type { Prisma } from "@/generated/prisma/client";

type Row = {
  id: string;
  displayName: string;
  tier: number;
  signalsReceived: number;
  totalDeposit: number;
  rank: number;
};

function displayName(u: {
  firstName: string | null;
  username: string | null;
  email: string | null;
}): string {
  return u.firstName ?? u.username ?? (u.email ? u.email.split("@")[0] : "Аноним");
}

type PageProps = {
  searchParams: Promise<{ period?: string; tier?: string }>;
};

export default async function LeaderboardPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const sp = await searchParams;
  const period = sp.period ?? "all";
  const tierFilter = Number.parseInt(sp.tier ?? "0", 10);
  const minTier = Number.isFinite(tierFilter) && tierFilter > 0 ? tierFilter : 0;

  const now = new Date();
  const periodFrom =
    period === "week"
      ? new Date(now.getTime() - 7 * 24 * 3600 * 1000)
      : period === "month"
        ? new Date(now.getTime() - 30 * 24 * 3600 * 1000)
        : null;

  const where: Prisma.UserWhereInput = {
    role: { not: "admin" },
    ...(minTier > 0 ? { tier: { gte: minTier } } : {}),
    ...(periodFrom ? { lastLogin: { gte: periodFrom } } : {}),
  };

  const [topUsers, me, myStats, proPrizes] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: [{ tier: "desc" }, { signalsReceived: "desc" }],
      take: 50,
      select: {
        id: true,
        firstName: true,
        username: true,
        email: true,
        tier: true,
        signalsReceived: true,
        poAccount: { select: { totalDeposit: true } },
      },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        username: true,
        email: true,
        tier: true,
        signalsReceived: true,
        poAccount: { select: { totalDeposit: true } },
      },
    }),
    prisma.user.count({ where }),
    prisma.prize.findMany({
      where: { isActive: true, tier: 2 },
      orderBy: { position: "asc" },
      take: 4,
    }),
  ]);

  const rows: Row[] = topUsers.slice(0, 10).map((u, i) => ({
    id: u.id,
    displayName: displayName(u),
    tier: u.tier,
    signalsReceived: u.signalsReceived,
    totalDeposit: Number(u.poAccount?.totalDeposit ?? 0),
    rank: i + 1,
  }));

  // Find user's rank (if outside top-10)
  const myIdx = topUsers.findIndex((u) => u.id === userId);
  const inTop10 = myIdx >= 0 && myIdx < 10;
  const myRow: Row | null =
    me && !inTop10
      ? {
          id: me.id,
          displayName: displayName(me),
          tier: me.tier,
          signalsReceived: me.signalsReceived,
          totalDeposit: Number(me.poAccount?.totalDeposit ?? 0),
          rank: myIdx >= 0 ? myIdx + 1 : myStats + 1,
        }
      : null;

  const medalFor = (rank: number) => {
    if (rank === 1) return { icon: Crown, color: MEDAL_COLORS.gold, bg: "rgba(245,197,24,0.12)" };
    if (rank === 2) return { icon: Medal, color: MEDAL_COLORS.silver, bg: "rgba(192,192,192,0.1)" };
    if (rank === 3) return { icon: Award, color: MEDAL_COLORS.bronze, bg: "rgba(205,127,50,0.1)" };
    return null;
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-[var(--brand-gold)] mb-1">
          Лидерборд
        </p>
        <h1 className="text-3xl md:text-4xl font-bold">Топ-10 трейдеров</h1>
        <p className="text-[var(--t-2)] mt-2">
          Рейтинг формируется по тиру + количеству полученных сигналов.
          Обновляется в реальном времени.
        </p>
      </div>

      <LeaderboardFilters />

      {/* Podium: top-3 */}
      {rows.length >= 3 && (
        <div className="grid grid-cols-3 gap-3">
          {[rows[1], rows[0], rows[2]]
            .filter((r): r is Row => !!r)
            .map((r) => {
              const medal = medalFor(r.rank);
              const isMe = r.id === userId;
              const heightClass =
                r.rank === 1 ? "pt-6" : r.rank === 2 ? "pt-10" : "pt-12";
              return (
                <Card
                  key={r.id}
                  variant={r.rank === 1 ? "highlight" : "default"}
                  padding="md"
                  className={`${heightClass} flex flex-col items-center text-center ${
                    isMe ? "ring-2 ring-[var(--brand-gold)]" : ""
                  }`}
                >
                  {medal && (
                    <medal.icon
                      size={r.rank === 1 ? 36 : 28}
                      style={{ color: medal.color }}
                      className="mb-2"
                    />
                  )}
                  <div className="text-xs text-[var(--t-3)]">#{r.rank}</div>
                  <div className="font-semibold truncate max-w-full">{r.displayName}</div>
                  <div className="mt-2">
                    <TierBadge tier={r.tier} size="sm" />
                  </div>
                  <div
                    className="mt-2 text-sm text-[var(--brand-gold)]"
                    style={{ fontFamily: "var(--font-jetbrains)" }}
                  >
                    {r.signalsReceived} сигн.
                  </div>
                </Card>
              );
            })}
        </div>
      )}

      {/* Full table */}
      <Card padding="lg">
        <div className="flex items-center gap-2 mb-4">
          <Trophy size={18} className="text-[var(--brand-gold)]" />
          <h2 className="text-lg font-semibold">Топ-10</h2>
        </div>
        {rows.length === 0 ? (
          <p className="text-[var(--t-2)] text-center py-8">
            Пока нет трейдеров в рейтинге.
          </p>
        ) : (
          <div className="divide-y divide-[var(--b-soft)]">
            {rows.map((r) => {
              const isMe = r.id === userId;
              const medal = medalFor(r.rank);
              return (
                <div
                  key={r.id}
                  className={`grid grid-cols-12 items-center gap-3 py-3 -mx-2 px-2 rounded-lg transition-colors ${
                    isMe ? "bg-[rgba(212,160,23,0.08)]" : ""
                  }`}
                >
                  <div className="col-span-1 text-center">
                    {medal ? (
                      <medal.icon size={16} style={{ color: medal.color }} className="mx-auto" />
                    ) : (
                      <span className="text-xs text-[var(--t-3)] font-mono">#{r.rank}</span>
                    )}
                  </div>
                  <div className="col-span-5 min-w-0">
                    <div
                      className={`font-medium text-sm truncate ${
                        isMe ? "text-[var(--brand-gold)]" : ""
                      }`}
                    >
                      {r.displayName}
                      {isMe && <span className="ml-2 text-xs">(ты)</span>}
                    </div>
                  </div>
                  <div className="col-span-3 text-xs">
                    <TierBadge tier={r.tier} size="sm" />
                    <span className="ml-2 text-[var(--t-3)]">
                      {TIER_LABELS[r.tier]}
                    </span>
                  </div>
                  <div
                    className="col-span-3 text-right text-sm text-[var(--brand-gold)]"
                    style={{ fontFamily: "var(--font-jetbrains)" }}
                  >
                    {r.signalsReceived}
                    <span className="ml-1 text-xs text-[var(--t-3)]">сигн.</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Your row if outside top-10 */}
        {myRow && (
          <>
            <div className="my-4 border-t border-dashed border-[var(--b-soft)]" />
            <div className="grid grid-cols-12 items-center gap-3 py-3 -mx-2 px-2 rounded-lg bg-[rgba(212,160,23,0.08)]">
              <div className="col-span-1 text-center text-xs text-[var(--brand-gold)] font-mono">
                #{myRow.rank}+
              </div>
              <div className="col-span-5 min-w-0">
                <div className="font-medium text-sm text-[var(--brand-gold)] truncate">
                  {myRow.displayName} <span className="ml-1 text-xs">(ты)</span>
                </div>
              </div>
              <div className="col-span-3 text-xs">
                <TierBadge tier={myRow.tier} size="sm" />
              </div>
              <div
                className="col-span-3 text-right text-sm text-[var(--brand-gold)]"
                style={{ fontFamily: "var(--font-jetbrains)" }}
              >
                {myRow.signalsReceived}
                <span className="ml-1 text-xs text-[var(--t-3)]">сигн.</span>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Pro Rewards — linked to giveaway */}
      {proPrizes.length > 0 && (
        <Card padding="lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Gift size={18} className="text-[var(--brand-gold)]" />
              <h2 className="text-lg font-semibold">Награды для Pro</h2>
            </div>
            <Link
              href="/dashboard/giveaway"
              className="flex items-center gap-1 text-xs text-[var(--brand-gold)] hover:text-[var(--brand-gold-bright)] transition-colors"
            >
              Все бонусы <ChevronRight size={12} />
            </Link>
          </div>
          <p className="text-xs text-[var(--t-3)] mb-4">
            Pro-трейдеры из топа рейтинга получают эксклюзивные призы каждый месяц.
            Депозит от $100 открывает участие.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {proPrizes.map((p, i) => {
              const placeLabel = i < 3 ? [`1-е место`, `2-е место`, `3-е место`][i] : null;
              return (
                <div
                  key={p.id}
                  className="flex items-center gap-3 rounded-xl border border-[var(--b-soft)] bg-[var(--bg-0)] px-4 py-3"
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      background: "rgba(212,160,23,0.08)",
                      border: "1px solid rgba(212,160,23,0.15)",
                    }}
                  >
                    <Gift size={16} className="text-[var(--brand-gold)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold truncate">{p.title}</span>
                      <span
                        className="text-xs font-bold shrink-0 text-[var(--brand-gold)]"
                        style={{ fontFamily: "var(--font-jetbrains)" }}
                      >
                        {p.valueLabel}
                      </span>
                    </div>
                    {placeLabel && (
                      <span className="text-[10px] text-[var(--t-3)]">{placeLabel} в рейтинге</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
