/**
 * /register — v4 (username-first).
 *
 * Username + password + telegram is the primary path. Telegram deep-link
 * is shown as an alternative below.
 */
import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Card } from "@/components/ui/Card";
import { TelegramDeeplinkButton } from "@/components/auth/TelegramDeeplinkButton";
import { RegisterForm } from "./_components/RegisterForm";
import { auth } from "@/lib/auth";
import { getDictionary, getDictionaryForUser } from "@/lib/i18n";

export default async function RegisterPage() {
  const session = await auth();
  const t = session?.user?.id
    ? await getDictionaryForUser(session.user.id)
    : await getDictionary("ru");

  const register = t.register as {
    title: string;
    subtitle: string;
    dividerTelegram: string;
    telegramRegisterButton: string;
    hasAccount: string;
    loginLink: string;
    backToHome: string;
    form: {
      loginLabel: string;
      loginPlaceholder: string;
      telegramLabel: string;
      telegramPlaceholder: string;
      passwordLabel: string;
      passwordPlaceholder: string;
      confirmLabel: string;
      confirmPlaceholder: string;
      submitButton: string;
      submittingButton: string;
      autoLoginButton: string;
      autoLoginError: string;
    };
  };

  const botUsername = process.env["NEXT_PUBLIC_TELEGRAM_LOGIN_BOT"];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo size="lg" />
        </div>

        <Card padding="lg">
          <h1 className="text-2xl font-bold mb-2">{register.title}</h1>
          <p className="text-sm text-[var(--t-2)] mb-6">
            {register.subtitle}
          </p>

          <Suspense>
            <RegisterForm translations={register.form} />
          </Suspense>

          {botUsername && (
            <>
              <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-widest text-[var(--t-3)]">
                <span className="flex-1 h-px bg-[var(--b-soft)]" />
                {register.dividerTelegram}
                <span className="flex-1 h-px bg-[var(--b-soft)]" />
              </div>
              <div className="py-2">
                <Suspense>
                  <TelegramDeeplinkButton
                    purpose="login"
                    label={register.telegramRegisterButton}
                  />
                </Suspense>
              </div>
            </>
          )}

          <p className="text-center text-sm text-[var(--t-3)] mt-6">
            {register.hasAccount}{" "}
            <Link
              href="/login"
              className="text-[var(--brand-gold)] hover:underline"
            >
              {register.loginLink}
            </Link>
          </p>
        </Card>

        <p className="text-center mt-6">
          <Link
            href="/"
            className="text-sm text-[var(--t-3)] hover:text-[var(--t-1)] inline-flex items-center gap-1.5"
          >
            <ArrowLeft size={14} /> {register.backToHome}
          </Link>
        </p>
      </div>
    </div>
  );
}
