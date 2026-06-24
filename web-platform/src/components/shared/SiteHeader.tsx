"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ArrowRight, Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";

// ---------------------------------------------------------------------------
// Translations shape (subset of Dictionary["nav"] | Dictionary["footer"])
// ---------------------------------------------------------------------------
export type SiteHeaderTranslations = {
  nav: {
    howItWorks: string;
    aboutUs: string;
    login: string;
    register: string;
    closeMenu: string;
    openMenu: string;
    cabinetFallback: string;
    avatarAlt: string;
  };
  footer: {
    disclaimer: string;
    sectionPlatform: string;
    sectionSupport: string;
    links: {
      howItWorks: string;
      aboutUs: string;
      register: string;
      login: string;
      faq: string;
      terms: string;
      privacy: string;
      dashboard: string;
    };
  };
};

const DEFAULT_TRANSLATIONS: SiteHeaderTranslations = {
  nav: {
    howItWorks: "Как это работает",
    aboutUs: "Про нас",
    login: "Войти",
    register: "Зарегистрироваться",
    closeMenu: "Закрыть меню",
    openMenu: "Открыть меню",
    cabinetFallback: "Кабинет",
    avatarAlt: "Аватар",
  },
  footer: {
    disclaimer:
      "SpaceSignal не является финансовым советником. Сигналы предоставляются в " +
      "информационных целях. Торговля бинарными опционами сопряжена с высоким риском " +
      "потери средств.",
    sectionPlatform: "Платформа",
    sectionSupport: "Поддержка",
    links: {
      howItWorks: "Как это работает",
      aboutUs: "Про нас",
      register: "Регистрация",
      login: "Войти",
      faq: "FAQ",
      terms: "Правила использования",
      privacy: "Конфиденциальность",
      dashboard: "Личный кабинет",
    },
  },
};

// ---------------------------------------------------------------------------
// HeaderAvatar
// ---------------------------------------------------------------------------
function HeaderAvatar({
  src,
  initial,
  alt,
  size = "w-6 h-6",
}: {
  src: string | null;
  initial: string;
  alt: string;
  size?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (src && !failed) {
    return (
      <img
        src={src}
        alt={alt}
        className={`${size} rounded-full object-cover shrink-0`}
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <div
      className={`${size} rounded-full flex items-center justify-center text-[10px] font-bold shrink-0`}
      style={{ background: "var(--brand-gold)", color: "var(--bg-0)" }}
    >
      {initial}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SiteHeader
// ---------------------------------------------------------------------------
export function SiteHeader({
  translations,
  locale,
}: {
  translations?: SiteHeaderTranslations;
  locale?: "ru" | "uk";
}) {
  const t = translations ?? DEFAULT_TRANSLATIONS;
  const nav = t.nav;

  const NAV = [
    { href: "/how-it-works", label: nav.howItWorks },
    { href: "/about", label: nav.aboutUs },
  ];

  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated" && !!session?.user;
  const displayName =
    session?.user?.name ??
    session?.user?.email?.split("@")[0] ??
    nav.cabinetFallback;
  const avatarUrl =
    (session?.user as { image?: string | null } | undefined)?.image ?? null;
  const initial = displayName[0]?.toUpperCase() ?? "?";

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
          <LanguageSwitcher locale={locale} />
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-[var(--brand-gold)] hover:text-[var(--brand-gold-bright)] transition-colors font-medium px-3 py-1.5 rounded-lg hover:bg-[rgba(212,160,23,0.08)]"
            >
              <HeaderAvatar src={avatarUrl} initial={initial} alt={nav.avatarAlt} />
              {displayName}
            </Link>
          ) : (
            <Link href="/login" className="hover:text-[var(--t-1)] transition-colors">
              {nav.login}
            </Link>
          )}
        </div>
        {!isLoggedIn && (
          <div className="hidden md:block">
            <ButtonLink href="/register" size="sm" iconRight={<ArrowRight size={16} />}>
              {nav.register}
            </ButtonLink>
          </div>
        )}
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="md:hidden p-2 text-[var(--t-2)] hover:text-[var(--t-1)] transition-colors"
          aria-label={mobileOpen ? nav.closeMenu : nav.openMenu}
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
          <LanguageSwitcher locale={locale} />
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2.5 text-sm font-medium text-[var(--brand-gold)] hover:text-[var(--brand-gold-bright)] transition-colors"
            >
              <HeaderAvatar src={avatarUrl} initial={initial} alt={nav.avatarAlt} />
              {displayName}
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="block text-sm text-[var(--t-2)] hover:text-[var(--t-1)] transition-colors"
              >
                {nav.login}
              </Link>
              <ButtonLink href="/register" size="sm" iconRight={<ArrowRight size={16} />}>
                {nav.register}
              </ButtonLink>
            </>
          )}
        </div>
      )}
    </header>
  );
}

// ---------------------------------------------------------------------------
// SiteFooter
// ---------------------------------------------------------------------------
export function SiteFooter({
  translations,
  locale,
}: {
  translations?: SiteHeaderTranslations;
  locale?: "ru" | "uk";
}) {
  void locale;
  const t = (translations ?? DEFAULT_TRANSLATIONS).footer;
  return (
    <footer className="border-t border-[var(--b-soft)] mt-24">
      <div className="max-w-6xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-8 items-start">
        <div>
          <Logo size="sm" />
          <p className="mt-4 text-xs text-[var(--t-3)] leading-relaxed max-w-xs">
            {t.disclaimer}
          </p>
        </div>
        <div className="text-sm">
          <div className="text-[var(--brand-gold)] uppercase tracking-widest text-xs mb-3">
            {t.sectionPlatform}
          </div>
          <ul className="space-y-2 text-[var(--t-2)]">
            <li><Link href="/how-it-works" className="hover:text-[var(--t-1)]">{t.links.howItWorks}</Link></li>
            <li><Link href="/about" className="hover:text-[var(--t-1)]">{t.links.aboutUs}</Link></li>
            <li><Link href="/register" className="hover:text-[var(--t-1)]">{t.links.register}</Link></li>
            <li><Link href="/login" className="hover:text-[var(--t-1)]">{t.links.login}</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <div className="text-[var(--brand-gold)] uppercase tracking-widest text-xs mb-3">
            {t.sectionSupport}
          </div>
          <ul className="space-y-2 text-[var(--t-2)]">
            <li><Link href="/faq" className="hover:text-[var(--t-1)]">{t.links.faq}</Link></li>
            <li><Link href="/terms" className="hover:text-[var(--t-1)]">{t.links.terms}</Link></li>
            <li><Link href="/privacy" className="hover:text-[var(--t-1)]">{t.links.privacy}</Link></li>
            <li><Link href="/dashboard" className="hover:text-[var(--t-1)]">{t.links.dashboard}</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
