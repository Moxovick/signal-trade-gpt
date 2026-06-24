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
  const { getPreferences } = await import("@/lib/user-preferences");
  const prefs = await getPreferences(userId);
  const locale: Locale = prefs.language === "uk" ? "uk" : "ru";
  return getDictionary(locale);
}

export async function getLocaleForUser(userId: string): Promise<Locale> {
  const { getPreferences } = await import("@/lib/user-preferences");
  const prefs = await getPreferences(userId);
  return prefs.language === "uk" ? "uk" : "ru";
}

export async function getLocaleFromCookies(): Promise<Locale> {
  const { cookies } = await import("next/headers");
  const c = await cookies();
  const val = c.get("locale")?.value;
  return val === "uk" ? "uk" : "ru";
}

export { type Locale } from "./types";
