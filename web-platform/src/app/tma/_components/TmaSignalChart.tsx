"use client";

/**
 * Mini-chart for a single non-OTC signal in the Mini App.
 *
 * Polls /api/market/candles every 8s and overlays an entry-price line
 * with a directional arrow.
 */
import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  ReferenceLine,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

type Candle = { t: number; o: number; h: number; l: number; c: number };
type ChartSource = "binance" | "twelvedata" | "synthetic";
type Response = { pair: string; source: ChartSource; candles: Candle[] };

type Props = {
  pair: string;
  providerSymbol: string;
  entryPrice: number | null;
  direction: "CALL" | "PUT";
};

export function TmaSignalChart({ pair, providerSymbol, entryPrice, direction }: Props) {
  const [data, setData] = useState<Candle[]>([]);
  const [source, setSource] = useState<ChartSource>("synthetic");
  const symbol = providerSymbol || pair;

  useEffect(() => {
    let alive = true;
    let timer: ReturnType<typeof setTimeout> | null = null;
    async function tick() {
      try {
        const r = await fetch(
          `/api/market/candles?pair=${encodeURIComponent(symbol)}&period=60&count=60`,
          { cache: "no-store" },
        );
        if (!r.ok) return;
        const j = (await r.json()) as Response;
        if (!alive) return;
        setData(j.candles);
        setSource(j.source);
      } finally {
        if (alive) timer = setTimeout(tick, 8000);
      }
    }
    void tick();
    return () => {
      alive = false;
      if (timer) clearTimeout(timer);
    };
  }, [symbol]);

  const last = data.at(-1);
  const first = data[0];
  const change = last && first ? ((last.c - first.o) / first.o) * 100 : 0;
  const isCall = direction === "CALL";

  return (
    <div className="rounded-xl bg-[var(--bg-2)] border border-[var(--b-soft)] p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[10px] uppercase tracking-wider text-[var(--t-3)]">График</div>
        <div className="flex items-center gap-2">
          {last && (
            <span className="text-xs font-mono tabular-nums text-[var(--t-2)]">
              {last.c.toFixed(4)}
            </span>
          )}
          <span
            className={`text-[10px] font-mono ${
              change >= 0 ? "text-[var(--green)]" : "text-[var(--red)]"
            }`}
          >
            {change >= 0 ? "+" : ""}
            {change.toFixed(2)}%
          </span>
          <span
            className="text-[9px] uppercase px-1.5 py-0.5 rounded"
            style={{
              background:
                source === "synthetic" ? "rgba(212,160,23,0.10)" : "rgba(142,224,107,0.10)",
              color: source === "synthetic" ? "var(--brand-gold)" : "var(--green)",
            }}
          >
            {source === "synthetic" ? "demo" : "live"}
          </span>
        </div>
      </div>
      <div className="h-44 -mx-1">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <defs>
              <linearGradient id="tmaGold" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#d4a017" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#d4a017" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="t"
              tickFormatter={(t: number) =>
                new Date(t * 1000).toLocaleTimeString("ru-RU", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              }
              stroke="var(--t-3)"
              fontSize={9}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              dataKey="c"
              domain={["dataMin", "dataMax"]}
              stroke="var(--t-3)"
              fontSize={9}
              tickLine={false}
              axisLine={false}
              width={50}
              tickFormatter={(v: number) => v.toFixed(4)}
            />
            <Tooltip
              cursor={{ stroke: "var(--brand-gold)", strokeOpacity: 0.3 }}
              contentStyle={{
                background: "var(--bg-1)",
                border: "1px solid var(--b-hard)",
                borderRadius: 8,
                fontSize: 11,
              }}
              labelFormatter={(t) =>
                typeof t === "number" ? new Date(t * 1000).toLocaleString("ru-RU") : ""
              }
              formatter={(v) => (typeof v === "number" ? v.toFixed(4) : String(v))}
            />
            <Area
              type="monotone"
              dataKey="c"
              stroke="#d4a017"
              strokeWidth={2}
              fill="url(#tmaGold)"
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="c"
              stroke="#d4a017"
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
            {entryPrice != null && (
              <ReferenceLine
                y={entryPrice}
                stroke={isCall ? "var(--green)" : "var(--red)"}
                strokeDasharray="3 3"
                label={{
                  value: `вход ${entryPrice.toFixed(4)} ${isCall ? "↑" : "↓"}`,
                  position: "right",
                  fill: isCall ? "var(--green)" : "var(--red)",
                  fontSize: 10,
                }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
