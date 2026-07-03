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
import { useI18n } from "@/lib/i18n/context";

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

export function SettingsSidebar() {
  const { t } = useI18n();
  const pathname = usePathname();

  const GROUPS: Group[] = [
    {
      label: t.settings.groupAccount,
      items: [
        {
          href: "/dashboard/settings",
          label: t.settings.appearance,
          icon: Palette,
          description: t.settings.appearanceDescSidebar,
        },
        {
          href: "/dashboard/settings/notifications",
          label: t.settings.notifications,
          icon: Bell,
          description: t.settings.notificationsDescSidebar,
        },
        {
          href: "/dashboard/settings/security",
          label: t.settings.security,
          icon: Shield,
          description: t.settings.securityDescSidebar,
        },
      ],
    },
    {
      label: t.settings.groupIntegrations,
      items: [
        {
          href: "/dashboard/settings/telegram",
          label: t.settings.telegram,
          icon: Send,
          description: t.settings.telegramDescSidebar,
        },
        {
          href: "/dashboard/settings/pocketoption",
          label: t.settings.pocketOption,
          icon: Link2,
          description: t.settings.pocketOptionDescSidebar,
        },
      ],
    },
    {
      label: t.settings.groupOther,
      items: [
        {
          href: "/dashboard/settings/achievements",
          label: t.settings.achievementsLabel,
          icon: Trophy,
          description: t.settings.achievementsDescSidebar,
        },
        {
          href: "/dashboard/referrals",
          label: t.settings.referralsLabel,
          icon: Share2,
          description: t.settings.referralsDesc,
        },
      ],
    },
  ];

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
