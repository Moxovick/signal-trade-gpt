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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Неверный email или пароль");
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
      <input
        type="email"
        required
        placeholder="email@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={FIELD}
      />
      <input
        type="password"
        required
        placeholder="Пароль"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className={FIELD}
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full h-11 rounded-full bg-[var(--brand-gold)] text-[#1a1208] font-semibold text-sm hover:bg-[var(--brand-gold-bright)] transition-colors disabled:opacity-50"
      >
        {loading ? "Входим…" : "Войти"}
      </button>
    </form>
  );
}
