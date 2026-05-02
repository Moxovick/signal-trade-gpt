"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

const FIELD =
  "h-10 px-3 rounded-lg text-sm outline-none transition-colors bg-[#0a0a13] border border-white/[0.08] focus:border-white/20 text-white placeholder-[#555]";

const COMMON_PAIRS = [
  "EUR/USD",
  "GBP/USD",
  "USD/JPY",
  "AUD/USD",
  "EUR/USD-OTC",
  "EUR/JPY-OTC",
  "BTC/USDT",
  "ETH/USDT",
] as const;

const EXPIRATIONS = ["60s", "2m", "3m", "5m", "10m", "15m", "30m"] as const;

export function CreateSignalForm() {
  const router = useRouter();
  const [pair, setPair] = useState("EUR/USD");
  const [direction, setDirection] = useState<"CALL" | "PUT">("CALL");
  const [expiration, setExpiration] = useState("3m");
  const [confidence, setConfidence] = useState(85);
  const [tier, setTier] = useState<"otc" | "exchange" | "elite">("otc");
  const [type, setType] = useState<"ai" | "expert" | "manual">("manual");
  const [entryPrice, setEntryPrice] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const res = await fetch("/api/admin/signals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pair,
        direction,
        expiration,
        confidence,
        tier,
        type,
        entryPrice: entryPrice ? Number(entryPrice) : null,
        analysis: analysis || null,
      }),
    });
    const data: { error?: string; signal?: { id: string } } = await res
      .json()
      .catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? `Ошибка ${res.status}`);
      return;
    }
    setSuccess(`Опубликован: ${pair} ${direction} ${expiration}`);
    setAnalysis("");
    setEntryPrice("");
    startTransition(() => router.refresh());
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border p-5 space-y-4"
      style={{
        background: "#0d0d18",
        borderColor: "rgba(255,255,255,0.07)",
      }}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Создать сигнал</h2>
        <span className="text-xs text-[#555]">Публикуется сразу</span>
      </div>

      {error && (
        <div className="px-3 py-2 rounded-lg text-xs border border-red-500/30 bg-red-500/10 text-red-400">
          {error}
        </div>
      )}
      {success && (
        <div className="px-3 py-2 rounded-lg text-xs border border-green-500/30 bg-green-500/10 text-green-400">
          {success}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <label className="text-xs text-[#777] flex flex-col gap-1">
          Пара
          <input
            list="signal-pairs"
            value={pair}
            onChange={(e) => setPair(e.target.value)}
            className={FIELD}
            placeholder="EUR/USD"
          />
          <datalist id="signal-pairs">
            {COMMON_PAIRS.map((p) => (
              <option key={p} value={p} />
            ))}
          </datalist>
        </label>

        <label className="text-xs text-[#777] flex flex-col gap-1">
          Направление
          <select
            value={direction}
            onChange={(e) => setDirection(e.target.value as "CALL" | "PUT")}
            className={FIELD}
          >
            <option value="CALL">CALL (вверх)</option>
            <option value="PUT">PUT (вниз)</option>
          </select>
        </label>

        <label className="text-xs text-[#777] flex flex-col gap-1">
          Экспирация
          <select
            value={expiration}
            onChange={(e) => setExpiration(e.target.value)}
            className={FIELD}
          >
            {EXPIRATIONS.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </label>

        <label className="text-xs text-[#777] flex flex-col gap-1">
          Тир (доступ)
          <select
            value={tier}
            onChange={(e) =>
              setTier(e.target.value as "otc" | "exchange" | "elite")
            }
            className={FIELD}
          >
            <option value="otc">OTC (T1+)</option>
            <option value="exchange">Биржа (T2+)</option>
            <option value="elite">Elite (T3+)</option>
          </select>
        </label>

        <label className="text-xs text-[#777] flex flex-col gap-1">
          Уверенность ({confidence}%)
          <input
            type="range"
            min={50}
            max={100}
            value={confidence}
            onChange={(e) => setConfidence(Number(e.target.value))}
            className="h-10 accent-[#f5c518]"
          />
        </label>

        <label className="text-xs text-[#777] flex flex-col gap-1">
          Тип
          <select
            value={type}
            onChange={(e) =>
              setType(e.target.value as "ai" | "expert" | "manual")
            }
            className={FIELD}
          >
            <option value="manual">Ручной</option>
            <option value="expert">Экспертный</option>
            <option value="ai">AI-генерация</option>
          </select>
        </label>

        <label className="text-xs text-[#777] flex flex-col gap-1">
          Цена входа (опционально)
          <input
            type="number"
            step="0.00001"
            value={entryPrice}
            onChange={(e) => setEntryPrice(e.target.value)}
            className={FIELD}
            placeholder="1.08543"
          />
        </label>
      </div>

      <label className="text-xs text-[#777] flex flex-col gap-1">
        Анализ / комментарий (опционально)
        <textarea
          value={analysis}
          onChange={(e) => setAnalysis(e.target.value)}
          className={`${FIELD} h-20 py-2`}
          placeholder="Например: пробой уровня 1.0850, ожидаем продолжение тренда"
        />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="h-11 px-6 rounded-full font-semibold text-sm disabled:opacity-50"
        style={{
          background: "#f5c518",
          color: "#1a1208",
        }}
      >
        {pending ? "Публикуем…" : "Опубликовать сигнал"}
      </button>
    </form>
  );
}
