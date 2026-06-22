"use client";

import {
  createContext,
  useContext,
  type ReactNode,
} from "react";
import type { Locale } from "./types";

// The dictionary type will be inferred from the actual ru.ts module
// For now we use a generic record; after dictionaries are built we can
// tighten this.
type AnyDict = Record<string, unknown>;

const I18nContext = createContext<{
  locale: Locale;
  t: AnyDict;
}>({
  locale: "ru",
  t: {},
});

export function I18nProvider({
  locale,
  dictionary,
  children,
}: {
  locale: Locale;
  dictionary: AnyDict;
  children: ReactNode;
}) {
  return (
    <I18nContext.Provider value={{ locale, t: dictionary }}>
      {children}
    </I18nContext.Provider>
  );
}

/**
 * Use in client components to access translations.
 *
 * Usage:
 *   const { t, locale } = useI18n();
 *   const nav = t.dashboardNav as typeof import("./ru").default["dashboardNav"];
 */
export function useI18n() {
  return useContext(I18nContext);
}

export function useLocale(): Locale {
  return useContext(I18nContext).locale;
}
