"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export type PoIdGateFormTranslations = {
  placeholder: string;
  submitButton: string;
  submittingButton: string;
  existingAccountLink: string;
  errors: {
    invalid_trader_id: string;
    trader_id_taken: string;
    not_in_our_network: string;
    po_unreachable: string;
    unauthorized: string;
    missing_trader_id: string;
    fallback: string;
    invalidFallback: string;
  };
};

const DEFAULT_TRANSLATIONS: PoIdGateFormTranslations = {
  placeholder: "Например: 130769421",
  submitButton: "Привязать и войти",
  submittingButton: "Проверяем…",
  existingAccountLink: "У меня уже есть PO-аккаунт →",
  errors: {
    invalid_trader_id:
      "ID должен состоять из 6–12 цифр. Без пробелов и других символов.",
    trader_id_taken:
      "Этот PO ID уже привязан к другому аккаунту на нашей платформе.",
    not_in_our_network:
      "Этот ID не нашёлся в нашей партнёрской сети. Зарегистрируйся ЗАНОВО по нашей ссылке выше — иначе сигналы не открыть.",
    po_unreachable:
      "PocketOption временно не отвечает. Попробуй ещё раз через минуту.",
    unauthorized: "Нужно войти заново.",
    missing_trader_id: "Введи свой PO ID.",
    fallback: "Не удалось привязать ID. Попробуй позже.",
    invalidFallback: "Неверный ID",
  },
};

type Props = {
  initialTraderId?: string;
  translations?: PoIdGateFormTranslations;
};

export function PoIdGateForm({ initialTraderId = "", translations }: Props) {
  const t = translations ?? DEFAULT_TRANSLATIONS;
  const router = useRouter();
  const [traderId, setTraderId] = useState(initialTraderId);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const cleaned = traderId.replace(/\D/g, "");
    if (cleaned.length < 6 || cleaned.length > 12) {
      setError(t.errors.invalid_trader_id ?? t.errors.invalidFallback);
      return;
    }

    startTransition(async () => {
      const res = await fetch("/api/po/submit-id", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ traderId: cleaned }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        reason?: string;
        status?: string;
      };
      if (!data.ok) {
        const reason = data.reason ?? "";
        setError(
          t.errors[reason as keyof typeof t.errors] ?? t.errors.fallback,
        );
        return;
      }
      // Verified or pending — both unblock the gate (pending fallbacks happen
      // only when PO API creds are missing, e.g. in local dev).
      router.refresh();
      router.push("/dashboard");
    });
  }

  const isNotInNetwork =
    error === t.errors.not_in_our_network;

  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <input
          type="text"
          inputMode="numeric"
          pattern="\d*"
          autoComplete="off"
          value={traderId}
          onChange={(e) => setTraderId(e.target.value)}
          placeholder={t.placeholder}
          className="w-full h-12 px-4 rounded-xl bg-[var(--bg-2)] border border-[var(--b-soft)] focus:border-[var(--brand-gold)] focus:outline-none transition-colors text-base"
          maxLength={12}
          required
        />
      </div>

      {error ? (
        <div className="flex gap-2 text-sm text-[var(--red)] bg-[var(--red)]/10 border border-[var(--red)]/30 rounded-lg px-3 py-2">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <div>
            <div>{error}</div>
            {isNotInNetwork ? (
              <a
                href="/onboarding/po-id/existing"
                className="text-[var(--brand-gold)] hover:underline mt-1 inline-block"
              >
                {t.existingAccountLink}
              </a>
            ) : null}
          </div>
        </div>
      ) : null}

      <Button
        type="submit"
        disabled={pending || traderId.replace(/\D/g, "").length < 6}
        iconLeft={
          pending ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <CheckCircle2 size={16} />
          )
        }
      >
        {pending ? t.submittingButton : t.submitButton}
      </Button>
    </form>
  );
}
