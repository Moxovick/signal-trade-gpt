/**
 * /login — v3.
 *
 * Primary path: Telegram deep-link via bot. The user clicks a single button,
 * the bot redeems a one-shot token, and NextAuth signs the user in via the
 * `tg-deeplink` credentials provider once polling reports `linked`.
 *
 * Fallback: legacy email/password for v1 users that still have a password set.
 */
import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Card } from "@/components/ui/Card";
import { TelegramDeeplinkButton } from "@/components/auth/TelegramDeeplinkButton";
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
            Один клик через Telegram-бота — без номера, без пароля.
          </p>

          <div className="py-2">
            {botUsername ? (
              <Suspense>
                <TelegramDeeplinkButton purpose="login" />
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
