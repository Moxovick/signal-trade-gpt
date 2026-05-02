"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Clock, Sparkles } from "lucide-react";

export type LiveSignal = {
  id: string;
  pair: string;
  direction: "CALL" | "PUT";
  expiration: string;
  confidence: number;
  tier: string;
  entryPrice: number | null;
  analysis: string | null;
  createdAtIso: string;
};

const TIER_LABEL: Record<string, string> = {
  otc: "OTC",
  exchange: "Биржа",
  elite: "Elite",
};

function parseExpirationSeconds(s: string): number {
  const m = /^(\d+)([sm])$/.exec(s);
  if (!m) return 60;
  const n = Number(m[1]);
  return m[2] === "m" ? n * 60 : n;
}

export function LiveSignalHero({ signal }: { signal: LiveSignal | null }) {
  const [now, setNow] = useState<number>(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!signal) {
    return (
      <div
        className="rounded-3xl border-2 border-dashed p-8 text-center"
        style={{ borderColor: "rgba(255,255,255,0.08)" }}
      >
        <Sparkles
          size={32}
          className="mx-auto mb-3"
          style={{ color: "var(--brand-gold)" }}
        />
        <h3 className="text-lg font-semibold mb-1">Активных сигналов нет</h3>
        <p className="text-sm text-[var(--t-2)]">
          Как только админ опубликует новый сигнал — он появится здесь
          мгновенно.
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

  const accent = isCall ? "var(--green)" : "var(--red)";
  const accentBg = isCall ? "rgba(0, 229, 160, 0.10)" : "rgba(255, 107, 61, 0.10)";

  return (
    <div
      className="rounded-3xl border-2 overflow-hidden relative"
      style={{
        borderColor: isExpired ? "rgba(255,255,255,0.10)" : accent,
        background: `linear-gradient(135deg, ${accentBg}, transparent 60%)`,
      }}
    >
      <div className="px-6 py-5 flex items-center justify-between border-b border-white/[0.06]">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[var(--brand-gold)]">
          <span
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: isExpired ? "#666" : accent }}
          />
          {isExpired ? "Сигнал истёк" : "Live сигнал"}
        </div>
        <div className="text-xs text-[var(--t-3)]">
          {TIER_LABEL[signal.tier] ?? signal.tier} ·{" "}
          {signal.expiration} экспирация
        </div>
      </div>

      <div className="px-6 py-6 grid md:grid-cols-[auto_1fr_auto] gap-6 items-center">
        <div
          className="w-20 h-20 rounded-2xl flex flex-col items-center justify-center shrink-0"
          style={{
            background: accentBg,
            color: accent,
            border: `2px solid ${accent}`,
          }}
        >
          {isCall ? <TrendingUp size={36} /> : <TrendingDown size={36} />}
          <span className="text-[10px] font-bold mt-1">
            {isCall ? "ВВЕРХ" : "ВНИЗ"}
          </span>
        </div>

        <div className="min-w-0">
          <div
            className="text-3xl md:text-4xl font-bold mb-1 truncate"
            style={{ fontFamily: "var(--font-jetbrains)" }}
          >
            {signal.pair}
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-2 text-[var(--t-2)]">
              <span>Уверенность</span>
              <span
                className="font-bold text-base"
                style={{ color: "var(--brand-gold)" }}
              >
                {signal.confidence}%
              </span>
            </div>
            {signal.entryPrice != null && (
              <div className="flex items-center gap-2 text-[var(--t-2)]">
                <span>Вход</span>
                <span
                  className="font-mono font-semibold text-base"
                  style={{ color: "var(--t-1)" }}
                >
                  {Number(signal.entryPrice).toFixed(5)}
                </span>
              </div>
            )}
          </div>
          {signal.analysis && (
            <p className="mt-3 text-sm text-[var(--t-2)] leading-relaxed line-clamp-2">
              {signal.analysis}
            </p>
          )}
        </div>

        <div className="md:text-right shrink-0">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[var(--t-3)] md:justify-end">
            <Clock size={14} />
            {isExpired ? "Истёк" : "Истекает через"}
          </div>
          <div
            className="text-4xl md:text-5xl font-bold tabular-nums"
            style={{
              fontFamily: "var(--font-jetbrains)",
              color: isExpired ? "var(--t-3)" : "var(--t-1)",
            }}
          >
            {String(minutes).padStart(2, "0")}:
            {String(seconds).padStart(2, "0")}
          </div>
        </div>
      </div>

      <div className="h-1.5 bg-white/[0.06]">
        <div
          className="h-full transition-all duration-1000 ease-linear"
          style={{
            width: `${progressPct}%`,
            background: isExpired ? "var(--t-3)" : accent,
          }}
        />
      </div>
    </div>
  );
}
