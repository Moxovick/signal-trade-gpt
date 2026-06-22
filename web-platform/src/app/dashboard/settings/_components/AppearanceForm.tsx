"use client";

import { useState, useTransition } from "react";
import { Save, Check, Globe, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/lib/i18n/context";
import type {
  Language,
  Theme,
  UserPreferences,
} from "@/lib/user-preferences";

const LANGUAGES: { value: Language; native: string }[] = [
  { value: "ru", native: "RU" },
  { value: "en", native: "EN" },
  { value: "uk", native: "UA" },
];

const TIMEZONE_DATA = [
  { tz: "UTC",                 label: "UTC +0"    },
  { tz: "Europe/London",       label: "UTC +0/+1" },
  { tz: "Europe/Berlin",       label: "UTC +1/+2" },
  { tz: "Europe/Warsaw",       label: "UTC +1/+2" },
  { tz: "Europe/Kyiv",         label: "UTC +2/+3" },
  { tz: "Europe/Minsk",        label: "UTC +3"    },
  { tz: "Europe/Moscow",       label: "UTC +3"    },
  { tz: "Asia/Dubai",          label: "UTC +4"    },
  { tz: "Asia/Tashkent",       label: "UTC +5"    },
  { tz: "Asia/Almaty",         label: "UTC +6"    },
  { tz: "Asia/Bangkok",        label: "UTC +7"    },
  { tz: "Asia/Tokyo",          label: "UTC +9"    },
  { tz: "America/New_York",    label: "UTC -5/-4" },
  { tz: "America/Los_Angeles", label: "UTC -8/-7" },
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
    localStorage.setItem("ss_theme", theme);
  } catch {
    // ignore
  }
}

export function AppearanceForm({
  initialPrefs,
}: {
  initialPrefs: UserPreferences;
}) {
  const { t } = useI18n();

  const CITY_LABELS: Record<string, string> = {
    UTC: "UTC",
    "Europe/London": t.appearance.cityLondon,
    "Europe/Berlin": t.appearance.cityBerlin,
    "Europe/Warsaw": t.appearance.cityWarsaw,
    "Europe/Kyiv": t.appearance.cityKyiv,
    "Europe/Minsk": t.appearance.cityMinsk,
    "Europe/Moscow": t.appearance.cityMoscow,
    "Asia/Dubai": t.appearance.cityDubai,
    "Asia/Tashkent": t.appearance.cityTashkent,
    "Asia/Almaty": t.appearance.cityAlmaty,
    "Asia/Bangkok": t.appearance.cityBangkok,
    "Asia/Tokyo": t.appearance.cityTokyo,
    "America/New_York": t.appearance.cityNewYork,
    "America/Los_Angeles": t.appearance.cityLosAngeles,
  };

  const TIMEZONES = TIMEZONE_DATA.map(({ tz, label }) => ({
    tz,
    label,
    city: CITY_LABELS[tz] ?? tz,
  }));

  const LANG_LABELS: Record<string, string> = {
    ru: t.appearance.langRu,
    en: t.appearance.langEn,
    uk: t.appearance.langUk,
  };

  const [language, setLanguage] = useState<Language>(initialPrefs.language);
  const [timezone, setTimezone] = useState(initialPrefs.timezone);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  async function save() {
    setError(null);
    setSaved(false);
    start(async () => {
      const r = await fetch("/api/account/preferences", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ theme: "dark", language, timezone }),
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
