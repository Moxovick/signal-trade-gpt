"use client";

import { useEffect, useState, useTransition } from "react";
import { Sun, Moon, Monitor, Save, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type {
  Language,
  Theme,
  UserPreferences,
} from "@/lib/user-preferences";

const THEMES: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Светлая", icon: Sun },
  { value: "dark", label: "Тёмная", icon: Moon },
  { value: "auto", label: "Системная", icon: Monitor },
];

const LANGUAGES: { value: Language; label: string; flag: string }[] = [
  { value: "ru", label: "Русский", flag: "RU" },
  { value: "en", label: "English", flag: "EN" },
  { value: "uk", label: "Українська", flag: "UA" },
];

const TIMEZONES = [
  "UTC",
  "Europe/Kyiv",
  "Europe/Moscow",
  "Europe/Minsk",
  "Europe/Warsaw",
  "Europe/London",
  "Europe/Berlin",
  "Asia/Almaty",
  "Asia/Tashkent",
  "Asia/Dubai",
  "Asia/Bangkok",
  "Asia/Tokyo",
  "America/New_York",
  "America/Los_Angeles",
];

/** Apply theme to document.html dataset and write localStorage so the
    choice persists on next reload before SSR. */
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

  return (
    <div className="space-y-8">
      <section>
        <label className="block text-[13px] font-semibold text-[var(--t-2)] mb-2">
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
                className={`flex flex-col items-center justify-center gap-2 py-4 rounded-xl border text-sm transition-colors ${
                  active
                    ? "border-[var(--brand-gold)] bg-[rgba(212,160,23,0.08)] text-[var(--brand-gold)]"
                    : "border-[var(--b-soft)] text-[var(--t-2)] hover:border-[var(--b-hard)]"
                }`}
              >
                <Icon size={20} />
                {label}
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <label className="block text-[13px] font-semibold text-[var(--t-2)] mb-2">
          Язык интерфейса
        </label>
        <div className="grid grid-cols-3 gap-3">
          {LANGUAGES.map(({ value, label, flag }) => {
            const active = language === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setLanguage(value)}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm transition-colors ${
                  active
                    ? "border-[var(--brand-gold)] bg-[rgba(212,160,23,0.08)] text-[var(--brand-gold)]"
                    : "border-[var(--b-soft)] text-[var(--t-2)] hover:border-[var(--b-hard)]"
                }`}
              >
                <span className="font-mono text-xs text-[var(--t-3)]">
                  {flag}
                </span>
                {label}
              </button>
            );
          })}
        </div>
        {language !== "ru" && (
          <p className="text-[11px] text-[var(--t-3)] mt-2">
            Поддержка {language.toUpperCase()} — в процессе, часть текстов пока
            на русском.
          </p>
        )}
      </section>

      <section>
        <label
          htmlFor="tz"
          className="block text-[13px] font-semibold text-[var(--t-2)] mb-2"
        >
          Часовой пояс
        </label>
        <select
          id="tz"
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className="w-full h-11 px-4 rounded-xl bg-[var(--bg-2)] border border-[var(--b-soft)] text-sm focus:border-[var(--b-hard)] focus:outline-none"
        >
          {TIMEZONES.map((tz) => (
            <option key={tz} value={tz}>
              {tz.replace("_", " ")}
            </option>
          ))}
        </select>
        <p className="text-[11px] text-[var(--t-3)] mt-2">
          Текущее время в выбранной зоне:{" "}
          {new Date().toLocaleString("ru-RU", { timeZone: timezone })}
        </p>
      </section>

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
