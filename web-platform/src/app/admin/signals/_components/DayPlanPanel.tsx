"use client";

import { useEffect, useState, useCallback } from "react";
import {
  CalendarDays,
  Loader2,
  Wand2,
  Trash2,
  Save,
  CheckCircle2,
  RefreshCw,
  Clock,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

const FIELD =
  "h-9 px-3 rounded-lg text-sm outline-none transition-colors bg-[#0a0a13] border border-white/[0.08] focus:border-white/20 text-white";

const EXPIRATIONS = ["60s", "2m", "3m", "5m", "10m", "15m"] as const;

type AssetOption = {
  symbol: string;
  signalTier: "otc" | "exchange" | "elite";
  isActive: boolean;
};

type SlotDraft = {
  id: string; // local uuid
  scheduledAt: string; // ISO string (UTC)
  pair: string;
  direction: "CALL" | "PUT";
  expiration: string;
  confidence: number;
  tier: "otc" | "exchange" | "elite";
  type: "ai" | "expert" | "manual";
  analysis: string;
};

type ExistingSignal = {
  id: string;
  pair: string;
  direction: string;
  expiration: string;
  confidence: number;
  tier: string;
  isActive: boolean;
  scheduledAt: string | null;
};

type Counts = { otc: number; exchange: number; elite: number };

function todayUTC() {
  return new Date().toISOString().slice(0, 10);
}

function uid() {
  return Math.random().toString(36).slice(2);
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Spread `total` slots across [startH, endH) UTC hours, no two within 15 min. */
function generateTimeSlots(
  dateStr: string,
  total: number,
  startH = 8,
  endH = 22,
): string[] {
  if (total <= 0) return [];
  const windowMin = (endH - startH) * 60;
  const gap = Math.floor(windowMin / (total + 1));
  const slots: string[] = [];
  let cursor = startH * 60 + gap;
  for (let i = 0; i < total; i++) {
    const jitter = Math.floor(Math.random() * Math.min(gap / 2, 20)) - Math.min(gap / 4, 10);
    const totalMin = Math.min(Math.max(cursor + jitter, startH * 60), endH * 60 - 1);
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    const dt = new Date(`${dateStr}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00Z`);
    slots.push(dt.toISOString());
    cursor += gap;
  }
  return slots;
}

export function DayPlanPanel() {
  const [date, setDate] = useState(todayUTC());
  const [counts, setCounts] = useState<Counts>({ otc: 3, exchange: 2, elite: 1 });
  const [drafts, setDrafts] = useState<SlotDraft[]>([]);
  const [existing, setExisting] = useState<ExistingSignal[]>([]);
  const [assets, setAssets] = useState<AssetOption[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(true);
  const [loadingExisting, setLoadingExisting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load assets once
  useEffect(() => {
    void (async () => {
      const r = await fetch("/api/admin/assets", { cache: "no-store" });
      const j = (await r.json()) as { assets?: AssetOption[] };
      setAssets((j.assets ?? []).filter((a) => a.isActive));
      setLoadingAssets(false);
    })();
  }, []);

  const loadExisting = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoadingExisting(true);
      try {
        const r = await fetch(
          `/api/admin/signals/schedule-day?date=${date}`,
          { cache: "no-store" },
        );
        const j = (await r.json()) as { signals?: ExistingSignal[] };
        if (!cancelled) {
          setExisting(j.signals ?? []);
          setLoadingExisting(false);
        }
      } catch {
        if (!cancelled) setLoadingExisting(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [date, refreshKey]);

  function assetsByTier(tier: "otc" | "exchange" | "elite") {
    return assets.filter((a) => a.signalTier === tier);
  }

  function fallbackPair(tier: "otc" | "exchange" | "elite") {
    const list = assetsByTier(tier);
    const fallbacks: Record<string, string> = { otc: "EUR/USD (OTC)", exchange: "EUR/USD", elite: "BTC/USD" };
    return list.length > 0 ? randomItem(list).symbol : fallbacks[tier];
  }

  function generate() {
    const totalSlots = counts.otc + counts.exchange + counts.elite;
    if (totalSlots === 0) return;

    // Build ordered tier list (spread interleaved)
    const tiers: Array<"otc" | "exchange" | "elite"> = [];
    for (let i = 0; i < Math.max(counts.otc, counts.exchange, counts.elite); i++) {
      if (i < counts.otc) tiers.push("otc");
      if (i < counts.exchange) tiers.push("exchange");
      if (i < counts.elite) tiers.push("elite");
    }

    const times = generateTimeSlots(date, tiers.length);
    const newDrafts: SlotDraft[] = tiers.map((tier, idx) => ({
      id: uid(),
      scheduledAt: times[idx] ?? new Date(`${date}T12:00:00Z`).toISOString(),
      pair: fallbackPair(tier),
      direction: Math.random() > 0.5 ? "CALL" : "PUT",
      expiration: randomItem(["2m", "3m", "5m"] as const),
      confidence: Math.floor(Math.random() * 16) + 80, // 80-95
      tier,
      type: "ai",
      analysis: "",
    }));

    // Sort by time
    newDrafts.sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
    setDrafts(newDrafts);
    setError(null);
  }

  function updateDraft(id: string, patch: Partial<SlotDraft>) {
    setDrafts((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  }

  function removeDraft(id: string) {
    setDrafts((prev) => prev.filter((d) => d.id !== id));
  }

  async function save() {
    if (drafts.length === 0) return;
    setSaving(true);
    setError(null);
    setSavedMsg(null);

    const slots = drafts.map((d) => ({
      scheduledAt: d.scheduledAt,
      pair: d.pair,
      direction: d.direction,
      expiration: d.expiration,
      confidence: d.confidence,
      tier: d.tier,
      type: d.type,
      analysis: d.analysis || null,
    }));

    const r = await fetch("/api/admin/signals/schedule-day", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ slots }),
    });
    const j = (await r.json()) as { ok?: boolean; error?: string; created?: number };
    setSaving(false);
    if (!r.ok || !j.ok) {
      setError(j.error ?? `Ошибка ${r.status}`);
      return;
    }
    setSavedMsg(`Запланировано ${j.created} сигналов`);
    setDrafts([]);
    loadExisting();
    setTimeout(() => setSavedMsg(null), 3000);
  }

  function formatTime(iso: string) {
    try {
      return new Date(iso).toISOString().slice(11, 16) + " UTC";
    } catch {
      return iso;
    }
  }

  const TIER_COLOR: Record<string, string> = {
    otc: "#6b7280",
    exchange: "#3b82f6",
    elite: "#f5c518",
  };
  const TIER_LABEL: Record<string, string> = {
    otc: "OTC",
    exchange: "Биржа",
    elite: "Elite",
  };

  return (
    <div className="space-y-5">
      {/* ── Header row ── */}
      <div className="rounded-2xl border border-white/[0.07] bg-[#0d0d18] p-5 space-y-5">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <CalendarDays size={18} className="text-[#f5c518]" />
            День-план
          </h2>
          <p className="text-xs text-[#777] mt-0.5">
            Выбери дату и количество сигналов. Сгенерируй слоты, отредактируй при
            необходимости — бот опубликует их ровно в назначенное время.
          </p>
        </div>

        {/* Date + counts */}
        <div className="flex flex-wrap gap-4 items-end">
          <label className="text-xs text-[#777] flex flex-col gap-1">
            Дата (UTC)
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={FIELD + " w-40"}
            />
          </label>

          {(["otc", "exchange", "elite"] as const).map((band) => (
            <label key={band} className="text-xs text-[#777] flex flex-col gap-1">
              <span style={{ color: TIER_COLOR[band] }}>{TIER_LABEL[band]} сигналов</span>
              <input
                type="number"
                min={0}
                max={20}
                value={counts[band]}
                onChange={(e) =>
                  setCounts((c) => ({ ...c, [band]: Math.max(0, Number(e.target.value)) }))
                }
                className={FIELD + " w-24"}
              />
            </label>
          ))}

          <button
            onClick={generate}
            disabled={loadingAssets || counts.otc + counts.exchange + counts.elite === 0}
            className="inline-flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-medium bg-[#f5c518] text-[#1a1208] disabled:opacity-40"
          >
            {loadingAssets ? <Loader2 size={13} className="animate-spin" /> : <Wand2 size={13} />}
            Сгенерировать слоты
          </button>
        </div>

        {error && (
          <div className="px-3 py-2 rounded-lg text-xs border border-red-500/30 bg-red-500/10 text-red-400">
            {error}
          </div>
        )}
        {savedMsg && (
          <div className="px-3 py-2 rounded-lg text-xs border border-green-500/30 bg-green-500/10 text-green-400 flex items-center gap-1.5">
            <CheckCircle2 size={12} /> {savedMsg}
          </div>
        )}
      </div>

      {/* ── Draft slots editor ── */}
      {drafts.length > 0 && (
        <div className="rounded-2xl border border-white/[0.07] bg-[#0d0d18] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">
              Черновик расписания ({drafts.length} слотов)
            </h3>
            <button
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-semibold bg-[#f5c518] text-[#1a1208] disabled:opacity-40"
            >
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
              Запланировать день
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-[#555] border-b border-white/[0.05]">
                  <th className="text-left pb-2 pr-3 font-medium">Время UTC</th>
                  <th className="text-left pb-2 pr-3 font-medium">Пара</th>
                  <th className="text-left pb-2 pr-3 font-medium">Направление</th>
                  <th className="text-left pb-2 pr-3 font-medium">Эксп.</th>
                  <th className="text-left pb-2 pr-3 font-medium">Тир</th>
                  <th className="text-left pb-2 pr-3 font-medium">Увер.</th>
                  <th className="pb-2 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {drafts.map((d) => {
                  const timeVal = d.scheduledAt.slice(11, 16);
                  const pairOpts = assets.filter((a) => a.signalTier === d.tier);
                  return (
                    <tr key={d.id} className="hover:bg-white/[0.02]">
                      <td className="py-2 pr-3">
                        <input
                          type="time"
                          value={timeVal}
                          onChange={(e) => {
                            const [h, m] = e.target.value.split(":");
                            const dt = new Date(`${date}T${h}:${m}:00Z`);
                            updateDraft(d.id, { scheduledAt: dt.toISOString() });
                          }}
                          className="h-8 px-2 rounded-lg bg-[#0a0a13] border border-white/[0.08] text-white text-xs outline-none"
                        />
                      </td>
                      <td className="py-2 pr-3">
                        {pairOpts.length > 0 ? (
                          <select
                            value={d.pair}
                            onChange={(e) => updateDraft(d.id, { pair: e.target.value })}
                            className="h-8 px-2 rounded-lg bg-[#0a0a13] border border-white/[0.08] text-white text-xs outline-none"
                          >
                            {pairOpts.map((a) => (
                              <option key={a.symbol} value={a.symbol}>
                                {a.symbol}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            value={d.pair}
                            onChange={(e) => updateDraft(d.id, { pair: e.target.value })}
                            className="h-8 px-2 w-32 rounded-lg bg-[#0a0a13] border border-white/[0.08] text-white text-xs outline-none"
                          />
                        )}
                      </td>
                      <td className="py-2 pr-3">
                        <select
                          value={d.direction}
                          onChange={(e) =>
                            updateDraft(d.id, { direction: e.target.value as "CALL" | "PUT" })
                          }
                          className="h-8 px-2 rounded-lg bg-[#0a0a13] border border-white/[0.08] text-white text-xs outline-none"
                        >
                          <option value="CALL">CALL ▲</option>
                          <option value="PUT">PUT ▼</option>
                        </select>
                      </td>
                      <td className="py-2 pr-3">
                        <select
                          value={d.expiration}
                          onChange={(e) => updateDraft(d.id, { expiration: e.target.value })}
                          className="h-8 px-2 rounded-lg bg-[#0a0a13] border border-white/[0.08] text-white text-xs outline-none"
                        >
                          {EXPIRATIONS.map((ex) => (
                            <option key={ex} value={ex}>
                              {ex}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2 pr-3">
                        <span
                          className="px-2 py-0.5 rounded-md text-[10px] font-semibold"
                          style={{
                            background: TIER_COLOR[d.tier] + "22",
                            color: TIER_COLOR[d.tier],
                          }}
                        >
                          {TIER_LABEL[d.tier]}
                        </span>
                      </td>
                      <td className="py-2 pr-3">
                        <input
                          type="number"
                          min={50}
                          max={100}
                          value={d.confidence}
                          onChange={(e) =>
                            updateDraft(d.id, { confidence: Number(e.target.value) })
                          }
                          className="h-8 px-2 w-16 rounded-lg bg-[#0a0a13] border border-white/[0.08] text-white text-xs outline-none"
                        />
                        <span className="text-[#555] ml-1">%</span>
                      </td>
                      <td className="py-2">
                        <button
                          onClick={() => removeDraft(d.id)}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 text-[#555] hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Existing scheduled signals ── */}
      <div className="rounded-2xl border border-white/[0.07] bg-[#0d0d18] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Clock size={14} className="text-[#777]" />
            Расписание на {date}
          </h3>
          <button
            onClick={() => loadExisting()}
            className="p-1.5 rounded-lg hover:bg-white/[0.05] text-[#555] hover:text-white transition-colors"
          >
            {loadingExisting ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <RefreshCw size={13} />
            )}
          </button>
        </div>

        {loadingExisting ? (
          <div className="flex items-center gap-2 text-xs text-[#555]">
            <Loader2 size={12} className="animate-spin" /> Загрузка…
          </div>
        ) : existing.length === 0 ? (
          <p className="text-xs text-[#555]">Нет запланированных сигналов на эту дату.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-[#555] border-b border-white/[0.05]">
                  <th className="text-left pb-2 pr-3 font-medium">Время UTC</th>
                  <th className="text-left pb-2 pr-3 font-medium">Пара</th>
                  <th className="text-left pb-2 pr-3 font-medium">Направление</th>
                  <th className="text-left pb-2 pr-3 font-medium">Эксп.</th>
                  <th className="text-left pb-2 pr-3 font-medium">Тир</th>
                  <th className="text-left pb-2 pr-3 font-medium">Увер.</th>
                  <th className="text-left pb-2 font-medium">Статус</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {existing.map((s) => (
                  <tr key={s.id} className="hover:bg-white/[0.02]">
                    <td className="py-2 pr-3 font-mono text-[#aaa]">
                      {s.scheduledAt ? formatTime(s.scheduledAt) : "—"}
                    </td>
                    <td className="py-2 pr-3 font-medium text-white">{s.pair}</td>
                    <td className="py-2 pr-3">
                      {s.direction === "CALL" ? (
                        <span className="inline-flex items-center gap-1 text-green-400">
                          <TrendingUp size={11} /> CALL
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-400">
                          <TrendingDown size={11} /> PUT
                        </span>
                      )}
                    </td>
                    <td className="py-2 pr-3 text-[#aaa]">{s.expiration}</td>
                    <td className="py-2 pr-3">
                      <span
                        className="px-2 py-0.5 rounded-md text-[10px] font-semibold"
                        style={{
                          background: (TIER_COLOR[s.tier] ?? "#6b7280") + "22",
                          color: TIER_COLOR[s.tier] ?? "#6b7280",
                        }}
                      >
                        {TIER_LABEL[s.tier] ?? s.tier}
                      </span>
                    </td>
                    <td className="py-2 pr-3 text-[#aaa]">{s.confidence}%</td>
                    <td className="py-2">
                      {s.isActive ? (
                        <span className="inline-flex items-center gap-1 text-green-400">
                          <CheckCircle2 size={11} /> Опубликован
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[#f5c518]">
                          <Clock size={11} /> Ожидает
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
