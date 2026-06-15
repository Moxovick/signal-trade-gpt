"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

const FIELD =
  "w-full h-11 px-4 rounded-xl text-sm outline-none transition-colors text-[var(--t-1)] placeholder:text-[var(--t-3)] bg-[var(--bg-2)] border border-[var(--b-soft)] focus:border-[var(--brand-gold)] focus:ring-1 focus:ring-[var(--brand-gold)]/30";

export function LegacyEmailLoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    params.get("error") ? "Неверный логин или пароль" : null,
  );
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await signIn("credentials", {
      login,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Неверный логин или пароль");
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <div className="p-3 rounded-xl text-sm border border-[var(--red)]/30 bg-[var(--red)]/10 text-[var(--red)]">
          {error}
        </div>
      )}
      <label className="block">
        <span className="text-xs font-medium text-[var(--t-2)] mb-1 block">Логин</span>
        <input
          type="text"
          required
          autoComplete="username"
          placeholder="Твой логин"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          className={FIELD}
        />
      </label>
      <label className="block">
        <span className="text-xs font-medium text-[var(--t-2)] mb-1 block">Пароль</span>
        <input
          type="password"
          required
          autoComplete="current-password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={FIELD}
        />
      </label>
      <button
        type="submit"
        disabled={loading}
        className="w-full h-12 rounded-full bg-[var(--brand-gold)] text-[#1a1208] font-semibold text-sm hover:bg-[var(--brand-gold-bright)] transition-colors disabled:opacity-50"
      >
        {loading ? "Входим..." : "Войти"}
      </button>
    </form>
  );
}
