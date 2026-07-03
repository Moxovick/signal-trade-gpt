/**
 * Telegram Mini App layout.
 *
 * Lives at /tma/* — a fully-isolated routing tree (no website chrome).
 * Uses the same design tokens as the main site (gold/dark) so the mini-app
 * feels like a Telegram-native shell of the website.
 */
import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { getDictionary, getLocaleFromCookies } from "@/lib/i18n";
import { I18nProvider } from "@/lib/i18n/context";

export const metadata: Metadata = {
  title: "SpaceSignal",
};

export const viewport: Viewport = {
  themeColor: "#08060a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function TmaLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocaleFromCookies();
  const dictionary = await getDictionary(locale);
  return (
    <I18nProvider locale={locale} dictionary={dictionary}>
      <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
      <div
        className="min-h-screen text-[var(--t-1)]"
        style={{
          background:
            "var(--bg-0)",
        }}
      >
        {children}
      </div>
    </I18nProvider>
  );
}
