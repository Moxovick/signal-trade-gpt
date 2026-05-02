"use client";

/**
 * Registration form — uses a Next.js Server Action so it works even when
 * client hydration is broken.
 *
 * Path A (JS enabled): useActionState handles the response, on success we
 * call NextAuth signIn() and push to /dashboard.
 *
 * Path B (no JS / hydration broken): the form submits via plain HTML POST
 * to `registerActionRedirect`, which redirects to /login?registered=1.
 *
 * The `?err=...` query param is read on first render to surface server-side
 * errors after a no-JS redirect.
 */
import { useActionState, useEffect, useRef, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
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

  const [state, action, isPending] = useActionState(registerAction, INITIAL);
  const [autoLoginError, setAutoLoginError] = useState<string | null>(null);
  const lastHandledRef = useRef<string | null>(null);

  // Path A: when client-side action returns ok, sign in and redirect.
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
      router.push("/dashboard");
    })();
  }, [state.ok, state.email, state.password, router]);

  const errorToShow = autoLoginError ?? state.error ?? errFromUrl ?? null;

  return (
    <form action={action} className="space-y-3" noValidate>
      {errorToShow && (
        <div className="p-3 rounded-xl text-sm border border-[var(--red)]/30 bg-[var(--red)]/10 text-[var(--red)]">
          {errorToShow}
        </div>
      )}
      <input
        type="email"
        name="email"
        required
        autoComplete="email"
        placeholder="email@example.com"
        className={FIELD}
      />
      <input
        type="password"
        name="password"
        required
        autoComplete="new-password"
        placeholder="Пароль (минимум 6 символов)"
        className={FIELD}
      />
      <input
        type="password"
        name="confirm"
        required
        autoComplete="new-password"
        placeholder="Повтори пароль"
        className={FIELD}
      />
      <input
        type="text"
        name="referralCode"
        defaultValue={refFromUrl}
        placeholder="Реферальный код (необязательно)"
        className={FIELD}
      />
      <button
        type="submit"
        disabled={isPending}
        className="w-full h-11 rounded-full bg-[var(--brand-gold)] text-[#1a1208] font-semibold text-sm hover:bg-[var(--brand-gold-bright)] transition-colors disabled:opacity-50"
      >
        {isPending ? "Создаём аккаунт…" : "Зарегистрироваться"}
      </button>
      <noscript>
        <p className="text-xs text-[var(--t-3)] text-center pt-2">
          JS отключён или сломан — форма всё равно работает через серверный
          экшен. После регистрации войди вручную через логин.
        </p>
      </noscript>
    </form>
  );
}
