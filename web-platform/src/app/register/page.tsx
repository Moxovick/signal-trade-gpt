"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [referralCode, setReferralCode] = useState(params.get("ref") ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Пароли не совпадают");
      return;
    }
    if (password.length < 6) {
      setError("Пароль минимум 6 символов");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, referralCode: referralCode || undefined }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Ошибка регистрации");
      setLoading(false);
      return;
    }

    // Auto-login after register
    await signIn("credentials", { email, password, redirect: false });
    router.push("/dashboard");
  }

  const inputStyle = {
    background: "#111120",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#e8e8f0",
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#07070d] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1
            className="text-4xl font-black tracking-wider mb-2"
            style={{ fontFamily: "var(--font-bebas)", color: "#f5c518" }}
          >
            SIGNAL TRADE GPT
          </h1>
          <p className="text-[#888] text-sm">Создайте аккаунт и начните зарабатывать</p>
        </div>

        <div
          className="rounded-2xl p-8 border"
          style={{ background: "#0d0d18", borderColor: "rgba(255,255,255,0.08)" }}
        >
          <h2 className="text-xl font-semibold mb-6">Регистрация</h2>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-950/50 border border-red-800/50 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: "Email", type: "email", value: email, set: setEmail, placeholder: "your@email.com" },
              { label: "Пароль", type: "password", value: password, set: setPassword, placeholder: "Минимум 6 символов" },
              { label: "Повторите пароль", type: "password", value: confirm, set: setConfirm, placeholder: "••••••••" },
            ].map(({ label, type, value, set, placeholder }) => (
              <div key={label}>
                <label className="block text-sm text-[#888] mb-1.5">{label}</label>
                <input
                  type={type}
                  value={value}
                  onChange={(e) => set(e.target.value)}
                  required
                  placeholder={placeholder}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "rgba(245,197,24,0.5)")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
                />
              </div>
            ))}

            <div>
              <label className="block text-sm text-[#888] mb-1.5">
                Реферальный код{" "}
                <span className="text-[#555]">(необязательно)</span>
              </label>
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                placeholder="XXXXXXXX"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors uppercase"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "rgba(245,197,24,0.5)")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
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
              {loading ? "Создаём аккаунт..." : "Создать аккаунт"}
            </button>
          </form>

          <p className="text-center text-sm text-[#666] mt-6">
            Уже есть аккаунт?{" "}
            <Link href="/login" className="text-[#f5c518] hover:underline">
              Войти
            </Link>
          </p>
        </div>

        <p className="text-xs text-center text-[#444] mt-4 px-4">
          Signal Trade GPT не является финансовым советником. Все сигналы предоставляются
          в информационных целях. Торговля сопряжена с риском потери средств.
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
