import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { ButtonLink } from "@/components/ui/Button";

const NAV = [
  { href: "/how-it-works", label: "Как это работает" },
  { href: "/about", label: "Про нас" },
];

export function SiteHeader() {
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
          <Link href="/login" className="hover:text-[var(--t-1)] transition-colors">
            Войти
          </Link>
        </div>
        <ButtonLink href="/register" size="sm" iconRight={<ArrowRight size={16} />}>
          Зарегистрироваться
        </ButtonLink>
      </nav>
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
