"use client";

import { useState, useTransition } from "react";
import { Save, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/lib/i18n/context";

export function ChangePasswordForm({ hasPassword }: { hasPassword: boolean }) {
  const { t } = useI18n();
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
      setError(t.security.errorMinLength);
      return;
    }
    if (next !== confirm) {
      setError(t.security.errorMismatch);
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
        setError(body?.error ?? t.security.errorSave);
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
            {t.security.currentPassword}
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
          {t.security.newPassword}
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
          {t.security.confirmPassword}
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
            ? t.security.saving
            : ok
              ? t.security.saved
              : hasPassword
                ? t.security.changePassword
                : t.security.setPassword}
        </Button>
        {error && <span className="text-xs text-[var(--red)]">{error}</span>}
      </div>
    </form>
  );
}
