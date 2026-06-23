"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save, Settings, CheckCircle2 } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

const FIELD =
  "h-10 px-3 rounded-lg text-sm outline-none transition-colors bg-[#0a0a13] border border-white/[0.08] focus:border-white/20 text-white";

type OnDemandConfig = {
  dailyLimits: Record<string, number | null>;
  allowedTypes: Record<string, string[]>;
  proFrequencySeconds: number;
  analysisDelayMin: number;
  analysisDelayMax: number;
};

const TIER_INFO = [
  { key: "0", label: "Free (T0)", color: "#8888ff" },
  { key: "1", label: "Basic (T1)", color: "#00e5a0" },
  { key: "2", label: "Pro (T2)", color: "#f5c518" },
] as const;

const SIGNAL_TYPES = [
  { value: "otc", label: "OTC" },
  { value: "exchange", label: "Биржа" },
  { value: "elite", label: "Elite" },
] as const;

export function TierSignalSettings({ initial }: { initial: OnDemandConfig }) {
  const router = useRouter();
  const { t } = useI18n();
  const ts = t?.admin?.signals?.tierSettings ?? {};
  const [config, setConfig] = useState<OnDemandConfig>({
    ...initial,
    analysisDelayMin: initial.analysisDelayMin ?? 5,
    analysisDelayMax: initial.analysisDelayMax ?? 20,
  });
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setDailyLimit(tier: string, value: string) {
    const parsed = value === "" ? null : Math.max(0, Number(value));
    setConfig((prev) => ({
      ...prev,
      dailyLimits: { ...prev.dailyLimits, [tier]: parsed },
    }));
  }

  function toggleType(tier: string, type: string) {
    setConfig((prev) => {
      const current = prev.allowedTypes[tier] ?? [];
      const updated = current.includes(type)
        ? current.filter((t) => t !== type)
        : [...current, type];
      return {
        ...prev,
        allowedTypes: { ...prev.allowedTypes, [tier]: updated },
      };
    });
  }

  async function save() {
    setError(null);
    setSaved(false);

    startTransition(async () => {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          updates: [
            { key: "on_demand_signal_config", value: config },
          ],
        }),
      });
      if (!res.ok) {
        const data: { reason?: string } = await res.json().catch(() => ({}));
        setError(data.reason ?? `Ошибка ${res.status}`);
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      router.refresh();
    });
  }

  return (
    <div
      className="rounded-2xl border p-5 space-y-5"
      style={{
        background: "#0d0d18",
        borderColor: "rgba(255,255,255,0.07)",
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings size={16} className="text-[#f5c518]" />
          <h2 className="text-lg font-semibold">{ts.title ?? "Настройки по тирам"}</h2>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="text-xs text-green-400 flex items-center gap-1">
              <CheckCircle2 size={12} /> {ts.saved ?? "Сохранено"}
            </span>
          )}
          <button
            onClick={save}
            disabled={pending}
            className="inline-flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-semibold bg-[#f5c518] text-[#1a1208] disabled:opacity-50"
          >
            <Save size={13} />
            {pending ? (ts.saving ?? "Сохраняем...") : (ts.save ?? "Сохранить")}
          </button>
        </div>
      </div>

      {error && (
        <div className="px-3 py-2 rounded-lg text-xs border border-red-500/30 bg-red-500/10 text-red-400">
          {error}
        </div>
      )}

      <p className="text-xs text-[#777]">
        {ts.description ?? "Дневные лимиты и доступные типы сигналов для каждого тира. Пустое поле лимита = безлимит."}
      </p>

      <div className="space-y-3">
        {TIER_INFO.map(({ key, label, color }) => (
          <div
            key={key}
            className="rounded-xl border border-white/[0.06] bg-[#0a0a13] p-4"
          >
            <div className="flex items-center gap-3 mb-3">
              <span
                className="text-sm font-semibold px-2 py-0.5 rounded-lg"
                style={{ background: `${color}20`, color }}
              >
                {label}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="text-xs text-[#777] flex flex-col gap-1">
                {ts.dailyLimit ?? "Дневной лимит сигналов"}
                <input
                  type="number"
                  min={0}
                  value={config.dailyLimits[key] ?? ""}
                  onChange={(e) => setDailyLimit(key, e.target.value)}
                  placeholder={ts.unlimited ?? "Безлимит"}
                  className={FIELD}
                />
              </label>

              <div className="text-xs text-[#777]">
                <span className="block mb-1.5">{ts.availableTypes ?? "Доступные типы сигналов"}</span>
                <div className="flex gap-2">
                  {SIGNAL_TYPES.map((st) => (
                    <label
                      key={st.value}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/[0.08] cursor-pointer hover:border-white/15 text-[#aaa]"
                    >
                      <input
                        type="checkbox"
                        checked={(config.allowedTypes[key] ?? []).includes(st.value)}
                        onChange={() => toggleType(key, st.value)}
                        className="accent-[#f5c518]"
                      />
                      {st.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div>
        <label className="text-xs text-[#777] flex flex-col gap-1">
          {ts.proMinInterval ?? "Минимальный интервал между сигналами для Pro (секунды, 0 = без ограничений)"}
          <input
            type="number"
            min={0}
            value={config.proFrequencySeconds}
            onChange={(e) =>
              setConfig((prev) => ({
                ...prev,
                proFrequencySeconds: Math.max(0, Number(e.target.value)),
              }))
            }
            className={`${FIELD} w-40`}
          />
        </label>
      </div>

      <div>
        <span className="text-xs text-[#777] block mb-1">
          {ts.analysisDelay ?? "Задержка анализа (секунды)"}
        </span>
        <div className="flex items-center gap-3">
          <label className="text-xs text-[#777] flex flex-col gap-1">
            Min
            <input
              type="number"
              min={0}
              value={config.analysisDelayMin}
              onChange={(e) => {
                const val = Math.max(0, Number(e.target.value));
                setConfig((prev) => ({
                  ...prev,
                  analysisDelayMin: val,
                  analysisDelayMax: Math.max(val, prev.analysisDelayMax),
                }));
              }}
              className={`${FIELD} w-24`}
            />
          </label>
          <label className="text-xs text-[#777] flex flex-col gap-1">
            Max
            <input
              type="number"
              min={0}
              value={config.analysisDelayMax}
              onChange={(e) => {
                const val = Math.max(0, Number(e.target.value));
                setConfig((prev) => ({
                  ...prev,
                  analysisDelayMax: val,
                  analysisDelayMin: Math.min(val, prev.analysisDelayMin),
                }));
              }}
              className={`${FIELD} w-24`}
            />
          </label>
        </div>
        <p className="text-xs text-[#555] mt-1">
          {ts.analysisDelayHint ?? "Время «анализа» перед выдачей сигнала. Рандомное значение между min и max."}
        </p>
      </div>
    </div>
  );
}
