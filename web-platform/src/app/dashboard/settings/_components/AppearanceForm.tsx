"use client";

import { useEffect, useState, useTransition } from "react";
import { Sun, Moon, Monitor, Save, Check, Globe, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type {
  Language,
  Theme,
  UserPreferences,
} from "@/lib/user-preferences";

const THEMES: { value: Theme; label: string; icon: typeof Sun; preview: string }[] = [
  {
    value: "light",
    label: "Светлая",
    icon: Sun,
    preview: "bg-[#f7f3ea] border-[#d4a017]",
  },
  {
    value: "dark",
    label: "Тёмная",
    icon: Moon,
    preview: "bg-[#08060a] border-[#d4a017]",
  },
  {
    value: "auto",
    label: "Авто",
    icon: Monitor,
    preview: "bg-gradient-to-br from-[#08060a] to-[#f7f3ea] border-[var(--b-soft)]",
  },
];

const LANGUAGES: { value: Language; label: string; native: string }[] = [
  { value: "ru", label: "Русский", native: "RU" },
  { value: "en", label: "English", native: "EN" },
  { value: "uk", label: "Українська", native: "UA" },
];

const TIMEZONES = [
  { tz: "UTC",               label: "UTC +0",    city: "UTC"        },
  { tz: "Europe/London",     label: "UTC +0/+1", city: "Лондон"     },
  { tz: "Europe/Berlin",     label: "UTC +1/+2", city: "Берлин"     },
  { tz: "Europe/Warsaw",     label: "UTC +1/+2", city: "Варшава"    },
  { tz: "Europe/Kyiv",       label: "UTC +2/+3", city: "Киев"       },
  { tz: "Europe/Minsk",      label: "UTC +3",    city: "Минск"      },
  { tz: "Europe/Moscow",     label: "UTC +3",    city: "Москва"     },
  { tz: "Asia/Dubai",        label: "UTC +4",    city: "Дубай"      },
  { tz: "Asia/Tashkent",     label: "UTC +5",    city: "Ташкент"    },
  { tz: "Asia/Almaty",       label: "UTC +6",    city: "Алматы"     },
  { tz: "Asia/Bangkok",      label: "UTC +7",    city: "Бангкок"    },
  { tz: "Asia/Tokyo",        label: "UTC +9",    city: "Токио"      },
  { tz: "America/New_York",  label: "UTC -5/-4", city: "Нью-Йорк"   },
  { tz: "America/Los_Angeles", label: "UTC -8/-7", city: "Лос-Анджелес" },
];

export function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  const effective =
    theme === "auto"
      ? window.matchMedia?.("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : theme;
  document.documentElement.dataset["theme"] = effective;
  try {
    localStorage.setItem("stg_theme", theme);
  } catch {
    // ignore
  }
}

export function AppearanceForm({
  initialPrefs,
}: {
  initialPrefs: UserPreferences;
}) {
  const [theme, setTheme] = useState<Theme>(initialPrefs.theme);
  const [language, setLanguage] = useState<Language>(initialPrefs.language);
  const [timezone, setTimezone] = useState(initialPrefs.timezone);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  async function save() {
    setError(null);
    setSaved(false);
    start(async () => {
      const r = await fetch("/api/account/preferences", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ theme, language, timezone }),
      });
      if (!r.ok) {
        setError("Не удалось сохранить. Попробуй ещё раз.");
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  const currentTzEntry = TIMEZONES.find((t) => t.tz === timezone);
  const currentTime = new Date().toLocaleString("ru-RU", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div className="space-y-7">
      {/* Theme */}
      <section>
        <label className="flex items-center gap-2 text-[13px] font-semibold text-[var(--t-1)] mb-3">
          <Sun size={14} className="text-[var(--brand-gold)]" />
          Тема оформления
        </label>
        <div className="grid grid-cols-3 gap-3">
          {THEMES.map(({ value, label, icon: Icon }) => {
            const active = theme === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setTheme(value)}
                className={`relative flex flex-col items-center gap-2.5 py-5 rounded-xl border text-sm transition-all duration-200 ${
                  active
                    ? "border-[var(--brand-gold)] bg-[rgba(212,160,23,0.08)]"
                    : "border-[var(--b-soft)] hover:border-[var(--b-hard)] hover:bg-[var(--bg-2)]"
                }`}
              >
                {active && (
                  <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[var(--brand-gold)] flex items-center justify-center">
                    <Check size={10} style={{ color: "#1a1208" }} />
                  </span>
                )}
                <Icon
                  size={22}
                  className={active ? "text-[var(--brand-gold)]" : "text-[var(--t-3)]"}
                />
                <span
                  className={`text-[13px] font-medium ${
                    active ? "text-[var(--brand-gold)]" : "text-[var(--t-2)]"
                  }`}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Language */}
      <section>
        <label className="flex items-center gap-2 text-[13px] font-semibold text-[var(--t-1)] mb-3">
          <Globe size={14} className="text-[var(--brand-gold)]" />
          Язык интерфейса
        </label>
        <div className="grid grid-cols-3 gap-3">
          {LANGUAGES.map(({ value, label, native }) => {
            const active = language === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setLanguage(value)}
                className={`flex flex-col items-center gap-1.5 py-4 rounded-xl border text-sm transition-all duration-200 ${
                  active
                    ? "border-[var(--brand-gold)] bg-[rgba(212,160,23,0.08)]"
                    : "border-[var(--b-soft)] hover:border-[var(--b-hard)] hover:bg-[var(--bg-2)]"
                }`}
              >
                <span
                  className="text-base font-black"
                  style={{
                    fontFamily: "var(--font-jetbrains)",
                    color: active ? "var(--brand-gold)" : "var(--t-2)",
                  }}
                >
                  {native}
                </span>
                <span
                  className={`text-[12px] ${
                    active ? "text-[var(--brand-gold)]" : "text-[var(--t-3)]"
                  }`}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
        {language !== "ru" && (
          <p className="text-[11px] text-[var(--t-3)] mt-2 pl-1">
            Поддержка {language.toUpperCase()} в процессе — часть текстов пока на русском.
          </p>
        )}
      </section>

      {/* Timezone */}
      <section>
        <label
          htmlFor="tz"
          className="flex items-center gap-2 text-[13px] font-semibold text-[var(--t-1)] mb-3"
        >
          <Clock size={14} className="text-[var(--brand-gold)]" />
          Часовой пояс
        </label>
        <select
          id="tz"
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className="w-full h-11 px-4 rounded-xl bg-[var(--bg-2)] border border-[var(--b-soft)] text-sm text-[var(--t-1)] focus:border-[var(--b-hard)] focus:outline-none transition-colors"
        >
          {TIMEZONES.map(({ tz, label, city }) => (
            <option key={tz} value={tz}>
              {city} — {label}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-2 mt-2 px-1">
          <span className="text-[11px] text-[var(--t-3)]">
            {currentTzEntry?.city ?? timezone}:
          </span>
          <span
            className="text-[11px] text-[var(--t-2)] font-semibold"
            style={{ fontFamily: "var(--font-jetbrains)" }}
          >
            {currentTime}
          </span>
        </div>
      </section>

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
