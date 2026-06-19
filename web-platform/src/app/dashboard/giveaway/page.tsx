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

/** Return an inline SVG illustration based on prize title keywords. */
function getPrizeImage(title: string): React.ReactElement | null {
  const t = title.toLowerCase();
  if (t.includes("macbook") || t.includes("ноутбук") || t.includes("laptop")) {
    return (
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="12" width="48" height="32" rx="3" fill="#2a2a2a" stroke="#555" strokeWidth="1"/>
        <rect x="11" y="15" width="42" height="26" rx="1" fill="#1a1a2e"/>
        <path d="M32 25L28 30H36L32 25Z" fill="#d4a017" opacity="0.8"/>
        <circle cx="32" cy="29" r="4" fill="none" stroke="#d4a017" strokeWidth="0.8" opacity="0.5"/>
        <path d="M4 44H60L56 48H8L4 44Z" fill="#3a3a3a" stroke="#555" strokeWidth="0.5"/>
        <rect x="24" y="44" width="16" height="1" fill="#555"/>
      </svg>
    );
  }
  if (t.includes("iphone") || t.includes("телефон") || t.includes("смартфон") || t.includes("phone")) {
    return (
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="18" y="4" width="28" height="56" rx="6" fill="#2a2a2a" stroke="#555" strokeWidth="1"/>
        <rect x="20" y="10" width="24" height="42" rx="2" fill="#1a1a2e"/>
        <circle cx="32" cy="7" r="1.5" fill="#444"/>
        <rect x="28" y="7" width="8" height="1" rx="0.5" fill="#444"/>
        <rect x="26" y="54" width="12" height="3" rx="1.5" fill="#444"/>
        <path d="M32 24L28 31H36L32 24Z" fill="#d4a017" opacity="0.8"/>
        <circle cx="32" cy="29" r="5" fill="none" stroke="#d4a017" strokeWidth="0.8" opacity="0.5"/>
      </svg>
    );
  }
  if (t.includes("airpods") || t.includes("наушники") || t.includes("headphone")) {
    return (
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="22" cy="28" rx="8" ry="10" fill="#e8e8e8" stroke="#ccc" strokeWidth="0.5"/>
        <ellipse cx="42" cy="28" rx="8" ry="10" fill="#e8e8e8" stroke="#ccc" strokeWidth="0.5"/>
        <rect x="20" y="36" width="4" height="16" rx="2" fill="#e8e8e8" stroke="#ccc" strokeWidth="0.5"/>
        <rect x="40" y="36" width="4" height="16" rx="2" fill="#e8e8e8" stroke="#ccc" strokeWidth="0.5"/>
        <ellipse cx="22" cy="28" rx="4" ry="5" fill="#ddd"/>
        <ellipse cx="42" cy="28" rx="4" ry="5" fill="#ddd"/>
        <rect x="20" y="14" width="24" height="4" rx="2" fill="#f0f0f0" stroke="#ccc" strokeWidth="0.3"/>
      </svg>
    );
  }
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
                const image = getPrizeImage(prize.title);
                return image ? (
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
                    {image}
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
