"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft } from "lucide-react";

const SECTION_LABELS: Record<string, string> = {
  "/dashboard/settings/notifications": "Уведомления",
  "/dashboard/settings/security": "Безопасность",
  "/dashboard/settings/telegram": "Telegram",
  "/dashboard/settings/pocketoption": "PocketOption",
  "/dashboard/settings/achievements": "Достижения",
};

export function SettingsBackNav() {
  const pathname = usePathname();

  if (pathname === "/dashboard/settings") return null;

  const label = SECTION_LABELS[pathname] ?? "Назад";

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/dashboard/settings"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--t-2)] hover:text-[var(--t-1)] transition-colors"
      >
        <ChevronLeft size={16} />
        Настройки
      </Link>
      <span className="text-[var(--t-3)]">/</span>
      <span className="text-sm font-semibold text-[var(--t-1)]">{label}</span>
    </div>
  );
}
