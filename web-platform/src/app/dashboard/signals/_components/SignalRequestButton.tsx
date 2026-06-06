"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Zap,
  Loader2,
  TrendingUp,
  TrendingDown,
  Clock,
  ArrowUpRight,
} from "lucide-react";

type GeneratedSignal = {
  id: string;
  pair: string;
  direction: "CALL" | "PUT";
  expiration: string;
  confidence: number;
  tier: string;
  createdAt: string;
};

type Props = {
  limitReached: boolean;
  remaining: number | null;
  tierLabel: string;
  referralUrl: string;
};

export function SignalRequestButton({
  limitReached,
  remaining,
  tierLabel,
  referralUrl,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [lastSignal, setLastSignal] = useState<GeneratedSignal | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function requestSignal() {
    setLoading(true);
    setError(null);
    setLastSignal(null);

    try {
      const res = await fetch("/api/signals/request", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? `Ошибка ${res.status}`);
        return;
      }

      setLastSignal(data.signal);
      router.refresh();
    } catch {
      setError("Не удалось получить сигнал. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md space-y-4">
      {/* Main button */}
      <button
        onClick={requestSignal}
        disabled={limitReached || loading}
        className="w-full h-14 rounded-2xl font-bold text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        style={{
          background: limitReached
            ? "var(--bg-2)"
            : "linear-gradient(135deg, var(--brand-gold-deep), var(--brand-gold-bright))",
          color: limitReached ? "var(--t-3)" : "#1a1208",
          boxShadow: limitReached ? "none" : "0 0 30px rgba(212,160,23,0.2)",
        }}
      >
        {loading ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            Генерируем...
          </>
        ) : limitReached ? (
          "Лимит исчерпан"
        ) : (
          <>
            <Zap size={20} />
            Получить сигнал
            {remaining != null && (
              <span className="text-sm opacity-70 ml-1">
                ({remaining} осталось)
              </span>
            )}
          </>
        )}
      </button>

      {/* Upgrade CTA for limited tiers */}
      {limitReached && (
        <Link
          href={referralUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 text-sm text-[var(--brand-gold)] hover:text-[var(--brand-gold-bright)] transition-colors"
        >
          Повысить уровень ({tierLabel})
          <ArrowUpRight size={14} />
        </Link>
      )}

      {/* Error message */}
      {error && (
        <div className="px-4 py-3 rounded-xl text-sm border border-red-500/30 bg-red-500/10 text-red-400 text-center">
          {error}
        </div>
      )}

      {/* Generated signal card */}
      {lastSignal && (
        <div
          className="rounded-2xl border-2 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300"
          style={{
            borderColor: lastSignal.direction === "CALL" ? "var(--green)" : "var(--red)",
            background: lastSignal.direction === "CALL"
              ? "rgba(0,229,160,0.05)"
              : "rgba(255,107,61,0.05)",
          }}
        >
          <div className="px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: lastSignal.direction === "CALL"
                      ? "rgba(0,229,160,0.15)"
                      : "rgba(255,107,61,0.15)",
                    color: lastSignal.direction === "CALL" ? "var(--green)" : "var(--red)",
                  }}
                >
                  {lastSignal.direction === "CALL" ? (
                    <TrendingUp size={22} />
                  ) : (
                    <TrendingDown size={22} />
                  )}
                </div>
                <div>
                  <div
                    className="text-lg font-bold"
                    style={{ fontFamily: "var(--font-jetbrains)" }}
                  >
                    {lastSignal.pair}
                  </div>
                  <div className="text-xs text-[var(--t-3)]">
                    {lastSignal.direction === "CALL" ? "CALL (Вверх)" : "PUT (Вниз)"}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div
                  className="text-2xl font-bold"
                  style={{ color: "var(--brand-gold)", fontFamily: "var(--font-jetbrains)" }}
                >
                  {lastSignal.confidence}%
                </div>
                <div className="text-[10px] text-[var(--t-3)] uppercase tracking-wider">
                  Уверенность
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-[var(--t-2)]">
              <span className="flex items-center gap-1">
                <Clock size={11} />
                {lastSignal.expiration}
              </span>
              <span className="uppercase text-[10px] px-1.5 py-0.5 rounded-md bg-white/[0.05]">
                {lastSignal.tier}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
