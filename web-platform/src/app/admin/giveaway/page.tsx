"use client";

import { useEffect, useState } from "react";
import { Save, Gift, Trophy, Medal, Award } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { useI18n } from "@/lib/i18n/context";

type GiveawayPrize = {
  place: number;
  title: string;
};

const DEFAULTS: GiveawayPrize[] = [
  { place: 1, title: "MacBook Pro" },
  { place: 2, title: "iPhone 17 Pro Max" },
  { place: 3, title: "AirPods 3 Pro" },
];

const PLACE_META: Record<number, { icon: typeof Trophy; color: string; label: string }> = {
  1: { icon: Trophy, color: "var(--brand-gold)", label: "1-е место" },
  2: { icon: Medal, color: "#c0c0c0", label: "2-е место" },
  3: { icon: Award, color: "#cd7f32", label: "3-е место" },
};

export default function AdminGiveawayPage() {
  const { t } = useI18n();
  const gw = t?.admin?.giveaway ?? {};
  const gwPlaces = (gw as Record<string, Record<string, string>>).places ?? {};
  const [prizes, setPrizes] = useState<GiveawayPrize[]>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/giveaway");
      if (r.ok) {
        const j = await r.json();
        if (j.prizes?.length) setPrizes(j.prizes);
      }
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
      const r = await fetch("/api/admin/giveaway", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prizes }),
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

  function updateTitle(place: number, title: string) {
    setPrizes((prev) =>
      prev.map((p) => (p.place === place ? { ...p, title } : p)),
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Gift size={20} className="text-[var(--brand-gold)]" />
          <div>
            <h1 className="text-xl font-bold">{(gw as Record<string, string>).title ?? "Розыгрыш — призы"}</h1>
            <p className="text-sm text-[var(--t-3)] mt-0.5">
              {(gw as Record<string, string>).description ?? "Настройка 3 призовых мест. Отображается на /dashboard/giveaway."}
            </p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--brand-gold)] text-[#1a1208] text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <Save size={14} />
          {saving ? ((gw as Record<string, string>).saving ?? "Сохранение...") : ((gw as Record<string, string>).save ?? "Сохранить")}
        </button>
      </div>

      {message && (
        <div
          className={`text-sm px-4 py-2 rounded-lg ${
            message.startsWith("Ошибка")
              ? "bg-red-500/10 text-red-400"
              : "bg-green-500/10 text-green-400"
          }`}
        >
          {message}
        </div>
      )}

      {loading ? (
        <div className="text-[var(--t-3)] text-center py-12">Загрузка...</div>
      ) : (
        <div className="grid gap-4">
          {prizes.map((prize) => {
            const meta = PLACE_META[prize.place];
            if (!meta) return null;
            const IconComponent = meta.icon;
            return (
              <Card key={prize.place}>
                <div className="flex items-center gap-4 p-4">
                  <div
                    className="flex items-center justify-center w-12 h-12 rounded-full shrink-0"
                    style={{
                      background: `${meta.color}15`,
                      border: `1px solid ${meta.color}40`,
                    }}
                  >
                    <IconComponent size={24} style={{ color: meta.color }} />
                  </div>
                  <div className="flex-1">
                    <div
                      className="text-xs font-bold uppercase tracking-wider mb-1.5"
                      style={{ color: meta.color }}
                    >
                      {meta.label}
                    </div>
                    <input
                      type="text"
                      value={prize.title}
                      onChange={(e) => updateTitle(prize.place, e.target.value)}
                      placeholder="Название приза"
                      className="w-full bg-[var(--bg-0)] border border-[var(--b-soft)] rounded-lg px-3 py-2 text-sm focus:border-[var(--brand-gold)] focus:outline-none"
                    />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
