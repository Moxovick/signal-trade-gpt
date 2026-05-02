"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

const FIELD =
  "w-full h-11 px-4 rounded-xl text-sm outline-none transition-colors bg-[var(--bg-2)] border border-[var(--b-soft)] focus:border-[var(--b-hard)]";

export function LegacyEmailLoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    params.get("error") ? "Неверный email или пароль" : null,
  );
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Неверный email или пароль");
    } else {
      router.push("/dashboard");
    }
  }

  async function handleDemoLogin() {
    setError(null);
    setDemoLoading(true);
    try {
      const res = await fetch("/api/auth/demo-login", { method: "POST" });
      const data: { email?: string; password?: string; error?: string } = await res
        .json()
        .catch(() => ({}));
      if (!res.ok || !data.email || !data.password) {
        setError(data.error ?? "Не удалось создать демо-аккаунт");
        setDemoLoading(false);
        return;
      }
      const signInRes = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });
      if (signInRes?.error) {
        setError("Демо-аккаунт создан, но автологин не удался");
        setDemoLoading(false);
        return;
      }
      router.push("/dashboard");
    } catch {
      setError("Сервер недоступен");
      setDemoLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        {error && (
          <div className="p-3 rounded-xl text-sm border border-[var(--red)]/30 bg-[var(--red)]/10 text-[var(--red)]">
            {error}
          </div>
        )}
        <input
          type="email"
          required
          autoComplete="email"
          placeholder="email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={FIELD}
        />
        <input
          type="password"
          required
          autoComplete="current-password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={FIELD}
        />
        <button
          type="submit"
          disabled={loading || demoLoading}
          className="w-full h-11 rounded-full bg-[var(--brand-gold)] text-[#1a1208] font-semibold text-sm hover:bg-[var(--brand-gold-bright)] transition-colors disabled:opacity-50"
        >
          {loading ? "Входим…" : "Войти"}
        </button>
      </form>

      <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-[var(--t-3)]">
        <span className="flex-1 h-px bg-[var(--b-soft)]" />
        тест
        <span className="flex-1 h-px bg-[var(--b-soft)]" />
      </div>

      <button
        type="button"
        onClick={handleDemoLogin}
        disabled={loading || demoLoading}
        className="w-full h-11 rounded-full border border-[var(--b-hard)] text-[var(--t-1)] text-sm font-medium hover:bg-[var(--bg-2)] transition-colors disabled:opacity-50"
      >
        {demoLoading
          ? "Создаём демо-аккаунт…"
          : "Войти как демо (T4, без регистрации)"}
      </button>
      <p className="text-[11px] text-center text-[var(--t-3)] leading-relaxed">
        Демо-кнопка создаёт временный аккаунт с тиром 4 и сразу логинит. Для
        тестирования. В продакшене отключается через ENABLE_DEMO_LOGIN=0.
      </p>
    </div>
  );
}
