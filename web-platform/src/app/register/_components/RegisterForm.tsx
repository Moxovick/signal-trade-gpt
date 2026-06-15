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
import { ExternalLink, Info } from "lucide-react";
import {
  registerAction,
  type RegisterActionResult,
} from "../actions";

const FIELD =
  "w-full h-11 px-4 rounded-xl text-sm outline-none transition-colors text-[var(--t-1)] placeholder:text-[var(--t-3)] bg-[var(--bg-2)] border border-[var(--b-soft)] focus:border-[var(--brand-gold)] focus:ring-1 focus:ring-[var(--brand-gold)]/30";

const INITIAL: RegisterActionResult = { ok: false };

export function RegisterForm() {
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
        setAutoLoginError(
          "Аккаунт создан, но автологин не удался. Войди вручную.",
        );
        return;
      }
      router.push(
        state.needsPoOnboarding ? "/onboarding/po-id" : "/dashboard/signals",
      );
    })();
  }, [state.ok, state.username, state.password, state.needsPoOnboarding, router]);

  const errorToShow = autoLoginError ?? state.error ?? errFromUrl ?? null;
  const poRefUrl = "/po/refer";

  return (
    <form action={action} className="space-y-4" noValidate>
      {errorToShow && (
        <div className="p-3 rounded-xl text-sm border border-[var(--red)]/30 bg-[var(--red)]/10 text-[var(--red)]">
          {errorToShow}
        </div>
      )}

      <div className="p-3 rounded-xl border border-[var(--brand-gold)]/20 bg-[var(--brand-gold)]/5 flex gap-2 text-xs text-[var(--t-2)]">
        <Info size={14} className="shrink-0 mt-0.5 text-[var(--brand-gold)]" />
        <span>
          Для получения сигналов нужна регистрация на{" "}
          <a
            href={poRefUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--brand-gold)] underline inline-flex items-center gap-1"
          >
            PocketOption <ExternalLink size={11} />
          </a>
          . Trader ID можно добавить позже.
        </span>
      </div>

      {/* Username (login) */}
      <label className="block">
        <span className="text-xs font-medium text-[var(--t-2)] mb-1 block">Логин</span>
        <input
          type="text"
          name="username"
          required
          autoComplete="username"
          placeholder="Придумай логин"
          className={FIELD}
          maxLength={32}
        />
      </label>

      {/* Telegram */}
      <label className="block">
        <span className="text-xs font-medium text-[var(--t-2)] mb-1 block">Telegram</span>
        <input
          type="text"
          name="telegramUsername"
          required
          autoComplete="off"
          placeholder="@username в Telegram"
          className={FIELD}
          maxLength={32}
        />
      </label>

      {/* Password */}
      <label className="block">
        <span className="text-xs font-medium text-[var(--t-2)] mb-1 block">Пароль</span>
        <input
          type="password"
          name="password"
          required
          autoComplete="new-password"
          placeholder="Минимум 6 символов"
          className={FIELD}
        />
      </label>
      <label className="block">
        <span className="text-xs font-medium text-[var(--t-2)] mb-1 block">Повтори пароль</span>
        <input
          type="password"
          name="confirm"
          required
          autoComplete="new-password"
          placeholder="Ещё раз"
          className={FIELD}
        />
      </label>

      {/* PO Trader ID */}
      <label className="block">
        <span className="text-xs font-medium text-[var(--t-2)] mb-1 block">
          PocketOption Trader ID <span className="text-[var(--t-3)] font-normal">(необязательно)</span>
        </span>
        <input
          type="text"
          name="poTraderId"
          inputMode="numeric"
          autoComplete="off"
          placeholder="Числовой ID из PocketOption"
          className={FIELD}
          maxLength={12}
        />
      </label>

      {/* Hidden referral code */}
      {initialRef && (
        <input type="hidden" name="referralCode" value={initialRef} />
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full h-12 rounded-full bg-[var(--brand-gold)] text-[#1a1208] font-semibold text-sm hover:bg-[var(--brand-gold-bright)] transition-colors disabled:opacity-50 mt-2"
      >
        {isPending ? "Создаём аккаунт..." : "Создать аккаунт"}
      </button>
    </form>
  );
}
