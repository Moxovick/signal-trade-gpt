"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Save, X, Gift } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { TierBadge } from "@/components/ui/TierBadge";

type Prize = {
  id: string;
  tier: number;
  position: number;
  minDeposit: string | number;
  title: string;
  description: string;
  valueLabel: string;
  imageUrl: string | null;
  isActive: boolean;
};

const TIER_NAME: Record<number, string> = {
  1: "T1 Starter",
  2: "T2 Active",
  3: "T3 Pro",
  4: "T4 VIP",
};

export default function AdminGiveawayPage() {
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Prize | null>(null);
  const [creating, setCreating] = useState(false);

  async function load() {
    setLoading(true);
    const r = await fetch("/api/admin/prizes");
    const j = await r.json();
    setPrizes(j.prizes ?? []);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  async function save(data: Partial<Prize>) {
    const url = editing ? `/api/admin/prizes/${editing.id}` : "/api/admin/prizes";
    const method = editing ? "PATCH" : "POST";
    await fetch(url, {
      method,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
    });
    setEditing(null);
    setCreating(false);
    load();
  }

  async function remove(id: string) {
    if (!confirm("Удалить приз?")) return;
    await fetch(`/api/admin/prizes/${id}`, { method: "DELETE" });
    load();
  }

  const grouped = new Map<number, Prize[]>();
  for (const p of prizes) {
    if (!grouped.has(p.tier)) grouped.set(p.tier, []);
    grouped.get(p.tier)!.push(p);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Розыгрыш — призы</h1>
          <p className="text-sm text-[var(--t-3)] mt-1">
            Каждый приз привязан к тиру + минимальному депозиту. Видно на /giveaway.
          </p>
        </div>
        <button
          onClick={() => {
            setCreating(true);
            setEditing(null);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--brand-gold)] text-[var(--bg-0)] font-semibold hover:opacity-90"
        >
          <Plus size={16} /> Новый приз
        </button>
      </div>

      {(creating || editing) && (
        <PrizeForm
          initial={editing}
          onCancel={() => {
            setEditing(null);
            setCreating(false);
          }}
          onSave={save}
        />
      )}

      {loading ? (
        <div className="text-[var(--t-3)] text-center py-12">Загрузка…</div>
      ) : (
        [...grouped.entries()]
          .sort(([a], [b]) => a - b)
          .map(([tier, items]) => (
            <div key={tier}>
              <div className="flex items-center gap-3 mb-3">
                <TierBadge tier={tier} size="sm" />
                <span className="text-sm text-[var(--t-2)]">{TIER_NAME[tier] ?? `T${tier}`}</span>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {items.map((p) => (
                  <Card key={p.id} padding="md">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0"
                          style={{
                            background: "rgba(212, 160, 23, 0.08)",
                            border: "1px solid var(--b-soft)",
                          }}
                        >
                          <Gift size={18} className="text-[var(--brand-gold)]" />
                        </div>
                        <div>
                          <div className="font-semibold">{p.title}</div>
                          <div
                            className="text-xs text-[var(--brand-gold)]"
                            style={{ fontFamily: "var(--font-jetbrains)" }}
                          >
                            {p.valueLabel}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-[var(--t-3)] text-right">
                        от ${Number(p.minDeposit).toLocaleString()}
                      </div>
                    </div>
                    <p className="text-sm text-[var(--t-2)] line-clamp-2">{p.description}</p>
                    <div className="mt-4 pt-3 border-t border-[var(--b-soft)] flex items-center gap-2">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                          p.isActive
                            ? "bg-[rgba(142,224,107,0.12)] text-[#8ee06b]"
                            : "bg-[var(--bg-2)] text-[var(--t-3)]"
                        }`}
                      >
                        {p.isActive ? "Active" : "Hidden"}
                      </span>
                      <span className="text-xs text-[var(--t-3)]">#{p.position}</span>
                      <div className="ml-auto flex gap-1">
                        <button
                          onClick={() => {
                            setEditing(p);
                            setCreating(false);
                          }}
                          className="text-xs px-3 py-1 rounded-lg bg-[var(--bg-2)] hover:bg-[var(--bg-3)]"
                        >
                          Изменить
                        </button>
                        <button
                          onClick={() => remove(p.id)}
                          className="text-xs p-1.5 rounded-lg bg-[var(--bg-2)] hover:bg-[#ff6b3d20] hover:text-[#ff6b3d]"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))
      )}
    </div>
  );
}

function PrizeForm({
  initial,
  onCancel,
  onSave,
}: {
  initial: Prize | null;
  onCancel: () => void;
  onSave: (data: Partial<Prize>) => void;
}) {
  const [tier, setTier] = useState(initial?.tier ?? 1);
  const [position, setPosition] = useState(initial?.position ?? 0);
  const [minDeposit, setMinDeposit] = useState(
    initial?.minDeposit ? Number(initial.minDeposit) : 100,
  );
  const [title, setTitle] = useState(initial?.title ?? "");
  const [valueLabel, setValueLabel] = useState(initial?.valueLabel ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);

  return (
    <Card padding="lg">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold">
          {initial ? "Редактирование приза" : "Новый приз"}
        </h2>
        <button onClick={onCancel} className="text-[var(--t-3)] hover:text-[var(--t-1)]">
          <X size={18} />
        </button>
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Название">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[var(--bg-2)] border border-[var(--b-soft)] rounded-lg px-3 py-2 outline-none focus:border-[var(--brand-gold)]"
            />
          </Field>
          <Field label='Лейбл ценности (напр. "$50 USDT")'>
            <input
              value={valueLabel}
              onChange={(e) => setValueLabel(e.target.value)}
              className="w-full bg-[var(--bg-2)] border border-[var(--b-soft)] rounded-lg px-3 py-2 outline-none focus:border-[var(--brand-gold)]"
            />
          </Field>
        </div>
        <Field label="Описание">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full bg-[var(--bg-2)] border border-[var(--b-soft)] rounded-lg px-3 py-2 outline-none focus:border-[var(--brand-gold)] resize-none"
          />
        </Field>
        <div className="grid grid-cols-4 gap-4">
          <Field label="Тир (1-4)">
            <select
              value={tier}
              onChange={(e) => setTier(Number(e.target.value))}
              className="w-full bg-[var(--bg-2)] border border-[var(--b-soft)] rounded-lg px-3 py-2 outline-none focus:border-[var(--brand-gold)]"
            >
              {[1, 2, 3, 4].map((t) => (
                <option key={t} value={t}>
                  {TIER_NAME[t]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Мин. депозит, $">
            <input
              type="number"
              value={minDeposit}
              onChange={(e) => setMinDeposit(Number(e.target.value))}
              className="w-full bg-[var(--bg-2)] border border-[var(--b-soft)] rounded-lg px-3 py-2 outline-none focus:border-[var(--brand-gold)]"
            />
          </Field>
          <Field label="Позиция">
            <input
              type="number"
              value={position}
              onChange={(e) => setPosition(Number(e.target.value))}
              className="w-full bg-[var(--bg-2)] border border-[var(--b-soft)] rounded-lg px-3 py-2 outline-none focus:border-[var(--brand-gold)]"
            />
          </Field>
          <Field label="Активен">
            <label className="flex items-center gap-2 px-3 py-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              <span className="text-sm">Виден</span>
            </label>
          </Field>
        </div>
        <div className="flex gap-2 pt-2">
          <button
            onClick={() =>
              onSave({
                tier,
                position,
                minDeposit: minDeposit as never,
                title,
                valueLabel,
                description,
                isActive,
              })
            }
            disabled={!title || !valueLabel || !description}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--brand-gold)] text-[var(--bg-0)] font-semibold hover:opacity-90 disabled:opacity-50"
          >
            <Save size={16} /> Сохранить
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl bg-[var(--bg-2)] hover:bg-[var(--bg-3)]"
          >
            Отмена
          </button>
        </div>
      </div>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-widest text-[var(--t-3)] mb-1.5 block">
        {label}
      </span>
      {children}
    </label>
  );
}
