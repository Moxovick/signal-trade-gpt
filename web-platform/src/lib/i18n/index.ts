/**
 * i18n — lightweight dictionary-based translation system.
 *
 * Server Components:  const t = await getDictionaryForUser(userId);
 * Client Components:  const { t } = useI18n();  (via I18nProvider in layout)
 */

import type { Locale } from "./types";

/* eslint-disable @typescript-eslint/no-explicit-any */
export type Dictionary = Record<string, any>;

const dictionaries: Record<string, () => Promise<Dictionary>> = {
  ru: () => import("./ru").then((m) => m.default as Dictionary),
  uk: () => import("./uk").then((m) => m.default as Dictionary),
};

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  const loader = dictionaries[locale] ?? dictionaries.ru;
  return loader();
}

export async function getDictionaryForUser(userId: string): Promise<Dictionary> {
  const locale = await getLocaleForUser(userId);
  return getDictionary(locale);
}

let _localeCache: { userId: string; locale: Locale; ts: number } | null = null;

export async function getLocaleForUser(userId: string): Promise<Locale> {
  // Deduplicate within the same request (same userId within 50ms window)
  if (_localeCache && _localeCache.userId === userId && Date.now() - _localeCache.ts < 50) {
    return _localeCache.locale;
  }
  const { getPreferences } = await import("@/lib/user-preferences");
  const prefs = await getPreferences(userId);
  const locale: Locale = prefs.language === "uk" ? "uk" : "ru";
  _localeCache = { userId, locale, ts: Date.now() };
  return locale;
}

export async function getLocaleFromCookies(): Promise<Locale> {
  const { cookies } = await import("next/headers");
  const c = await cookies();
  const val = c.get("locale")?.value;
  return val === "uk" ? "uk" : "ru";
}

export { type Locale } from "./types";
