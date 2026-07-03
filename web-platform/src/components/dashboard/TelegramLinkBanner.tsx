"use client";

/**
 * 3-step wizard banner for linking Telegram account.
 * Rendered dynamically (no SSR) — reads localStorage on mount.
 */
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Check, Loader2, ExternalLink, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/lib/i18n/context";

const DISMISS_KEY = "tg_banner_dismissed_v1";
const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 10 * 60 * 1000;

type Step = "idle" | "waiting" | "linked";

function StepIndicator({ step }: { step: Step }) {
  const { t } = useI18n();
  const steps: Array<{ label: string; state: "completed" | "active" | "upcoming" }> = (() => {
    switch (step) {
      case "idle":
        return [
          { label: t.telegramBanner.step1, state: "active" },
          { label: t.telegramBanner.step2, state: "upcoming" },
          { label: t.telegramBanner.step3, state: "upcoming" },
        ];
      case "waiting":
        return [
          { label: t.telegramBanner.step1, state: "completed" },
          { label: t.telegramBanner.step2, state: "active" },
          { label: t.telegramBanner.step3, state: "upcoming" },
        ];
      case "linked":
        return [
          { label: t.telegramBanner.step1, state: "completed" },
          { label: t.telegramBanner.step2, state: "completed" },
          { label: t.telegramBanner.step3, state: "completed" },
        ];
    }
  })();

  return (
    <div className="flex items-center gap-4 mb-4">
      {steps.map((s) => (
        <div key={s.label} className="flex items-center gap-1.5">
          <span
            className={[
              "inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold shrink-0",
              s.state === "completed"
                ? "bg-[var(--green)] text-[var(--bg-1)]"
                : s.state === "active"
                  ? "bg-[var(--brand-gold)] text-[var(--bg-1)]"
                  : "border border-[var(--t-3)] text-[var(--t-3)]",
            ].join(" ")}
          >
            {s.state === "completed" ? <Check size={10} strokeWidth={3} /> : null}
          </span>
          <span
            className={[
              "text-xs",
              s.state === "completed"
                ? "text-[var(--green)]"
                : s.state === "active"
                  ? "text-[var(--brand-gold)] font-semibold"
                  : "text-[var(--t-3)]",
            ].join(" ")}
          >
            {s.label}
          </span>
        </div>
      ))}
    </div>
  );
}

