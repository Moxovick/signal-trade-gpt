"use client";

export type ChartCandle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
};

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
  const W = 400;
  const H = 120;
  const PAD = 8;

  const prices = candles.flatMap((c) => [c.high, c.low, support, resistance]);
  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);
  const range = maxP - minP || 0.001;

  const yOf = (p: number) => PAD + (1 - (p - minP) / range) * (H - PAD * 2);
  const candleW = Math.max(2, (W - PAD * 2) / candles.length - 1);

  const supportY = yOf(support);
  const resistanceY = yOf(resistance);

  const accentColor = direction === "CALL" ? "#00e5a0" : "#ff6b3d";

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full rounded-lg overflow-hidden"
      style={{ background: "rgba(0,0,0,0.25)", height: 120 }}
    >
      {/* Support / resistance lines */}
      <line x1={0} y1={supportY} x2={W} y2={supportY} stroke="#8888ff" strokeWidth={0.5} strokeDasharray="4 3" opacity={0.5} />
      <line x1={0} y1={resistanceY} x2={W} y2={resistanceY} stroke="#ff6b3d" strokeWidth={0.5} strokeDasharray="4 3" opacity={0.5} />
      <text x={4} y={supportY - 3} fill="#8888ff" fontSize={7} opacity={0.6}>S {support.toFixed(4)}</text>
      <text x={4} y={resistanceY - 3} fill="#ff6b3d" fontSize={7} opacity={0.6}>R {resistance.toFixed(4)}</text>

      {/* Candles */}
      {candles.map((c, i) => {
        const x = PAD + i * (candleW + 1);
        const isGreen = c.close >= c.open;
        const color = isGreen ? "#00e5a0" : "#ff6b3d";
        const bodyTop = yOf(Math.max(c.open, c.close));
        const bodyBot = yOf(Math.min(c.open, c.close));
        const bodyH = Math.max(1, bodyBot - bodyTop);

        return (
          <g key={i}>
            <line
              x1={x + candleW / 2} y1={yOf(c.high)}
              x2={x + candleW / 2} y2={yOf(c.low)}
              stroke={color} strokeWidth={0.7} opacity={0.6}
            />
            <rect
              x={x} y={bodyTop}
              width={candleW} height={bodyH}
              fill={color} rx={0.5} opacity={0.85}
            />
          </g>
        );
      })}

      {/* Direction arrow */}
      <text
        x={W - PAD - 10} y={direction === "CALL" ? PAD + 12 : H - PAD - 4}
        fill={accentColor} fontSize={16} fontWeight="bold" textAnchor="end"
      >
        {direction === "CALL" ? "\u25B2" : "\u25BC"}
      </text>
    </svg>
  );
}
