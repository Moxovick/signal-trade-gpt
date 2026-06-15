/**
 * Dashboard — Бонусы и награды (v3).
 *
 * Clean table-based layout showing deposit milestones and tier rewards.
 */
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  Gift,
  Lock,
  CheckCircle2,
  Zap,
  TrendingUp,
  Star,
  ArrowRight,
} from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";

const TIER_META: Record<number, { name: string; color: string; req: string }> = {
  0: { name: "Free", color: "#b6a586", req: "Регистрация на PO" },
  1: { name: "Basic", color: "#8888ff", req: "Депозит от $20" },
  2: { name: "Pro", color: "#d4a017", req: "Депозит от $100" },
};

const TIER_ICONS = [Zap, TrendingUp, Star];
const thresholds: Record<number, number> = { 0: 0, 1: 20, 2: 100 };

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
  const userTier = totalDeposit >= 100 ? 2 : totalDeposit >= 20 ? 1 : 0;
  const nextTier = userTier < 2 ? userTier + 1 : null;
  const nextThreshold = nextTier !== null ? thresholds[nextTier] : null;
  const gap = nextThreshold !== null ? Math.max(0, nextThreshold - totalDeposit) : 0;
  const progressPct = nextThreshold !== null
    ? Math.min(100, Math.round((totalDeposit / nextThreshold) * 100))
    : 100;

  // Group prizes by tier
  const grouped = new Map<number, typeof prizes>();
  for (const p of prizes) {
    const t = Math.min(p.tier, 2);
    if (!grouped.has(t)) grouped.set(t, []);
    grouped.get(t)!.push(p);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
          <Gift size={20} style={{ color: "var(--brand-gold)" }} />
          <h1 style={{ fontSize: "22px", fontWeight: 700, margin: 0 }}>Бонусы и награды</h1>
        </div>
        <p style={{ fontSize: "13px", color: "var(--t-2)", margin: "4px 0 0 0" }}>
          Депозит на PocketOption открывает доступ к бонусам. Чем выше уровень — тем больше привилегий.
        </p>
      </div>

      {/* Progress bar */}
      <div
        style={{
          background: "var(--bg-1)",
          border: "1px solid var(--b-soft)",
          borderRadius: "8px",
          padding: "20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
          <div>
            <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--t-3)", marginBottom: "4px" }}>
              Текущий уровень
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "18px", fontWeight: 700, color: TIER_META[userTier].color }}>
                {TIER_META[userTier].name}
              </span>
              <span style={{ fontSize: "14px", fontWeight: 600, fontFamily: "var(--font-jetbrains)", color: "var(--t-2)" }}>
                ${totalDeposit.toLocaleString()}
              </span>
            </div>
          </div>

          {nextTier !== null && nextThreshold !== null ? (
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "11px", color: "var(--t-3)", marginBottom: "2px" }}>
                До <span style={{ color: TIER_META[nextTier].color, fontWeight: 600 }}>{TIER_META[nextTier].name}</span>
              </div>
              <div style={{ fontSize: "16px", fontWeight: 700, fontFamily: "var(--font-jetbrains)", color: "var(--brand-gold)" }}>
                ${gap}
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--green)" }}>
              <CheckCircle2 size={14} />
              Максимальный уровень
            </div>
          )}
        </div>

        {/* Bar */}
        <div style={{ height: "6px", borderRadius: "3px", background: "var(--bg-2)", overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              borderRadius: "3px",
              width: `${progressPct}%`,
              background: "linear-gradient(90deg, var(--brand-gold-deep), var(--brand-gold-bright))",
              transition: "width 0.7s ease",
            }}
          />
        </div>
        {nextThreshold !== null && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "10px",
              fontFamily: "var(--font-jetbrains)",
              color: "var(--t-3)",
              marginTop: "4px",
            }}
          >
            <span>${totalDeposit}</span>
            <span>${nextThreshold}</span>
          </div>
        )}
      </div>

      {/* Tier sections */}
      {[0, 1, 2].map((t) => {
        const tierPrizes = grouped.get(t) ?? [];
        const meta = TIER_META[t];
        const isUnlocked = userTier >= t;
        const TierIcon = TIER_ICONS[t];

        return (
          <div
            key={t}
            style={{
              background: "var(--bg-1)",
              border: `1px solid ${isUnlocked && userTier === t ? meta.color + "40" : "var(--b-soft)"}`,
              borderRadius: "8px",
              overflow: "hidden",
              opacity: isUnlocked ? 1 : 0.5,
            }}
          >
            {/* Tier header row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                borderBottom: tierPrizes.length > 0 ? "1px solid var(--b-soft)" : "none",
                background: isUnlocked && userTier === t ? meta.color + "08" : "transparent",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <TierIcon size={16} style={{ color: meta.color }} />
                <span style={{ fontSize: "14px", fontWeight: 600, color: meta.color }}>{meta.name}</span>
                <span style={{ fontSize: "11px", color: "var(--t-3)" }}>{meta.req}</span>
              </div>
              {isUnlocked ? (
                <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "var(--green)" }}>
                  <CheckCircle2 size={12} />
                  Открыто
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "var(--t-3)" }}>
                  <Lock size={12} />
                  Заблокировано
                </div>
              )}
            </div>

            {/* Prize rows */}
            {tierPrizes.length > 0 ? (
              tierPrizes.map((p, idx) => (
                <div
                  key={p.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "10px 16px",
                    borderTop: idx > 0 ? "1px solid var(--b-soft)" : "none",
                  }}
                >
                  <Gift
                    size={14}
                    style={{ color: isUnlocked ? "var(--brand-gold)" : "var(--t-3)", flexShrink: 0 }}
                  />
                  <span style={{ flex: 1, fontSize: "13px", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {p.title}
                  </span>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      fontFamily: "var(--font-jetbrains)",
                      color: isUnlocked ? "var(--brand-gold)" : "var(--t-3)",
                      flexShrink: 0,
                    }}
                  >
                    {p.valueLabel}
                  </span>
                  {isUnlocked ? (
                    <CheckCircle2 size={13} style={{ color: "var(--green)", flexShrink: 0 }} />
                  ) : (
                    <Lock size={12} style={{ color: "var(--t-3)", flexShrink: 0 }} />
                  )}
                </div>
              ))
            ) : (
              <div style={{ padding: "12px 16px", fontSize: "12px", color: "var(--t-3)" }}>
                Бонусы для этого уровня ещё не добавлены.
              </div>
            )}
          </div>
        );
      })}

      {/* How it works */}
      <div
        style={{
          background: "var(--bg-1)",
          border: "1px solid var(--b-soft)",
          borderRadius: "8px",
          padding: "16px",
        }}
      >
        <div style={{ fontSize: "13px", fontWeight: 600, marginBottom: "10px" }}>Как получить бонусы</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {[
            "Зарегистрируйся на PocketOption по нашей реферальной ссылке",
            "Внеси депозит — уровень повышается автоматически",
            "Бонусы начисляются сразу после подтверждения депозита",
          ].map((text, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
              <span
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "11px",
                  fontWeight: 700,
                  background: "rgba(212,160,23,0.12)",
                  color: "var(--brand-gold)",
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </span>
              <span style={{ fontSize: "13px", color: "var(--t-2)", paddingTop: "1px" }}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Link to leaderboard */}
      <div style={{ textAlign: "center" }}>
        <Link
          href="/dashboard/leaderboard"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "13px",
            color: "var(--brand-gold)",
            textDecoration: "none",
          }}
        >
          Рейтинг трейдеров <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
