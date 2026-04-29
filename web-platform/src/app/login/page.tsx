/**
 * /login — v2.
 *
 * Primary path: Telegram Login Widget (works only when
 * NEXT_PUBLIC_TELEGRAM_LOGIN_BOT is set + @BotFather domain is registered).
 *
 * Fallback: legacy email/password for v1 users that haven't migrated yet.
 */
import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Card } from "@/components/ui/Card";
import { TelegramLoginButton } from "@/components/auth/TelegramLoginButton";
import { LegacyEmailLoginForm } from "./_components/LegacyEmailLoginForm";

export default function LoginPage() {
  const botUsername = process.env["NEXT_PUBLIC_TELEGRAM_LOGIN_BOT"];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo size="lg" />
        </div>

        <Card padding="lg">
          <h1 className="text-2xl font-bold mb-2">Войти</h1>
          <p className="text-sm text-[var(--t-2)] mb-6">
            Используй Telegram — это быстрее и безопаснее, чем пароль.
          </p>

          <div className="flex justify-center py-2">
            {botUsername ? (
              <Suspense>
                <TelegramLoginButton botUsername={botUsername} />
              </Suspense>
            ) : (
              <div className="text-xs text-[var(--t-3)] text-center px-4 py-3 rounded-xl border border-dashed border-[var(--b-soft)]">
                Telegram Login пока не настроен (нужен <code>NEXT_PUBLIC_TELEGRAM_LOGIN_BOT</code>).
                Используй email/пароль ниже.
              </div>
            )}
          </div>

          <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-widest text-[var(--t-3)]">
            <span className="flex-1 h-px bg-[var(--b-soft)]" />
            или email
            <span className="flex-1 h-px bg-[var(--b-soft)]" />
          </div>

          <Suspense>
            <LegacyEmailLoginForm />
          </Suspense>

          <p className="text-center text-sm text-[var(--t-3)] mt-6">
            Нет аккаунта?{" "}
            <Link href="/register" className="text-[var(--brand-gold)] hover:underline">
              Зарегистрироваться
            </Link>
          </p>
        </Card>

        <p className="text-center mt-6">
          <Link
            href="/"
            className="text-sm text-[var(--t-3)] hover:text-[var(--t-1)] inline-flex items-center gap-1.5"
          >
            <ArrowLeft size={14} /> На главную
          </Link>
        </p>
      </div>
    </div>
  );
}
