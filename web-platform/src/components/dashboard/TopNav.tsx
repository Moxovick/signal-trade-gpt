"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Send,
  Users,
  Award,
  Gift,
  Trophy,
  User as UserIcon,
  Shield,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
};

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Обзор", icon: LayoutDashboard },
  { href: "/dashboard/signals", label: "Сигналы", icon: Send },
  { href: "/dashboard/referrals", label: "Рефералы", icon: Users },
  { href: "/dashboard/achievements", label: "Достижения", icon: Award },
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

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md border-b border-[var(--b-soft)] bg-[rgba(8,6,10,0.85)]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="h-16 flex items-center justify-between gap-6">
          <div className="shrink-0">
            <Logo size="md" />
          </div>

          <div className="flex items-center gap-3">
            <a
              href={BOT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-xs text-[var(--t-2)] hover:text-[var(--brand-gold)] transition-colors"
            >
              Telegram <ExternalLink size={12} />
            </a>
            {user.role === "admin" && (
              <Link
                href="/admin"
                className="hidden sm:flex items-center gap-1.5 text-xs text-[var(--brand-gold)] hover:text-[var(--t-1)] transition-colors px-2 py-1 rounded-md bg-[rgba(212,160,23,0.08)] border border-[var(--b-soft)]"
              >
                <Shield size={12} /> Admin
              </Link>
            )}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--bg-1)] border border-[var(--b-soft)]">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{ background: "var(--brand-gold)", color: "var(--bg-0)" }}
              >
                {initial}
              </div>
              <span className="text-xs text-[var(--t-2)] max-w-32 truncate">
                {displayName}
              </span>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-[var(--t-3)] hover:text-[var(--red)] transition-colors p-1.5 rounded-md"
              aria-label="Выйти"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <nav className="flex items-center gap-1 -mb-px overflow-x-auto scrollbar-thin">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-4 py-3 text-sm whitespace-nowrap border-b-2 transition-colors ${
                  active
                    ? "border-[var(--brand-gold)] text-[var(--brand-gold)] font-semibold"
                    : "border-transparent text-[var(--t-2)] hover:text-[var(--t-1)]"
                }`}
              >
                <Icon size={14} />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
