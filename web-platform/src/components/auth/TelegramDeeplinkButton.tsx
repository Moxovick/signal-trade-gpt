"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { ExternalLink, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";

const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 10 * 60 * 1000;

const ERROR_COPY: Record<string, string> = {
  bot_not_configured: "Telegram-бот не настроен. Сообщи админу.",
  unauthorized: "Войди заново.",
};

type Props = {
  /**
   * "login" — anonymous flow, creates session via NextAuth tg-deeplink provider.
   *           Used on /login and /register.
   * "link"  — requires session, attaches Telegram to current account.
   *           Used on /dashboard/settings/telegram.
   */
  purpose: "login" | "link";
  /** Where to send the user after successful auth (login flow only). */
  callbackUrl?: string;
  /** Triggered on success in link mode (after polling reports linked). */
  onLinked?: (info: { telegramId: string | null; userId: string | null }) => void;
  label?: string;
};

export function TelegramDeeplinkButton({
  purpose,
  callbackUrl,
  onLinked,
  label,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [session, setSession] = useState<{ token: string; deepLink: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [waiting, setWaiting] = useState(false);

  const finalCallback = callbackUrl ?? searchParams.get("callbackUrl") ?? "/dashboard";

  useEffect(() => {
    if (!session) return;
    const startedAt = Date.now();
    let cancelled = false;

    async function poll() {
      while (!cancelled && session) {
        if (Date.now() - startedAt > POLL_TIMEOUT_MS) {
          setError("Время ожидания истекло. Попробуй снова.");
          setSession(null);
          setWaiting(false);
          return;
        }
        try {
          const res = await fetch(
            `/api/account/telegram/link-status?token=${encodeURIComponent(session.token)}`,
          );
          const data = (await res.json().catch(() => ({}))) as {
            ok?: boolean;
            status?: "linked" | "pending" | "expired";
            telegramId?: string | null;
            userId?: string | null;
          };
          if (data.ok && data.status === "linked") {
            if (purpose === "login") {
              const result = await signIn("tg-deeplink", {
                token: session.token,
                redirect: false,
              });
              if (result?.ok) {
                router.push(finalCallback);
                router.refresh();
              } else {
                setError("Не удалось создать сессию. Попробуй ещё раз.");
              }
            } else {
              onLinked?.({
                telegramId: data.telegramId ?? null,
                userId: data.userId ?? null,
              });
              router.refresh();
            }
            setSession(null);
            setWaiting(false);
            return;
          }
          if (data.ok && data.status === "expired") {
            setError("Срок действия ссылки истёк. Попробуй снова.");
            setSession(null);
            setWaiting(false);
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
      cancelled = true;
    };
  }, [session, router, purpose, onLinked, finalCallback]);

  function start() {
    setError(null);
    setWaiting(true);
    startTransition(async () => {
      const res = await fetch("/api/account/telegram/start-link", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ purpose }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        reason?: string;
        token?: string;
        deepLink?: string;
      };
      if (!data.ok || !data.token || !data.deepLink) {
        setError(ERROR_COPY[data.reason ?? ""] ?? "Не удалось создать ссылку.");
        setWaiting(false);
        return;
      }
      setSession({ token: data.token, deepLink: data.deepLink });
      window.open(data.deepLink, "_blank", "noopener,noreferrer");
    });
  }

  if (session) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-[var(--t-2)] rounded-xl border border-[var(--b-soft)] bg-[var(--bg-2)] px-4 py-3">
          <Loader2 size={16} className="animate-spin text-[var(--brand-gold)] shrink-0" />
          <span>Открыли бота — подтверди вход в Telegram.</span>
        </div>
        <a
          href={session.deepLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-[var(--brand-gold)] hover:underline inline-flex items-center gap-1"
        >
          <ExternalLink size={12} />
          Открыть бота заново
        </a>
        {error ? (
          <div className="text-sm text-[var(--red)]">{error}</div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={start}
        disabled={pending || waiting}
        iconLeft={
          pending || waiting ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Send size={16} />
          )
        }
      >
        {pending || waiting
          ? "Создаём ссылку…"
          : (label ?? (purpose === "login" ? "Войти через Telegram" : "Привязать Telegram"))}
      </Button>
      {error ? <div className="text-sm text-[var(--red)]">{error}</div> : null}
    </div>
  );
}
