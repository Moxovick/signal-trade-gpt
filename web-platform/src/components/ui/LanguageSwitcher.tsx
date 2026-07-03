"use client";

import { useState, useTransition } from "react";
import { Globe } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type Locale = "ru" | "uk";

function readLocaleCookie(): Locale {
  if (typeof document === "undefined") return "ru";
  const match = document.cookie.match(/(?:^|;\s*)locale=(ru|uk)/);
  return (match?.[1] as Locale) ?? "ru";
}

export function LanguageSwitcher({ locale }: { locale?: Locale }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useState<Locale | null>(null);

  const isAuthenticated = status === "authenticated" && !!session?.user;

  // Determine current locale: prop > optimistic > cookie
  const current: Locale = optimistic ?? locale ?? readLocaleCookie();
  const next: Locale = current === "ru" ? "uk" : "ru";

  async function handleSwitch() {
    setOptimistic(next);

    const maxAge = 60 * 60 * 24 * 365;
    document.cookie = `locale=${next}; path=/; max-age=${maxAge}; SameSite=Lax`;

    if (isAuthenticated) {
      try {
        await fetch("/api/account/preferences", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ language: next }),
        });
      } catch {
        // best-effort — still reload
      }
      startTransition(() => {
        router.refresh();
      });
    } else {
      // Set cookie (1 year) and reload so server pages pick up new locale
      const maxAge = 60 * 60 * 24 * 365;
      document.cookie = `locale=${next}; path=/; max-age=${maxAge}; SameSite=Lax`;
      window.location.reload();
    }
  }

  return (
    <button
      type="button"
      onClick={handleSwitch}
      title={next === "uk" ? "Переключити на українську" : "Переключить на русский"}
      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all select-none"
      style={{
        border: "1px solid var(--b-soft)",
        background: "var(--bg-2)",
        color: "var(--t-2)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.color = "var(--brand-gold)";
        (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--brand-gold)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.color = "var(--t-2)";
        (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--b-soft)";
      }}
    >
      <Globe size={13} />
      <span>{current.toUpperCase()}</span>
    </button>
  );
}
