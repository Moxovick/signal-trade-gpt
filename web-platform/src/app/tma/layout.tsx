/**
 * Telegram Mini App layout.
 *
 * Lives at /tma/* — a fully-isolated routing tree (no website chrome).
 * Uses the same design tokens as the main site (gold/dark) so the mini-app
 * feels like a Telegram-native shell of the website.
 */
import type { Metadata, Viewport } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Signal Trade GPT",
};

export const viewport: Viewport = {
  themeColor: "#08060a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function TmaLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
      <div
        className="min-h-screen text-[var(--t-1)]"
        style={{
          background:
            "radial-gradient(ellipse at top, rgba(212,160,23,0.06), transparent 60%), var(--bg-0)",
        }}
      >
        {children}
      </div>
    </>
  );
}
