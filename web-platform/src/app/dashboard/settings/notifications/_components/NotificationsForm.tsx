"use client";

import { useState, useTransition } from "react";
import {
  Send,
  Bell,
  Check,
  Save,
  Zap,
  TrendingUp,
  Crown,
  Wallet,
  BarChart2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import type {
  ChannelPrefs,
  NotificationPrefs,
  UserPreferences,
} from "@/lib/user-preferences";

type EventKey = keyof NotificationPrefs;
type ChannelKey = keyof ChannelPrefs;

const EVENTS: {
  key: EventKey;
  label: string;
  description: string;
  icon: typeof Zap;
}[] = [
  {
    key: "newSignal",
    label: "Новый сигнал",
    description: "Публикуется свежий сигнал",
    icon: Zap,
  },
  {
    key: "signalResult",
    label: "Результат сигнала",
    description: "Сигнал закрылся (Win / Loss)",
    icon: TrendingUp,
  },
  {
    key: "tierUpgrade",
    label: "Повышение тира",
    description: "Депозит открыл новый уровень",
    icon: Crown,
  },
  {
    key: "deposit",
    label: "Депозит",
    description: "Подтверждение из PocketOption",
    icon: Wallet,
  },
  {
    key: "weeklyDigest",
    label: "Еженедельная сводка",
    description: "Статистика за неделю",
    icon: BarChart2,
  },
];

const CHANNELS: { key: ChannelKey; label: string; icon: typeof Send }[] = [
  { key: "telegram", label: "Telegram", icon: Send },
  { key: "browser", label: "Браузер", icon: Bell },
];

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 transition-colors duration-200 focus:outline-none ${
        checked
          ? "border-[var(--brand-gold)] bg-[var(--brand-gold)]"
          : "border-[var(--b-soft)] bg-[var(--bg-3)]"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 rounded-full shadow transition-transform duration-200 ${
          checked
            ? "translate-x-5 bg-[#1a1208]"
            : "translate-x-0.5 bg-[var(--t-3)]"
        }`}
        style={{ margin: "1px 0" }}
      />
    </button>
  );
}

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
    <div className="space-y-5">
      {/* Channel legend */}
      <div className="flex items-center gap-6 px-1">
        {CHANNELS.map(({ key, label, icon: Icon }) => (
          <div key={key} className="flex items-center gap-1.5 text-[12px] text-[var(--t-3)]">
            <Icon size={12} />
            <span>{label}</span>
          </div>
        ))}
      </div>

      {/* Event rows */}
      <div className="space-y-2">
        {EVENTS.map(({ key, label, description, icon: EventIcon }) => (
          <div
            key={key}
            className="rounded-xl border border-[var(--b-soft)] bg-[var(--bg-1)] p-4 hover:border-[var(--b-hard)] transition-colors"
          >
            <div className="flex items-start gap-3">
              {/* Event icon */}
              <div className="w-8 h-8 rounded-lg bg-[var(--bg-2)] flex items-center justify-center shrink-0 mt-0.5">
                <EventIcon size={14} className="text-[var(--brand-gold)]" />
              </div>

              {/* Event info */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-[var(--t-1)]">
                  {label}
                </div>
                <div className="text-[12px] text-[var(--t-3)] mt-0.5">
                  {description}
                </div>
              </div>

              {/* Channel toggles */}
              <div className="flex items-center gap-4 shrink-0">
                {CHANNELS.map((ch) => {
                  const ChIcon = ch.icon;
                  const on = notifs[key][ch.key];
                  return (
                    <div key={ch.key} className="flex flex-col items-center gap-1.5">
                      <ChIcon
                        size={12}
                        className={on ? "text-[var(--brand-gold)]" : "text-[var(--t-3)]"}
                      />
                      <Toggle
                        checked={on}
                        onChange={() => toggle(key, ch.key)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Browser push block */}
      <div className="rounded-xl border border-[var(--b-soft)] bg-[var(--bg-2)] px-4 py-3.5 flex items-start gap-3">
        <Bell size={16} className="text-[var(--t-3)] shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold mb-0.5">Браузерные push-уведомления</div>
          <p className="text-[12px] text-[var(--t-3)] leading-relaxed mb-3">
            Браузер запросит разрешение один раз. Без него канал «Браузер» работать не будет.
          </p>
          <Button variant="secondary" size="sm" onClick={requestBrowserPermission}>
            Запросить разрешение
          </Button>
        </div>
      </div>

      {/* Save */}
      <div className="flex items-center gap-3 pt-2 border-t border-[var(--b-soft)]">
        <Button
          onClick={save}
          disabled={pending}
          iconLeft={saved ? <Check size={14} /> : <Save size={14} />}
        >
          {pending ? "Сохраняю..." : saved ? "Сохранено" : "Сохранить"}
        </Button>
        {error && <span className="text-xs text-[var(--red)]">{error}</span>}
        {saved && (
          <span className="text-xs text-[var(--green)]">Настройки применены</span>
        )}
      </div>
    </div>
  );
}
