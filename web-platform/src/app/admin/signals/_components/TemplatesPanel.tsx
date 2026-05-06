"use client";

import { useState } from "react";
import { Plus, Save, Trash2, Loader2, CheckCircle2 } from "lucide-react";
import type { SignalTemplate } from "@/lib/signal-config";

const FIELD =
  "h-9 px-3 rounded-lg text-sm outline-none transition-colors bg-[#0a0a13] border border-white/[0.08] focus:border-white/20 text-white placeholder-[#555]";

const EXP = ["60s", "2m", "3m", "5m", "10m", "15m", "30m"];

function uid() {
  return `tpl-${Math.random().toString(36).slice(2, 10)}`;
}

export function TemplatesPanel({ initial }: { initial: SignalTemplate[] }) {
  const [list, setList] = useState<SignalTemplate[]>(initial);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update(id: string, patch: Partial<SignalTemplate>) {
    setList((cur) => cur.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }

  function add() {
    setList((cur) => [
      ...cur,
      {
        id: uid(),
        name: "Новый шаблон",
        pair: "EUR/USD",
        direction: "CALL",
        expiration: "3m",
        confidence: 80,
        tier: "otc",
        analysis: null,
        weight: 1,
        autoPublish: true,
      },
    ]);
  }

  function remove(id: string) {
    setList((cur) => cur.filter((t) => t.id !== id));
  }

  async function save() {
    setBusy(true);
    setError(null);
    setSaved(false);
    const r = await fetch("/api/admin/signal-templates", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ templates: list }),
    });
    setBusy(false);
    if (!r.ok) {
      setError(`Не удалось сохранить (${r.status})`);
      return;
    }
    const j = await r.json();
    setList(j.templates ?? []);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#0d0d18] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Шаблоны сигналов</h2>
          <p className="text-xs text-[#777] mt-0.5">
            Используются в Bulk-генерации и Авто-расписании.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={add}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-white/[0.08] text-sm hover:border-white/20 transition-colors"
          >
            <Plus size={14} /> Новый
          </button>
          <button
            onClick={save}
            disabled={busy}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-[#f5c518] text-[#1a1208] text-sm font-semibold disabled:opacity-50"
          >
            {busy ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Save size={14} />
            )}
            Сохранить
          </button>
          {saved ? (
            <span className="text-xs text-green-400 inline-flex items-center gap-1">
              <CheckCircle2 size={12} /> Сохранено
            </span>
          ) : null}
        </div>
      </div>

      {error ? (
        <div className="px-3 py-2 rounded-lg text-xs border border-red-500/30 bg-red-500/10 text-red-400">
          {error}
        </div>
      ) : null}

      {list.length === 0 ? (
        <div className="text-center py-12 text-sm text-[#666]">
          Шаблонов пока нет. Нажми «Новый», чтобы добавить.
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((t) => (
            <div
              key={t.id}
              className="rounded-xl border border-white/[0.06] bg-[#0a0a13] p-3 grid grid-cols-12 gap-2 items-center"
            >
              <input
                value={t.name}
                onChange={(e) => update(t.id, { name: e.target.value })}
                className={`${FIELD} col-span-2`}
                placeholder="Название"
              />
              <input
                value={t.pair}
                onChange={(e) => update(t.id, { pair: e.target.value })}
                className={`${FIELD} col-span-2 font-mono`}
                placeholder="EUR/USD"
              />
              <select
                value={t.direction}
                onChange={(e) =>
                  update(t.id, {
                    direction: e.target.value as "CALL" | "PUT",
                  })
                }
                className={`${FIELD} col-span-1`}
              >
                <option value="CALL">CALL</option>
                <option value="PUT">PUT</option>
              </select>
              <select
                value={t.expiration}
                onChange={(e) => update(t.id, { expiration: e.target.value })}
                className={`${FIELD} col-span-1`}
              >
                {EXP.map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={50}
                max={100}
                value={t.confidence}
                onChange={(e) =>
                  update(t.id, { confidence: Number(e.target.value) })
                }
                className={`${FIELD} col-span-1`}
              />
              <select
                value={t.tier}
                onChange={(e) =>
                  update(t.id, {
                    tier: e.target.value as "otc" | "exchange" | "elite",
                  })
                }
                className={`${FIELD} col-span-1`}
              >
                <option value="otc">OTC</option>
                <option value="exchange">Биржа</option>
                <option value="elite">Elite</option>
              </select>
              <input
                type="number"
                min={1}
                max={20}
                value={t.weight}
                onChange={(e) =>
                  update(t.id, { weight: Number(e.target.value) })
                }
                className={`${FIELD} col-span-1`}
                title="Вес в случайной выборке"
              />
              <label className="col-span-2 flex items-center gap-2 text-xs text-[#aaa]">
                <input
                  type="checkbox"
                  checked={t.autoPublish}
                  onChange={(e) =>
                    update(t.id, { autoPublish: e.target.checked })
                  }
                />
                Авто-паблиш
              </label>
              <button
                onClick={() => remove(t.id)}
                className="col-span-1 inline-flex items-center justify-center h-9 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
                title="Удалить"
              >
                <Trash2 size={14} />
              </button>
              <textarea
                value={t.analysis ?? ""}
                onChange={(e) =>
                  update(t.id, { analysis: e.target.value || null })
                }
                placeholder="Анализ (опционально)"
                className="col-span-12 h-12 px-3 py-2 rounded-lg text-xs outline-none bg-[#0d0d18] border border-white/[0.06] focus:border-white/20 text-white placeholder-[#555] resize-none"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
