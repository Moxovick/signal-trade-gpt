"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Trophy, User } from "lucide-react";

type Item = {
  href: string;
  label: string;
  icon: typeof Activity;
  exact?: boolean;
};

const ITEMS: readonly Item[] = [
  { href: "/tma", label: "Сигналы", icon: Activity, exact: true },
  { href: "/tma/leaders", label: "Лидеры", icon: Trophy },
  { href: "/tma/profile", label: "Профиль", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      className="fixed bottom-0 inset-x-0 border-t border-[var(--b-soft)] bg-[var(--bg-0)]/90 backdrop-blur-xl z-30"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0)" }}
    >
      <div className="grid grid-cols-3 max-w-md mx-auto">
        {ITEMS.map((it) => {
          const Icon = it.icon;
          const active = it.exact ? pathname === it.href : pathname?.startsWith(it.href);
          return (
            <Link
              key={it.href}
              href={it.href}
              className={`flex flex-col items-center gap-1 py-3 transition-colors ${
                active ? "text-[var(--brand-gold)]" : "text-[var(--t-3)] hover:text-[var(--t-2)]"
              }`}
            >
              <Icon size={20} />
              <span className="text-[11px] uppercase tracking-wider">{it.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
