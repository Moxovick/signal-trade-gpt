"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Unlink } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TelegramDeeplinkButton } from "@/components/auth/TelegramDeeplinkButton";

type Props = {
  initialLink: { id: string; username: string | null; firstName: string | null } | null;
};

const ERROR_COPY: Record<string, string> = {
  unauthorized: "Войди заново.",
  not_configured: "Telegram-бот не настроен на сервере. Свяжись с админом.",
  bot_not_configured: "Telegram-бот не настроен на сервере.",
};

export function TelegramLinkSection({ initialLink }: Props) {
  const router = useRouter();
  const [linked, setLinked] = useState(initialLink);
  const [error, setError] = useState<string | null>(null);
  const [unlinking, startUnlink] = useTransition();

  function unlink() {
    setError(null);
    startUnlink(async () => {
      const res = await fetch("/api/account/telegram/unlink", { method: "POST" });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; reason?: string };
      if (!data.ok) {
        setError(ERROR_COPY[data.reason ?? ""] ?? "Не удалось отвязать.");
        return;
      }
      setLinked(null);
      router.refresh();
    });
  }

  if (linked) {
    return (
      <div className="space-y-3">
        <div className="flex items-start gap-3 rounded-xl border border-[var(--green)]/30 bg-[var(--green)]/5 px-4 py-3">
          <CheckCircle2 size={18} className="text-[var(--green)] mt-0.5 shrink-0" />
          <div className="flex-1 text-sm">
            <div className="font-semibold text-[var(--t-1)]">Telegram привязан</div>
            <div className="text-[var(--t-3)] mt-0.5">
              ID: <code className="text-xs">{linked.id}</code>
              {linked.username ? <> · @{linked.username}</> : null}
              {linked.firstName && !linked.username ? <> · {linked.firstName}</> : null}
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          onClick={unlink}
          disabled={unlinking}
          iconLeft={<Unlink size={14} />}
        >
          {unlinking ? "Отвязываем…" : "Отвязать"}
        </Button>
        {error ? (
          <div className="flex items-center gap-2 text-sm text-[var(--red)]">
            <AlertCircle size={14} /> {error}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--t-2)]">
        Привяжешь Telegram — получишь сигналы прямо в чат и сможешь открыть Mini App.
        Без ввода номера: жмёшь кнопку, открываешь чат с ботом, нажимаешь «Запустить».
      </p>
      <TelegramDeeplinkButton purpose="link" onLinked={(info) => {
        setLinked({ id: info.telegramId ?? "", username: null, firstName: null });
      }} />
    </div>
  );
}
