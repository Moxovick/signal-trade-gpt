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
  FileText,
  Award,
  CandlestickChart,
  KeyRound,
  Webhook,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  badgeKey?: "unmatched";
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const GROUPS: NavGroup[] = [
  {
    label: "Главное",
    items: [
      { href: "/admin",        label: "Обзор",         icon: BarChart3 },
      { href: "/admin/users",  label: "Пользователи",  icon: Users },
      { href: "/admin/signals",label: "Сигналы",       icon: Send },
    ],
  },
  {
    label: "PocketOption",
    items: [
      { href: "/admin/po-accounts",       label: "PO-аккаунты",        icon: Layers },
      { href: "/admin/postbacks",         label: "Postback-лог",       icon: Activity, badgeKey: "unmatched" },
      { href: "/admin/postbacks/setup",   label: "Настройка постбэков",icon: Webhook },
      { href: "/admin/settings/po-api",   label: "API креды",          icon: KeyRound },
    ],
  },
  {
    label: "Контент",
    items: [
      { href: "/admin/perks",        label: "Перки бота",    icon: Sparkles },
      { href: "/admin/assets",       label: "Активы (пары)", icon: CandlestickChart },
      { href: "/admin/deposits",     label: "Депозиты",      icon: Wallet },
      { href: "/admin/faq",          label: "FAQ",           icon: HelpCircle },
      { href: "/admin/reviews",      label: "Отзывы",        icon: MessageSquare },
      { href: "/admin/giveaway",     label: "Розыгрыш",      icon: Trophy },
      { href: "/admin/achievements", label: "Достижения",    icon: Award },
      { href: "/admin/legal",        label: "Правовые",      icon: FileText },
    ],
  },
  {
    label: "Системное",
    items: [
      { href: "/admin/bot-config", label: "Конфиг бота",    icon: Bot },
      { href: "/admin/settings",   label: "Настройки сайта",icon: SettingsIcon },
    ],
  },
];

type Props = {
  badges: { unmatched: number };
};

export function AdminSidebar({ badges }: Props) {
  const pathname = usePathname() ?? "";

  const isActive = (href: string): boolean => {
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <aside
      className="w-60 shrink-0 flex flex-col border-r border-[var(--b-soft)]"
      style={{ background: "rgba(8,6,10,0.92)", backdropFilter: "blur(16px)" }}
    >
      {/* Header */}
      <div className="px-4 pt-5 pb-4 border-b border-[var(--b-soft)]">
        <Logo size="sm" />
        <div
          className="text-[10px] font-black tracking-[0.25em] text-[var(--brand-gold)] mt-2 opacity-70"
          style={{ fontFamily: "var(--font-bebas)" }}
        >
          ADMIN PANEL
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5 scrollbar-thin">
        {GROUPS.map((group) => (
          <div key={group.label}>
            <div className="text-[9px] uppercase tracking-[0.22em] text-[var(--t-3)] font-bold mb-1.5 px-1">
              {group.label}
            </div>
            <div className="space-y-0.5">
              {group.items.map(({ href, label, icon: Icon, badgeKey }) => {
                const active = isActive(href);
                const badge =
                  badgeKey === "unmatched" && badges.unmatched > 0
                    ? badges.unmatched
                    : null;

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
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[rgba(255,107,61,0.15)] text-[var(--red)] shrink-0">
                        {badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 pt-3 border-t border-[var(--b-soft)]">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] text-[var(--t-3)] hover:text-[var(--t-1)] hover:bg-[var(--bg-2)] transition-all"
        >
          <ArrowLeft size={13} />
          Назад к кабинету
        </Link>
      </div>
    </aside>
  );
}
