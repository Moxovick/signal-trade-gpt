"use client";

import { useState, useTransition } from "react";
import { Link2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function LinkPoAccountForm() {
  const router = useRouter();
  const [traderId, setTraderId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const res = await fetch("/api/po/submit-id", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ traderId }),
      });
      const data = (await res.json()) as { ok: boolean; reason?: string };
      if (!data.ok) {
        const map: Record<string, string> = {
          invalid_trader_id: "Неверный формат ID — должно быть 4–12 цифр.",
          trader_id_taken: "Этот ID уже привязан к другому пользователю.",
          unauthorized: "Нужно войти.",
        };
        setError(map[data.reason ?? ""] ?? "Не удалось привязать ID.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="flex items-center gap-2">
      <input
        type="text"
        inputMode="numeric"
        placeholder="Свой ID на PocketOption"
        value={traderId}
        onChange={(e) => setTraderId(e.target.value.replace(/\D/g, ""))}
        className="h-11 px-4 rounded-full border border-[var(--b-soft)] bg-[var(--bg-2)] text-[var(--t-1)] text-sm focus:outline-none focus:border-[var(--b-hard)] w-44"
      />
      <button
        type="submit"
        disabled={pending || traderId.length < 4}
        className="inline-flex items-center gap-2 h-11 px-5 rounded-full text-sm font-medium border border-[var(--b-hard)] text-[var(--brand-gold)] hover:bg-[rgba(212,160,23,0.05)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Link2 size={14} />
        {pending ? "Проверяем..." : "Привязать"}
      </button>
      {error && (
        <span className="text-xs text-[var(--red)] ml-2">{error}</span>
      )}
    </form>
  );
}
