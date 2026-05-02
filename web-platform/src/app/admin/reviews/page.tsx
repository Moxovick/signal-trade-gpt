"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Save, X, Star } from "lucide-react";
import { Card } from "@/components/ui/Card";

type Review = {
  id: string;
  authorName: string;
  authorRole: string | null;
  avatarUrl: string | null;
  rating: number;
  text: string;
  isFeatured: boolean;
  isPublic: boolean;
  position: number;
  status: string;
};

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Review | null>(null);
  const [creating, setCreating] = useState(false);

  async function load() {
    setLoading(true);
    const r = await fetch("/api/admin/reviews");
    const j = await r.json();
    setReviews(j.reviews ?? []);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  async function save(data: Partial<Review>) {
    const url = editing ? `/api/admin/reviews/${editing.id}` : "/api/admin/reviews";
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
    if (!confirm("Удалить отзыв?")) return;
    await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Отзывы</h1>
          <p className="text-sm text-[var(--t-3)] mt-1">Всего: {reviews.length}</p>
        </div>
        <button
          onClick={() => {
            setCreating(true);
            setEditing(null);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--brand-gold)] text-[var(--bg-0)] font-semibold hover:opacity-90"
        >
          <Plus size={16} /> Новый отзыв
        </button>
      </div>

      {(creating || editing) && (
        <ReviewForm
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
        <div className="grid md:grid-cols-2 gap-4">
          {reviews.map((r) => (
            <Card key={r.id} padding="md">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="font-semibold">{r.authorName}</div>
                  {r.authorRole && (
                    <div className="text-xs text-[var(--t-3)]">{r.authorRole}</div>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      size={12}
                      className={
                        i < r.rating
                          ? "fill-[var(--brand-gold)] text-[var(--brand-gold)]"
                          : "text-[var(--t-3)]"
                      }
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-[var(--t-2)] line-clamp-3">{r.text}</p>
              <div className="mt-4 pt-3 border-t border-[var(--b-soft)] flex items-center gap-2 flex-wrap">
                {r.isFeatured && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[rgba(212,160,23,0.15)] text-[var(--brand-gold)]">
                    Featured
                  </span>
                )}
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    r.isPublic
                      ? "bg-[rgba(142,224,107,0.12)] text-[#8ee06b]"
                      : "bg-[var(--bg-2)] text-[var(--t-3)]"
                  }`}
                >
                  {r.isPublic ? "Public" : "Hidden"}
                </span>
                <span className="text-xs text-[var(--t-3)]">#{r.position}</span>
                <div className="ml-auto flex gap-1">
                  <button
                    onClick={() => {
                      setEditing(r);
                      setCreating(false);
                    }}
                    className="text-xs px-3 py-1 rounded-lg bg-[var(--bg-2)] hover:bg-[var(--bg-3)]"
                  >
                    Изменить
                  </button>
                  <button
                    onClick={() => remove(r.id)}
                    className="text-xs p-1.5 rounded-lg bg-[var(--bg-2)] hover:bg-[#ff6b3d20] hover:text-[#ff6b3d]"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function ReviewForm({
  initial,
  onCancel,
  onSave,
}: {
  initial: Review | null;
  onCancel: () => void;
  onSave: (data: Partial<Review>) => void;
}) {
  const [authorName, setAuthorName] = useState(initial?.authorName ?? "");
  const [authorRole, setAuthorRole] = useState(initial?.authorRole ?? "");
  const [rating, setRating] = useState(initial?.rating ?? 5);
  const [text, setText] = useState(initial?.text ?? "");
  const [isFeatured, setIsFeatured] = useState(initial?.isFeatured ?? false);
  const [isPublic, setIsPublic] = useState(initial?.isPublic ?? true);
  const [position, setPosition] = useState(initial?.position ?? 0);

  return (
    <Card padding="lg">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold">
          {initial ? "Редактирование отзыва" : "Новый отзыв"}
        </h2>
        <button onClick={onCancel} className="text-[var(--t-3)] hover:text-[var(--t-1)]">
          <X size={18} />
        </button>
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Имя автора">
            <input
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="w-full bg-[var(--bg-2)] border border-[var(--b-soft)] rounded-lg px-3 py-2 outline-none focus:border-[var(--brand-gold)]"
            />
          </Field>
          <Field label='Роль (например "Trader, T3")'>
            <input
              value={authorRole}
              onChange={(e) => setAuthorRole(e.target.value)}
              className="w-full bg-[var(--bg-2)] border border-[var(--b-soft)] rounded-lg px-3 py-2 outline-none focus:border-[var(--brand-gold)]"
            />
          </Field>
        </div>
        <Field label="Текст отзыва">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            className="w-full bg-[var(--bg-2)] border border-[var(--b-soft)] rounded-lg px-3 py-2 outline-none focus:border-[var(--brand-gold)] resize-none"
          />
        </Field>
        <div className="grid grid-cols-4 gap-4">
          <Field label="Рейтинг (1-5)">
            <input
              type="number"
              min={1}
              max={5}
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
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
          <Field label="Featured">
            <label className="flex items-center gap-2 px-3 py-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
              />
              <span className="text-sm">На главной</span>
            </label>
          </Field>
          <Field label="Публичный">
            <label className="flex items-center gap-2 px-3 py-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
              />
              <span className="text-sm">Видим</span>
            </label>
          </Field>
        </div>
        <div className="flex gap-2 pt-2">
          <button
            onClick={() =>
              onSave({
                authorName,
                authorRole: authorRole || null,
                rating,
                text,
                isFeatured,
                isPublic,
                position,
              })
            }
            disabled={!authorName || !text}
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
