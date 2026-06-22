/**
 * i18n — lightweight dictionary-based translation system.
 *
 * Usage in Server Components:
 *   const t = await getDictionary(userId);
 *   <h1>{t.dashboard.title}</h1>
 *
 * Usage in Client Components:
 *   const t = useT();
 *   <h1>{t.dashboard.title}</h1>
 */

import type { Locale } from "./types";

const dictionaries = {
  ru: () => import("./ru").then((m) => m.default),
  uk: () => import("./uk").then((m) => m.default),
};

export type Dictionary = Awaited<ReturnType<(typeof dictionaries)["ru"]>>;

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  const loader = dictionaries[locale] ?? dictionaries.ru;
  return loader();
}

export async function getDictionaryForUser(userId: string): Promise<Dictionary> {
  const { getPreferences } = await import("@/lib/user-preferences");
  const prefs = await getPreferences(userId);
  const locale = (prefs.language === "uk" ? "uk" : "ru") as Locale;
  return getDictionary(locale);
}

export async function getLocaleForUser(userId: string): Promise<Locale> {
  const { getPreferences } = await import("@/lib/user-preferences");
  const prefs = await getPreferences(userId);
  return prefs.language === "uk" ? "uk" : "ru";
}

export { type Locale } from "./types";
