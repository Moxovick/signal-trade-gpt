/**
 * Settings hub — main entry point.
 * Shows all settings categories as tappable cards.
 * Fetch minimal status data to show indicators on each card.
 */
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPreferences } from "@/lib/user-preferences";
import Link from "next/link";
import {
  Palette,
  Bell,
  Shield,
  Send,
  Link2,
  Trophy,
  ChevronRight,
  Sun,
  Moon,
  Monitor,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default async function SettingsHubPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [user, prefs] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        tier: true,
        telegramId: true,
        signalsReceived: true,
        poAccount: {
          select: { status: true, poTraderId: true },
        },
      },
    }),
    getPreferences(session.user.id),
  ]);
  if (!user) redirect("/login");

  const themeLabel =
    prefs.theme === "light" ? "Светлая" : prefs.theme === "dark" ? "Тёмная" : "Авто";
  const ThemeIcon =
    prefs.theme === "light" ? Sun : prefs.theme === "dark" ? Moon : Monitor;

  const poStatus = user.poAccount?.status ?? null;
  const poConnected = !!user.poAccount;
  const tgConnected = !!user.telegramId;

  const sections = [
    {
      group: "Аккаунт",
      items: [
        {
          href: "/dashboard/settings/appearance",
          label: "Внешний вид",
          description: "Тема, язык и часовой пояс",
          icon: Palette,
          iconColor: "#a78bfa",
          iconBg: "rgba(167,139,250,0.15)",
          badge: (
            <span className="inline-flex items-center gap-1 text-[11px] text-[var(--t-3)]">
              <ThemeIcon size={11} /> {themeLabel}
            </span>
          ),
        },
        {
          href: "/dashboard/settings/notifications",
          label: "Уведомления",
          description: "Email, Telegram, браузерные push",
          icon: Bell,
          iconColor: "#f59e0b",
          iconBg: "rgba(245,158,11,0.15)",
          badge: null,
        },
        {
          href: "/dashboard/settings/security",
          label: "Безопасность",
          description: "Пароль, двухфакторка, журнал входов",
          icon: Shield,
          iconColor: "#34d399",
          iconBg: "rgba(52,211,153,0.15)",
          badge: null,
        },
      ],
    },
    {
      group: "Интеграции",
      items: [
        {
          href: "/dashboard/settings/telegram",
          label: "Telegram",
          description: "Привязка для бота и Mini App",
          icon: Send,
          iconColor: "#38bdf8",
          iconBg: "rgba(56,189,248,0.15)",
          badge: tgConnected ? (
            <span className="inline-flex items-center gap-1 text-[11px] text-[var(--green)]">
              <CheckCircle2 size={10} /> Привязан
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] text-[var(--t-3)]">
              <AlertCircle size={10} /> Не привязан
            </span>
          ),
        },
        {
          href: "/dashboard/settings/pocketoption",
          label: "PocketOption",
          description: "Аккаунт, депозиты, история пополнений",
          icon: Link2,
          iconColor: "#d4a017",
          iconBg: "rgba(212,160,23,0.15)",
          badge: poConnected ? (
            <span
              className="inline-flex items-center gap-1 text-[11px]"
              style={{
                color:
                  poStatus === "verified"
                    ? "var(--green)"
                    : poStatus === "pending"
                    ? "var(--brand-gold)"
                    : "var(--red)",
              }}
            >
              <CheckCircle2 size={10} />
              {poStatus === "verified"
                ? "Подтверждён"
                : poStatus === "pending"
                ? "На проверке"
                : "Отклонён"}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] text-[var(--t-3)]">
              <AlertCircle size={10} /> Не привязан
            </span>
          ),
        },
      ],
    },
    {
      group: "Активность",
      items: [
        {
          href: "/dashboard/settings/achievements",
          label: "Достижения",
          description: "Бейджи, серии, прогресс",
          icon: Trophy,
          iconColor: "#fb923c",
          iconBg: "rgba(251,146,60,0.15)",
          badge: (
            <span className="text-[11px] text-[var(--t-3)]">
              {user.signalsReceived} сигналов
            </span>
          ),
        },
      ],
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Настройки</h1>
        <p className="text-sm text-[var(--t-3)] mt-1">
          Управление профилем, уведомлениями и интеграциями
        </p>
      </div>

      {/* Groups */}
      {sections.map((section) => (
        <div key={section.group}>
          <h2 className="text-[11px] uppercase tracking-[0.18em] text-[var(--t-3)] font-semibold mb-3 px-1">
            {section.group}
          </h2>
          <div className="rounded-2xl border border-[var(--b-soft)] overflow-hidden bg-[var(--bg-1)] divide-y divide-[var(--b-soft)]">
            {section.items.map(({ href, label, description, icon: Icon, iconColor, iconBg, badge }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-4 px-5 py-4 hover:bg-[var(--bg-2)] transition-colors group"
              >
                {/* Icon */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: iconBg }}
                >
                  <Icon size={18} style={{ color: iconColor }} />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-[var(--t-1)] group-hover:text-[var(--brand-gold)] transition-colors">
                    {label}
                  </div>
                  <div className="text-[12px] text-[var(--t-3)] mt-0.5 truncate">
                    {description}
                  </div>
                </div>

                {/* Status badge */}
                {badge && <div className="shrink-0">{badge}</div>}

                {/* Arrow */}
                <ChevronRight
                  size={16}
                  className="text-[var(--t-3)] group-hover:text-[var(--brand-gold)] transition-colors shrink-0"
                />
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
