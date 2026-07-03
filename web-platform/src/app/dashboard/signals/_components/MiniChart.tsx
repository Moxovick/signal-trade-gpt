"use client";

export type ChartCandle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
};

/**
 * Clean mini candlestick chart — matches Variant A reference.
 * Deep background, hairline border, new palette colors.
 */
export function MiniChart({
  candles,
  direction,
  support,
  resistance,
}: {
  candles: ChartCandle[];
  direction: "CALL" | "PUT";
  support: number;
  resistance: number;
}) {
  const W = 700;
  const H = 150;
  const PAD = 12;

  const prices = candles.flatMap((c) => [c.high, c.low, support, resistance]);
  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);
  const range = maxP - minP || 0.001;

  const yOf = (p: number) => PAD + (1 - (p - minP) / range) * (H - PAD * 2);
  const candleW = Math.max(2, (W - PAD * 2) / candles.length - 1);

  const supportY = yOf(support);
  const resistanceY = yOf(resistance);

  const greenColor = "#4CC38A";
  const redColor = "#E8623A";
  const accentColor = direction === "CALL" ? greenColor : redColor;

  // Entry arrow at last candle
  const lastCandle = candles[candles.length - 1];
  const entryX = PAD + (candles.length - 1) * (candleW + 1) + candleW / 2;
  const entryY = lastCandle ? yOf(lastCandle.close) : H / 2;

  return (
    <div
      style={{
        position: "relative",
        background: "#100d0b",
        border: "1px solid rgba(245,236,217,0.05)",
        borderRadius: 11,
        padding: "12px 14px",
      }}
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        style={{ width: "100%", height: 150, display: "block" }}
      >
        {/* Support / resistance lines */}
        <line
          x1={0} y1={supportY} x2={W} y2={supportY}
          stroke="#5B8DEF" strokeWidth={1} strokeDasharray="3 5" opacity={0.4}
        />
        <line
          x1={0} y1={resistanceY} x2={W} y2={resistanceY}
          stroke="#E8623A" strokeWidth={1} strokeDasharray="3 5" opacity={0.4}
        />

        {/* Candles */}
        {candles.map((c, i) => {
          const x = PAD + i * (candleW + 1);
          const isGreen = c.close >= c.open;
          const color = isGreen ? greenColor : redColor;
          const bodyTop = yOf(Math.max(c.open, c.close));
          const bodyBot = yOf(Math.min(c.open, c.close));
          const bodyH = Math.max(1.5, bodyBot - bodyTop);

          return (
            <g key={i}>
              <line
                x1={x + candleW / 2} y1={yOf(c.high)}
                x2={x + candleW / 2} y2={yOf(c.low)}
                stroke={color} strokeWidth={1.1} opacity={0.85}
              />
              <rect
                x={x} y={bodyTop}
                width={candleW} height={bodyH}
                fill={color} rx={0.5}
              />
            </g>
          );
        })}

        {/* Entry arrow */}
        <polygon
          points={`${entryX},${entryY - 9} ${entryX - 7},${entryY + 5} ${entryX + 7},${entryY + 5}`}
          fill={accentColor}
        />
      </svg>

      {/* R/S labels */}
      <span
        style={{
          position: "absolute",
          right: 14,
          top: 8,
          fontFamily: "var(--font-jetbrains)",
          fontSize: 10,
          color: "#E8623A",
          opacity: 0.7,
        }}
      >
        R {resistance.toFixed(4)}
      </span>
      <span
        style={{
          position: "absolute",
          right: 14,
          bottom: 10,
          fontFamily: "var(--font-jetbrains)",
          fontSize: 10,
          color: "#5B8DEF",
          opacity: 0.7,
        }}
      >
        S {support.toFixed(4)}
      </span>
    </div>
  );
}
