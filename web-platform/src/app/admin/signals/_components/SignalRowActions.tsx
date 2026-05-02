"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type Result = "pending" | "win" | "loss";

export function SignalRowActions({
  id,
  result,
  isActive,
}: {
  id: string;
  result: Result;
  isActive: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function patch(body: Record<string, unknown>) {
    setError(null);
    const res = await fetch("/api/admin/signals", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...body }),
    });
    if (!res.ok) {
      const data: { error?: string } = await res.json().catch(() => ({}));
      setError(data.error ?? `Ошибка ${res.status}`);
      return;
    }
    startTransition(() => router.refresh());
  }

  async function remove() {
    if (!confirm("Удалить сигнал безвозвратно?")) return;
    setError(null);
    const res = await fetch(`/api/admin/signals?id=${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const data: { error?: string } = await res.json().catch(() => ({}));
      setError(data.error ?? `Ошибка ${res.status}`);
      return;
    }
    startTransition(() => router.refresh());
  }

  const btn =
    "px-2 py-1 rounded text-[10px] font-semibold uppercase tracking-wider transition-colors disabled:opacity-50";

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {result === "pending" && (
        <>
          <button
            onClick={() => patch({ result: "win" })}
            disabled={pending}
            className={`${btn} bg-green-500/15 text-green-400 hover:bg-green-500/25`}
          >
            WIN
          </button>
          <button
            onClick={() => patch({ result: "loss" })}
            disabled={pending}
            className={`${btn} bg-red-500/15 text-red-400 hover:bg-red-500/25`}
          >
            LOSS
          </button>
        </>
      )}
      {result !== "pending" && (
        <button
          onClick={() => patch({ result: "pending" })}
          disabled={pending}
          className={`${btn} bg-white/5 text-[#888] hover:bg-white/10`}
        >
          ↺ pending
        </button>
      )}
      <button
        onClick={() => patch({ isActive: !isActive })}
        disabled={pending}
        className={`${btn} ${
          isActive
            ? "bg-yellow-500/15 text-yellow-400 hover:bg-yellow-500/25"
            : "bg-white/5 text-[#777] hover:bg-white/10"
        }`}
        title={isActive ? "Скрыть от пользователей" : "Сделать активным"}
      >
        {isActive ? "Активен" : "Скрыт"}
      </button>
      <button
        onClick={remove}
        disabled={pending}
        className={`${btn} bg-red-500/10 text-red-400/80 hover:bg-red-500/20`}
      >
        ✕
      </button>
      {error && (
        <span className="text-[10px] text-red-400 ml-2">{error}</span>
      )}
    </div>
  );
}
