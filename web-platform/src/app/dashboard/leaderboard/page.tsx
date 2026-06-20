/**
 * Dashboard — Leaderboard page (v4).
 *
 * Shows TOP 10 from SiteSettings (fake data), all PRO tier.
 */
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TierBadge } from "@/components/ui/TierBadge";
import { Trophy, Crown, Medal, Award } from "lucide-react";
import { redirect } from "next/navigation";

type LeaderboardEntry = {
  nickname: string;
  earnings: number;
  signals: number;
};

const RUSSIAN_NICKNAMES = [
  "d1mkas",
  "kapital_andrey",
  "alex_t92",
  "olgaprofit",
  "nik_winner",
  "ann_signals",
  "elena_top1",
  "sergmaster",
  "vika_fx",
  "maxpro_trade",
];

function generateDefaults(): LeaderboardEntry[] {
  return RUSSIAN_NICKNAMES.map((nickname) => ({
    nickname,
    earnings: Math.floor(Math.random() * 49500) + 500,
    signals: Math.floor(Math.random() * 481) + 20,
  })).sort((a, b) => b.earnings - a.earnings);
}

function medalIcon(rank: number) {
  if (rank === 1) return <Crown size={14} style={{ color: "var(--brand-gold)" }} />;
  if (rank === 2) return <Medal size={14} style={{ color: "#c0c0c0" }} />;
  if (rank === 3) return <Award size={14} style={{ color: "#cd7f32" }} />;
  return null;
}

export default async function LeaderboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const setting = await prisma.siteSettings.findUnique({
    where: { key: "leaderboard_top10" },
  });

  const entries: LeaderboardEntry[] = setting
    ? (setting.value as LeaderboardEntry[])
    : generateDefaults();

  const top10 = entries.slice(0, 10);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
          <Trophy size={20} style={{ color: "var(--brand-gold)" }} />
          <h1 style={{ fontSize: "22px", fontWeight: 700, margin: 0 }}>Рейтинг трейдеров</h1>
        </div>
        <p style={{ fontSize: "13px", color: "var(--t-2)", margin: "4px 0 0 0" }}>
          Топ-10 лучших трейдеров платформы. Обновляется регулярно.
        </p>
      </div>

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
            gridTemplateColumns: "48px 1fr 120px 120px 100px",
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
          <span style={{ textAlign: "right" }}>Заработали ($)</span>
          <span style={{ textAlign: "right" }}>Сигналы</span>
        </div>

        {top10.length === 0 ? (
          <div style={{ padding: "40px 16px", textAlign: "center", color: "var(--t-2)", fontSize: "14px" }}>
            Пока нет трейдеров в рейтинге.
          </div>
        ) : (
          top10.map((entry, i) => {
            const rank = i + 1;
            return (
              <div
                key={`${entry.nickname}-${rank}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "48px 1fr 120px 120px 100px",
                  alignItems: "center",
                  padding: "10px 16px",
                  borderBottom: "1px solid var(--b-soft)",
                  transition: "background 0.15s",
                }}
              >
                {/* Rank */}
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "24px" }}>
                  {medalIcon(rank) ?? (
                    <span style={{ fontSize: "12px", color: "var(--t-3)", fontFamily: "var(--font-jetbrains)" }}>
                      {rank}
                    </span>
                  )}
                </span>

                {/* Nickname */}
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "var(--t-1)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {entry.nickname}
                </span>

                {/* Tier — all PRO */}
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <TierBadge tier={2} size="sm" />
                </span>

                {/* Earnings */}
                <span
                  style={{
                    textAlign: "right",
                    fontSize: "13px",
                    fontFamily: "var(--font-jetbrains)",
                    color: "var(--brand-gold)",
                  }}
                >
                  ${entry.earnings.toLocaleString()}
                </span>

                {/* Signals */}
                <span
                  style={{
                    textAlign: "right",
                    fontSize: "13px",
                    fontFamily: "var(--font-jetbrains)",
                    color: "var(--t-2)",
                  }}
                >
                  {entry.signals}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
