"use client";

import { useEffect, useState } from "react";
import { Save, RefreshCw, Trophy } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { useI18n } from "@/lib/i18n/context";

type LeaderboardEntry = {
  nickname: string;
  earnings: number;
  signals: number;
};

const RUSSIAN_NICKNAMES = [
  "Алексей_Трейдер",
  "МаксимPRO",
  "Виктория_FX",
  "Дмитрий_Gold",
  "Анна_Сигнал",
  "Сергей_Мастер",
  "Елена_Топ",
  "Николай_Win",
  "Ольга_Профит",
  "Андрей_Капитал",
];

function generateRandom(): LeaderboardEntry[] {
  return RUSSIAN_NICKNAMES.map((nickname) => ({
    nickname,
    earnings: Math.floor(Math.random() * 49500) + 500,
    signals: Math.floor(Math.random() * 481) + 20,
  })).sort((a, b) => b.earnings - a.earnings);
}

export default function AdminLeaderboardPage() {
  const { t } = useI18n();
  const tl = t?.admin?.leaderboard ?? {};

  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/leaderboard");
      const j = await r.json();
      setEntries(j.entries ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  async function handleSave() {
    setSaving(true);
    setMessage("");
    try {
      const r = await fetch("/api/admin/leaderboard", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ entries }),
      });
      if (r.ok) {
        setMessage("Сохранено");
      } else {
        const j = await r.json();
        setMessage(`Ошибка: ${j.error}`);
      }
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    setEntries(generateRandom());
    setMessage("");
  }

  function updateEntry(index: number, field: keyof LeaderboardEntry, value: string) {
    setEntries((prev) => {
      const next = [...prev];
      const entry = { ...next[index] };
      if (field === "nickname") {
        entry.nickname = value;
      } else if (field === "earnings") {
        entry.earnings = Number(value) || 0;
      } else if (field === "signals") {
        entry.signals = Number(value) || 0;
      }
      next[index] = entry;
      return next;
    });
  }

  const displayEntries = entries.length >= 10
    ? entries
    : [...entries, ...Array.from({ length: 10 - entries.length }, () => ({ nickname: "", earnings: 0, signals: 0 }))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Trophy size={20} className="text-[var(--brand-gold)]" />
          <h1 className="text-xl font-bold">{tl.title ?? "Лидерборд — Топ 10"}</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--b-soft)] bg-[var(--bg-1)] text-sm font-medium hover:border-[var(--b-hard)] transition-colors"
          >
            <RefreshCw size={14} />
            {tl.reset ?? "Сбросить (рандом)"}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--brand-gold)] text-[#1a1208] text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Save size={14} />
            {saving ? (tl.saving ?? "Сохранение...") : (tl.save ?? "Сохранить")}
          </button>
        </div>
      </div>

      {message && (
        <div className={`text-sm px-4 py-2 rounded-lg ${message.startsWith("Ошибка") ? "bg-red-500/10 text-red-400" : "bg-green-500/10 text-green-400"}`}>
          {message}
        </div>
      )}

      <Card>
        {loading ? (
          <div className="p-8 text-center text-[var(--t-3)]">{tl.loading ?? "Загрузка..."}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--b-soft)] text-left text-xs uppercase tracking-wider text-[var(--t-3)]">
                  <th className="px-4 py-3 w-12">#</th>
                  <th className="px-4 py-3">{tl.columns?.nick ?? "Ник"}</th>
                  <th className="px-4 py-3 w-40">{tl.columns?.earned ?? "Заработали ($)"}</th>
                  <th className="px-4 py-3 w-32">{tl.columns?.signals ?? "Сигналы"}</th>
                </tr>
              </thead>
              <tbody>
                {displayEntries.slice(0, 10).map((entry, i) => (
                  <tr key={i} className="border-b border-[var(--b-soft)] last:border-b-0">
                    <td className="px-4 py-2 text-[var(--t-3)] font-mono">{i + 1}</td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={entry.nickname}
                        onChange={(e) => updateEntry(i, "nickname", e.target.value)}
                        className="w-full bg-[var(--bg-0)] border border-[var(--b-soft)] rounded px-3 py-1.5 text-sm focus:border-[var(--brand-gold)] focus:outline-none"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        value={entry.earnings}
                        onChange={(e) => updateEntry(i, "earnings", e.target.value)}
                        className="w-full bg-[var(--bg-0)] border border-[var(--b-soft)] rounded px-3 py-1.5 text-sm font-mono focus:border-[var(--brand-gold)] focus:outline-none"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        value={entry.signals}
                        onChange={(e) => updateEntry(i, "signals", e.target.value)}
                        className="w-full bg-[var(--bg-0)] border border-[var(--b-soft)] rounded px-3 py-1.5 text-sm font-mono focus:border-[var(--brand-gold)] focus:outline-none"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
