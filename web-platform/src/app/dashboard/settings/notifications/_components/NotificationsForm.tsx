"use client";

import { useState, useTransition } from "react";
import { Mail, Send, Bell, Check, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type {
  ChannelPrefs,
  NotificationPrefs,
  UserPreferences,
} from "@/lib/user-preferences";

type EventKey = keyof NotificationPrefs;
type ChannelKey = keyof ChannelPrefs;

const EVENTS: { key: EventKey; label: string; description: string }[] = [
  {
    key: "newSignal",
    label: "Новый сигнал",
    description: "Когда публикуется свежий сигнал на доступном тебе тире",
  },
  {
    key: "signalResult",
    label: "Результат сигнала",
    description: "Когда сигнал закрывается с Win или Loss",
  },
  {
    key: "tierUpgrade",
    label: "Повышение тира",
    description: "Когда депозит открывает новый уровень доступа",
  },
  {
    key: "deposit",
    label: "Депозит",
    description: "Подтверждение депозита из PocketOption",
  },
  {
    key: "weeklyDigest",
    label: "Недельная сводка",
    description: "Твоя статистика за неделю: сигналы, винрейт, тир",
  },
];

const CHANNELS: { key: ChannelKey; label: string; icon: typeof Mail }[] = [
  { key: "email", label: "Email", icon: Mail },
  { key: "telegram", label: "Telegram", icon: Send },
  { key: "browser", label: "Браузер", icon: Bell },
];

export function NotificationsForm({
  initialPrefs,
}: {
  initialPrefs: UserPreferences;
}) {
  const [notifs, setNotifs] = useState(initialPrefs.notifications);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function toggle(event: EventKey, channel: ChannelKey) {
    setNotifs((prev) => ({
      ...prev,
      [event]: { ...prev[event], [channel]: !prev[event][channel] },
    }));
  }

  async function save() {
    setError(null);
    setSaved(false);
    start(async () => {
      const r = await fetch("/api/account/preferences", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ notifications: notifs }),
      });
      if (!r.ok) {
        setError("Не удалось сохранить.");
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  async function requestBrowserPermission() {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    await Notification.requestPermission();
  }

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wider text-[var(--t-3)]">
              <th className="pb-3 pr-4">Событие</th>
              {CHANNELS.map(({ key, label, icon: Icon }) => (
                <th
                  key={key}
                  className="pb-3 px-3 text-center min-w-[88px] font-semibold"
                >
                  <div className="inline-flex items-center gap-1.5">
                    <Icon size={12} /> {label}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {EVENTS.map(({ key, label, description }) => (
              <tr key={key} className="border-t border-[var(--b-soft)]">
                <td className="py-3 pr-4">
                  <div className="text-sm font-medium">{label}</div>
                  <div className="text-[11px] text-[var(--t-3)]">
                    {description}
                  </div>
                </td>
                {CHANNELS.map((ch) => (
                  <td key={ch.key} className="py-3 px-3 text-center">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifs[key][ch.key]}
                        onChange={() => toggle(key, ch.key)}
                        className="sr-only peer"
                      />
                      <span className="w-9 h-5 rounded-full bg-[var(--bg-3)] relative transition-colors peer-checked:bg-[var(--brand-gold)] border border-[var(--b-soft)]">
                        <span className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-[var(--t-1)] transition-transform peer-checked:translate-x-4" />
                      </span>
                    </label>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-xl border border-[var(--b-soft)] bg-[var(--bg-2)] p-4">
        <div className="text-sm font-semibold mb-1">
          Разрешить браузерные уведомления
        </div>
        <p className="text-[12px] text-[var(--t-3)] mb-3">
          Браузер попросит разрешение показывать push-уведомления — без него
          канал «Браузер» работать не будет.
        </p>
        <Button
          variant="secondary"
          size="sm"
          onClick={requestBrowserPermission}
        >
          Запросить разрешение
        </Button>
      </div>

      <div className="flex items-center gap-3 pt-4 border-t border-[var(--b-soft)]">
        <Button
          onClick={save}
          disabled={pending}
          iconLeft={saved ? <Check size={14} /> : <Save size={14} />}
        >
          {pending ? "Сохраняю..." : saved ? "Сохранено" : "Сохранить"}
        </Button>
        {error && <span className="text-xs text-[var(--red)]">{error}</span>}
      </div>
    </div>
  );
}
