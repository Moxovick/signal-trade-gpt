"use client";

import { useState } from "react";
import { Save, Loader2, CheckCircle2 } from "lucide-react";
import type { SignalSchedule } from "@/lib/signal-config";

const FIELD =
  "h-10 px-3 rounded-lg text-sm outline-none transition-colors bg-[#0a0a13] border border-white/[0.08] focus:border-white/20 text-white";

export function SchedulePanel({ initial }: { initial: SignalSchedule }) {
  const [s, setS] = useState<SignalSchedule>(initial);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setBusy(true);
    setError(null);
    setSaved(false);
    const r = await fetch("/api/admin/signal-schedule", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ schedule: s }),
    });
    setBusy(false);
    if (!r.ok) {
      setError(`Не удалось сохранить (${r.status})`);
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#0d0d18] p-5 space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Авто-расписание публикации</h2>
        <p className="text-xs text-[#777] mt-0.5">
          Раз в 5 минут серверный cron проверяет: если интервал тира истёк —
          публикуется новый сигнал из шаблонов с auto-publish.
        </p>
      </div>

      {error ? (
        <div className="px-3 py-2 rounded-lg text-xs border border-red-500/30 bg-red-500/10 text-red-400">
          {error}
        </div>
      ) : null}

      <label className="flex items-center gap-3 px-3 py-2 rounded-lg border border-white/[0.08] bg-[#0a0a13] cursor-pointer">
        <input
          type="checkbox"
          checked={s.enabled}
          onChange={(e) => setS({ ...s, enabled: e.target.checked })}
        />
        <span className="text-sm">Включить авто-публикацию</span>
      </label>

      <div>
        <p className="text-xs text-[#777] mb-2">Интервал между сигналами (минут, 0 = выключено)</p>
        <div className="grid grid-cols-3 gap-3">
          {(["otc", "exchange", "elite"] as const).map((band) => (
            <label
              key={band}
              className="text-xs text-[#777] flex flex-col gap-1"
            >
              {band === "otc" ? "OTC" : band === "exchange" ? "Биржа" : "Elite"}
              <input
                type="number"
                min={0}
                max={1440}
                value={s.intervalMinutes[band]}
                onChange={(e) =>
                  setS({
                    ...s,
                    intervalMinutes: {
                      ...s.intervalMinutes,
                      [band]: Number(e.target.value),
                    },
                  })
                }
                className={FIELD}
              />
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs text-[#777] mb-2">Рабочее окно (UTC, 24h формат). Если start = end — работает 24/7.</p>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-xs text-[#777] flex flex-col gap-1">
            Начало
            <input
              type="number"
              min={0}
              max={23}
              value={s.workingHours.start}
              onChange={(e) =>
                setS({
                  ...s,
                  workingHours: {
                    ...s.workingHours,
                    start: Number(e.target.value),
                  },
                })
              }
              className={FIELD}
            />
          </label>
          <label className="text-xs text-[#777] flex flex-col gap-1">
            Конец
            <input
              type="number"
              min={0}
              max={24}
              value={s.workingHours.end}
              onChange={(e) =>
                setS({
                  ...s,
                  workingHours: {
                    ...s.workingHours,
                    end: Number(e.target.value),
                  },
                })
              }
              className={FIELD}
            />
          </label>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={save}
          disabled={busy}
          className="inline-flex items-center gap-2 h-11 px-6 rounded-full bg-[#f5c518] text-[#1a1208] font-semibold disabled:opacity-50"
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
  );
}
