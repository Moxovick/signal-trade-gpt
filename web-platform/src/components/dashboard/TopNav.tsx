"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Send,
  Users,
  Gift,
  Trophy,
  User as UserIcon,
  Shield,
  LogOut,
  Settings as SettingsIcon,
  ExternalLink,
  MoreHorizontal,
  Menu,
  X,
  Wallet,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";

type NavItem = {
  href: string;
  label: string;
  icon: typeof Send;
};

const MORE_NAV: NavItem[] = [
  { href: "/dashboard/referrals", label: "Рефералы", icon: Users },
  { href: "/dashboard/giveaway", label: "Розыгрыш", icon: Gift },
  { href: "/dashboard/leaderboard", label: "Лидерборд", icon: Trophy },
  { href: "/dashboard/pocket-option", label: "PocketOption", icon: Wallet },
  { href: "/dashboard/profile", label: "Профиль", icon: UserIcon },
  { href: "/dashboard/settings", label: "Настройки", icon: SettingsIcon },
];

const BOT_URL =
  process.env["NEXT_PUBLIC_BOT_URL"] ?? "https://t.me/traitsignaltsest_bot";

export function DashboardTopNav({
  user,
}: {
  user: { name: string | null; email: string | null; role?: string };
}) {
  const pathname = usePathname();
  const initial = (user.name ?? user.email ?? "?")[0]!.toUpperCase();
  const displayName = user.name ?? user.email?.split("@")[0] ?? "Trader";

  const [moreOpen, setMoreOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  // Close "More" dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    }
    if (moreOpen) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [moreOpen]);

  // Close menus on navigation by keying state to pathname.
  const [trackedPath, setTrackedPath] = useState(pathname);
  if (trackedPath !== pathname) {
    setTrackedPath(pathname);
    if (mobileOpen) setMobileOpen(false);
    if (moreOpen) setMoreOpen(false);
  }

  const signalsActive = pathname === "/dashboard/signals";

  function isItemActive(href: string): boolean {
    if (href === "/dashboard/settings") return pathname.startsWith("/dashboard/settings");
    return pathname === href;
  }

  return (
    <header
      className="sticky top-0 z-40 backdrop-blur-md border-b border-[var(--b-soft)]"
      style={{ background: "rgba(8,6,10,0.88)" }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="h-14 flex items-center justify-between gap-4">
          {/* LEFT: Logo */}
          <div className="shrink-0">
            <Logo size="md" />
          </div>

          {/* CENTER: Signals — primary CTA */}
          <Link
            href="/dashboard/signals"
            className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl text-base font-bold whitespace-nowrap transition-all duration-200 border ${
              signalsActive
                ? "bg-[rgba(212,160,23,0.18)] text-[var(--brand-gold-bright)] border-[var(--brand-gold)] shadow-[0_0_12px_rgba(212,160,23,0.25)]"
                : "bg-[rgba(212,160,23,0.08)] text-[var(--brand-gold)] border-[rgba(212,160,23,0.30)] hover:bg-[rgba(212,160,23,0.14)] hover:border-[var(--brand-gold)] hover:shadow-[0_0_8px_rgba(212,160,23,0.15)]"
            }`}
          >
            <Send size={16} />
            Сигналы
          </Link>

          {/* RIGHT: Actions */}
          <div className="flex items-center gap-2">
            {/* More dropdown — desktop */}
            <div ref={moreRef} className="relative hidden sm:block">
              <button
                onClick={() => setMoreOpen((v) => !v)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                  moreOpen
                    ? "border-[var(--brand-gold)] bg-[rgba(212,160,23,0.12)] text-[var(--brand-gold)]"
                    : "border-transparent text-[var(--t-2)] hover:text-[var(--t-1)] hover:bg-[var(--bg-2)]"
                }`}
                aria-label="Ещё"
              >
                <MoreHorizontal size={16} />
                <span className="hidden md:inline">Ещё</span>
              </button>

              {moreOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-[var(--b-hard)] shadow-xl overflow-hidden"
                  style={{ background: "var(--bg-1)" }}
                >
                  {MORE_NAV.map(({ href, label, icon: Icon }) => {
                    const active = isItemActive(href);
                    return (
                      <Link
                        key={href}
                        href={href}
                        className={`flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors ${
                          active
                            ? "bg-[rgba(212,160,23,0.12)] text-[var(--brand-gold)]"
                            : "text-[var(--t-2)] hover:text-[var(--t-1)] hover:bg-[var(--bg-2)]"
                        }`}
                      >
                        <Icon
                          size={14}
                          className={active ? "text-[var(--brand-gold)]" : "text-[var(--t-3)]"}
                        />
                        {label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Telegram bot link */}
            <a
              href={BOT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-[rgba(56,189,248,0.30)] bg-[rgba(56,189,248,0.07)] text-[#38bdf8] hover:bg-[rgba(56,189,248,0.14)] hover:border-[rgba(56,189,248,0.50)] transition-all"
            >
              <Send size={12} />
              Telegram
              <ExternalLink size={10} className="opacity-60" />
            </a>

            {/* Admin badge */}
            {user.role === "admin" && (
              <Link
                href="/admin"
                className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold text-[var(--brand-gold)] px-2.5 py-1.5 rounded-lg border border-[var(--b-hard)] bg-[rgba(212,160,23,0.08)] hover:bg-[rgba(212,160,23,0.14)] transition-colors"
              >
                <Shield size={11} />
                Admin
              </Link>
            )}

            {/* User chip */}
            <div className="hidden sm:flex items-center gap-2 pl-1">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 select-none"
                style={{ background: "var(--brand-gold)", color: "var(--bg-0)" }}
              >
                {initial}
              </div>
              <span className="text-xs text-[var(--t-2)] max-w-28 truncate hidden md:block">
                {displayName}
              </span>
            </div>

            {/* Settings icon-button — desktop */}
            <Link
              href="/dashboard/settings"
              className={`hidden sm:inline-flex p-2 rounded-lg transition-all ${
                pathname.startsWith("/dashboard/settings")
                  ? "text-[var(--brand-gold)] bg-[rgba(212,160,23,0.10)]"
                  : "text-[var(--t-3)] hover:text-[var(--t-1)] hover:bg-[var(--bg-2)]"
              }`}
              aria-label="Настройки"
            >
              <SettingsIcon size={15} />
            </Link>

            {/* Logout */}
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="hidden sm:inline-flex p-2 rounded-lg text-[var(--t-3)] hover:text-[var(--red)] hover:bg-[rgba(255,107,61,0.08)] transition-all"
              aria-label="Выйти"
            >
              <LogOut size={15} />
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="sm:hidden p-2 rounded-lg text-[var(--t-2)] hover:text-[var(--t-1)] hover:bg-[var(--bg-2)] transition-all"
              aria-label="Меню"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="sm:hidden border-t border-[var(--b-soft)] px-4 pb-4 pt-2"
          style={{ background: "var(--bg-1)" }}
        >
          <nav className="flex flex-col gap-1">
            {MORE_NAV.map(({ href, label, icon: Icon }) => {
              const active = isItemActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "bg-[rgba(212,160,23,0.12)] text-[var(--brand-gold)]"
                      : "text-[var(--t-2)] hover:text-[var(--t-1)] hover:bg-[var(--bg-2)]"
                  }`}
                >
                  <Icon
                    size={14}
                    className={active ? "text-[var(--brand-gold)]" : "text-[var(--t-3)]"}
                  />
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-3 pt-3 border-t border-[var(--b-soft)] flex flex-col gap-1">
            {/* Telegram bot link — mobile */}
            <a
              href={BOT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-[#38bdf8] hover:bg-[rgba(56,189,248,0.08)] transition-colors"
            >
              <Send size={14} />
              Telegram-бот
              <ExternalLink size={10} className="opacity-60" />
            </a>

            {/* Admin — mobile */}
            {user.role === "admin" && (
              <Link
                href="/admin"
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--brand-gold)] hover:bg-[rgba(212,160,23,0.08)] transition-colors"
              >
                <Shield size={14} />
                Admin
              </Link>
            )}

            {/* User info — mobile */}
            <div className="flex items-center gap-2.5 px-3 py-2.5">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 select-none"
                style={{ background: "var(--brand-gold)", color: "var(--bg-0)" }}
              >
                {initial}
              </div>
              <span className="text-sm text-[var(--t-2)] truncate">{displayName}</span>
            </div>

            {/* Logout — mobile */}
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--red)] hover:bg-[rgba(255,107,61,0.08)] transition-colors w-full text-left"
            >
              <LogOut size={14} />
              Выйти
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
