"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

export function SettingsBackNav() {
  const { t } = useI18n();
  const pathname = usePathname();

  const SECTION_LABELS: Record<string, string> = {
    "/dashboard/settings/notifications": t.settings.notifications,
    "/dashboard/settings/security": t.settings.security,
    "/dashboard/settings/telegram": t.settings.telegram,
    "/dashboard/settings/pocketoption": t.settings.pocketOption,
    "/dashboard/settings/achievements": t.settings.achievementsLabel,
  };

  if (pathname === "/dashboard/settings") return null;

  const label = SECTION_LABELS[pathname] ?? t.settings.backNavFallback;

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/dashboard/settings"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--t-2)] hover:text-[var(--t-1)] transition-colors"
      >
        <ChevronLeft size={16} />
        {t.settings.backNav}
      </Link>
      <span className="text-[var(--t-3)]">/</span>
      <span className="text-sm font-semibold text-[var(--t-1)]">{label}</span>
    </div>
  );
}
