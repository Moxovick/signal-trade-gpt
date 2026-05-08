"use client";

import { useEffect, useState } from "react";
import { Crown } from "lucide-react";
import { TmaShell } from "../_components/TmaShell";

type Entry = {
  rank: number;
  user: { firstName: string | null; email: string | null };
  totalProfit?: number | string | null;
  winRate?: number | string | null;
};

export default function TmaLeadersPage() {
  return <TmaShell>{() => <Leaders />}</TmaShell>;
}

function Leaders() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    void (async () => {
      try {
        const r = await fetch("/api/leaderboard", { cache: "no-store" });
        if (r.ok) {
          const j = (await r.json()) as { entries: Entry[] };
          if (alive) setEntries(j.entries);
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <main className="max-w-md mx-auto p-4 space-y-4">
      <header className="pt-2">
        <div className="text-xs text-[var(--t-3)] uppercase tracking-[0.2em]">Сообщество</div>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Crown size={18} className="text-[var(--brand-gold)]" />
          Лидеры
        </h1>
      </header>

      <div className="rounded-2xl border border-[var(--b-soft)] bg-[var(--bg-1)] divide-y divide-[var(--b-soft)]">
        {loading ? (
          <div className="p-6 text-center text-sm text-[var(--t-3)] animate-pulse">Загружаем…</div>
        ) : entries.length === 0 ? (
          <div className="p-6 text-center text-sm text-[var(--t-3)]">Пока пусто</div>
        ) : (
          entries.map((e) => {
            const name =
              e.user.firstName ||
              (e.user.email ? e.user.email.split("@")[0] : `Игрок #${e.rank}`);
            const profit = Number(e.totalProfit ?? 0);
            const win = Number(e.winRate ?? 0);
            return (
              <div key={e.rank} className="flex items-center gap-3 p-3">
                <div
                  className={`size-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    e.rank === 1
                      ? "bg-[var(--brand-gold)] text-[#1a1208]"
                      : e.rank <= 3
                        ? "bg-[var(--brand-gold)]/20 text-[var(--brand-gold)]"
                        : "bg-[var(--bg-2)] text-[var(--t-2)]"
                  }`}
                >
                  {e.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{name}</div>
                  <div className="text-xs text-[var(--t-3)]">
                    Профит: ${Math.round(profit)} · WR {Math.round(win)}%
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </main>
  );
}
