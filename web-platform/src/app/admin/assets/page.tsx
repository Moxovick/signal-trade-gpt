"use client";

/**
 * Admin · Asset whitelist (CRUD).
 *
 * Manages the master list of tradable PocketOption pairs. Drives:
 *   • Signal publisher (admin selects pair from Active assets)
 *   • Per-pair behaviour: OTC = no chart, real = chart from `provider`
 */
import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Save, X, Power, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/Card";

type Asset = {
  id: string;
  symbol: string;
  displaySymbol: string;
  category: "currency" | "crypto" | "commodity" | "stock" | "index";
  isOtc: boolean;
  payoutPct: number;
  signalTier: "otc" | "exchange" | "elite";
  provider: "none" | "twelvedata" | "binance" | "yahoo";
  providerSymbol: string | null;
  position: number;
  isActive: boolean;
};

type Draft = {
  id: string | null;
  symbol: string;
  displaySymbol: string;
  category: Asset["category"];
  isOtc: boolean;
  payoutPct: number;
  signalTier: Asset["signalTier"];
  provider: Asset["provider"];
  providerSymbol: string;
  position: number;
  isActive: boolean;
};

const EMPTY: Draft = {
  id: null,
  symbol: "",
  displaySymbol: "",
  category: "currency",
  isOtc: true,
  payoutPct: 80,
  signalTier: "otc",
  provider: "none",
  providerSymbol: "",
  position: 999,
  isActive: true,
};

const CAT_LABEL: Record<Asset["category"], string> = {
  currency: "Валюты",
  crypto: "Крипта",
  commodity: "Сырьевые",
  stock: "Акции",
  index: "Индексы",
};

const TIER_LABEL: Record<Asset["signalTier"], string> = {
  otc: "OTC (T1+)",
  exchange: "Биржа (T2+)",
  elite: "Elite (T3+)",
};

