"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Palette,
  Bell,
  Shield,
  Link2,
  Trophy,
  Share2,
} from "lucide-react";

type Item = {
  href: string;
  label: string;
  icon: typeof Palette;
  description: string;
};

const ITEMS: Item[] = [
  {
    href: "/dashboard/settings",
    label: "Внешний вид",
    icon: Palette,
    description: "Тема, язык, часовой пояс",
  },
  {
    href: "/dashboard/settings/notifications",
    label: "Уведомления",
    icon: Bell,
    description: "Email, telegram, браузер",
  },
  {
    href: "/dashboard/settings/security",
    label: "Безопасность",
    icon: Shield,
    description: "Пароль, 2FA, сессии",
  },
  {
    href: "/dashboard/settings/pocketoption",
    label: "PocketOption",
    icon: Link2,
    description: "ID, депозиты, P&L",
  },
  {
    href: "/dashboard/settings/achievements",
    label: "Достижения",
    icon: Trophy,
    description: "Бейджи и streak",
  },
  {
    href: "/dashboard/referrals",
    label: "Рефералы",
    icon: Share2,
    description: "Ссылка и статистика",
  },
];

export function SettingsSidebar() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1 sticky top-24">
      {ITEMS.map(({ href, label, icon: Icon, description }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors border ${
              active
                ? "border-[var(--b-hard)] bg-[rgba(212,160,23,0.08)]"
                : "border-transparent hover:bg-[var(--bg-2)]"
            }`}
          >
            <Icon
              size={16}
              className={`mt-0.5 shrink-0 ${
                active ? "text-[var(--brand-gold)]" : "text-[var(--t-3)]"
              }`}
            />
            <div className="min-w-0">
              <div
                className={`text-[13px] font-semibold ${
                  active ? "text-[var(--brand-gold)]" : "text-[var(--t-1)]"
                }`}
              >
                {label}
              </div>
              <div className="text-[11px] text-[var(--t-3)] truncate">
                {description}
              </div>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
