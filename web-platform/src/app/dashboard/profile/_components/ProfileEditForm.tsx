"use client";

import { useRef, useState } from "react";
import { CheckCircle2, ImagePlus, Loader2, Save } from "lucide-react";

const FIELD =
  "w-full h-11 px-4 rounded-xl text-sm outline-none transition-colors bg-[var(--bg-2)] border border-[var(--b-soft)] focus:border-[var(--brand-gold)]";

const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2 MB
const AVATAR_DIM = 200;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function resizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const scale = Math.min(AVATAR_DIM / img.width, AVATAR_DIM / img.height, 1);
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas not supported"));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/webp", 0.85));
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

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
  const [avatarPreview, setAvatarPreview] = useState(initialAvatar || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_TYPES.has(file.type)) {
      setError("Допустимые форматы: JPG, PNG, WebP");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setError("Максимальный размер файла — 2 МБ");
      return;
    }
    setError(null);
    try {
      const dataUrl = await resizeImage(file);
      setAvatar(dataUrl);
      setAvatarPreview(dataUrl);
    } catch {
      setError("Не удалось обработать изображение");
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const r = await fetch("/api/account/profile", {
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

      <Field label="Аватар">
        <div className="flex items-center gap-4">
          {avatarPreview ? (
            <img
              src={avatarPreview}
              alt="Аватар"
              className="w-14 h-14 rounded-full object-cover border border-[var(--b-soft)]"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-[var(--bg-2)] border border-[var(--b-soft)] flex items-center justify-center text-[var(--t-3)]">
              <ImagePlus size={20} />
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-medium bg-[var(--bg-2)] border border-[var(--b-soft)] hover:border-[var(--brand-gold)] transition-colors"
            >
              <ImagePlus size={14} />
              Загрузить аватар
            </button>
            <span className="text-[11px] text-[var(--t-3)]">
              JPG, PNG или WebP, до 2 МБ
            </span>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
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
          {saving ? "Сохраняем..." : "Сохранить"}
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
