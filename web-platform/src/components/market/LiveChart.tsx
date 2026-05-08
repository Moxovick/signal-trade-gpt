"use client";

/**
 * LiveChart — landing showcase chart.
 *
 * Polls /api/market/candles for the selected pair every 5 seconds and
 * renders an area+line chart in the matte-gold palette. When CHIPA_API_KEY
 * is unset, the source is "synthetic" and we display a small badge so the
 * user knows it's a placeholder.
 */
import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

type Candle = { t: number; o: number; h: number; l: number; c: number };

type ChartSource = "binance" | "twelvedata" | "synthetic";
type Response = { pair: string; source: ChartSource; candles: Candle[] };

const PAIRS = ["EUR/USD", "GBP/USD", "USD/JPY", "AUD/USD", "EUR/GBP", "USD/CHF"] as const;

export function LiveChart() {
  const [pair, setPair] = useState<(typeof PAIRS)[number]>("EUR/USD");
  const [data, setData] = useState<Candle[]>([]);
  const [source, setSource] = useState<ChartSource>("synthetic");

  useEffect(() => {
    let alive = true;
    let timer: ReturnType<typeof setTimeout> | null = null;

    async function tick() {
      try {
        const res = await fetch(`/api/market/candles?pair=${encodeURIComponent(pair)}`);
        if (!res.ok) return;
        const j = (await res.json()) as Response;
        if (!alive) return;
        setData(j.candles);
        setSource(j.source);
      } finally {
        timer = setTimeout(tick, 5000);
      }
    }
    tick();
    return () => {
      alive = false;
      if (timer) clearTimeout(timer);
    };
  }, [pair]);

  const last = data.at(-1);
  const first = data[0];
  const change = last && first ? ((last.c - first.o) / first.o) * 100 : 0;

  return (
    <div className="rounded-2xl glass border border-[var(--b-soft)] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div
            className="text-xl font-bold text-[var(--brand-gold)]"
            style={{ fontFamily: "var(--font-bebas)" }}
          >
            LIVE · {pair}
          </div>
          {last && (
            <div
              className="text-sm tabular-nums"
              style={{ fontFamily: "var(--font-jetbrains)" }}
            >
              {last.c.toFixed(4)}{" "}
              <span
                className={change >= 0 ? "text-[var(--green)]" : "text-[var(--red)]"}
              >
                {change >= 0 ? "+" : ""}
                {change.toFixed(2)}%
              </span>
            </div>
          )}
          <span
            className="text-[10px] uppercase px-1.5 py-0.5 rounded"
            style={{
              background:
                source === "synthetic" ? "rgba(212,160,23,0.10)" : "rgba(142,224,107,0.10)",
              color: source === "synthetic" ? "var(--brand-gold)" : "var(--green)",
            }}
          >
            {source === "synthetic" ? "demo" : "real"}
          </span>
        </div>
        <div className="flex flex-wrap gap-1">
          {PAIRS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPair(p)}
              className={`text-xs px-2.5 py-1 rounded-full transition-colors ${
                p === pair
                  ? "bg-[var(--brand-gold)] text-[#1a1208]"
                  : "bg-[var(--bg-2)] text-[var(--t-2)] hover:text-[var(--t-1)]"
              }`}
              style={{ fontFamily: "var(--font-jetbrains)" }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64 -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <defs>
              <linearGradient id="chartGold" x1="0" y1="0" x2="0" y2="1">
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
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              dataKey="c"
              domain={["dataMin", "dataMax"]}
              stroke="var(--t-3)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              width={60}
              tickFormatter={(v: number) => v.toFixed(4)}
            />
            <Tooltip
              cursor={{ stroke: "var(--brand-gold)", strokeOpacity: 0.3 }}
              contentStyle={{
                background: "var(--bg-1)",
                border: "1px solid var(--b-hard)",
                borderRadius: 12,
                fontFamily: "var(--font-jetbrains)",
                fontSize: 12,
              }}
              labelFormatter={(label) => {
                const t = typeof label === "number" ? label : Number(label);
                return Number.isFinite(t)
                  ? new Date(t * 1000).toLocaleTimeString("ru-RU")
                  : String(label);
              }}
              formatter={(value, name) => {
                const num = typeof value === "number" ? value : Number(value);
                return [Number.isFinite(num) ? num.toFixed(4) : String(value), String(name).toUpperCase()];
              }}
            />
            <Area
              type="monotone"
              dataKey="c"
              stroke="transparent"
              fill="url(#chartGold)"
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="c"
              stroke="#d4a017"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
