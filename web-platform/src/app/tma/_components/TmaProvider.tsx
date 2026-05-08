"use client";

/**
 * Reads `Telegram.WebApp.initData` once on mount and stores it in a context.
 * Also provides a typed `tmaFetch` helper that adds the `X-Telegram-Init-Data`
 * header to every request to /api/tma/*.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type TgWebApp = {
  initData: string;
  initDataUnsafe: {
    user?: {
      id: number;
      first_name?: string;
      last_name?: string;
      username?: string;
      photo_url?: string;
    };
    start_param?: string;
  };
  ready: () => void;
  expand: () => void;
  close: () => void;
  enableClosingConfirmation: () => void;
  disableClosingConfirmation: () => void;
  HapticFeedback?: {
    impactOccurred: (style: "light" | "medium" | "heavy" | "rigid" | "soft") => void;
    notificationOccurred: (type: "error" | "success" | "warning") => void;
    selectionChanged: () => void;
  };
  themeParams: Record<string, string>;
  colorScheme: "light" | "dark";
  MainButton: {
    text: string;
    setText: (t: string) => void;
    show: () => void;
    hide: () => void;
    onClick: (cb: () => void) => void;
    offClick: (cb: () => void) => void;
    setParams: (p: { text?: string; color?: string; text_color?: string; is_active?: boolean; is_visible?: boolean }) => void;
  };
};

type TmaContextValue = {
  initData: string;
  tg: TgWebApp | null;
  tmaFetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
};

const TmaContext = createContext<TmaContextValue | null>(null);

export function TmaProvider({ children }: { children: React.ReactNode }) {
  const [initData, setInitData] = useState<string>("");
  const [tg, setTg] = useState<TgWebApp | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const w = window as unknown as { Telegram?: { WebApp: TgWebApp } };
    const wa = w.Telegram?.WebApp;
    if (!wa) return;
    try {
      wa.ready();
      wa.expand();
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTg(wa);
    setInitData(wa.initData ?? "");
  }, []);

  const tmaFetch = useCallback(
    async (input: RequestInfo, init: RequestInit = {}) => {
      const headers = new Headers(init.headers ?? {});
      if (initData) headers.set("X-Telegram-Init-Data", initData);
      return fetch(input, { ...init, headers, cache: "no-store" });
    },
    [initData],
  );

  const value = useMemo(() => ({ initData, tg, tmaFetch }), [initData, tg, tmaFetch]);

  return <TmaContext.Provider value={value}>{children}</TmaContext.Provider>;
}

export function useTma() {
  const ctx = useContext(TmaContext);
  if (!ctx) throw new Error("useTma must be used inside <TmaProvider>");
  return ctx;
}
