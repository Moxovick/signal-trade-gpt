"use client";

/**
 * Admin sidebar — all navigation config lives here (client-only).
 * Icons are React components and cannot be passed as props from RSC,
 * so adminGroups is defined directly in this file.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  BarChart3,
  Bot,
  Layers,
  Send,
  Sparkles,
  Activity,
  Settings as SettingsIcon,
  Users,
  Wallet,
  HelpCircle,
  MessageSquare,
  Trophy,
  Gift,
  FileText,
  Award,
  CandlestickChart,
  KeyRound,
  Webhook,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { useI18n } from "@/lib/i18n/context";

type NavItem = {
  href: string;
  labelKey: string;
  icon: LucideIcon;
  badgeKey?: "unmatched";
};

type NavGroup = {
  groupKey: string;
  items: NavItem[];
};

const GROUPS: NavGroup[] = [
  {
    groupKey: "main",
    items: [
      { href: "/admin",        labelKey: "overview",    icon: BarChart3 },
      { href: "/admin/users",  labelKey: "users",       icon: Users },
      { href: "/admin/signals",labelKey: "signals",     icon: Send },
    ],
  },
  {
    groupKey: "pocketOption",
    items: [
      { href: "/admin/po-accounts",       labelKey: "poAccounts",       icon: Layers },
      { href: "/admin/postbacks",         labelKey: "postbackLog",      icon: Activity, badgeKey: "unmatched" },
      { href: "/admin/postbacks/setup",   labelKey: "postbackSetup",    icon: Webhook },
      { href: "/admin/settings/po-api",   labelKey: "poApi",            icon: KeyRound },
    ],
  },
  {
    groupKey: "content",
    items: [
      { href: "/admin/perks",        labelKey: "botPerks",    icon: Sparkles },
      { href: "/admin/assets",       labelKey: "assets",      icon: CandlestickChart },
      { href: "/admin/deposits",     labelKey: "deposits",    icon: Wallet },
      { href: "/admin/faq",          labelKey: "faq",         icon: HelpCircle },
      { href: "/admin/reviews",      labelKey: "reviews",     icon: MessageSquare },
      { href: "/admin/leaderboard",  labelKey: "leaderboard", icon: Trophy },
      { href: "/admin/giveaway",     labelKey: "giveaway",    icon: Gift },
      { href: "/admin/achievements", labelKey: "achievements",icon: Award },
      { href: "/admin/legal",        labelKey: "legal",       icon: FileText },
    ],
  },
  {
    groupKey: "system",
    items: [
      { href: "/admin/bot-config", labelKey: "botConfig",     icon: Bot },
      { href: "/admin/settings",   labelKey: "siteSettings",  icon: SettingsIcon },
    ],
  },
];

const GROUP_LABEL_FALLBACK: Record<string, string> = {
  main: "Главное",
  pocketOption: "PocketOption",
  content: "Контент",
  system: "Системное",
};

const ITEM_LABEL_FALLBACK: Record<string, string> = {
  overview: "Обзор",
  users: "Пользователи",
  signals: "Сигналы",
  poAccounts: "PO-аккаунты",
  postbackLog: "Postback-лог",
  postbackSetup: "Настройка постбэков",
  poApi: "API креды",
  botPerks: "Перки бота",
  assets: "Активы (пары)",
  deposits: "Депозиты",
  faq: "FAQ",
  reviews: "Отзывы",
  leaderboard: "Лидерборд",
  giveaway: "Розыгрыш",
  achievements: "Достижения",
  legal: "Правовые",
  botConfig: "Конфиг бота",
  siteSettings: "Настройки сайта",
};

type Props = {
  badges: { unmatched: number };
};

export function AdminSidebar({ badges }: Props) {
  const pathname = usePathname() ?? "";
  const { t } = useI18n();
  const sidebar = t?.admin?.sidebar ?? {};

  const isActive = (href: string): boolean => {
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <aside
      className="w-60 shrink-0 flex flex-col border-r border-[var(--b-soft)]"
      style={{ background: "rgba(12,10,9,0.92)", backdropFilter: "blur(16px)" }}
    >
      {/* Header */}
      <div className="px-4 pt-5 pb-4 border-b border-[var(--b-soft)]">
        <Logo size="sm" />
        <div
          className="text-[10px] font-black tracking-[0.25em] text-[var(--brand-gold)] mt-2 opacity-70"
        >
          ADMIN PANEL
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5 scrollbar-thin">
        {GROUPS.map((group) => {
          const groupLabel =
            (sidebar.groups as Record<string, string> | undefined)?.[group.groupKey] ??
            GROUP_LABEL_FALLBACK[group.groupKey];
          return (
            <div key={group.groupKey}>
              <div className="text-[9px] uppercase tracking-[0.22em] text-[var(--t-3)] font-bold mb-1.5 px-1">
                {groupLabel}
              </div>
              <div className="space-y-0.5">
                {group.items.map(({ href, labelKey, icon: Icon, badgeKey }) => {
                  const active = isActive(href);
                  const badge =
                    badgeKey === "unmatched" && badges.unmatched > 0
                      ? badges.unmatched
                      : null;
                  const label =
                    (sidebar.items as Record<string, string> | undefined)?.[labelKey] ??
                    ITEM_LABEL_FALLBACK[labelKey];

                  return (
                    <Link
                      key={href}
                      href={href}
                      className={`group relative flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-150 ${
                        active
                          ? "bg-[rgba(212,160,23,0.12)] text-[var(--brand-gold)]"
                          : "text-[var(--t-2)] hover:text-[var(--t-1)] hover:bg-[var(--bg-2)]"
                      }`}
                    >
                      {active && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full bg-[var(--brand-gold)]" />
                      )}

                      <div
                        className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                          active
                            ? "bg-[rgba(212,160,23,0.20)]"
                            : "bg-transparent group-hover:bg-[var(--bg-3)]"
                        }`}
                      >
                        <Icon
                          size={13}
                          className={
                            active
                              ? "text-[var(--brand-gold)]"
                              : "text-[var(--t-3)] group-hover:text-[var(--t-2)]"
                          }
                        />
                      </div>

                      <span className="flex-1 truncate">{label}</span>

                      {badge != null && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[rgba(232,98,58,0.15)] text-[var(--red)] shrink-0">
                          {badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 pt-3 border-t border-[var(--b-soft)]">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] text-[var(--t-3)] hover:text-[var(--t-1)] hover:bg-[var(--bg-2)] transition-all"
        >
          <ArrowLeft size={13} />
          {sidebar.backToDashboard ?? "Назад к кабинету"}
        </Link>
      </div>
    </aside>
  );
}
