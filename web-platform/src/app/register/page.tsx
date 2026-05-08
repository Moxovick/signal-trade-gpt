/**
 * /register — v3 (email-first, post-supervisor-feedback).
 *
 * Email + password is the primary path. Telegram Login Widget is shown as an
 * optional fast path below. Form collects nickname, telegram username, and
 * referral code in addition to email + password.
 */
import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Card } from "@/components/ui/Card";
import { TelegramDeeplinkButton } from "@/components/auth/TelegramDeeplinkButton";
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
            Создай аккаунт за 30 секунд. Демо-сигналы доступны сразу, без
            депозита.
          </p>

          <Suspense>
            <RegisterForm />
          </Suspense>

          {botUsername && (
            <>
              <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-widest text-[var(--t-3)]">
                <span className="flex-1 h-px bg-[var(--b-soft)]" />
                или быстро через telegram
                <span className="flex-1 h-px bg-[var(--b-soft)]" />
              </div>
              <div className="py-2">
                <Suspense>
                  <TelegramDeeplinkButton
                    purpose="login"
                    label="Зарегистрироваться через Telegram"
                  />
                </Suspense>
              </div>
            </>
          )}

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
