/**
 * Settings hub — main entry point.
 * Shows all settings categories as tappable cards.
 * Fetch minimal status data to show indicators on each card.
 */
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Palette,
  Bell,
  Shield,
  Send,
  Link2,
  Trophy,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { getDictionaryForUser } from "@/lib/i18n";

export default async function SettingsHubPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      tier: true,
      telegramId: true,
      signalsReceived: true,
      poAccount: {
        select: { status: true, poTraderId: true },
      },
    },
  });
  if (!user) redirect("/login");

  const t = await getDictionaryForUser(session.user.id);

  const poStatus = user.poAccount?.status ?? null;
  const poConnected = !!user.poAccount;
  const tgConnected = !!user.telegramId;

  const sections = [
    {
      group: t.settings.groupAccount,
      items: [
        {
          href: "/dashboard/settings/appearance",
          label: t.settings.appearance,
          description: t.settings.appearanceDesc,
          icon: Palette,
          iconColor: "#a78bfa",
          iconBg: "rgba(167,139,250,0.15)",
          badge: null,
        },
        {
          href: "/dashboard/settings/notifications",
          label: t.settings.notifications,
          description: t.settings.notificationsDesc,
          icon: Bell,
          iconColor: "#f59e0b",
          iconBg: "rgba(245,158,11,0.15)",
          badge: null,
        },
        {
          href: "/dashboard/settings/security",
          label: t.settings.security,
          description: t.settings.securityDesc,
          icon: Shield,
          iconColor: "#34d399",
          iconBg: "rgba(52,211,153,0.15)",
          badge: null,
        },
      ],
    },
    {
      group: t.settings.groupIntegrations,
      items: [
        {
          href: "/dashboard/settings/telegram",
          label: t.settings.telegram,
          description: t.settings.telegramDesc,
          icon: Send,
          iconColor: "#38bdf8",
          iconBg: "rgba(56,189,248,0.15)",
          badge: tgConnected ? (
            <span className="inline-flex items-center gap-1 text-[11px] text-[var(--green)]">
              <CheckCircle2 size={10} /> {t.settings.tgConnected}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] text-[var(--t-3)]">
              <AlertCircle size={10} /> {t.settings.tgNotConnected}
            </span>
          ),
        },
        {
          href: "/dashboard/settings/pocketoption",
          label: t.settings.pocketOption,
          description: t.settings.pocketOptionDesc,
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
                ? t.settings.poVerified
                : poStatus === "pending"
                ? t.settings.poReview
                : t.settings.poRejected}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] text-[var(--t-3)]">
              <AlertCircle size={10} /> {t.settings.poNotConnected}
            </span>
          ),
        },
      ],
    },
    {
      group: t.settings.groupActivity,
      items: [
        {
          href: "/dashboard/achievements",
          label: t.settings.achievementsLabel,
          description: t.settings.achievementsDesc,
          icon: Trophy,
          iconColor: "#fb923c",
          iconBg: "rgba(251,146,60,0.15)",
          badge: (
            <span className="text-[11px] text-[var(--t-3)]">
              {user.signalsReceived} {t.settings.signalsCount}
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
        <h1 className="text-2xl font-bold tracking-tight">{t.settings.title}</h1>
        <p className="text-sm text-[var(--t-3)] mt-1">
          {t.settings.desc}
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
