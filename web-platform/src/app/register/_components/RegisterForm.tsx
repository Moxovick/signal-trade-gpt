"use client";

/**
 * Registration form.
 *
 * - Email + password are required.
 * - PocketOption Trader ID is optional. If supplied, the server action binds
 *   the PO account immediately. If skipped, the user is redirected to
 *   /onboarding/po-id to attach there (the dashboard layout requires a PO
 *   account before letting them in).
 * - There is no deposit gate at registration — any trader registered through
 *   our referral link is admitted regardless of deposit size.
 */
import { useActionState, useEffect, useRef, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { ExternalLink, Info } from "lucide-react";
import {
  registerAction,
  type RegisterActionResult,
} from "../actions";

const FIELD =
  "w-full h-11 px-4 rounded-xl text-sm outline-none transition-colors bg-[var(--bg-2)] border border-[var(--b-soft)] focus:border-[var(--b-hard)]";

const INITIAL: RegisterActionResult = { ok: false };

export function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const refFromUrl = params.get("ref") ?? "";
  const errFromUrl = params.get("err");

  // Also read stg_ref cookie as fallback (set by /r/[code] short-link)
  const refFromCookie =
    typeof document !== "undefined"
      ? document.cookie
          .split("; ")
          .find((r) => r.startsWith("stg_ref="))
          ?.split("=")[1] ?? ""
      : "";
  const initialRef = refFromUrl || refFromCookie;

  const [state, action, isPending] = useActionState(registerAction, INITIAL);
  const [autoLoginError, setAutoLoginError] = useState<string | null>(null);
  const lastHandledRef = useRef<string | null>(null);

  useEffect(() => {
    if (!state.ok || !state.email || !state.password) return;
    const key = `${state.email}:${state.password}`;
    if (lastHandledRef.current === key) return;
    lastHandledRef.current = key;
    (async () => {
      const res = await signIn("credentials", {
        email: state.email,
        password: state.password,
        redirect: false,
      });
      if (res?.error) {
        setAutoLoginError(
          "Аккаунт создан, но автологин не удался. Войди вручную.",
        );
        return;
      }
      // PO attached → straight to the signals tab.
      // PO skipped → onboarding gate so the user can finish attaching.
      router.push(
        state.needsPoOnboarding ? "/onboarding/po-id" : "/dashboard/signals",
      );
    })();
  }, [state.ok, state.email, state.password, state.needsPoOnboarding, router]);

  const errorToShow = autoLoginError ?? state.error ?? errFromUrl ?? null;
  const poRefUrl = "/po/refer";

  return (
    <form action={action} className="space-y-3" noValidate>
      {errorToShow && (
        <div className="p-3 rounded-xl text-sm border border-[var(--red)]/30 bg-[var(--red)]/10 text-[var(--red)]">
          {errorToShow}
        </div>
      )}

      <div className="p-3 rounded-xl border border-[var(--brand-gold)]/20 bg-[var(--brand-gold)]/5 flex gap-2 text-xs text-[var(--t-2)]">
        <Info size={14} className="shrink-0 mt-0.5 text-[var(--brand-gold)]" />
        <div className="space-y-1">
          <div>
            Доступ к кабинету открывается тем, кто зарегистрирован на{" "}
            <a
              href={poRefUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--brand-gold)] underline inline-flex items-center gap-1"
            >
              PocketOption по нашей ссылке <ExternalLink size={11} />
            </a>
            . Депозит не нужен — нужна только регистрация.
          </div>
          <div>
            Trader ID можно ввести сейчас или после регистрации — мы напомним.
          </div>
        </div>
      </div>

      <label className="block">
        <span className="sr-only">Email</span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="Email"
          className={FIELD}
        />
      </label>
      <label className="block">
        <span className="sr-only">Пароль</span>
        <input
          type="password"
          name="password"
          required
          autoComplete="new-password"
          placeholder="Пароль (минимум 6 символов)"
          className={FIELD}
        />
      </label>
      <label className="block">
        <span className="sr-only">Повтори пароль</span>
        <input
          type="password"
          name="confirm"
          required
          autoComplete="new-password"
          placeholder="Повтори пароль"
          className={FIELD}
        />
      </label>
      <label className="block">
        <span className="sr-only">PocketOption Trader ID</span>
        <input
          type="text"
          name="poTraderId"
          inputMode="numeric"
          autoComplete="off"
          placeholder="PocketOption Trader ID (необязательно)"
          className={FIELD}
          maxLength={12}
        />
      </label>
      <label className="block">
        <span className="sr-only">Промокод</span>
        <input
          type="text"
          name="promoCode"
          autoComplete="off"
          placeholder="Промокод (если активировал на PO — для записи)"
          className={FIELD}
          maxLength={32}
        />
      </label>
      <label className="block">
        <span className="sr-only">Ник</span>
        <input
          type="text"
          name="nickname"
          autoComplete="nickname"
          placeholder="Ник для leaderboard (необязательно)"
          className={FIELD}
          maxLength={32}
        />
      </label>
      <label className="block">
        <span className="sr-only">Telegram username</span>
        <input
          type="text"
          name="telegramUsername"
          autoComplete="off"
          placeholder="Telegram username, без @ (необязательно)"
          className={FIELD}
          maxLength={32}
        />
      </label>
      <label className="block">
        <span className="sr-only">Реферальный код</span>
        <input
          type="text"
          name="referralCode"
          defaultValue={initialRef}
          placeholder="Реферальный код (если кто-то пригласил)"
          className={FIELD}
        />
      </label>
      <button
        type="submit"
        disabled={isPending}
        className="w-full h-11 rounded-full bg-[var(--brand-gold)] text-[#1a1208] font-semibold text-sm hover:bg-[var(--brand-gold-bright)] transition-colors disabled:opacity-50"
      >
        {isPending ? "Создаём аккаунт…" : "Зарегистрироваться"}
      </button>
      <p className="text-[11px] text-[var(--t-3)] text-center pt-1">
        Если PO ID не указан — мы попросим привязать его на следующем шаге.
      </p>
    </form>
  );
}
