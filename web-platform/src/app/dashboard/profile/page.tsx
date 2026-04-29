"use client";

import { useEffect, useState } from "react";

interface UserProfile {
  id: string;
  email: string;
  username?: string;
  firstName?: string;
  telegramId?: string;
  subscriptionPlan: string;
  referralCode: string;
  createdAt: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firstName, setFirstName] = useState("");
  const [username, setUsername] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/users/me")
      .then((r) => r.json())
      .then((d) => {
        setUser(d.user);
        setFirstName(d.user?.firstName ?? "");
        setUsername(d.user?.username ?? "");
      });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/users/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName, username }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64 text-[#555]">
        Загрузка...
      </div>
    );
  }

  const planColors: Record<string, string> = {
    free: "#888",
    premium: "#f5c518",
    vip: "#00e5a0",
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Профиль</h1>

      {/* Plan badge */}
      <div
        className="rounded-2xl p-5 border flex items-center gap-4"
        style={{ background: "#0d0d18", borderColor: "rgba(255,255,255,0.07)" }}
      >
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold shrink-0"
          style={{ background: "#f5c518", color: "#07070d" }}
        >
          {(user.firstName ?? user.email)[0].toUpperCase()}
        </div>
        <div>
          <p className="font-semibold">{user.firstName ?? "Пользователь"}</p>
          <p className="text-sm text-[#666]">{user.email}</p>
          <span
            className="inline-block mt-1 text-xs font-bold px-2 py-0.5 rounded-full"
            style={{
              background: `${planColors[user.subscriptionPlan]}22`,
              color: planColors[user.subscriptionPlan],
            }}
          >
            {user.subscriptionPlan.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Edit form */}
      <form
        onSubmit={handleSave}
        className="rounded-2xl p-6 border space-y-4"
        style={{ background: "#0d0d18", borderColor: "rgba(255,255,255,0.07)" }}
      >
        <h2 className="font-semibold mb-2">Личные данные</h2>

        {[
          { label: "Имя", value: firstName, set: setFirstName, placeholder: "Ваше имя" },
          { label: "Имя пользователя", value: username, set: setUsername, placeholder: "@username" },
        ].map(({ label, value, set, placeholder }) => (
          <div key={label}>
            <label className="block text-sm text-[#888] mb-1.5">{label}</label>
            <input
              type="text"
              value={value}
              onChange={(e) => set(e.target.value)}
              placeholder={placeholder}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors"
              style={{
                background: "#111120",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#e8e8f0",
              }}
              onFocus={(e) => (e.target.style.borderColor = "rgba(245,197,24,0.5)")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
            />
          </div>
        ))}

        <div>
          <label className="block text-sm text-[#888] mb-1.5">Email</label>
          <input
            type="email"
            value={user.email}
            disabled
            className="w-full px-4 py-3 rounded-xl text-sm"
            style={{
              background: "#0a0a14",
              border: "1px solid rgba(255,255,255,0.05)",
              color: "#555",
            }}
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors"
          style={{ background: saved ? "#00e5a0" : "#f5c518", color: "#07070d" }}
        >
          {saved ? "✓ Сохранено" : saving ? "Сохраняем..." : "Сохранить"}
        </button>
      </form>

      {/* Account info */}
      <div
        className="rounded-2xl p-6 border space-y-3"
        style={{ background: "#0d0d18", borderColor: "rgba(255,255,255,0.07)" }}
      >
        <h2 className="font-semibold mb-2">Аккаунт</h2>
        {[
          { label: "ID аккаунта", value: user.id },
          {
            label: "Реферальный код",
            value: user.referralCode,
            mono: true,
            highlight: true,
          },
          {
            label: "Зарегистрирован",
            value: new Date(user.createdAt).toLocaleDateString("ru-RU"),
          },
          {
            label: "Telegram",
            value: user.telegramId ? `#${user.telegramId}` : "Не привязан",
          },
        ].map(({ label, value, mono, highlight }) => (
          <div key={label} className="flex items-center justify-between text-sm">
            <span className="text-[#666]">{label}</span>
            <span
              className={mono ? "font-mono" : ""}
              style={{ color: highlight ? "#f5c518" : "#aaa" }}
            >
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
