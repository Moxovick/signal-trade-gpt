"use client";

import { useState, useTransition } from "react";
import { Mail, Check } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export function EmailVerificationCard({ email }: { email: string }) {
  const [stage, setStage] = useState<"idle" | "sent" | "done">("idle");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function send() {
    setError(null);
    start(async () => {
      const r = await fetch("/api/account/email/send-verification", {
        method: "POST",
      });
      if (!r.ok) {
        setError("Не удалось отправить код");
        return;
      }
      setStage("sent");
    });
  }

  function verify() {
    setError(null);
    start(async () => {
      const r = await fetch("/api/account/email/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (!r.ok) {
        const b = await r.json().catch(() => ({}));
        setError(b?.error ?? "Код неверный");
        return;
      }
      setStage("done");
      setTimeout(() => {
        window.location.reload();
      }, 800);
    });
  }

  return (
    <Card padding="lg" variant="glass">
      <div className="flex items-start gap-3">
        <Mail size={18} className="text-[var(--brand-gold)] mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold">Email не подтверждён</div>
          <div className="text-[12px] text-[var(--t-3)] mt-1">
            Подтверди адрес {email}, чтобы получать уведомления и включить 2FA.
          </div>
          {stage === "idle" && (
            <div className="mt-3">
              <Button size="sm" onClick={send} disabled={pending}>
                {pending ? "Отправка..." : "Отправить код"}
              </Button>
            </div>
          )}
          {stage === "sent" && (
            <div className="mt-3 flex items-center gap-2">
              <input
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="123 456"
                className="h-9 w-28 px-3 rounded-lg bg-[var(--bg-2)] border border-[var(--b-soft)] text-sm text-center tracking-widest font-mono focus:border-[var(--b-hard)] focus:outline-none"
              />
              <Button size="sm" onClick={verify} disabled={pending || code.length !== 6}>
                Проверить
              </Button>
              <button
                type="button"
                onClick={send}
                disabled={pending}
                className="text-[11px] text-[var(--t-3)] hover:text-[var(--brand-gold)] underline"
              >
                отправить ещё раз
              </button>
            </div>
          )}
          {stage === "done" && (
            <div className="mt-3 text-sm text-[var(--green)] flex items-center gap-1.5">
              <Check size={14} /> Email подтверждён
            </div>
          )}
          {error && (
            <div className="mt-2 text-xs text-[var(--red)]">{error}</div>
          )}
        </div>
      </div>
    </Card>
  );
}
