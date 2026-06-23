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
import { useI18n } from "@/lib/i18n/context";

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
  referralsCount: number;
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
  const { t } = useI18n();
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
        <div className="text-[var(--t-3)] text-sm animate-pulse">{t.tma.shell.connecting}</div>
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
        <div className="text-[var(--red)] font-semibold mb-2">{t.tma.shell.authError}</div>
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
  onRegister,
}: {
  mode: "external" | "register";
  onRegister?: () => void;
}) {
  const { tg } = useTma();
  const { t } = useI18n();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = process.env["NEXT_PUBLIC_APP_URL"] ?? "";
  // /login?from=tma uses the Telegram Login Widget which sets telegramId
  // automatically — this is the only way to link site account ↔ Telegram.
  const loginUrl = `${baseUrl}/login?from=tma`;

  // When the user returns from the web login (tab becomes visible again or the
  // window regains focus), fire onRegister so the shell re-fetches auth state.
  useEffect(() => {
    if (mode !== "register" || !onRegister) return;

    let fired = false;

    function handleReturn() {
      if (fired) return;
      // Only act if the user actually opened the link (pending flag is set).
      if (!pending) return;
      fired = true;
      setError(null);
      Promise.resolve(onRegister?.()).catch((err: unknown) => {
        fired = false;
        setError((err as Error).message ?? t.tma.shell.loginError);
      });
    }

    document.addEventListener("visibilitychange", handleReturn);
    window.addEventListener("focus", handleReturn);
    return () => {
      document.removeEventListener("visibilitychange", handleReturn);
      window.removeEventListener("focus", handleReturn);
    };
  }, [mode, onRegister, pending]);

  function handleLoginClick() {
    setPending(true);
    setError(null);
    // Use Telegram WebApp openLink if available so the browser opens externally
    // and Telegram can detect the return; fall back to window.open.
    if (tg && typeof (tg as unknown as Record<string, unknown>).openLink === "function") {
      (tg as unknown as { openLink: (url: string, opts?: { try_instant_view?: boolean }) => void }).openLink(
        loginUrl,
        { try_instant_view: false },
      );
    } else {
      window.open(loginUrl, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="size-16 rounded-2xl bg-[var(--brand-gold)]/15 text-[var(--brand-gold)] flex items-center justify-center mb-5">
        <Send size={28} />
      </div>
      {mode === "external" ? (
        <>
          <h1 className="text-xl font-bold mb-2">{t.tma.shell.external.title}</h1>
          <p className="text-sm text-[var(--t-3)] max-w-sm">
            {t.tma.shell.external.description}
          </p>
        </>
      ) : (
        <>
          <h1 className="text-xl font-bold mb-2">{t.tma.shell.register.title}</h1>
          <div className="text-sm text-[var(--t-3)] max-w-sm mb-6 space-y-2">
            <p>1. {t.tma.shell.register.steps.step1}</p>
            <p>2. {t.tma.shell.register.steps.step2}</p>
            <p>3. {t.tma.shell.register.steps.step3}</p>
          </div>
          <button
            type="button"
            onClick={handleLoginClick}
            disabled={pending}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[var(--brand-gold)] text-[#1a1208] font-semibold text-sm disabled:opacity-60"
          >
            <Send size={16} />
            {pending ? t.tma.shell.register.waiting : t.tma.shell.register.loginButton}
          </button>
          {error && (
            <p className="text-[11px] text-[var(--red)] mt-3 max-w-xs">{error}</p>
          )}
          {!error && pending && (
            <p className="text-[11px] text-[var(--t-3)] mt-4 max-w-xs">
              {t.tma.shell.pending.afterLogin}
            </p>
          )}
          {!pending && (
            <p className="text-[11px] text-[var(--t-3)] mt-4 max-w-xs">
              {t.tma.shell.pending.afterLoginAlt}
            </p>
          )}
        </>
      )}
    </div>
  );
}
