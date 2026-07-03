"use client";

/**
 * Registration form — simplified.
 *
 * - Username (login) + password are required.
 * - Telegram username is required for bot integration.
 * - PocketOption Trader ID is optional at registration but required for signals.
 */
import { useActionState, useEffect, useRef, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  registerAction,
  type RegisterActionResult,
} from "../actions";

const FIELD =
  "w-full h-11 px-4 rounded-xl text-sm outline-none transition-colors text-[var(--t-1)] placeholder:text-[var(--t-3)] bg-[var(--bg-2)] border border-[var(--b-soft)] focus:border-[var(--brand-gold)] focus:ring-1 focus:ring-[var(--brand-gold)]/30";

const INITIAL: RegisterActionResult = { ok: false };

export type RegisterFormTranslations = {
  loginLabel: string;
  loginPlaceholder: string;
  telegramLabel: string;
  telegramPlaceholder: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  confirmLabel: string;
  confirmPlaceholder: string;
  submitButton: string;
  submittingButton: string;
  autoLoginButton: string;
  autoLoginError: string;
};

const DEFAULT_TRANSLATIONS: RegisterFormTranslations = {
  loginLabel: "Логин",
  loginPlaceholder: "Придумай логин",
  telegramLabel: "Telegram",
  telegramPlaceholder: "@username в Telegram",
  passwordLabel: "Пароль",
  passwordPlaceholder: "Минимум 6 символов",
  confirmLabel: "Повтори пароль",
  confirmPlaceholder: "Ещё раз",
  submitButton: "Создать аккаунт",
  submittingButton: "Создаём аккаунт...",
  autoLoginButton: "Входим в аккаунт...",
  autoLoginError: "Аккаунт создан, но автологин не удался. Войди вручную.",
};

export function RegisterForm({
  translations,
}: {
  translations?: RegisterFormTranslations;
}) {
  const t = translations ?? DEFAULT_TRANSLATIONS;
  const router = useRouter();
  const params = useSearchParams();
  const refFromUrl = params.get("ref") ?? "";
  const errFromUrl = params.get("err");

  const refFromCookie =
    typeof document !== "undefined"
      ? document.cookie
          .split("; ")
          .find((r) => r.startsWith("ss_ref="))
          ?.split("=")[1] ?? ""
      : "";
  const initialRef = refFromUrl || refFromCookie;

  const [state, action, isPending] = useActionState(registerAction, INITIAL);
  const [autoLoginError, setAutoLoginError] = useState<string | null>(null);
  const lastHandledRef = useRef<string | null>(null);

  useEffect(() => {
    if (!state.ok || !state.username || !state.password) return;
    const key = `${state.username}:${state.password}`;
    if (lastHandledRef.current === key) return;
    lastHandledRef.current = key;
    (async () => {
      const res = await signIn("credentials", {
        login: state.username,
        password: state.password,
        redirect: false,
      });
      if (res?.error) {
        setAutoLoginError(t.autoLoginError);
        return;
      }
      router.push(
        state.needsPoOnboarding ? "/onboarding/po-id" : "/dashboard/signals",
      );
    })();
  }, [state.ok, state.username, state.password, state.needsPoOnboarding, router, t.autoLoginError]);

  const errorToShow = autoLoginError ?? state.error ?? errFromUrl ?? null;
  const fv = state.formValues;
  const isAutoLogging = state.ok && !autoLoginError;

  return (
    <form action={action} className="space-y-4" noValidate>
      {errorToShow && (
        <div className="p-3 rounded-xl text-sm border border-[var(--red)]/30 bg-[var(--red)]/10 text-[var(--red)]">
          {errorToShow}
        </div>
      )}

      {/* Username (login) */}
      <label className="block">
        <span className="text-xs font-medium text-[var(--t-2)] mb-1 block">{t.loginLabel}</span>
        <input
          type="text"
          name="username"
          required
          autoComplete="username"
          placeholder={t.loginPlaceholder}
          className={FIELD}
          maxLength={32}
          defaultValue={fv?.username ?? ""}
        />
      </label>

      {/* Telegram */}
      <label className="block">
        <span className="text-xs font-medium text-[var(--t-2)] mb-1 block">{t.telegramLabel}</span>
        <input
          type="text"
          name="telegramUsername"
          required
          autoComplete="off"
          placeholder={t.telegramPlaceholder}
          className={FIELD}
          maxLength={32}
          defaultValue={fv?.telegramUsername ?? ""}
        />
      </label>

      {/* Password */}
      <label className="block">
        <span className="text-xs font-medium text-[var(--t-2)] mb-1 block">{t.passwordLabel}</span>
        <input
          type="password"
          name="password"
          required
          autoComplete="new-password"
          placeholder={t.passwordPlaceholder}
          className={FIELD}
        />
      </label>
      <label className="block">
        <span className="text-xs font-medium text-[var(--t-2)] mb-1 block">{t.confirmLabel}</span>
        <input
          type="password"
          name="confirm"
          required
          autoComplete="new-password"
          placeholder={t.confirmPlaceholder}
          className={FIELD}
        />
      </label>

      {/* Hidden referral code */}
      {initialRef && (
        <input type="hidden" name="referralCode" value={initialRef} />
      )}

      <button
        type="submit"
        disabled={isPending || isAutoLogging}
        className="w-full h-12 rounded-full bg-[var(--brand-gold)] text-[#1a1208] font-semibold text-sm hover:bg-[var(--brand-gold-bright)] transition-colors disabled:opacity-50 mt-2"
      >
        {isAutoLogging ? t.autoLoginButton : isPending ? t.submittingButton : t.submitButton}
      </button>
    </form>
  );
}