function Banner() {
  const { t } = useI18n();
  const router = useRouter();
  const [visible, setVisible] = useState(() => !localStorage.getItem(DISMISS_KEY));
  const [step, setStep] = useState<Step>("idle");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [deepLink, setDeepLink] = useState<string | null>(null);
  const sessionRef = useRef<{ token: string; deepLink: string } | null>(null);
  const cancelledRef = useRef(false);

  const dismiss = useCallback(() => {
    localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  }, []);

  // Auto-dismiss after link
  useEffect(() => {
    if (step !== "linked") return;
    const t = setTimeout(() => {
      dismiss();
      router.refresh();
    }, 3000);
    return () => clearTimeout(t);
  }, [step, dismiss, router]);

  // Polling
  useEffect(() => {
    if (step !== "waiting" || !sessionRef.current) return;
    cancelledRef.current = false;
    const startedAt = Date.now();
    const token = sessionRef.current.token;

    async function poll() {
      while (!cancelledRef.current) {
        if (Date.now() - startedAt > POLL_TIMEOUT_MS) {
          setError(t.telegramBanner.errorTimeout);
          setStep("idle");
          sessionRef.current = null;
          return;
        }
        try {
          const res = await fetch(
            `/api/account/telegram/link-status?token=${encodeURIComponent(token)}`,
          );
          const data = (await res.json().catch(() => ({}))) as {
            ok?: boolean;
            status?: "linked" | "pending" | "expired";
          };
          if (data.ok && data.status === "linked") {
            setStep("linked");
            sessionRef.current = null;
            return;
          }
          if (data.ok && data.status === "expired") {
            setError(t.telegramBanner.errorLinkExpired);
            setStep("idle");
            sessionRef.current = null;
            return;
          }
        } catch {
          // network blip — keep polling
        }
        await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
      }
    }
    void poll();
    return () => {
      cancelledRef.current = true;
    };
  }, [step]);

  async function start() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/account/telegram/start-link", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ purpose: "link" }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        reason?: string;
        token?: string;
        deepLink?: string;
      };
      if (!data.ok || !data.token || !data.deepLink) {
        const messages: Record<string, string> = {
          bot_not_configured: t.telegramBanner.errorBotNotConfigured,
          unauthorized: t.telegramBanner.errorUnauthorized,
        };
        setError(messages[data.reason ?? ""] ?? t.telegramBanner.errorLinkFailed);
        setLoading(false);
        return;
      }
      sessionRef.current = { token: data.token, deepLink: data.deepLink };
      setDeepLink(data.deepLink);
      window.open(data.deepLink, "_blank", "noopener,noreferrer");
      setStep("waiting");
    } catch {
      setError(t.telegramBanner.errorNetwork);
    } finally {
      setLoading(false);
    }
  }

  function retry() {
    setError(null);
    setStep("idle");
    setDeepLink(null);
    sessionRef.current = null;
  }

  if (!visible) return null;

  return (
    <div className="mb-6 rounded-xl border px-5 py-4 relative" style={{ borderColor: "rgba(212,160,23,0.2)", background: "rgba(212,160,23,0.04)" }}>
      {/* Close button */}
      {step !== "linked" && (
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 text-[var(--t-3)] hover:text-[var(--t-1)] transition-colors"
          aria-label={t.telegramBanner.dismiss}
        >
          <X size={16} />
        </button>
      )}

      {/* Title */}
      <p className="text-sm font-semibold text-[var(--t-1)] mb-3 pr-6">
        {t.telegramBanner.title}
      </p>

      {/* Step indicator */}
      <StepIndicator step={step} />

      {/* Step content */}
      {step === "idle" && (
        <div>
          <p className="text-xs text-[var(--t-2)] mb-4 leading-relaxed">
            {t.telegramBanner.idleDescription.split("\n").map((line: string, i: number) => (
              <span key={i}>{line}{i === 0 ? <br /> : null}</span>
            ))}
          </p>
          <Button onClick={start} disabled={loading} iconLeft={
            loading
              ? <Loader2 size={16} className="animate-spin" />
              : <Send size={16} />
          }>
            {loading ? t.telegramBanner.creatingLink : t.telegramBanner.openBot}
          </Button>
          {error && (
            <div className="mt-3 flex items-start gap-2 text-sm text-[var(--red)]">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <span>{error}</span>
              <button onClick={retry} className="ml-2 text-[var(--brand-gold)] hover:underline text-xs whitespace-nowrap">
                {t.telegramBanner.retry}
              </button>
            </div>
          )}
        </div>
      )}

      {step === "waiting" && (
        <div>
          <p className="text-xs text-[var(--t-2)] mb-4 leading-relaxed">
            {t.telegramBanner.waitingDescription.split("\n").map((line: string, i: number) => (
              <span key={i}>{line}{i === 0 ? <br /> : null}</span>
            ))}
          </p>
          <div className="flex items-center gap-2 text-sm text-[var(--t-2)] mb-3">
            <Loader2 size={16} className="animate-spin text-[var(--brand-gold)] shrink-0" />
            <span>{t.telegramBanner.waitingConfirmation}</span>
          </div>
          {deepLink && (
            <a
              href={deepLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[var(--brand-gold)] hover:underline inline-flex items-center gap-1"
            >
              <ExternalLink size={12} />
              {t.telegramBanner.reopenBot}
            </a>
          )}
          {error && (
            <div className="mt-3 flex items-start gap-2 text-sm text-[var(--red)]">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <span>{error}</span>
              <button onClick={retry} className="ml-2 text-[var(--brand-gold)] hover:underline text-xs whitespace-nowrap">
                {t.telegramBanner.retry}
              </button>
            </div>
          )}
        </div>
      )}

      {step === "linked" && (
        <div className="flex items-center gap-2 text-sm text-[var(--green)]">
          <Check size={16} />
          <span>{t.telegramBanner.linked}</span>
        </div>
      )}
    </div>
  );
}

export const TelegramLinkBanner = dynamic(() => Promise.resolve(Banner), {
  ssr: false,
});
