"use client";

import { useEffect, useState } from "react";
import { ChevronUp, ChevronDown, Sparkles } from "lucide-react";
import { MiniChart, type ChartCandle } from "./MiniChart";
import { useI18n } from "@/lib/i18n/context";

export type LiveSignal = {
  id: string;
  pair: string;
  direction: "CALL" | "PUT";
  expiration: string;
  confidence: number;
  tier: string;
  entryPrice: number | null;
  entryTime: string | null;
  analysis: string | null;
  createdAtIso: string;
  chartData?: {
    candles: ChartCandle[];
    indicators: { rsi: number; ema20: number; ema50: number };
    levels: { support: number; resistance: number };
    entryPrice: number;
  } | null;
};

function parseExpirationSeconds(s: string): number {
  const m = /^(\d+)([sm])$/.exec(s);
  if (!m) return 60;
  const n = Number(m[1]);
  return m[2] === "m" ? n * 60 : n;
}

/**
 * Live signal card — Variant A "Clean" design.
 * Header with pair + direction chip, chart (exchange only),
 * indicator grid, analysis section.
 */
export function LiveSignalHero({ signal }: { signal: LiveSignal | null }) {
  const { t } = useI18n();
  const TIER_LABEL: Record<string, string> = {
    otc: "OTC",
    exchange: t.liveSignalHero.tierExchange,
    elite: "Elite",
  };

  const [now, setNow] = useState<number>(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!signal) {
    return (
      <div
        style={{
          background: "#15110e",
          border: "1px dashed rgba(245,236,217,0.14)",
          borderRadius: 16,
          padding: "56px 30px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 20,
            background: "radial-gradient(circle, rgba(212,160,23,0.14), transparent 70%)",
            border: "1px solid rgba(212,160,23,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto",
          }}
        >
          <Sparkles size={34} color="#d4a017" strokeWidth={1.8} />
        </div>
        <h3 style={{ fontWeight: 800, fontSize: 20, marginTop: 18 }}>
          {t.liveSignalHero.noActiveSignals}
        </h3>
        <p style={{ fontSize: 14, color: "#A99A82", marginTop: 8, maxWidth: 420, marginLeft: "auto", marginRight: "auto", lineHeight: 1.55 }}>
          {t.liveSignalHero.noActiveDesc}
        </p>
      </div>
    );
  }

  const isCall = signal.direction === "CALL";
  const totalSec = parseExpirationSeconds(signal.expiration);
  const elapsed = Math.floor((now - new Date(signal.createdAtIso).getTime()) / 1000);
  const remaining = Math.max(0, totalSec - elapsed);
  const isExpired = remaining <= 0;
  const progressPct = Math.min(100, Math.max(0, (elapsed / totalSec) * 100));
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  const dirColor = isCall ? "#4CC38A" : "#E8623A";
  const dirBg = isCall ? "rgba(76,195,138,0.12)" : "rgba(232,98,58,0.12)";
  const dirBorder = isCall ? "rgba(76,195,138,0.3)" : "rgba(232,98,58,0.3)";

  const tierLabel = TIER_LABEL[signal.tier] ?? signal.tier;
  const isOtc = signal.tier === "otc";
  const cd = signal.chartData;

  // Pair initials for icon
  const cleanPair = signal.pair.replace(/ \(OTC\)/, "");
  const initials = cleanPair.includes("/")
    ? cleanPair.split("/").map(s => s[0]).join("")
    : cleanPair.slice(0, 2).toUpperCase();

  return (
    <div
      style={{
        background: "#15110e",
        border: "1px solid rgba(245,236,217,0.08)",
        borderRadius: 16,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "20px 22px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid rgba(245,236,217,0.06)",
        }}
      >
        <div style={{ display: "flex", gap: 13, alignItems: "center" }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 11,
              background: "#1c1611",
              border: "1px solid rgba(245,236,217,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: 13,
              color: "#d4a017",
              letterSpacing: "0.02em",
            }}
          >
            {initials}
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 20, letterSpacing: "-0.01em" }}>
              {cleanPair}
            </div>
            <div style={{ display: "flex", gap: 9, alignItems: "center", marginTop: 4 }}>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#A99A82",
                  border: "1px solid rgba(245,236,217,0.14)",
                  borderRadius: 5,
                  padding: "2px 8px",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                {tierLabel}
              </span>
              <span style={{ fontSize: 12.5, color: "#6F6353" }}>
                {signal.expiration} · {new Date(signal.createdAtIso).toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          </div>
        </div>

        {/* Direction chip */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            background: dirBg,
            border: `1px solid ${dirBorder}`,
            borderRadius: 9,
            padding: "8px 13px",
          }}
        >
          {!isExpired && (
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: dirColor,
                animation: "blink 1.6s ease-in-out infinite",
              }}
            />
          )}
          <span style={{ fontWeight: 700, fontSize: 14, color: isExpired ? "#6F6353" : dirColor, letterSpacing: "0.02em" }}>
            {isCall ? (t.liveSignalHero.directionUp) : (t.liveSignalHero.directionDown)}
          </span>
          {isCall ? (
            <ChevronUp size={13} color={dirColor} strokeWidth={3} />
          ) : (
            <ChevronDown size={13} color={dirColor} strokeWidth={3} />
          )}
        </div>
      </div>

      {/* Chart section (exchange signals only) */}
      {!isOtc && cd && cd.candles.length > 0 && (
        <div style={{ padding: "18px 22px 6px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
            <span style={{ fontSize: 11, color: "#6F6353", textTransform: "uppercase", letterSpacing: "0.14em" }}>
              {t.liveSignalHero.chart ?? "График"} · M{signal.expiration.replace(/[^0-9]/g, "")}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, color: "#A99A82" }}>{t.liveSignalHero.confidence}</span>
              <span style={{ fontFamily: "var(--font-jetbrains)", fontWeight: 700, fontSize: 15, color: dirColor }}>
                {signal.confidence}%
              </span>
            </span>
          </div>
          <MiniChart
            candles={cd.candles}
            direction={signal.direction}
            support={cd.levels.support}
            resistance={cd.levels.resistance}
          />
        </div>
      )}

      {/* Indicator grid */}
      {!isOtc && cd && (
        <div
          style={{
            margin: "8px 22px 0",
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 1,
            background: "rgba(245,236,217,0.06)",
            border: "1px solid rgba(245,236,217,0.06)",
            borderRadius: 11,
            overflow: "hidden",
          }}
        >
          <div style={{ background: "#15110e", padding: "13px 15px" }}>
            <div style={{ fontSize: 10.5, color: "#6F6353", textTransform: "uppercase", letterSpacing: "0.1em" }}>RSI 14</div>
            <div style={{ fontFamily: "var(--font-jetbrains)", fontWeight: 500, fontSize: 16, marginTop: 3 }}>{cd.indicators.rsi}</div>
          </div>
          <div style={{ background: "#15110e", padding: "13px 15px" }}>
            <div style={{ fontSize: 10.5, color: "#6F6353", textTransform: "uppercase", letterSpacing: "0.1em" }}>EMA 20</div>
            <div style={{ fontFamily: "var(--font-jetbrains)", fontWeight: 500, fontSize: 16, marginTop: 3 }}>{cd.indicators.ema20.toFixed(4)}</div>
          </div>
          <div style={{ background: "#15110e", padding: "13px 15px" }}>
            <div style={{ fontSize: 10.5, color: "#6F6353", textTransform: "uppercase", letterSpacing: "0.1em" }}>EMA 50</div>
            <div style={{ fontFamily: "var(--font-jetbrains)", fontWeight: 500, fontSize: 16, marginTop: 3 }}>{cd.indicators.ema50.toFixed(4)}</div>
          </div>
          <div style={{ background: "#15110e", padding: "13px 15px" }}>
            <div style={{ fontSize: 10.5, color: "#6F6353", textTransform: "uppercase", letterSpacing: "0.1em" }}>{t.signalHistory?.support ?? "Поддержка"}</div>
            <div style={{ fontFamily: "var(--font-jetbrains)", fontWeight: 500, fontSize: 16, color: "#5B8DEF", marginTop: 3 }}>{cd.levels.support.toFixed(4)}</div>
          </div>
          <div style={{ background: "#15110e", padding: "13px 15px" }}>
            <div style={{ fontSize: 10.5, color: "#6F6353", textTransform: "uppercase", letterSpacing: "0.1em" }}>{t.signalHistory?.resistance ?? "Сопротивление"}</div>
            <div style={{ fontFamily: "var(--font-jetbrains)", fontWeight: 500, fontSize: 16, color: "#E8623A", marginTop: 3 }}>{cd.levels.resistance.toFixed(4)}</div>
          </div>
          <div style={{ background: "#1a1510", padding: "13px 15px" }}>
            <div style={{ fontSize: 10.5, color: "#d4a017", textTransform: "uppercase", letterSpacing: "0.1em" }}>{t.signalHistory?.entry ?? "Точка входа"}</div>
            <div style={{ fontFamily: "var(--font-jetbrains)", fontWeight: 700, fontSize: 16, color: "#d4a017", marginTop: 3 }}>{cd.entryPrice.toFixed(4)}</div>
          </div>
        </div>
      )}

      {/* OTC: confidence + entry price (no chart) */}
      {isOtc && (
        <div style={{ padding: "16px 22px 0" }}>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "#A99A82" }}>{t.liveSignalHero.confidence}</span>
            <span style={{ fontFamily: "var(--font-jetbrains)", fontWeight: 700, fontSize: 15, color: dirColor }}>
              {signal.confidence}%
            </span>
            {signal.entryPrice != null && (
              <>
                <span style={{ fontSize: 11, color: "#A99A82" }}>{t.liveSignalHero.entryPrice}</span>
                <span style={{ fontFamily: "var(--font-jetbrains)", fontWeight: 600, fontSize: 15 }}>
                  {Number(signal.entryPrice).toFixed(5)}
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Timer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          background: "#100d0b",
          border: "1px solid rgba(245,236,217,0.06)",
          borderRadius: 11,
          padding: "12px 16px",
          margin: "14px 22px 0",
        }}
      >
        <span style={{ fontSize: 11, color: "#6F6353", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          {isExpired ? t.liveSignalHero.expired : (t.liveSignalHero.expiresIn ?? "До входа")}
        </span>
        <span
          style={{
            fontFamily: "var(--font-jetbrains)",
            fontWeight: 700,
            fontSize: 20,
            color: isExpired ? "#6F6353" : "var(--t-1)",
          }}
        >
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </span>
        <div style={{ flex: 1, height: 5, borderRadius: 3, background: "#1c1611", overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              width: `${progressPct}%`,
              background: isExpired ? "#6F6353" : dirColor,
              transition: "width 1s linear",
            }}
          />
        </div>
      </div>

      {/* Analysis */}
      {signal.analysis && (
        <div style={{ padding: "22px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#d4a017", textTransform: "uppercase", letterSpacing: "0.16em" }}>
            {t.signalHistory?.signalBreakdown ?? "Разбор"}
          </div>
          <p style={{ fontSize: 14, color: "#A99A82", lineHeight: 1.7, margin: "12px 0 0" }}>
            {signal.analysis}
          </p>
        </div>
      )}

      {/* Progress bar at bottom */}
      <div style={{ height: 3, background: "rgba(245,236,217,0.06)" }}>
        <div
          style={{
            height: "100%",
            width: `${progressPct}%`,
            background: isExpired ? "#6F6353" : dirColor,
            transition: "width 1s linear",
          }}
        />
      </div>
    </div>
  );
}
