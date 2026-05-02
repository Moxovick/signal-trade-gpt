/**
 * /register — v2.1.
 *
 * Two paths:
 * 1. Telegram Login Widget — preferred (instant, no password).
 * 2. Email + password — fallback for users who can't / don't want Telegram.
 *
 * Email path POSTs to /api/auth/register, then auto-logins via NextAuth's
 * "credentials" provider and redirects to /dashboard.
 */
import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Card } from "@/components/ui/Card";
import { TelegramLoginButton } from "@/components/auth/TelegramLoginButton";
import { RegisterForm } from "./_components/RegisterForm";

export default function RegisterPage() {
  const botUsername = process.env["NEXT_PUBLIC_TELEGRAM_LOGIN_BOT"];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo size="lg" />
        </div>

        <Card padding="lg">
          <h1 className="text-2xl font-bold mb-2">Регистрация</h1>
          <p className="text-sm text-[var(--t-2)] mb-6">
            Создай аккаунт через Telegram (быстрее) или email с паролем.
          </p>

          <div className="flex justify-center py-2">
            {botUsername ? (
              <Suspense>
                <TelegramLoginButton botUsername={botUsername} />
              </Suspense>
            ) : (
              <div className="text-xs text-[var(--t-3)] text-center px-4 py-3 rounded-xl border border-dashed border-[var(--b-soft)]">
                Telegram Login пока не настроен (нужен{" "}
                <code>NEXT_PUBLIC_TELEGRAM_LOGIN_BOT</code>). Используй email
                ниже.
              </div>
            )}
          </div>

          <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-widest text-[var(--t-3)]">
            <span className="flex-1 h-px bg-[var(--b-soft)]" />
            или email
            <span className="flex-1 h-px bg-[var(--b-soft)]" />
          </div>

          <Suspense>
            <RegisterForm />
          </Suspense>

          <p className="text-center text-sm text-[var(--t-3)] mt-6">
            Уже есть аккаунт?{" "}
            <Link
              href="/login"
              className="text-[var(--brand-gold)] hover:underline"
            >
              Войти
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
