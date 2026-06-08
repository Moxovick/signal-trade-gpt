"use client";

import { TrendingUp, TrendingDown } from "lucide-react";

type Props = {
  pair: string;
  direction: "CALL" | "PUT";
  confidence: number;
  expiration: string;
};

/**
 * Decorative OTC signal card — no real chart data, just a stylized visual.
 */
export function OtcSignalVisual({ pair, direction, confidence, expiration }: Props) {
  const isCall = direction === "CALL";
  const mainColor = isCall ? "var(--green)" : "var(--red)";
  const mainHex = isCall ? "#00e5a0" : "#ff6b3d";
  const bgTint = isCall ? "rgba(0,229,160,0.06)" : "rgba(255,107,61,0.06)";

  // Gauge arc calculations (SVG)
  const gaugeRadius = 38;
  const circumference = 2 * Math.PI * gaugeRadius;
  const gaugeProgress = (confidence / 100) * 0.75; // 270 degrees max
  const dashOffset = circumference * (1 - gaugeProgress);

  // Decorative wave path
  const wavePath = isCall
    ? "M0,40 Q30,25 60,35 T120,28 T180,32 T240,22 T300,30"
    : "M0,25 Q30,38 60,30 T120,38 T180,33 T240,42 T300,35";

  return (
    <div
      className="rounded-2xl overflow-hidden relative"
      style={{ background: bgTint, border: `1px solid color-mix(in srgb, ${mainHex} 20%, transparent)` }}
    >
      {/* Background decorative waves */}
      <svg
        className="absolute inset-0 w-full h-full opacity-10 pointer-events-none"
        viewBox="0 0 300 120"
        preserveAspectRatio="none"
      >
        <path d={wavePath} fill="none" stroke={mainHex} strokeWidth="1.5" />
        <path
          d={isCall
            ? "M0,55 Q40,42 80,50 T160,44 T240,48 T300,38"
            : "M0,42 Q40,52 80,46 T160,54 T240,48 T300,56"}
          fill="none"
          stroke={mainHex}
          strokeWidth="1"
          opacity="0.5"
        />
        <path
          d={isCall
            ? "M0,70 Q50,60 100,65 T200,58 T300,52"
            : "M0,58 Q50,68 100,62 T200,70 T300,66"}
          fill="none"
          stroke={mainHex}
          strokeWidth="0.7"
          opacity="0.3"
        />
      </svg>

      <div className="relative flex items-center gap-4 px-5 py-5">
        {/* Direction arrow */}
        <div className="flex flex-col items-center gap-1 shrink-0">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center"
            style={{
              background: isCall ? "rgba(0,229,160,0.15)" : "rgba(255,107,61,0.15)",
              color: mainColor,
            }}
          >
            {isCall ? <TrendingUp size={30} /> : <TrendingDown size={30} />}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: mainColor }}>
            {direction}
          </span>
        </div>

        {/* Pair name + expiration */}
        <div className="flex-1 min-w-0">
          <div
            className="text-xl font-bold truncate"
            style={{ fontFamily: "var(--font-jetbrains)" }}
          >
            {pair}
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wide"
              style={{ color: "#8888ff", background: "rgba(136,136,255,0.12)" }}
            >
              OTC
            </span>
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-md"
              style={{ background: "rgba(255,255,255,0.06)", color: "var(--t-2)" }}
            >
              {expiration}
            </span>
          </div>
        </div>

        {/* Circular confidence gauge */}
        <div className="shrink-0 relative w-24 h-24 flex items-center justify-center">
          <svg className="w-full h-full -rotate-[135deg]" viewBox="0 0 100 100">
            {/* Background arc */}
            <circle
              cx="50" cy="50" r={gaugeRadius}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="6"
              strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
              strokeLinecap="round"
            />
            {/* Progress arc */}
            <circle
              cx="50" cy="50" r={gaugeRadius}
              fill="none"
              stroke={mainHex}
              strokeWidth="6"
              strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              className="transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="text-2xl font-bold tabular-nums"
              style={{ color: mainColor, fontFamily: "var(--font-jetbrains)" }}
            >
              {confidence}%
            </span>
            <span className="text-[8px] text-[var(--t-3)] uppercase tracking-wider">
              Сила
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
