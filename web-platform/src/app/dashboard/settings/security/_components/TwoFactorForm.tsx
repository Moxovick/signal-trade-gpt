"use client";

import { useState, useTransition } from "react";
import { Check, ShieldCheck, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function TwoFactorForm({
  email,
  twoFactorEmail,
}: {
  email: string | null;
  twoFactorEmail: boolean;
}) {
  const [enabled, setEnabled] = useState(twoFactorEmail);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();

  async function toggle() {
    if (!email) {
      setError("Сначала добавь email в профиле");
      return;
    }
    setError(null);
    start(async () => {
      const r = await fetch("/api/account/preferences", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ twoFactorEmail: !enabled }),
      });
      if (!r.ok) {
        setError("Не удалось переключить");
        return;
      }
      setEnabled(!enabled);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  if (!email) {
    return (
      <div className="rounded-xl border border-[var(--b-soft)] bg-[var(--bg-2)] p-4">
        <div className="flex items-start gap-2">
          <AlertTriangle size={16} className="text-[var(--red)] shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-semibold">Email не указан</div>
            <div className="text-[12px] text-[var(--t-3)]">
              2FA по email требует адреса почты. Добавь его на странице{" "}
              <a href="/dashboard/profile" className="text-[var(--brand-gold)] underline">
                Профиля
              </a>
              .
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex-1">
        <div className="text-sm font-medium">
          2FA по email:{" "}
          <span className={enabled ? "text-[var(--green)]" : "text-[var(--t-3)]"}>
            {enabled ? "включено" : "выключено"}
          </span>
        </div>
        <div className="text-[12px] text-[var(--t-3)]">
          Коды будут приходить на {email}
        </div>
      </div>
      <Button
        onClick={toggle}
        disabled={pending}
        variant={enabled ? "danger" : "primary"}
        iconLeft={saved ? <Check size={14} /> : <ShieldCheck size={14} />}
      >
        {pending ? "..." : enabled ? "Отключить" : "Включить"}
      </Button>
      {error && <span className="text-xs text-[var(--red)]">{error}</span>}
    </div>
  );
}
