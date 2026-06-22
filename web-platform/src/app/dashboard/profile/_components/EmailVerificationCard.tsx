"use client";

import { useState, useTransition } from "react";
import { Mail, Check } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/lib/i18n/context";

export function EmailVerificationCard({ email }: { email: string }) {
  const { t } = useI18n();
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
        setError(t.emailVerification.errorSend);
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
        setError(b?.error ?? t.emailVerification.errorCode);
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
          <div className="text-sm font-semibold">{t.emailVerification.notVerified}</div>
          <div className="text-[12px] text-[var(--t-3)] mt-1">
            {t.emailVerification.description} {email}{t.emailVerification.descriptionSuffix}
          </div>
          {stage === "idle" && (
            <div className="mt-3">
              <Button size="sm" onClick={send} disabled={pending}>
                {pending ? t.emailVerification.sending : t.emailVerification.sendCode}
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
                {t.emailVerification.verify}
              </Button>
              <button
                type="button"
                onClick={send}
                disabled={pending}
                className="text-[11px] text-[var(--t-3)] hover:text-[var(--brand-gold)] underline"
              >
                {t.emailVerification.resend}
              </button>
            </div>
          )}
          {stage === "done" && (
            <div className="mt-3 text-sm text-[var(--green)] flex items-center gap-1.5">
              <Check size={14} /> {t.emailVerification.verified}
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
