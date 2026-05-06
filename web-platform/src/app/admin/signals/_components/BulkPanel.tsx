"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Loader2, Wand2, CheckCircle2 } from "lucide-react";
import type { SignalTemplate } from "@/lib/signal-config";

const FIELD =
  "h-10 px-3 rounded-lg text-sm outline-none transition-colors bg-[#0a0a13] border border-white/[0.08] focus:border-white/20 text-white";

export function BulkPanel({ templates }: { templates: SignalTemplate[] }) {
  const router = useRouter();
  const [count, setCount] = useState(5);
  const [spacing, setSpacing] = useState(15);
  const [backfill, setBackfill] = useState(true);
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{
    n: number;
    samples: string[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  function toggle(id: string) {
    setSelected((cur) =>
      cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id],
    );
  }

  async function run() {
    setBusy(true);
    setError(null);
    setResult(null);
    const r = await fetch("/api/admin/signals/bulk", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        count,
        templateIds: selected,
        spacingMinutes: spacing,
        backfill,
      }),
    });
    setBusy(false);
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      setError(j.error ?? `Ошибка ${r.status}`);
      return;
    }
    const j = (await r.json()) as {
      created: { id: string; pair: string; direction: string }[];
    };
    setResult({
      n: j.created.length,
      samples: j.created
        .slice(0, 5)
        .map((c) => `${c.pair} ${c.direction}`),
    });
    startTransition(() => router.refresh());
  }

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#0d0d18] p-5 space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Bulk-генерация</h2>
        <p className="text-xs text-[#777] mt-0.5">
          Сгенерировать пачку сигналов из шаблонов. Полезно когда лента пустая.
        </p>
      </div>

      {error ? (
        <div className="px-3 py-2 rounded-lg text-xs border border-red-500/30 bg-red-500/10 text-red-400">
          {error}
        </div>
      ) : null}
      {result ? (
        <div className="px-3 py-2 rounded-lg text-xs border border-green-500/30 bg-green-500/10 text-green-400 inline-flex items-center gap-2">
          <CheckCircle2 size={14} />
          Создано {result.n}: {result.samples.join(" • ")}
        </div>
      ) : null}

      <div className="grid grid-cols-3 gap-3">
        <label className="text-xs text-[#777] flex flex-col gap-1">
          Количество
          <input
            type="number"
            min={1}
            max={50}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className={FIELD}
          />
        </label>
        <label className="text-xs text-[#777] flex flex-col gap-1">
          Интервал (мин)
          <input
            type="number"
            min={0}
            max={240}
            value={spacing}
            onChange={(e) => setSpacing(Number(e.target.value))}
            className={FIELD}
          />
        </label>
        <label className="text-xs text-[#777] flex items-center gap-2 mt-5">
          <input
            type="checkbox"
            checked={backfill}
            onChange={(e) => setBackfill(e.target.checked)}
          />
          Распределить назад во времени (createdAt = now − N×interval)
        </label>
      </div>

      <div>
        <p className="text-xs text-[#777] mb-2">
          Шаблоны для выборки {selected.length === 0 ? "(все)" : `(${selected.length})`}
        </p>
        <div className="grid grid-cols-2 gap-2">
          {templates.map((t) => (
            <label
              key={t.id}
              className="flex items-center gap-2 px-3 h-10 rounded-lg border border-white/[0.06] bg-[#0a0a13] text-xs text-[#aaa] cursor-pointer hover:border-white/15"
            >
              <input
                type="checkbox"
                checked={selected.includes(t.id)}
                onChange={() => toggle(t.id)}
              />
              <span className="font-mono">{t.pair}</span>
              <span
                className="font-bold"
                style={{ color: t.direction === "CALL" ? "#00e5a0" : "#f5c518" }}
              >
                {t.direction}
              </span>
              <span className="text-[#666]">{t.expiration}</span>
              <span className="ml-auto text-[10px] uppercase text-[#666]">
                {t.tier}
              </span>
            </label>
          ))}
          {templates.length === 0 ? (
            <p className="col-span-2 text-xs text-[#666]">
              Сначала добавь шаблоны во вкладке «Шаблоны».
            </p>
          ) : null}
        </div>
      </div>

      <button
        onClick={run}
        disabled={busy || pending || templates.length === 0}
        className="inline-flex items-center gap-2 h-11 px-6 rounded-full bg-[#f5c518] text-[#1a1208] font-semibold disabled:opacity-50"
      >
        {busy ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
        Сгенерировать {count}
      </button>
    </div>
  );
}
