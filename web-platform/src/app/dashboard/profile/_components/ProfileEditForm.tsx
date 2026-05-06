"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Save } from "lucide-react";

const FIELD =
  "w-full h-11 px-4 rounded-xl text-sm outline-none transition-colors bg-[var(--bg-2)] border border-[var(--b-soft)] focus:border-[var(--brand-gold)]";

type Props = {
  email: string;
  firstName: string;
  username: string;
  avatar: string;
};

export function ProfileEditForm({
  email,
  firstName: initialFirstName,
  username: initialUsername,
  avatar: initialAvatar,
}: Props) {
  const [firstName, setFirstName] = useState(initialFirstName);
  const [username, setUsername] = useState(initialUsername);
  const [avatar, setAvatar] = useState(initialAvatar);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const r = await fetch("/api/users/me", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        firstName: firstName.trim(),
        username: username.trim(),
        avatar: avatar.trim() || null,
      }),
    });
    setSaving(false);
    if (!r.ok) {
      setError(`Не удалось сохранить (HTTP ${r.status})`);
      return;
    }
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      window.location.reload();
    }, 800);
  }

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <Field label="Имя / Никнейм">
        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="Например: Anton"
          maxLength={32}
          className={FIELD}
        />
      </Field>

      <Field label="Telegram username">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="без @, например: anton"
          maxLength={32}
          className={FIELD}
        />
      </Field>

      <Field label="Аватар (URL изображения)">
        <input
          type="url"
          value={avatar}
          onChange={(e) => setAvatar(e.target.value)}
          placeholder="https://… (оставь пустым — используем Gravatar по email)"
          className={FIELD}
        />
      </Field>

      <Field label="Email (нельзя изменить)">
        <input
          type="email"
          value={email}
          disabled
          className={`${FIELD} opacity-60 cursor-not-allowed`}
        />
      </Field>

      {error ? (
        <div className="text-sm text-[var(--red)]">{error}</div>
      ) : null}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 h-11 px-6 rounded-full bg-[var(--brand-gold)] text-[#1a1208] font-semibold hover:bg-[var(--brand-gold-bright)] transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? "Сохраняем…" : "Сохранить"}
        </button>
        {saved ? (
          <span className="inline-flex items-center gap-1.5 text-sm text-[var(--green)]">
            <CheckCircle2 size={14} /> Сохранено
          </span>
        ) : null}
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-[0.18em] text-[var(--t-3)] mb-1.5">
        {label}
      </span>
      {children}
    </label>
  );
}