export default function AdminAssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | Asset["category"]>("all");

  async function load() {
    setLoading(true);
    const r = await fetch("/api/admin/assets", { cache: "no-store" });
    const j = (await r.json()) as { assets?: Asset[] };
    setAssets(j.assets ?? []);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, []);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return assets.filter((a) => {
      if (filter !== "all" && a.category !== filter) return false;
      if (!s) return true;
      return (
        a.symbol.toLowerCase().includes(s) ||
        a.displaySymbol.toLowerCase().includes(s)
      );
    });
  }, [assets, search, filter]);

  function openCreate() {
    setDraft({ ...EMPTY });
    setError(null);
  }

  function openEdit(a: Asset) {
    setDraft({
      id: a.id,
      symbol: a.symbol,
      displaySymbol: a.displaySymbol,
      category: a.category,
      isOtc: a.isOtc,
      payoutPct: a.payoutPct,
      signalTier: a.signalTier,
      provider: a.provider,
      providerSymbol: a.providerSymbol ?? "",
      position: a.position,
      isActive: a.isActive,
    });
    setError(null);
  }

  async function save() {
    if (!draft) return;
    setBusy(true);
    setError(null);
    const payload = {
      symbol: draft.symbol.trim(),
      displaySymbol: draft.displaySymbol.trim(),
      category: draft.category,
      isOtc: draft.isOtc,
      payoutPct: draft.payoutPct,
      signalTier: draft.signalTier,
      provider: draft.provider,
      providerSymbol: draft.providerSymbol.trim() || null,
      position: draft.position,
      isActive: draft.isActive,
    };
    const url = draft.id ? `/api/admin/assets/${draft.id}` : "/api/admin/assets";
    const method = draft.id ? "PATCH" : "POST";
    const r = await fetch(url, {
      method,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!r.ok) {
      const j = (await r.json().catch(() => ({}))) as { error?: string };
      setError(j.error ?? `Ошибка ${r.status}`);
      setBusy(false);
      return;
    }
    setDraft(null);
    setBusy(false);
    void load();
  }

  async function toggle(a: Asset) {
    await fetch(`/api/admin/assets/${a.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ isActive: !a.isActive }),
    });
    void load();
  }

  async function remove(a: Asset) {
    if (!confirm(`Удалить «${a.symbol}»? Сигналы по этому ассету продолжат существовать, но новые создавать будет нельзя.`))
      return;
    await fetch(`/api/admin/assets/${a.id}`, { method: "DELETE" });
    void load();
  }

  async function reseed() {
    setBusy(true);
    const r = await fetch("/api/admin/assets?action=seed", { method: "POST" });
    const j = (await r.json()) as { inserted?: number };
    alert(`Пересеяно. Добавлено новых: ${j.inserted ?? 0}`);
    setBusy(false);
    void load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Активы (PocketOption пары)</h1>
          <p className="text-sm text-[var(--t-3)] mt-1">
            Всего: {assets.length} · {assets.filter((a) => a.isActive).length} активных ·
            {" "}OTC: {assets.filter((a) => a.isOtc).length} ·
            {" "}Реал: {assets.filter((a) => !a.isOtc).length}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={reseed}
            disabled={busy}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--b-soft)] hover:bg-[var(--bg-2)] text-sm"
          >
            <RefreshCw size={14} /> Пересеять из списка
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--brand-gold)] text-[#1a1208] font-semibold hover:bg-[var(--brand-gold-bright)]"
          >
            <Plus size={16} /> Добавить актив
          </button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap items-center">
        <input
          placeholder="Поиск по символу…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 rounded-xl border border-[var(--b-soft)] bg-[var(--bg-2)] text-sm"
        />
        <div className="flex gap-1">
          {(["all", "currency", "crypto", "commodity", "stock", "index"] as const).map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                filter === c
                  ? "bg-[var(--brand-gold)] text-[#1a1208] border-transparent"
                  : "border-[var(--b-soft)] text-[var(--t-2)] hover:bg-[var(--bg-2)]"
              }`}
            >
              {c === "all" ? "Все" : CAT_LABEL[c as Asset["category"]]}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Card padding="lg">
          <div className="text-[var(--t-3)] text-sm">Загружаем…</div>
        </Card>
      ) : (
        <Card padding="md">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[var(--t-3)] text-[11px] uppercase tracking-wider">
                  <th className="px-2 py-2">Символ</th>
                  <th className="px-2 py-2">Имя</th>
                  <th className="px-2 py-2">Кат.</th>
                  <th className="px-2 py-2">OTC</th>
                  <th className="px-2 py-2">Выплата</th>
                  <th className="px-2 py-2">Sig.tier</th>
                  <th className="px-2 py-2">Провайдер</th>
                  <th className="px-2 py-2 text-right">Действия</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr
                    key={a.id}
                    className={`border-t border-[var(--b-soft)] ${a.isActive ? "" : "opacity-50"}`}
                  >
                    <td className="px-2 py-2 font-mono text-[12px]">{a.symbol}</td>
                    <td className="px-2 py-2">{a.displaySymbol}</td>
                    <td className="px-2 py-2 text-[var(--t-3)]">{CAT_LABEL[a.category]}</td>
                    <td className="px-2 py-2">
                      {a.isOtc ? (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-2)] text-[var(--t-2)]">
                          OTC
                        </span>
                      ) : (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[rgba(142,224,107,0.12)] text-[var(--green)]">
                          Реал
                        </span>
                      )}
                    </td>
                    <td className="px-2 py-2 tabular-nums font-semibold text-[var(--brand-gold)]">
                      +{a.payoutPct}%
                    </td>
                    <td className="px-2 py-2 text-[var(--t-3)] text-[12px]">{TIER_LABEL[a.signalTier]}</td>
                    <td className="px-2 py-2 text-[var(--t-3)] text-[12px]">
                      {a.provider === "none" ? "—" : `${a.provider}${a.providerSymbol ? ` · ${a.providerSymbol}` : ""}`}
                    </td>
                    <td className="px-2 py-2 text-right whitespace-nowrap">
                      <button
                        onClick={() => toggle(a)}
                        className={`p-1.5 rounded-lg hover:bg-[var(--bg-2)] ${
                          a.isActive ? "text-[var(--green)]" : "text-[var(--t-3)]"
                        }`}
                        title={a.isActive ? "Выключить" : "Включить"}
                      >
                        <Power size={14} />
                      </button>
                      <button
                        onClick={() => openEdit(a)}
                        className="p-1.5 rounded-lg hover:bg-[var(--bg-2)] text-[var(--t-2)]"
                        title="Редактировать"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => remove(a)}
                        className="p-1.5 rounded-lg hover:bg-[var(--bg-2)] text-[var(--red)]"
                        title="Удалить"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center text-[var(--t-3)] py-6">
                      Ничего не найдено.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {draft !== null && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <Card padding="lg" className="max-w-2xl w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                {draft.id ? "Редактировать актив" : "Новый актив"}
              </h2>
              <button
                onClick={() => setDraft(null)}
                className="p-1 hover:bg-[var(--bg-2)] rounded-lg"
              >
                <X size={18} />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] text-[var(--t-3)]">Symbol (uniq, e.g. EUR/USD OTC)</label>
                <input
                  value={draft.symbol}
                  onChange={(e) => setDraft({ ...draft, symbol: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-[var(--b-soft)] bg-[var(--bg-2)] text-sm font-mono"
                />
              </div>
              <div>
                <label className="text-[12px] text-[var(--t-3)]">Display name</label>
                <input
                  value={draft.displaySymbol}
                  onChange={(e) => setDraft({ ...draft, displaySymbol: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-[var(--b-soft)] bg-[var(--bg-2)] text-sm"
                />
              </div>
              <div>
                <label className="text-[12px] text-[var(--t-3)]">Категория</label>
                <select
                  value={draft.category}
                  onChange={(e) => setDraft({ ...draft, category: e.target.value as Asset["category"] })}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-[var(--b-soft)] bg-[var(--bg-2)] text-sm"
                >
                  {Object.entries(CAT_LABEL).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[12px] text-[var(--t-3)]">Signal tier (доступ)</label>
                <select
                  value={draft.signalTier}
                  onChange={(e) => setDraft({ ...draft, signalTier: e.target.value as Asset["signalTier"] })}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-[var(--b-soft)] bg-[var(--bg-2)] text-sm"
                >
                  {Object.entries(TIER_LABEL).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[12px] text-[var(--t-3)]">Выплата %</label>
                <input
                  type="number"
                  value={draft.payoutPct}
                  onChange={(e) => setDraft({ ...draft, payoutPct: Number(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-[var(--b-soft)] bg-[var(--bg-2)] text-sm"
                />
              </div>
              <div>
                <label className="text-[12px] text-[var(--t-3)]">Position (sort)</label>
                <input
                  type="number"
                  value={draft.position}
                  onChange={(e) => setDraft({ ...draft, position: Number(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-[var(--b-soft)] bg-[var(--bg-2)] text-sm"
                />
              </div>
              <div>
                <label className="text-[12px] text-[var(--t-3)]">Провайдер графика</label>
                <select
                  value={draft.provider}
                  onChange={(e) => setDraft({ ...draft, provider: e.target.value as Asset["provider"] })}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-[var(--b-soft)] bg-[var(--bg-2)] text-sm"
                >
                  <option value="none">none (нет графика)</option>
                  <option value="twelvedata">TwelveData</option>
                  <option value="binance">Binance</option>
                  <option value="yahoo">Yahoo Finance</option>
                </select>
              </div>
              <div>
                <label className="text-[12px] text-[var(--t-3)]">
                  Provider symbol (e.g. BTCUSDT, AAPL, EUR/USD)
                </label>
                <input
                  value={draft.providerSymbol}
                  onChange={(e) => setDraft({ ...draft, providerSymbol: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-[var(--b-soft)] bg-[var(--bg-2)] text-sm font-mono"
                />
              </div>
              <label className="flex items-center gap-2 text-sm md:col-span-1">
                <input
                  type="checkbox"
                  checked={draft.isOtc}
                  onChange={(e) => setDraft({ ...draft, isOtc: e.target.checked })}
                />
                Это OTC (синтетика, без графика)
              </label>
              <label className="flex items-center gap-2 text-sm md:col-span-1">
                <input
                  type="checkbox"
                  checked={draft.isActive}
                  onChange={(e) => setDraft({ ...draft, isActive: e.target.checked })}
                />
                Активен (показывается в публикаторе)
              </label>
            </div>

            {error && (
              <div className="mt-3 px-3 py-2 rounded-xl bg-[rgba(229,72,77,0.12)] text-[var(--red)] text-sm">
                {error}
              </div>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setDraft(null)}
                className="px-4 py-2 rounded-xl border border-[var(--b-soft)] text-sm hover:bg-[var(--bg-2)]"
              >
                Отмена
              </button>
              <button
                disabled={busy}
                onClick={save}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--brand-gold)] text-[#1a1208] font-semibold hover:bg-[var(--brand-gold-bright)] disabled:opacity-50"
              >
                <Save size={14} /> Сохранить
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
