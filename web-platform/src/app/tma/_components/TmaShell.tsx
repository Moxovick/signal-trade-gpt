"use client";

/**
 * Shared shell for Mini App pages: handles `useTma` initialisation,
 * loads /api/tma/me, shows onboarding/error states, and renders the
 * authenticated children with the bottom navigation.
 */
import { useEffect, useState } from "react";
import { Send } from "lucide-react";
import { TmaProvider, useTma } from "./TmaProvider";
import { BottomNav } from "./BottomNav";

export type TmaUser = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  avatar: string | null;
  tier: number;
  role: string;
  depositTotal: number | string;
  signalsReceived: number;
  streakDays: number;
  referralCode: string;
  poAccount: { poTraderId: string; status: string; totalDeposit: number | string } | null;
};

type Status =
  | { kind: "loading" }
  | { kind: "no_tma" }
  | { kind: "no_account" }
  | { kind: "ok"; user: TmaUser }
  | { kind: "error"; message: string };

export function TmaShell({
  children,
  withNav = true,
}: {
  children: (user: TmaUser) => React.ReactNode;
  withNav?: boolean;
}) {
  return (
    <TmaProvider>
      <Inner withNav={withNav}>{children}</Inner>
    </TmaProvider>
  );
}

function Inner({
  children,
  withNav,
}: {
  children: (user: TmaUser) => React.ReactNode;
  withNav: boolean;
}) {
  const { initData, tmaFetch } = useTma();
  const [status, setStatus] = useState<Status>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;
    async function run() {
      // Allow ~300 ms for the SDK to attach initData.
      if (!initData) {
        await new Promise((r) => setTimeout(r, 300));
      }
      const w = window as unknown as { Telegram?: unknown };
      if (!w.Telegram) {
        if (!cancelled) setStatus({ kind: "no_tma" });
        return;
      }
      try {
        const r = await tmaFetch("/api/tma/me");
        if (r.status === 401) {
          const j = (await r.json().catch(() => ({}))) as { error?: string };
          if (j.error === "no_account") {
            if (!cancelled) setStatus({ kind: "no_account" });
          } else {
            if (!cancelled) setStatus({ kind: "error", message: j.error ?? "auth failed" });
          }
          return;
        }
        if (!r.ok) {
          if (!cancelled) setStatus({ kind: "error", message: `HTTP ${r.status}` });
          return;
        }
        const j = (await r.json()) as { user: TmaUser };
        if (!cancelled) setStatus({ kind: "ok", user: j.user });
      } catch (err) {
        if (!cancelled) setStatus({ kind: "error", message: (err as Error).message });
      }
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [initData, tmaFetch]);

  if (status.kind === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[var(--t-3)] text-sm animate-pulse">Подключаемся к Telegram…</div>
      </div>
    );
  }

  if (status.kind === "no_tma") {
    return <Onboarding mode="external" />;
  }
  if (status.kind === "no_account") {
    return (
      <Onboarding
        mode="register"
        onRegister={async () => {
          const r = await tmaFetch("/api/tma/register", { method: "POST" });
          if (!r.ok) {
            const j = (await r.json().catch(() => ({}))) as { error?: string };
            throw new Error(j.error ?? "register_failed");
          }
          // Re-run main flow.
          setStatus({ kind: "loading" });
          const me = await tmaFetch("/api/tma/me");
          if (me.ok) {
            const j = (await me.json()) as { user: TmaUser };
            setStatus({ kind: "ok", user: j.user });
          } else {
            setStatus({ kind: "error", message: `HTTP ${me.status}` });
          }
        }}
      />
    );
  }
  if (status.kind === "error") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="text-[var(--red)] font-semibold mb-2">Ошибка авторизации</div>
        <div className="text-sm text-[var(--t-3)]">{status.message}</div>
      </div>
    );
  }

  return (
    <>
      <div className={withNav ? "pb-24" : ""}>{children(status.user)}</div>
      {withNav && <BottomNav />}
    </>
  );
}

function Onboarding({
  mode,
}: {
  mode: "external" | "register";
  /** Legacy: kept for callers that still pass it; ignored in v6b. */
  onRegister?: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="size-16 rounded-2xl bg-[var(--brand-gold)]/15 text-[var(--brand-gold)] flex items-center justify-center mb-5">
        <Send size={28} />
      </div>
      {mode === "external" ? (
        <>
          <h1 className="text-xl font-bold mb-2">Открой через Telegram</h1>
          <p className="text-sm text-[var(--t-3)] max-w-sm">
            Этот экран — Mini App, его нужно открывать через нашего бота, а не в обычном браузере.
          </p>
        </>
      ) : (
        <>
          <h1 className="text-xl font-bold mb-2">Сначала зарегистрируйся на сайте</h1>
          <p className="text-sm text-[var(--t-3)] max-w-sm mb-6">
            Регистрация требует PocketOption Trader ID и подтверждённого депозита от $20.
            Открой сайт, пройди регистрацию, потом возвращайся в Mini App — мы тебя
            узнаем по Telegram.
          </p>
          <a
            href={(process.env["NEXT_PUBLIC_APP_URL"] ?? "") + "/register"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[var(--brand-gold)] text-[#1a1208] font-semibold"
          >
            Открыть регистрацию
          </a>
        </>
      )}
    </div>
  );
}
