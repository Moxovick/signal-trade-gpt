"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const navItems = [
  { href: "/dashboard", label: "Обзор", icon: "⚡" },
  { href: "/dashboard/signals", label: "Сигналы", icon: "📊" },
  { href: "/dashboard/profile", label: "Профиль", icon: "👤" },
  { href: "/dashboard/referrals", label: "Рефералы", icon: "🔗" },
  { href: "/dashboard/history", label: "История", icon: "🕐" },
  { href: "/dashboard/leaderboard", label: "Лидерборд", icon: "🏆" },
];

interface Props {
  user: { name?: string | null; email?: string | null; [key: string]: unknown };
}

export default function DashboardSidebar({ user }: Props) {
  const pathname = usePathname();

  return (
    <aside
      className="fixed left-0 top-0 h-full w-64 flex flex-col z-40 border-r"
      style={{ background: "#0a0a14", borderColor: "rgba(255,255,255,0.06)" }}
    >
      {/* Logo */}
      <div className="p-6 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <Link href="/">
          <span
            className="text-2xl font-black tracking-wider"
            style={{ fontFamily: "var(--font-bebas)", color: "#f5c518" }}
          >
            SIGNAL TRADE GPT
          </span>
        </Link>
      </div>

      {/* User info */}
      <div
        className="mx-4 mt-4 p-3 rounded-xl flex items-center gap-3"
        style={{ background: "rgba(245,197,24,0.06)", border: "1px solid rgba(245,197,24,0.15)" }}
      >
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
          style={{ background: "#f5c518", color: "#07070d" }}
        >
          {(user.name ?? user.email ?? "?")[0].toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{user.name ?? "Пользователь"}</p>
          <p className="text-xs text-[#666] truncate">{user.email}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 mt-2">
        {navItems.map(({ href, label, icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background: active ? "rgba(245,197,24,0.12)" : "transparent",
                color: active ? "#f5c518" : "#888",
                borderLeft: active ? "2px solid #f5c518" : "2px solid transparent",
              }}
            >
              <span>{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t space-y-2" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <Link
          href="https://t.me/traitsignaltsest_bot"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#888] hover:text-[#f5c518] transition-colors"
        >
          <span>✈</span> Telegram бот
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#555] hover:text-red-400 transition-colors"
        >
          <span>↩</span> Выйти
        </button>
      </div>
    </aside>
  );
}
