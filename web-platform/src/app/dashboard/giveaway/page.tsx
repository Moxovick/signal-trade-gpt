/**
 * Dashboard — Розыгрыш призов (v5).
 *
 * Reads prize titles from SiteSettings (admin-editable).
 */
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Gift, Trophy, Medal, Award, Laptop, Smartphone, Headphones } from "lucide-react";
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

/** Pick a device icon based on prize title keywords. */
function getDeviceIcon(title: string): LucideIcon | null {
  const t = title.toLowerCase();
  if (t.includes("macbook") || t.includes("ноутбук") || t.includes("laptop")) return Laptop;
  if (t.includes("iphone") || t.includes("телефон") || t.includes("смартфон") || t.includes("phone")) return Smartphone;
  if (t.includes("airpods") || t.includes("наушники") || t.includes("headphone")) return Headphones;
  return null;
}

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
              {/* Device illustration */}
              {(() => {
                const DeviceIcon = getDeviceIcon(prize.title);
                return DeviceIcon ? (
                  <div
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "20px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: `${style.accentColor}10`,
                      border: `1.5px solid ${style.borderColor}`,
                    }}
                  >
                    <DeviceIcon size={38} style={{ color: style.accentColor }} />
                  </div>
                ) : null;
              })()}

              {/* Place badge */}
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <IconComponent size={18} style={{ color: style.accentColor }} />
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: style.accentColor,
                  }}
                >
                  {prize.place}-е место
                </span>
              </div>

              {/* Prize title */}
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
