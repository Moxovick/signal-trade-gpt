"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Save, X } from "lucide-react";
import { Card } from "@/components/ui/Card";

type Faq = {
  id: string;
  question: string;
  answer: string;
  category: string;
  position: number;
  isActive: boolean;
};

const CATEGORIES = [
  "registration",
  "promocode",
  "signals",
  "tiers",
  "referral",
  "giveaway",
  "general",
];

export default function AdminFaqPage() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Faq | null>(null);
  const [creating, setCreating] = useState(false);

  async function load() {
    setLoading(true);
    const r = await fetch("/api/admin/faq");
    const j = await r.json();
    setFaqs(j.faqs ?? []);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  async function save(data: Partial<Faq>) {
    if (editing) {
      await fetch(`/api/admin/faq/${editing.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      });
    } else {
      await fetch("/api/admin/faq", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      });
    }
    setEditing(null);
    setCreating(false);
    load();
  }

  async function remove(id: string) {
    if (!confirm("Удалить вопрос?")) return;
    await fetch(`/api/admin/faq/${id}`, { method: "DELETE" });
    load();
  }

  const grouped = new Map<string, Faq[]>();
  for (const f of faqs) {
    if (!grouped.has(f.category)) grouped.set(f.category, []);
    grouped.get(f.category)!.push(f);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Управление FAQ</h1>
          <p className="text-sm text-[var(--t-3)] mt-1">Всего: {faqs.length}</p>
        </div>
        <button
          onClick={() => {
            setCreating(true);
            setEditing(null);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--brand-gold)] text-[var(--bg-0)] font-semibold hover:opacity-90"
        >
          <Plus size={16} /> Новый вопрос
        </button>
      </div>

      {(creating || editing) && (
        <FaqForm
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
        [...grouped.entries()].map(([cat, items]) => (
          <div key={cat}>
            <div className="text-xs uppercase tracking-widest text-[var(--brand-gold)] mb-3">
              {cat}
            </div>
            <Card padding="none">
              {items.map((f, i) => (
                <div
                  key={f.id}
                  className={`px-5 py-4 flex items-start gap-4 ${
                    i < items.length - 1 ? "border-b border-[var(--b-soft)]" : ""
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{f.question}</p>
                    <p className="text-xs text-[var(--t-3)] mt-1 line-clamp-2">{f.answer}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-[var(--t-3)]">#{f.position}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        f.isActive
                          ? "bg-[rgba(142,224,107,0.12)] text-[#8ee06b]"
                          : "bg-[var(--bg-2)] text-[var(--t-3)]"
                      }`}
                    >
                      {f.isActive ? "Active" : "Hidden"}
                    </span>
                    <button
                      onClick={() => {
                        setEditing(f);
                        setCreating(false);
                      }}
                      className="text-xs px-3 py-1 rounded-lg bg-[var(--bg-2)] hover:bg-[var(--bg-3)]"
                    >
                      Изменить
                    </button>
                    <button
                      onClick={() => remove(f.id)}
                      className="text-xs p-1.5 rounded-lg bg-[var(--bg-2)] hover:bg-[#ff6b3d20] hover:text-[#ff6b3d]"
                      aria-label="Удалить"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </Card>
          </div>
        ))
      )}
    </div>
  );
}

function FaqForm({
  initial,
  onCancel,
  onSave,
}: {
  initial: Faq | null;
  onCancel: () => void;
  onSave: (data: Partial<Faq>) => void;
}) {
  const [question, setQuestion] = useState(initial?.question ?? "");
  const [answer, setAnswer] = useState(initial?.answer ?? "");
  const [category, setCategory] = useState(initial?.category ?? "general");
  const [position, setPosition] = useState(initial?.position ?? 0);
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);

  return (
    <Card padding="lg">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold">
          {initial ? "Редактирование" : "Новый вопрос"}
        </h2>
        <button onClick={onCancel} className="text-[var(--t-3)] hover:text-[var(--t-1)]">
          <X size={18} />
        </button>
      </div>
      <div className="space-y-4">
        <Field label="Вопрос">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full bg-[var(--bg-2)] border border-[var(--b-soft)] rounded-lg px-3 py-2 outline-none focus:border-[var(--brand-gold)]"
          />
        </Field>
        <Field label="Ответ (поддерживается перенос строк)">
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={5}
            className="w-full bg-[var(--bg-2)] border border-[var(--b-soft)] rounded-lg px-3 py-2 outline-none focus:border-[var(--brand-gold)] resize-none"
          />
        </Field>
        <div className="grid grid-cols-3 gap-4">
          <Field label="Категория">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[var(--bg-2)] border border-[var(--b-soft)] rounded-lg px-3 py-2 outline-none focus:border-[var(--brand-gold)]"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Позиция">
            <input
              type="number"
              value={position}
              onChange={(e) => setPosition(Number(e.target.value))}
              className="w-full bg-[var(--bg-2)] border border-[var(--b-soft)] rounded-lg px-3 py-2 outline-none focus:border-[var(--brand-gold)]"
            />
          </Field>
          <Field label="Видимость">
            <label className="flex items-center gap-2 px-3 py-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              <span className="text-sm">Active</span>
            </label>
          </Field>
        </div>
        <div className="flex gap-2 pt-2">
          <button
            onClick={() => onSave({ question, answer, category, position, isActive })}
            disabled={!question || !answer}
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
