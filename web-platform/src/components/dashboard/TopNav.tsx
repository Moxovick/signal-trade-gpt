"use client";

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
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";

type NavItem = {
  href: string;
  label: string;
  icon: typeof Send;
};

const NAV: NavItem[] = [
  { href: "/dashboard/signals", label: "Сигналы", icon: Send },
  { href: "/dashboard/referrals", label: "Рефералы", icon: Users },
  { href: "/dashboard/giveaway", label: "Розыгрыш", icon: Gift },
  { href: "/dashboard/leaderboard", label: "Лидерборд", icon: Trophy },
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

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md border-b border-[var(--b-soft)]"
      style={{ background: "rgba(8,6,10,0.88)" }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Top bar */}
        <div className="h-14 flex items-center justify-between gap-4">
          <div className="shrink-0">
            <Logo size="md" />
          </div>

          <div className="flex items-center gap-2">
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

            {/* Logout */}
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="p-2 rounded-lg text-[var(--t-3)] hover:text-[var(--red)] hover:bg-[rgba(255,107,61,0.08)] transition-all"
              aria-label="Выйти"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>

        {/* Navigation pills */}
        <nav className="flex items-center gap-1 pb-2 overflow-x-auto scrollbar-none">
          {NAV.map(({ href, label, icon: Icon }) => {
            // For settings, highlight if pathname starts with settings prefix
            const isSettings = href === "/dashboard/settings";
            const active = isSettings
              ? pathname.startsWith("/dashboard/settings")
              : pathname === href;

            return (
              <Link
                key={href}
                href={href}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  active
                    ? "bg-[rgba(212,160,23,0.14)] text-[var(--brand-gold)] border border-[rgba(212,160,23,0.25)]"
                    : "text-[var(--t-2)] hover:text-[var(--t-1)] hover:bg-[var(--bg-2)] border border-transparent"
                }`}
              >
                <Icon
                  size={13}
                  className={active ? "text-[var(--brand-gold)]" : "text-[var(--t-3)]"}
                />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
