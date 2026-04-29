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
  const [promoCode, setPromoCode] = useState(params.get("promo") ?? "");
  const [promoValid, setPromoValid] = useState<boolean | null>(null);
  const [promoMsg, setPromoMsg] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function checkPromo(code: string) {
    if (!code || code.length < 3) {
      setPromoValid(null);
      setPromoMsg("");
      return;
    }
    try {
      const res = await fetch(`/api/promo/check?code=${encodeURIComponent(code)}`);
      const data = await res.json();
      if (res.ok && data.valid) {
        setPromoValid(true);
        setPromoMsg(data.message ?? "Промо-код активен! 7 дней Premium бесплатно");
      } else {
        setPromoValid(false);
        setPromoMsg(data.error ?? "Промо-код недействителен");
      }
    } catch {
      setPromoValid(false);
      setPromoMsg("Ошибка проверки");
    }
  }

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
      body: JSON.stringify({
        email,
        password,
        referralCode: referralCode || undefined,
        promoCode: promoCode || undefined,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Ошибка регистрации");
      setLoading(false);
      return;
    }

    await signIn("credentials", { email, password, redirect: false });
    router.push("/dashboard");
  }

  const inputStyle = {
    background: "var(--card-bg, #0e0e22)",
    border: "1px solid rgba(245, 197, 24, 0.08)",
    color: "#e8e8f0",
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative z-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/">
            <h1 className="text-4xl font-black tracking-wider mb-2 text-gold-gradient logo-glow" style={{ fontFamily: "var(--font-bebas)" }}>
              SIGNAL TRADE GPT
            </h1>
          </Link>
          <p className="text-[#888] text-sm">Создайте аккаунт и начните зарабатывать</p>
        </div>

        <div className="card-premium rounded-2xl p-8">
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
                  onBlur={(e) => (e.target.style.borderColor = "rgba(245,197,24,0.08)")}
                />
              </div>
            ))}

            {/* Promo code field */}
            <div>
              <label className="block text-sm text-[#888] mb-1.5">
                Промо-код{" "}
                <span className="text-[#f5c518]">(7 дней Premium бесплатно!)</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => {
                    const val = e.target.value.toUpperCase();
                    setPromoCode(val);
                    setPromoValid(null);
                    setPromoMsg("");
                  }}
                  onBlur={() => checkPromo(promoCode)}
                  placeholder="Введите промо-код"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors uppercase"
                  style={{
                    ...inputStyle,
                    borderColor: promoValid === true
                      ? "rgba(0,229,160,0.5)"
                      : promoValid === false
                        ? "rgba(239,68,68,0.5)"
                        : "rgba(245,197,24,0.08)",
                  }}
                />
                {promoValid === true && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#00e5a0] text-lg">✓</span>
                )}
              </div>
              {promoMsg && (
                <p className="text-xs mt-1" style={{ color: promoValid ? "#00e5a0" : "#ef4444" }}>
                  {promoMsg}
                </p>
              )}
            </div>

            {/* Referral code */}
            <div>
              <label className="block text-sm text-[#888] mb-1.5">
                Реферальный код <span className="text-[#555]">(необязательно)</span>
              </label>
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                placeholder="XXXXXXXX"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors uppercase"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "rgba(245,197,24,0.5)")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(245,197,24,0.08)")}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-sm transition-all mt-2 hover:scale-[1.02]"
              style={{
                background: loading ? "#8a7010" : "linear-gradient(135deg, #f5c518, #f0a500)",
                color: "#08081a",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Создаём аккаунт..." : "Создать аккаунт"}
            </button>
          </form>

          <p className="text-center text-sm text-[#666] mt-6">
            Уже есть аккаунт?{" "}
            <Link href="/login" className="text-[#f5c518] hover:underline">Войти</Link>
          </p>
        </div>

        <p className="text-xs text-center text-[#333] mt-4 px-4">
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
