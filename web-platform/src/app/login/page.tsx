"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    params.get("error") ? "Неверный email или пароль" : null
  );
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#07070d] px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1
            className="text-4xl font-black tracking-wider mb-2"
            style={{ fontFamily: "var(--font-bebas)", color: "#f5c518" }}
          >
            SIGNAL TRADE GPT
          </h1>
          <p className="text-[#888] text-sm">Войдите в личный кабинет</p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8 border"
          style={{ background: "#0d0d18", borderColor: "rgba(255,255,255,0.08)" }}
        >
          <h2 className="text-xl font-semibold mb-6">Вход</h2>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-950/50 border border-red-800/50 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-[#888] mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors"
                style={{
                  background: "#111120",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#e8e8f0",
                }}
                onFocus={(e) =>
                  (e.target.style.borderColor = "rgba(245,197,24,0.5)")
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = "rgba(255,255,255,0.08)")
                }
              />
            </div>

            <div>
              <label className="block text-sm text-[#888] mb-1.5">Пароль</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors"
                style={{
                  background: "#111120",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#e8e8f0",
                }}
                onFocus={(e) =>
                  (e.target.style.borderColor = "rgba(245,197,24,0.5)")
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = "rgba(255,255,255,0.08)")
                }
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-sm transition-all mt-2"
              style={{
                background: loading ? "#8a7010" : "#f5c518",
                color: "#07070d",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Входим..." : "Войти"}
            </button>
          </form>

          <p className="text-center text-sm text-[#666] mt-6">
            Нет аккаунта?{" "}
            <Link href="/register" className="text-[#f5c518] hover:underline">
              Зарегистрироваться
            </Link>
          </p>
        </div>

        <p className="text-center mt-6">
          <Link href="/" className="text-sm text-[#555] hover:text-[#888]">
            ← На главную
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
