/**
 * Dashboard — Leaderboard page (v3).
 *
 * Clean table-first layout. No podium gimmick.
 */
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TierBadge } from "@/components/ui/TierBadge";
import { TIER_LABELS } from "@/lib/tier";
import { Trophy, Crown, Medal, Award } from "lucide-react";
import { redirect } from "next/navigation";
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

  const medalIcon = (rank: number) => {
    if (rank === 1) return <Crown size={14} style={{ color: "var(--brand-gold)" }} />;
    if (rank === 2) return <Medal size={14} style={{ color: "#c0c0c0" }} />;
    if (rank === 3) return <Award size={14} style={{ color: "#cd7f32" }} />;
    return null;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
          <Trophy size={20} style={{ color: "var(--brand-gold)" }} />
          <h1 style={{ fontSize: "22px", fontWeight: 700, margin: 0 }}>Рейтинг трейдеров</h1>
        </div>
        <p style={{ fontSize: "13px", color: "var(--t-2)", margin: "4px 0 0 0" }}>
          Ранжирование по тиру и количеству полученных сигналов. Обновляется в реальном времени.
        </p>
      </div>

      <LeaderboardFilters />

      {/* Table */}
      <div
        style={{
          background: "var(--bg-1)",
          border: "1px solid var(--b-soft)",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        {/* Table header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "48px 1fr 120px 100px",
            alignItems: "center",
            padding: "10px 16px",
            borderBottom: "1px solid var(--b-soft)",
            background: "var(--bg-0)",
            fontSize: "11px",
            fontWeight: 600,
            textTransform: "uppercase" as const,
            letterSpacing: "0.05em",
            color: "var(--t-3)",
          }}
        >
          <span>#</span>
          <span>Трейдер</span>
          <span>Тир</span>
          <span style={{ textAlign: "right" }}>Сигналы</span>
        </div>

        {rows.length === 0 ? (
          <div style={{ padding: "40px 16px", textAlign: "center", color: "var(--t-2)", fontSize: "14px" }}>
            Пока нет трейдеров в рейтинге.
          </div>
        ) : (
          rows.map((r) => {
            const isMe = r.id === userId;
            return (
              <div
                key={r.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "48px 1fr 120px 100px",
                  alignItems: "center",
                  padding: "10px 16px",
                  borderBottom: "1px solid var(--b-soft)",
                  background: isMe ? "rgba(212,160,23,0.06)" : "transparent",
                  transition: "background 0.15s",
                }}
              >
                {/* Rank */}
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "24px" }}>
                  {medalIcon(r.rank) ?? (
                    <span style={{ fontSize: "12px", color: "var(--t-3)", fontFamily: "var(--font-jetbrains)" }}>
                      {r.rank}
                    </span>
                  )}
                </span>

                {/* Name */}
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: isMe ? 600 : 500,
                    color: isMe ? "var(--brand-gold)" : "var(--t-1)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {r.displayName}
                  {isMe && (
                    <span style={{ fontSize: "11px", color: "var(--t-3)", marginLeft: "6px" }}>(ты)</span>
                  )}
                </span>

                {/* Tier */}
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <TierBadge tier={r.tier} size="sm" />
                  <span style={{ fontSize: "11px", color: "var(--t-3)" }}>{TIER_LABELS[r.tier]}</span>
                </span>

                {/* Signals */}
                <span
                  style={{
                    textAlign: "right",
                    fontSize: "13px",
                    fontFamily: "var(--font-jetbrains)",
                    color: "var(--brand-gold)",
                  }}
                >
                  {r.signalsReceived}
                </span>
              </div>
            );
          })
        )}

        {/* Your row if outside top-10 */}
        {myRow && (
          <>
            <div
              style={{
                borderBottom: "1px dashed var(--b-soft)",
                margin: "0 16px",
              }}
            />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "48px 1fr 120px 100px",
                alignItems: "center",
                padding: "10px 16px",
                background: "rgba(212,160,23,0.06)",
              }}
            >
              <span
                style={{
                  fontSize: "12px",
                  color: "var(--brand-gold)",
                  fontFamily: "var(--font-jetbrains)",
                  textAlign: "center",
                  width: "24px",
                }}
              >
                {myRow.rank}
              </span>
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "var(--brand-gold)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {myRow.displayName}
                <span style={{ fontSize: "11px", color: "var(--t-3)", marginLeft: "6px" }}>(ты)</span>
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <TierBadge tier={myRow.tier} size="sm" />
              </span>
              <span
                style={{
                  textAlign: "right",
                  fontSize: "13px",
                  fontFamily: "var(--font-jetbrains)",
                  color: "var(--brand-gold)",
                }}
              >
                {myRow.signalsReceived}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Stats footer */}
      <div
        style={{
          display: "flex",
          gap: "16px",
          fontSize: "12px",
          color: "var(--t-3)",
        }}
      >
        <span>Всего участников: <strong style={{ color: "var(--t-2)" }}>{myStats}</strong></span>
        {me && (
          <span>Твоя позиция: <strong style={{ color: "var(--brand-gold)" }}>#{inTop10 ? myIdx + 1 : myRow?.rank ?? "—"}</strong></span>
        )}
      </div>
    </div>
  );
}
