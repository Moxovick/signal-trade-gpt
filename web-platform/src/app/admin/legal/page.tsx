"use client";

import { useEffect, useState } from "react";
import { Save, Eye, EyeOff } from "lucide-react";
import { Card } from "@/components/ui/Card";

const SLUGS = [
  { slug: "terms", label: "Правила использования", path: "/terms" },
  { slug: "privacy", label: "Конфиденциальность", path: "/privacy" },
];

export default function AdminLegalPage() {
  const [activeSlug, setActiveSlug] = useState("terms");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);

  async function load(slug: string) {
    setLoading(true);
    const r = await fetch(`/api/admin/legal/${slug}`);
    const j = await r.json();
    if (j.page) {
      setTitle(j.page.title);
      setBody(j.page.body);
      setIsActive(j.page.isActive);
    } else {
      setTitle("");
      setBody("");
      setIsActive(true);
    }
    setLoading(false);
  }


  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load(activeSlug);
  }, [activeSlug]);

  async function save() {
    setSaving(true);
    await fetch(`/api/admin/legal/${activeSlug}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title, body, isActive }),
    });
    setSaving(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Правовые страницы</h1>
        <p className="text-sm text-[var(--t-3)] mt-1">
          Поддерживается Markdown. Заголовки, списки, **жирный**, ссылки.
        </p>
      </div>

      <div className="flex gap-2">
        {SLUGS.map((s) => (
          <button
            key={s.slug}
            onClick={() => setActiveSlug(s.slug)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeSlug === s.slug
                ? "bg-[var(--brand-gold)] text-[var(--bg-0)]"
                : "bg-[var(--bg-2)] hover:bg-[var(--bg-3)] text-[var(--t-2)]"
            }`}
          >
            {s.label}
          </button>
        ))}
        <a
          href={SLUGS.find((s) => s.slug === activeSlug)?.path}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto px-4 py-2 rounded-xl text-sm font-medium bg-[var(--bg-2)] hover:bg-[var(--bg-3)] text-[var(--t-2)] flex items-center gap-2"
        >
          <Eye size={14} /> Посмотреть страницу
        </a>
      </div>

      {loading ? (
        <div className="text-[var(--t-3)] text-center py-12">Загрузка…</div>
      ) : (
        <Card padding="lg">
          <div className="space-y-4">
            <Field label="Заголовок">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[var(--bg-2)] border border-[var(--b-soft)] rounded-lg px-3 py-2 outline-none focus:border-[var(--brand-gold)]"
              />
            </Field>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-[var(--t-3)]">
                Содержимое (Markdown)
              </span>
              <button
                onClick={() => setPreview(!preview)}
                className="text-xs px-3 py-1 rounded-lg bg-[var(--bg-2)] hover:bg-[var(--bg-3)] flex items-center gap-1"
              >
                {preview ? <EyeOff size={12} /> : <Eye size={12} />}{" "}
                {preview ? "Редактор" : "Превью"}
              </button>
            </div>
            {preview ? (
              <div
                className="legal-prose bg-[var(--bg-2)] border border-[var(--b-soft)] rounded-lg p-6 min-h-[400px]"
                dangerouslySetInnerHTML={{ __html: simpleMarkdownPreview(body) }}
              />
            ) : (
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={20}
                className="w-full bg-[var(--bg-2)] border border-[var(--b-soft)] rounded-lg px-3 py-3 outline-none focus:border-[var(--brand-gold)] resize-y font-mono text-sm"
                style={{ fontFamily: "var(--font-jetbrains)" }}
              />
            )}
            <div className="flex items-center gap-4 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                <span className="text-sm">Опубликовано</span>
              </label>
              <button
                onClick={save}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--brand-gold)] text-[var(--bg-0)] font-semibold hover:opacity-90 disabled:opacity-50 ml-auto"
              >
                <Save size={16} />
                {saving ? "Сохранение…" : "Сохранить"}
              </button>
            </div>
          </div>
        </Card>
      )}
    </div>
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

// Tiny inline markdown rendering for preview only (full rendering happens server-side on /terms etc.)
function simpleMarkdownPreview(md: string): string {
  let html = md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  html = html.replace(/^### (.*)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.*)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.*)$/gm, "<h1>$1</h1>");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  html = html.replace(/^- (.*)$/gm, "<li>$1</li>");
  html = html.replace(/(<li>[\s\S]*?<\/li>(?:\n<li>[\s\S]*?<\/li>)*)/g, "<ul>$1</ul>");
  html = html.replace(/\n\n/g, "</p><p>");
  html = "<p>" + html + "</p>";
  html = html.replace(/<p>(<h\d>)/g, "$1").replace(/(<\/h\d>)<\/p>/g, "$1");
  html = html.replace(/<p>(<ul>)/g, "$1").replace(/(<\/ul>)<\/p>/g, "$1");
  return html;
}
