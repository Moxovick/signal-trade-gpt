/**
 * Dashboard — Розыгрыш призов (v4).
 *
 * Static prize showcase with 3 prize cards.
 */
import { auth } from "@/lib/auth";
import { Gift, Trophy, Medal, Award } from "lucide-react";
import { redirect } from "next/navigation";

const PRIZES = [
  {
    place: 1,
    title: "MacBook Pro",
    icon: Trophy,
    accentColor: "var(--brand-gold)",
    borderColor: "rgba(212,160,23,0.4)",
    bgGradient: "linear-gradient(135deg, rgba(212,160,23,0.08) 0%, transparent 100%)",
  },
  {
    place: 2,
    title: "iPhone 17 Pro Max",
    icon: Medal,
    accentColor: "#c0c0c0",
    borderColor: "rgba(192,192,192,0.4)",
    bgGradient: "linear-gradient(135deg, rgba(192,192,192,0.06) 0%, transparent 100%)",
  },
  {
    place: 3,
    title: "AirPods 3 Pro",
    icon: Award,
    accentColor: "#cd7f32",
    borderColor: "rgba(205,127,50,0.4)",
    bgGradient: "linear-gradient(135deg, rgba(205,127,50,0.06) 0%, transparent 100%)",
  },
] as const;

export default async function DashboardGiveawayPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
          <Gift size={20} style={{ color: "var(--brand-gold)" }} />
          <h1 style={{ fontSize: "22px", fontWeight: 700, margin: 0 }}>Розыгрыш призов</h1>
        </div>
        <p style={{ fontSize: "13px", color: "var(--t-2)", margin: "4px 0 0 0" }}>
          Розыгрыш для всех участников! Чем больше успешных сделок на PocketOption — тем выше шанс выиграть.
        </p>
      </div>

      {/* Prize cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "16px",
        }}
      >
        {PRIZES.map((prize) => {
          const IconComponent = prize.icon;
          return (
            <div
              key={prize.place}
              style={{
                background: prize.bgGradient,
                border: `1px solid ${prize.borderColor}`,
                borderRadius: "12px",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "16px",
                textAlign: "center",
              }}
            >
              {/* Icon */}
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: `${prize.accentColor}15`,
                  border: `1px solid ${prize.borderColor}`,
                }}
              >
                <IconComponent size={28} style={{ color: prize.accentColor }} />
              </div>

              {/* Place */}
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: prize.accentColor,
                }}
              >
                {prize.place}-е место
              </div>

              {/* Prize name */}
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "var(--t-1)",
                }}
              >
                {prize.title}
              </div>
            </div>
          );
        })}
      </div>

      {/* Rules */}
      <div
        style={{
          background: "var(--bg-1)",
          border: "1px solid var(--b-soft)",
          borderRadius: "8px",
          padding: "20px",
        }}
      >
        <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "10px", color: "var(--t-1)" }}>
          Правила участия
        </div>
        <p style={{ fontSize: "13px", color: "var(--t-2)", margin: 0, lineHeight: 1.6 }}>
          Участвуют все пользователи с привязанным PocketOption аккаунтом.
          Победители определяются по количеству успешных сделок за период розыгрыша.
        </p>
      </div>
    </div>
  );
}
