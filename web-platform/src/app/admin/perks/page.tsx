"use client";

/**
 * Admin · BotPerk catalogue (CRUD).
 *
 * Each perk binds a `code` (consumed by bot/web) to a min-tier and an
 * arbitrary JSON config. Admin can create/edit/delete/toggle perks at runtime
 * without redeploying.
 */
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Save, X, Power } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { TierBadge } from "@/components/ui/TierBadge";

type Perk = {
  id: string;
  code: string;
  name: string;
  description: string;
  minTier: number;
  config: unknown;
  isActive: boolean;
};

type Draft = {
  id: string | null;
  code: string;
  name: string;
  description: string;
  minTier: number;
  configJson: string;
  isActive: boolean;
};

const EMPTY: Draft = {
  id: null,
  code: "",
  name: "",
  description: "",
  minTier: 1,
  configJson: "{}",
  isActive: true,
};

export default function AdminPerksPage() {
  const [perks, setPerks] = useState<Perk[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const r = await fetch("/api/admin/perks", { cache: "no-store" });
    const j = (await r.json()) as { perks?: Perk[] };
    setPerks(j.perks ?? []);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, []);

  function openCreate() {
    setDraft({ ...EMPTY });
    setError(null);
  }

  function openEdit(p: Perk) {
    setDraft({
      id: p.id,
      code: p.code,
      name: p.name,
      description: p.description ?? "",
      minTier: p.minTier,
      configJson: JSON.stringify(p.config ?? {}, null, 2),
      isActive: p.isActive,
    });
    setError(null);
  }

  async function save() {
    if (!draft) return;
    setBusy(true);
    setError(null);
    let cfg: unknown;
    try {
      cfg = draft.configJson.trim() ? JSON.parse(draft.configJson) : {};
    } catch {
      setBusy(false);
      setError("Config — невалидный JSON.");
      return;
    }
    const payload = {
      code: draft.code.trim(),
      name: draft.name.trim(),
      description: draft.description.trim(),
      minTier: draft.minTier,
      config: cfg,
      isActive: draft.isActive,
    };
    const url = draft.id ? `/api/admin/perks/${draft.id}` : "/api/admin/perks";
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

  async function toggleActive(p: Perk) {
    await fetch(`/api/admin/perks/${p.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ isActive: !p.isActive }),
    });
    void load();
  }

  async function remove(p: Perk) {
    if (!confirm(`Удалить перк «${p.name}» (${p.code})?`)) return;
    await fetch(`/api/admin/perks/${p.id}`, { method: "DELETE" });
    void load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Перки бота</h1>
          <p className="text-sm text-[var(--t-3)] mt-1">
            Всего: {perks.length} · {perks.filter((p) => p.isActive).length} активных
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--brand-gold)] text-[#1a1208] font-semibold hover:bg-[var(--brand-gold-bright)]"
        >
          <Plus size={16} /> Создать перк
        </button>
      </div>

      {loading ? (
        <Card padding="lg">
          <div className="text-[var(--t-3)] text-sm">Загружаем…</div>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {perks.map((p) => (
            <Card key={p.id} padding="lg">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <h3 className="font-semibold text-lg truncate">{p.name}</h3>
                  <code
                    className="text-xs text-[var(--t-3)]"
                    style={{ fontFamily: "var(--font-jetbrains)" }}
                  >
                    {p.code}
                  </code>
                </div>
                <TierBadge tier={p.minTier} size="sm" />
              </div>
              <p className="text-sm text-[var(--t-2)] mb-4 min-h-[2.5em]">
                {p.description || "—"}
              </p>
              <pre
                className="text-xs text-[var(--t-3)] bg-[var(--bg-2)] rounded-md p-2 overflow-x-auto mb-3"
                style={{ fontFamily: "var(--font-jetbrains)" }}
              >
                {JSON.stringify(p.config ?? {}, null, 0)}
              </pre>
              <div className="flex items-center justify-between text-xs">
                <button
                  onClick={() => toggleActive(p)}
                  className={`inline-flex items-center gap-1 ${
                    p.isActive ? "text-[var(--green)]" : "text-[var(--t-3)]"
                  } hover:underline`}
                  title="Переключить активность"
                >
                  <Power size={14} /> {p.isActive ? "active" : "off"}
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(p)}
                    className="inline-flex items-center gap-1 text-[var(--t-2)] hover:text-[var(--brand-gold)]"
                  >
                    <Pencil size={14} /> Edit
                  </button>
                  <button
                    onClick={() => remove(p)}
                    className="inline-flex items-center gap-1 text-[var(--red)] hover:underline"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            </Card>
          ))}
          {perks.length === 0 ? (
            <Card padding="lg" className="md:col-span-2 text-center">
              <div className="text-[var(--t-3)] text-sm py-6">
                Перков пока нет. Нажми «Создать перк» — опубликуй привилегии,
                которые откроет тир.
              </div>
            </Card>
          ) : null}
        </div>
      )}

      {draft ? (
        <PerkEditor
          draft={draft}
          setDraft={setDraft}
          onSave={save}
          onClose={() => setDraft(null)}
          busy={busy}
          error={error}
        />
      ) : null}
    </div>
  );
}

function PerkEditor({
  draft,
  setDraft,
  onSave,
  onClose,
  busy,
  error,
}: {
  draft: Draft;
  setDraft: (d: Draft) => void;
  onSave: () => void;
  onClose: () => void;
  busy: boolean;
  error: string | null;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-12 px-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-[var(--bg-1)] border border-[var(--b-soft)] rounded-2xl shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {draft.id ? "Редактировать перк" : "Новый перк"}
          </h2>
          <button onClick={onClose} className="text-[var(--t-3)] hover:text-[var(--t-1)]">
            <X size={20} />
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <Field label="Код (уникальный, A-Z_-)">
            <input
              type="text"
              value={draft.code}
              onChange={(e) => setDraft({ ...draft, code: e.target.value })}
              placeholder="early_access"
              className={INPUT}
            />
          </Field>
          <Field label="Минимальный тир">
            <select
              value={draft.minTier}
              onChange={(e) => setDraft({ ...draft, minTier: Number(e.target.value) })}
              className={INPUT}
            >
              {[0, 1, 2, 3, 4].map((t) => (
                <option key={t} value={t}>
                  T{t}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Название">
          <input
            type="text"
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            placeholder="Ранний доступ"
            className={INPUT}
          />
        </Field>

        <Field label="Описание">
          <textarea
            value={draft.description}
            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            placeholder="Сигналы приходят за 60 секунд до публичного релиза"
            rows={2}
            className={`${INPUT} h-auto py-2 resize-y`}
          />
        </Field>

        <Field label="Config (JSON)">
          <textarea
            value={draft.configJson}
            onChange={(e) => setDraft({ ...draft, configJson: e.target.value })}
            rows={5}
            spellCheck={false}
            className={`${INPUT} h-auto py-2 font-mono text-xs`}
            style={{ fontFamily: "var(--font-jetbrains)" }}
          />
        </Field>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={draft.isActive}
            onChange={(e) => setDraft({ ...draft, isActive: e.target.checked })}
          />
          Активен
        </label>

        {error ? (
          <div className="text-sm text-[var(--red)] bg-[var(--red)]/10 border border-[var(--red)]/30 rounded-lg px-3 py-2">
            {error}
          </div>
        ) : null}

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 h-10 rounded-full border border-[var(--b-soft)] text-[var(--t-2)] hover:text-[var(--t-1)]"
          >
            Отмена
          </button>
          <button
            onClick={onSave}
            disabled={busy || !draft.code || !draft.name}
            className="px-4 h-10 rounded-full bg-[var(--brand-gold)] text-[#1a1208] font-semibold hover:bg-[var(--brand-gold-bright)] disabled:opacity-50 inline-flex items-center gap-2"
          >
            <Save size={14} />
            {busy ? "Сохраняем…" : "Сохранить"}
          </button>
        </div>
      </div>
    </div>
  );
}

const INPUT =
  "w-full h-10 px-3 rounded-lg bg-[var(--bg-2)] border border-[var(--b-soft)] focus:border-[var(--brand-gold)] focus:outline-none text-sm";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-[0.18em] text-[var(--t-3)] mb-1 block">
        {label}
      </span>
      {children}
    </label>
  );
}
