"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Locale } from "./types";
import type { Dictionary } from "./index";

const I18nContext = createContext<{ locale: Locale; t: Dictionary }>({
  locale: "ru",
  t: {},
});

export function I18nProvider({
  locale,
  dictionary,
  children,
}: {
  locale: Locale;
  dictionary: Dictionary;
  children: ReactNode;
}) {
  return (
    <I18nContext.Provider value={{ locale, t: dictionary }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}

export function useLocale(): Locale {
  return useContext(I18nContext).locale;
}
