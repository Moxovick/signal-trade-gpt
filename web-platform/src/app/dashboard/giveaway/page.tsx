/**
 * Dashboard — Розыгрыш призов (v5).
 *
 * Reads prize titles from SiteSettings (admin-editable).
 */
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Gift, Trophy, Medal, Award } from "lucide-react";
import { redirect } from "next/navigation";
import type { LucideIcon } from "lucide-react";

type GiveawayPrize = { place: number; title: string };

const DEFAULTS: GiveawayPrize[] = [
  { place: 1, title: "MacBook Pro" },
  { place: 2, title: "iPhone 17 Pro Max" },
  { place: 3, title: "AirPods 3 Pro" },
];

const PLACE_STYLE: Record<number, { icon: LucideIcon; accentColor: string; borderColor: string; bgGradient: string }> = {
  1: { icon: Trophy, accentColor: "var(--brand-gold)", borderColor: "rgba(212,160,23,0.4)", bgGradient: "linear-gradient(135deg, rgba(212,160,23,0.08) 0%, transparent 100%)" },
  2: { icon: Medal, accentColor: "#c0c0c0", borderColor: "rgba(192,192,192,0.4)", bgGradient: "linear-gradient(135deg, rgba(192,192,192,0.06) 0%, transparent 100%)" },
  3: { icon: Award, accentColor: "#cd7f32", borderColor: "rgba(205,127,50,0.4)", bgGradient: "linear-gradient(135deg, rgba(205,127,50,0.06) 0%, transparent 100%)" },
};

export default async function DashboardGiveawayPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const setting = await prisma.siteSettings.findUnique({
    where: { key: "giveaway_prizes" },
  });
  const prizes: GiveawayPrize[] = setting
    ? (setting.value as GiveawayPrize[])
    : DEFAULTS;

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
        {prizes.map((prize) => {
          const style = PLACE_STYLE[prize.place];
          if (!style) return null;
          const IconComponent = style.icon;
          return (
            <div
              key={prize.place}
              style={{
                background: style.bgGradient,
                border: `1px solid ${style.borderColor}`,
                borderRadius: "12px",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "16px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: `${style.accentColor}15`,
                  border: `1px solid ${style.borderColor}`,
                }}
              >
                <IconComponent size={28} style={{ color: style.accentColor }} />
              </div>
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: style.accentColor,
                }}
              >
                {prize.place}-е место
              </div>
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
