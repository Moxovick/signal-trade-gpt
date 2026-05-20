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
  Send,
} from "lucide-react";

type Group = {
  label: string;
  items: Item[];
};

type Item = {
  href: string;
  label: string;
  icon: typeof Palette;
  description: string;
};

const GROUPS: Group[] = [
  {
    label: "Аккаунт",
    items: [
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
        description: "Email, Telegram, браузер",
      },
      {
        href: "/dashboard/settings/security",
        label: "Безопасность",
        icon: Shield,
        description: "Пароль, 2FA, сессии",
      },
    ],
  },
  {
    label: "Интеграции",
    items: [
      {
        href: "/dashboard/settings/telegram",
        label: "Telegram",
        icon: Send,
        description: "Привязка аккаунта",
      },
      {
        href: "/dashboard/settings/pocketoption",
        label: "PocketOption",
        icon: Link2,
        description: "ID, депозиты, тир",
      },
    ],
  },
  {
    label: "Прочее",
    items: [
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
    ],
  },
];

export function SettingsSidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-6 sticky top-24">
      {GROUPS.map((group) => (
        <div key={group.label}>
          <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--t-3)] font-semibold mb-2 px-1">
            {group.label}
          </div>
          <div className="flex flex-col gap-0.5">
            {group.items.map(({ href, label, icon: Icon, description }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 ${
                    active
                      ? "bg-[rgba(212,160,23,0.10)] text-[var(--t-1)]"
                      : "text-[var(--t-2)] hover:bg-[var(--bg-2)] hover:text-[var(--t-1)]"
                  }`}
                >
                  {/* Active indicator stripe */}
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-[var(--brand-gold)]" />
                  )}

                  {/* Icon pill */}
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-200 ${
                      active
                        ? "bg-[rgba(212,160,23,0.18)]"
                        : "bg-[var(--bg-2)] group-hover:bg-[var(--bg-3)]"
                    }`}
                  >
                    <Icon
                      size={15}
                      className={
                        active
                          ? "text-[var(--brand-gold)]"
                          : "text-[var(--t-3)] group-hover:text-[var(--t-2)]"
                      }
                    />
                  </div>

                  {/* Text */}
                  <div className="min-w-0 flex-1">
                    <div
                      className={`text-[13px] font-semibold leading-tight ${
                        active ? "text-[var(--brand-gold)]" : ""
                      }`}
                    >
                      {label}
                    </div>
                    <div className="text-[11px] text-[var(--t-3)] truncate mt-0.5">
                      {description}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
