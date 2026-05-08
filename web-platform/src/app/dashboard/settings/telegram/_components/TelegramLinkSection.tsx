"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Send,
  Unlink,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

type TelegramAuthData = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
};

declare global {
  interface Window {
    onTelegramLink?: (user: TelegramAuthData) => void;
  }
}

type Props = {
  botUsername: string;
  initialLink: { id: string; username: string | null; firstName: string | null } | null;
};

const ERROR_COPY: Record<string, string> = {
  unauthorized: "Войди заново.",
  not_configured: "Telegram-бот не настроен на сервере. Свяжись с админом.",
  bot_not_configured: "Telegram-бот не настроен на сервере.",
  invalid_payload: "Telegram прислал кривой payload. Попробуй ещё раз.",
  verification_failed:
    "Не удалось проверить подпись Telegram. Возможно, виджет настроен на другого бота.",
  telegram_taken: "Этот Telegram уже привязан к другому аккаунту.",
  expired: "Срок действия ссылки истёк. Попробуй снова.",
  not_found: "Сессия привязки не найдена. Попробуй снова.",
};

const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 10 * 60 * 1000;

export function TelegramLinkSection({ botUsername, initialLink }: Props) {
  const router = useRouter();
  const widgetRef = useRef<HTMLDivElement>(null);
  const [linked, setLinked] = useState(initialLink);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [deepLinkSession, setDeepLinkSession] = useState<{
    token: string;
    deepLink: string;
  } | null>(null);

  // Telegram Login Widget (browser flow)
  useEffect(() => {
    if (linked || !widgetRef.current) return;

    window.onTelegramLink = (user: TelegramAuthData) => {
      setError(null);
      const fields: Array<keyof TelegramAuthData> = [
        "id",
        "first_name",
        "last_name",
        "username",
        "photo_url",
        "auth_date",
        "hash",
      ];
      const payload = Object.fromEntries(
        fields.map((f) => [f, user[f] != null ? String(user[f]) : ""]),
      );
      startTransition(async () => {
        const res = await fetch("/api/account/telegram/link", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = (await res.json().catch(() => ({}))) as {
          ok?: boolean;
          reason?: string;
          telegram?: { id: number; username: string | null; firstName: string | null };
        };
        if (!data.ok) {
          setError(ERROR_COPY[data.reason ?? ""] ?? "Не удалось привязать. Попробуй позже.");
          return;
        }
        if (data.telegram) {
          setLinked({
            id: String(data.telegram.id),
            username: data.telegram.username,
            firstName: data.telegram.firstName,
          });
        }
        router.refresh();
      });
    };

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;
    script.setAttribute("data-telegram-login", botUsername);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-radius", "12");
    script.setAttribute("data-onauth", "onTelegramLink(user)");
    script.setAttribute("data-request-access", "write");
    widgetRef.current.appendChild(script);

    const node = widgetRef.current;
    return () => {
      node.innerHTML = "";
      delete window.onTelegramLink;
    };
  }, [botUsername, linked, router]);

  // Deep-link flow polling
  useEffect(() => {
    if (!deepLinkSession) return;
    const startedAt = Date.now();
    let cancelled = false;

    async function poll() {
      while (!cancelled && deepLinkSession) {
        if (Date.now() - startedAt > POLL_TIMEOUT_MS) {
          setError("Время ожидания истекло. Попробуй снова.");
          setDeepLinkSession(null);
          return;
        }
        try {
          const res = await fetch(
            `/api/account/telegram/link-status?token=${encodeURIComponent(deepLinkSession.token)}`,
          );
          const data = (await res.json().catch(() => ({}))) as {
            ok?: boolean;
            status?: "linked" | "pending" | "expired";
            telegramId?: string | null;
          };
          if (data.ok && data.status === "linked") {
            setLinked({
              id: data.telegramId ?? "",
              username: null,
              firstName: null,
            });
            setDeepLinkSession(null);
            router.refresh();
            return;
          }
          if (data.ok && data.status === "expired") {
            setError("Срок действия ссылки истёк. Попробуй снова.");
            setDeepLinkSession(null);
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
  }, [deepLinkSession, router]);

  function startDeepLink() {
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/account/telegram/start-link", { method: "POST" });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        reason?: string;
        token?: string;
        deepLink?: string;
      };
      if (!data.ok || !data.token || !data.deepLink) {
        setError(ERROR_COPY[data.reason ?? ""] ?? "Не удалось создать сессию.");
        return;
      }
      setDeepLinkSession({ token: data.token, deepLink: data.deepLink });
      // Open in new tab so the polling page stays mounted
      window.open(data.deepLink, "_blank", "noopener,noreferrer");
    });
  }

  function unlink() {
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/account/telegram/unlink", { method: "POST" });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; reason?: string };
      if (!data.ok) {
        setError(ERROR_COPY[data.reason ?? ""] ?? "Не удалось отвязать. Попробуй позже.");
        return;
      }
      setLinked(null);
      router.refresh();
    });
  }

  if (linked) {
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-xl border border-[var(--b-soft)] bg-[var(--bg-2)] px-4 py-3">
          <CheckCircle2 size={18} className="text-[var(--brand-gold)] mt-0.5 shrink-0" />
          <div className="min-w-0 text-sm">
            <div className="font-semibold text-[var(--t-1)]">Telegram привязан</div>
            <div className="text-[var(--t-3)] mt-0.5">
              ID: <span className="font-mono">{linked.id}</span>
              {linked.username ? (
                <>
                  {" · "}
                  <span>@{linked.username}</span>
                </>
              ) : null}
              {linked.firstName ? (
                <>
                  {" · "}
                  <span>{linked.firstName}</span>
                </>
              ) : null}
            </div>
          </div>
        </div>

        {error ? (
          <div className="flex gap-2 text-sm text-[var(--red)] bg-[var(--red)]/10 border border-[var(--red)]/30 rounded-lg px-3 py-2">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        ) : null}

        <Button
          variant="secondary"
          onClick={unlink}
          disabled={pending}
          iconLeft={
            pending ? <Loader2 size={16} className="animate-spin" /> : <Unlink size={16} />
          }
        >
          {pending ? "Отвязываем…" : "Отвязать Telegram"}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-xl border border-[var(--b-soft)] bg-[var(--bg-2)] px-4 py-3 text-sm">
        <Send size={18} className="text-[var(--t-3)] mt-0.5 shrink-0" />
        <div className="text-[var(--t-2)]">
          Привяжи Telegram, чтобы получать сигналы в боте и пользоваться Mini App.
        </div>
      </div>

      <div className="rounded-xl border border-[var(--b-soft)] bg-[var(--bg-2)] p-4 space-y-3">
        <div>
          <div className="font-semibold text-sm text-[var(--t-1)] mb-1">
            Через бота (рекомендуется)
          </div>
          <div className="text-xs text-[var(--t-3)] mb-3">
            Откроется чат с ботом → ты жмёшь «Запустить» → привязка сделана. Без ввода номера.
          </div>
          {deepLinkSession ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-[var(--t-2)]">
                <Loader2 size={14} className="animate-spin text-[var(--brand-gold)]" />
                <span>Ждём подтверждения в Telegram…</span>
              </div>
              <a
                href={deepLinkSession.deepLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[var(--brand-gold)] hover:underline inline-flex items-center gap-1"
              >
                <ExternalLink size={12} />
                Открыть бота заново
              </a>
            </div>
          ) : (
            <Button
              onClick={startDeepLink}
              disabled={pending}
              iconLeft={
                pending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />
              }
            >
              {pending ? "Создаём ссылку…" : "Открыть бота и привязать"}
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-[var(--b-soft)] bg-[var(--bg-2)] p-4 space-y-3">
        <div>
          <div className="font-semibold text-sm text-[var(--t-1)] mb-1">Через виджет в браузере</div>
          <div className="text-xs text-[var(--t-3)] mb-3">
            Запросит номер телефона в первый раз, потом запомнит браузер.
          </div>
          <div ref={widgetRef} aria-label="Привязать Telegram через виджет" />
        </div>
      </div>

      {error ? (
        <div className="flex gap-2 text-sm text-[var(--red)] bg-[var(--red)]/10 border border-[var(--red)]/30 rounded-lg px-3 py-2">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      ) : null}
    </div>
  );
}
