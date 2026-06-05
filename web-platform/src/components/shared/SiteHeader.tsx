"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ArrowRight, Menu, X, LayoutDashboard } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { ButtonLink } from "@/components/ui/Button";

const NAV = [
  { href: "/how-it-works", label: "Как это работает" },
  { href: "/about", label: "Про нас" },
];

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated" && !!session?.user;
  const displayName =
    session?.user?.name ?? session?.user?.email?.split("@")[0] ?? "Кабинет";

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md border-b border-[var(--b-soft)] bg-[rgba(8,6,10,0.75)]">
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="shrink-0">
          <Logo size="md" />
        </div>
        <div className="hidden md:flex items-center gap-7 text-sm text-[var(--t-2)]">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="hover:text-[var(--brand-gold)] transition-colors"
            >
              {n.label}
            </Link>
          ))}
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-[var(--brand-gold)] hover:text-[var(--brand-gold-bright)] transition-colors font-medium"
            >
              <LayoutDashboard size={15} />
              {displayName}
            </Link>
          ) : (
            <Link href="/login" className="hover:text-[var(--t-1)] transition-colors">
              Войти
            </Link>
          )}
        </div>
        {!isLoggedIn && (
          <div className="hidden md:block">
            <ButtonLink href="/register" size="sm" iconRight={<ArrowRight size={16} />}>
              Зарегистрироваться
            </ButtonLink>
          </div>
        )}
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="md:hidden p-2 text-[var(--t-2)] hover:text-[var(--t-1)] transition-colors"
          aria-label={mobileOpen ? "Закрыть меню" : "Открыть меню"}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[var(--b-soft)] bg-[rgba(8,6,10,0.95)] px-6 pb-6 pt-4 space-y-4">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setMobileOpen(false)}
              className="block text-sm text-[var(--t-2)] hover:text-[var(--brand-gold)] transition-colors"
            >
              {n.label}
            </Link>
          ))}
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-1.5 text-sm font-medium text-[var(--brand-gold)] hover:text-[var(--brand-gold-bright)] transition-colors"
            >
              <LayoutDashboard size={15} />
              {displayName}
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="block text-sm text-[var(--t-2)] hover:text-[var(--t-1)] transition-colors"
              >
                Войти
              </Link>
              <ButtonLink href="/register" size="sm" iconRight={<ArrowRight size={16} />}>
                Зарегистрироваться
              </ButtonLink>
            </>
          )}
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--b-soft)] mt-24">
      <div className="max-w-6xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-8 items-start">
        <div>
          <Logo size="sm" />
          <p className="mt-4 text-xs text-[var(--t-3)] leading-relaxed max-w-xs">
            Signal Trade GPT не является финансовым советником. Сигналы предоставляются в
            информационных целях. Торговля бинарными опционами сопряжена с высоким риском
            потери средств.
          </p>
        </div>
        <div className="text-sm">
          <div className="text-[var(--brand-gold)] uppercase tracking-widest text-xs mb-3">
            Платформа
          </div>
          <ul className="space-y-2 text-[var(--t-2)]">
            <li><Link href="/how-it-works" className="hover:text-[var(--t-1)]">Как это работает</Link></li>
            <li><Link href="/about" className="hover:text-[var(--t-1)]">Про нас</Link></li>
            <li><Link href="/register" className="hover:text-[var(--t-1)]">Регистрация</Link></li>
            <li><Link href="/login" className="hover:text-[var(--t-1)]">Войти</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <div className="text-[var(--brand-gold)] uppercase tracking-widest text-xs mb-3">
            Поддержка
          </div>
          <ul className="space-y-2 text-[var(--t-2)]">
            <li><Link href="/faq" className="hover:text-[var(--t-1)]">FAQ</Link></li>
            <li><Link href="/terms" className="hover:text-[var(--t-1)]">Правила использования</Link></li>
            <li><Link href="/privacy" className="hover:text-[var(--t-1)]">Конфиденциальность</Link></li>
            <li><Link href="/dashboard" className="hover:text-[var(--t-1)]">Личный кабинет</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
