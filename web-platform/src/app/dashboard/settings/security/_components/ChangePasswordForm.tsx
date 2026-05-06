"use client";

import { useState, useTransition } from "react";
import { Save, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function ChangePasswordForm({ hasPassword }: { hasPassword: boolean }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOk(false);
    if (next.length < 8) {
      setError("Новый пароль — минимум 8 символов");
      return;
    }
    if (next !== confirm) {
      setError("Пароли не совпадают");
      return;
    }
    start(async () => {
      const r = await fetch("/api/account/password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          currentPassword: hasPassword ? current : null,
          newPassword: next,
        }),
      });
      if (!r.ok) {
        const body = await r.json().catch(() => ({}));
        setError(body?.error ?? "Не удалось сохранить");
        return;
      }
      setOk(true);
      setCurrent("");
      setNext("");
      setConfirm("");
      setTimeout(() => setOk(false), 3000);
    });
  }

  const input =
    "w-full h-11 px-4 rounded-xl bg-[var(--bg-2)] border border-[var(--b-soft)] text-sm focus:border-[var(--b-hard)] focus:outline-none";

  return (
    <form onSubmit={submit} className="space-y-4">
      {hasPassword && (
        <div>
          <label className="block text-[13px] text-[var(--t-2)] mb-1">
            Текущий пароль
          </label>
          <input
            type="password"
            autoComplete="current-password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            required
            className={input}
          />
        </div>
      )}
      <div>
        <label className="block text-[13px] text-[var(--t-2)] mb-1">
          Новый пароль
        </label>
        <input
          type="password"
          autoComplete="new-password"
          value={next}
          onChange={(e) => setNext(e.target.value)}
          required
          minLength={8}
          className={input}
        />
      </div>
      <div>
        <label className="block text-[13px] text-[var(--t-2)] mb-1">
          Подтверди пароль
        </label>
        <input
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          className={input}
        />
      </div>
      <div className="flex items-center gap-3">
        <Button
          type="submit"
          disabled={pending}
          iconLeft={ok ? <Check size={14} /> : <Save size={14} />}
        >
          {pending
            ? "Сохраняю..."
            : ok
              ? "Сохранено"
              : hasPassword
                ? "Сменить пароль"
                : "Установить пароль"}
        </Button>
        {error && <span className="text-xs text-[var(--red)]">{error}</span>}
      </div>
    </form>
  );
}
