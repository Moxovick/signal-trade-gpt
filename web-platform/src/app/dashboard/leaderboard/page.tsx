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
import { Trophy, Medal, Award, Crown } from "lucide-react";
import { LeaderboardFilters } from "./_components/LeaderboardFilters";
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
  if (!session?.user?.id) return null;
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

  const [topUsers, me, myStats] = await Promise.all([
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
  const myRow: Row | null =
    me && myIdx === -1
      ? {
          id: me.id,
          displayName: displayName(me),
          tier: me.tier,
          signalsReceived: me.signalsReceived,
          totalDeposit: Number(me.poAccount?.totalDeposit ?? 0),
          rank: Math.min(50, myStats),
        }
      : null;

  const medalFor = (rank: number) => {
    if (rank === 1) return { icon: Crown, color: "#f5c518", bg: "rgba(245,197,24,0.12)" };
    if (rank === 2) return { icon: Medal, color: "#c0c0c0", bg: "rgba(192,192,192,0.1)" };
    if (rank === 3) return { icon: Award, color: "#cd7f32", bg: "rgba(205,127,50,0.1)" };
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
    </div>
  );
}
