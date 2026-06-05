"use client";

import { useState } from "react";
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
  Menu,
  X,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";

type NavItem = {
  href: string;
  label: string;
  icon: typeof Send;
};

const MAIN_NAV: NavItem[] = [
  { href: "/dashboard/signals", label: "Сигналы", icon: Send },
  { href: "/dashboard/referrals", label: "Рефералы", icon: Users },
  { href: "/dashboard/giveaway", label: "Розыгрыш", icon: Gift },
  { href: "/dashboard/leaderboard", label: "Лидерборд", icon: Trophy },
  { href: "/dashboard/profile", label: "Профиль", icon: UserIcon },
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

  const [mobileOpen, setMobileOpen] = useState(false);

  // Close menus on navigation
  const [trackedPath, setTrackedPath] = useState(pathname);
  if (trackedPath !== pathname) {
    setTrackedPath(pathname);
    if (mobileOpen) setMobileOpen(false);
  }

  function isItemActive(href: string): boolean {
    if (href === "/dashboard/signals") return pathname === "/dashboard/signals";
    if (href === "/dashboard/settings") return pathname.startsWith("/dashboard/settings");
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <header
      className="sticky top-0 z-40 backdrop-blur-md border-b border-[var(--b-soft)]"
      style={{ background: "rgba(8,6,10,0.88)" }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="h-14 flex items-center justify-between gap-2">
          {/* LEFT: Logo */}
          <div className="shrink-0">
            <Logo size="md" />
          </div>

          {/* CENTER: All nav tabs — desktop */}
          <nav className="hidden lg:flex items-center gap-1">
            {MAIN_NAV.map(({ href, label, icon: Icon }) => {
              const active = isItemActive(href);
              const isSignals = href === "/dashboard/signals";
              return (
                <Link
                  key={href}
                  href={href}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all border ${
                    isSignals
                      ? active
                        ? "bg-[rgba(212,160,23,0.18)] text-[var(--brand-gold-bright)] border-[var(--brand-gold)] shadow-[0_0_12px_rgba(212,160,23,0.25)]"
                        : "bg-[rgba(212,160,23,0.08)] text-[var(--brand-gold)] border-[rgba(212,160,23,0.30)] hover:bg-[rgba(212,160,23,0.14)] hover:border-[var(--brand-gold)]"
                      : active
                        ? "bg-[var(--bg-2)] text-[var(--t-1)] border-[var(--b-hard)]"
                        : "border-transparent text-[var(--t-2)] hover:text-[var(--t-1)] hover:bg-[var(--bg-2)]"
                  }`}
                >
                  <Icon size={14} />
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* RIGHT: Actions */}
          <div className="flex items-center gap-2">
            {/* Telegram bot link — desktop */}
            <a
              href={BOT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-[rgba(56,189,248,0.30)] bg-[rgba(56,189,248,0.07)] text-[#38bdf8] hover:bg-[rgba(56,189,248,0.14)] hover:border-[rgba(56,189,248,0.50)] transition-all"
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

            {/* Logout — desktop */}
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
              className="lg:hidden p-2 rounded-lg text-[var(--t-2)] hover:text-[var(--t-1)] hover:bg-[var(--bg-2)] transition-all"
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
          className="lg:hidden border-t border-[var(--b-soft)] px-4 pb-4 pt-2"
          style={{ background: "var(--bg-1)" }}
        >
          <nav className="flex flex-col gap-1">
            {MAIN_NAV.map(({ href, label, icon: Icon }) => {
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
            <Link
              href="/dashboard/settings"
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                pathname.startsWith("/dashboard/settings")
                  ? "bg-[rgba(212,160,23,0.12)] text-[var(--brand-gold)]"
                  : "text-[var(--t-2)] hover:text-[var(--t-1)] hover:bg-[var(--bg-2)]"
              }`}
            >
              <SettingsIcon
                size={14}
                className={pathname.startsWith("/dashboard/settings") ? "text-[var(--brand-gold)]" : "text-[var(--t-3)]"}
              />
              Настройки
            </Link>
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
