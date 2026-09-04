"use client";

import { ArrowUp, ArrowDown } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

type Props = {
  pair: string;
  direction: "CALL" | "PUT";
  confidence: number;
  expiration: string;
  entryTime?: string | null;
};

/**
 * Clean OTC signal card — direction circle + stats grid, NO chart.
 * Matches Signals.dc.html "Результат ОТС" reference.
 */
export function OtcSignalVisual({ pair, direction, confidence, expiration, entryTime }: Props) {
  const { t } = useI18n();
  const isCall = direction === "CALL";
  const dirColor = isCall ? "#4CC38A" : "#E8623A";
  const dirBg = isCall ? "rgba(76,195,138,0.14)" : "rgba(232,98,58,0.14)";
  const dirBorder = isCall ? "rgba(76,195,138,0.28)" : "rgba(232,98,58,0.28)";

  return (
    <div
      style={{
        background: "#15110e",
        border: `1px solid ${isCall ? "rgba(63,209,127,0.3)" : "rgba(232,98,58,0.3)"}`,
        borderRadius: 16,
        overflow: "hidden",
        fontFamily: "var(--font-manrope, Manrope, sans-serif)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 13,
          padding: "16px 20px",
          borderBottom: "1px solid rgba(245,236,217,0.06)",
        }}
      >
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 11,
            background: dirBg,
            border: `1px solid ${dirBorder}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-jetbrains)",
            fontWeight: 700,
            fontSize: 11,
            color: dirColor,
          }}
        >
          {pair.replace(/ \(OTC\)/, "").slice(0, 2).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontWeight: 800, fontSize: 18 }}>
              {pair.replace(/ \(OTC\)/, "")}
            </span>
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                textTransform: "uppercase",
                color: "#A99A82",
                border: "1px solid rgba(245,236,217,0.14)",
                borderRadius: 4,
                padding: "1px 6px",
              }}
            >
              OTC
            </span>
          </div>
          <div style={{ fontSize: 12, color: "#6F6353", marginTop: 2 }}>
            {expiration} · {new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span style={{ fontSize: 11, color: "#A99A82" }}>AI Confidence</span>
          <span
            style={{
              fontFamily: "var(--font-jetbrains)",
              fontWeight: 700,
              fontSize: 15,
              color: dirColor,
            }}
          >
            {confidence}%
          </span>
        </div>
      </div>

      {/* Body: direction circle + stats grid */}
      <div
        style={{
          padding: "22px 20px",
          display: "grid",
          gridTemplateColumns: "200px 1fr",
          gap: 22,
          alignItems: "center",
        }}
      >
        {/* Direction circle */}
        <div
          style={{
            background: `linear-gradient(180deg, ${dirBg}, transparent)`,
            border: `1px solid ${dirBorder}`,
            borderRadius: 14,
            padding: 24,
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 74,
              height: 74,
              borderRadius: "50%",
              background: isCall ? "rgba(76,195,138,0.16)" : "rgba(232,98,58,0.16)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto",
            }}
          >
            {isCall ? (
              <ArrowUp size={40} color={dirColor} strokeWidth={2.6} />
            ) : (
              <ArrowDown size={40} color={dirColor} strokeWidth={2.6} />
            )}
          </div>
          <div
            style={{
              fontWeight: 800,
              fontSize: 30,
              color: dirColor,
              marginTop: 12,
              letterSpacing: "0.02em",
            }}
          >
            {isCall
              ? (t.liveSignalHero?.directionUp ?? "ВВЕРХ")
              : (t.liveSignalHero?.directionDown ?? "ВНИЗ")}
          </div>
          <div style={{ fontSize: 12, color: "#A99A82", marginTop: 2 }}>
            {t.signalRequest?.directionLabel ?? "направление сделки"}
          </div>
        </div>

        {/* Stats grid */}
        <div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 1,
              background: "rgba(245,236,217,0.06)",
              border: "1px solid rgba(245,236,217,0.06)",
              borderRadius: 11,
              overflow: "hidden",
            }}
          >
            <div style={{ background: "#100d0b", padding: "13px 15px" }}>
              <div
                style={{
                  fontSize: 10,
                  color: "#6F6353",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                {t.signalRequest?.expirationLabel ?? "Экспирация"}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-jetbrains)",
                  fontWeight: 700,
                  fontSize: 17,
                  marginTop: 3,
                }}
              >
                {expiration}
              </div>
            </div>
            <div style={{ background: "#1a1510", padding: "13px 15px" }}>
              <div
                style={{
                  fontSize: 10,
                  color: "#d4a017",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                {t.signalRequest?.entryTimeLabel ?? "Время входа"}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-jetbrains)",
                  fontWeight: 700,
                  fontSize: 17,
                  color: "#d4a017",
                  marginTop: 3,
                }}
              >
                {entryTime ?? new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
