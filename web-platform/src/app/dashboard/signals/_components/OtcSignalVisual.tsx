"use client";

import { TrendingUp, TrendingDown } from "lucide-react";

type Props = {
  pair: string;
  direction: "CALL" | "PUT";
  confidence: number;
  expiration: string;
};

/**
 * Decorative OTC signal card with SpaceSignal branding.
 */
export function OtcSignalVisual({ pair, direction, confidence, expiration }: Props) {
  const isCall = direction === "CALL";
  const accent = isCall ? "#00e5a0" : "#ff6b3d";
  const accentSoft = isCall ? "rgba(0,229,160,0.10)" : "rgba(255,107,61,0.10)";
  const accentMid = isCall ? "rgba(0,229,160,0.25)" : "rgba(255,107,61,0.25)";

  // Confidence bar segments
  const totalBars = 12;
  const filledBars = Math.round((confidence / 100) * totalBars);

  return (
    <div
      style={{
        borderRadius: 16,
        overflow: "hidden",
        position: "relative",
        background: `linear-gradient(135deg, var(--bg-0) 0%, ${accentSoft} 100%)`,
        border: `1px solid ${accentMid}`,
      }}
    >
      {/* Subtle gradient accent line at top */}
      <div
        style={{
          height: 3,
          background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
        }}
      />

      <div style={{ padding: "20px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        {/* Direction block */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: accentSoft,
              color: accent,
              border: `1px solid ${accentMid}`,
            }}
          >
            {isCall ? <TrendingUp size={28} /> : <TrendingDown size={28} />}
          </div>
          <span
            style={{
              fontSize: 10,
              fontWeight: 800,
              textTransform: "uppercase" as const,
              letterSpacing: "0.1em",
              color: accent,
            }}
          >
            {direction}
          </span>
        </div>

        {/* Center: pair + meta */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: "var(--t-1)",
              fontFamily: "var(--font-jetbrains)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {pair}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: 6,
                background: "rgba(136,136,255,0.12)",
                color: "#8888ff",
                textTransform: "uppercase" as const,
                letterSpacing: "0.08em",
              }}
            >
              OTC
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                padding: "2px 8px",
                borderRadius: 6,
                background: "rgba(255,255,255,0.05)",
                color: "var(--t-2)",
              }}
            >
              {expiration}
            </span>
          </div>

          {/* Confidence bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10 }}>
            <div style={{ display: "flex", gap: 2 }}>
              {Array.from({ length: totalBars }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: 6,
                    height: 14,
                    borderRadius: 2,
                    background: i < filledBars ? accent : "rgba(255,255,255,0.06)",
                    transition: "background 0.3s",
                  }}
                />
              ))}
            </div>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "var(--t-2)",
                fontFamily: "var(--font-jetbrains)",
              }}
            >
              {confidence}%
            </span>
          </div>
        </div>

        {/* Right: large confidence number */}
        <div style={{ flexShrink: 0, textAlign: "center" }}>
          <div
            style={{
              fontSize: 36,
              fontWeight: 800,
              lineHeight: 1,
              color: accent,
              fontFamily: "var(--font-jetbrains)",
              letterSpacing: "-0.02em",
            }}
          >
            {confidence}
          </div>
          <div
            style={{
              fontSize: 8,
              fontWeight: 600,
              textTransform: "uppercase" as const,
              letterSpacing: "0.15em",
              color: "var(--t-3)",
              marginTop: 2,
            }}
          >
            Точность
          </div>
        </div>
      </div>

      {/* Bottom branding bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 24px",
          borderTop: `1px solid ${accentMid}`,
          background: "rgba(0,0,0,0.15)",
        }}
      >
        <span
          style={{
            fontSize: 9,
            fontWeight: 700,
            textTransform: "uppercase" as const,
            letterSpacing: "0.2em",
            color: "var(--brand-gold)",
            opacity: 0.7,
          }}
        >
          SpaceSignal
        </span>
        <span style={{ fontSize: 9, color: "var(--t-3)" }}>
          Объём: 1–3% депозита
        </span>
      </div>
    </div>
  );
}
