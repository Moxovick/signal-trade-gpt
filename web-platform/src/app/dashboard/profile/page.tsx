import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAccessReport } from "@/lib/access";
import { TIER_ACCESS, TIER_LABELS, distanceToNextTier } from "@/lib/tier";
import { Card } from "@/components/ui/Card";
import { TierBadge } from "@/components/ui/TierBadge";
import { ProfileEditForm } from "./_components/ProfileEditForm";
import { ReferralCopy } from "./_components/ReferralCopy";
import { avatarUrl, initialsFromName } from "@/lib/avatar";
import { formatDate } from "@/lib/utils";
import {
  Award,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Mail,
  ShieldCheck,
  TrendingUp,
  Users,
  XCircle,
  Clock,
} from "lucide-react";

export const dynamic = "force-dynamic";

const SITE_URL =
  process.env["NEXT_PUBLIC_SITE_URL"] ?? "https://spacesignal.net";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const [user, account, report] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        username: true,
        firstName: true,
        avatar: true,
        role: true,
        referralCode: true,
        signalsReceived: true,
        createdAt: true,
        _count: { select: { referrals: true } },
      },
    }),
    prisma.pocketOptionAccount.findUnique({ where: { userId } }),
    getAccessReport(userId),
  ]);
  if (!user || !report) redirect("/login");

  const tier = report.tier;
  const allowedBands = TIER_ACCESS[tier] ?? ["otc"];
  const signals = await prisma.signal.findMany({
    where: { tier: { in: allowedBands }, isActive: true },
    select: { result: true },
    take: 500,
    orderBy: { createdAt: "desc" },
  });

  const displayName =
    user.firstName ?? user.username ?? user.email?.split("@")[0] ?? "User";
  const totalDeposit = account?.totalDeposit ? Number(account.totalDeposit) : 0;
  const memberSince = formatDate(user.createdAt);

  const nextTierInfo = distanceToNextTier(totalDeposit, tier);

  const avatarSrc = avatarUrl({ avatar: user.avatar, email: user.email });

  return (
    <div className="max-w-4xl mx-auto space-y-5">

      {/* ── Hero card ──────────────────────────────────────────────────── */}
      <div
        className="rounded-3xl border p-6 relative overflow-hidden"
        style={{
          borderColor: tier >= 1 ? "rgba(245,232,192,0.30)" : "var(--b-soft)",
          background: tier >= 1
            ? "linear-gradient(135deg,rgba(212,160,23,0.08) 0%,var(--bg-1) 60%)"
            : "var(--bg-1)",
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          {/* Avatar */}
          {avatarSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarSrc}
              alt=""
              className="size-20 rounded-2xl object-cover border border-[var(--b-soft)] shrink-0"
            />
          ) : (
            <div className="size-20 rounded-2xl bg-[var(--brand-gold)] text-[#1a1208] flex items-center justify-center text-3xl font-bold shrink-0 select-none">
              {initialsFromName(user)}
            </div>
          )}

          {/* Name + meta */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-bold truncate">{displayName}</h1>
              <TierBadge tier={tier} size="sm" />
              {user.role === "admin" && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--brand-gold)]/15 text-[var(--brand-gold)] border border-[var(--brand-gold)]/30 uppercase tracking-wider font-semibold">
                  admin
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-[var(--t-3)]">
              <span className="flex items-center gap-1.5">
                <Mail size={13} />
                <span className="text-[var(--t-2)]">{user.email ?? "—"}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CalendarDays size={13} />
                С нами с {memberSince}
              </span>
              {user.username && (
                <span className="flex items-center gap-1.5">
                  <span className="text-[var(--t-3)]">@{user.username}</span>
                </span>
              )}
            </div>
          </div>

          {/* Deposit counter */}
          <div className="sm:text-right shrink-0">
            <div className="text-[11px] uppercase tracking-widest text-[var(--t-3)] mb-0.5">
              Депозит на PO
            </div>
            <div
              className="text-3xl font-bold text-[var(--brand-gold)]"
              style={{ fontFamily: "var(--font-jetbrains)" }}
            >
              ${totalDeposit.toLocaleString("en-US")}
            </div>
            <div className="text-[11px] text-[var(--t-3)] mt-0.5">
              {TIER_LABELS[tier]}
            </div>
            {nextTierInfo ? (
              <div className="text-[11px] text-[var(--brand-gold)] mt-1.5">
                До {TIER_LABELS[nextTierInfo.nextTier]}: ещё ${nextTierInfo.needed}
              </div>
            ) : (
              <div className="text-[11px] text-[var(--green)] mt-1.5">
                Максимальный уровень
              </div>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-5 pt-5 border-t border-[var(--b-soft)] grid grid-cols-2 gap-4">
          {[
            { icon: <TrendingUp size={14} />, label: "Сигналов", value: user.signalsReceived.toString() },
            { icon: <Users size={14} />, label: "Рефералов", value: user._count.referrals.toString() },
          ].map(({ icon, label, value }) => (
            <div key={label}>
              <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[var(--t-3)] mb-1">
                {icon} {label}
              </div>
              <div
                className="text-2xl font-bold text-[var(--t-1)]"
                style={{ fontFamily: "var(--font-jetbrains)" }}
              >
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Two-column body ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-5 items-start">

        {/* Left — edit form */}
        <Card padding="lg">
          <h2 className="text-base font-semibold mb-4">Личные данные</h2>
          <ProfileEditForm
            email={user.email ?? ""}
            firstName={user.firstName ?? ""}
            username={user.username ?? ""}
            avatar={user.avatar ?? ""}
          />
        </Card>

        {/* Right — sidebar */}
        <div className="space-y-4">

          {/* PocketOption */}
          <Card padding="lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck size={15} className="text-[var(--brand-gold)]" />
                <h2 className="text-sm font-semibold">PocketOption</h2>
              </div>
              <Link
                href="/onboarding/po-id"
                className="text-[11px] text-[var(--brand-gold)] hover:text-[var(--brand-gold-bright)] transition-colors"
              >
                {account ? "Перепривязать" : "Привязать →"}
              </Link>
            </div>
            {account ? (
              <div className="space-y-3">
                <InfoRow label="Trader ID">
                  <span style={{ fontFamily: "var(--font-jetbrains)" }}>
                    #{account.poTraderId}
                  </span>
                </InfoRow>
                <InfoRow label="Депозит">
                  <span style={{ fontFamily: "var(--font-jetbrains)" }}>
                    ${totalDeposit.toLocaleString("en-US")}
                  </span>
                </InfoRow>
                <InfoRow label="Статус">
                  {account.status === "verified" ? (
                    <span className="flex items-center gap-1 text-[var(--green)]">
                      <CheckCircle2 size={12} /> Подтверждён
                    </span>
                  ) : account.status === "pending" ? (
                    <span className="flex items-center gap-1 text-[var(--brand-gold)]">
                      <Clock size={12} /> Ожидание
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[var(--red)]">
                      <XCircle size={12} /> Отклонён
                    </span>
                  )}
                </InfoRow>
              </div>
            ) : (
              <p className="text-xs text-[var(--t-3)] leading-relaxed">
                Аккаунт не привязан.{" "}
                <Link href="/onboarding/po-id" className="text-[var(--brand-gold)]">
                  Привязать →
                </Link>
              </p>
            )}
          </Card>

          {/* Quick links */}
          <Card padding="none">
            {[
              {
                href: "/dashboard/achievements",
                icon: <Award size={15} className="text-[var(--brand-gold)]" />,
                label: "Достижения",
                sub: "Бейджи за активность",
              },
              {
                href: "/dashboard/referrals",
                icon: <Users size={15} className="text-[var(--brand-gold)]" />,
                label: "Рефералы",
                sub: `${user._count.referrals} приглашено`,
              },
              {
                href: "/dashboard/settings/pocketoption",
                icon: <TrendingUp size={15} className="text-[var(--brand-gold)]" />,
                label: "История депозитов",
                sub: "PocketOption аккаунт",
              },
            ].map((item, i, arr) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3.5 hover:bg-[var(--bg-2)] transition-colors group ${i < arr.length - 1 ? "border-b border-[var(--b-soft)]" : ""}`}
              >
                <div className="w-8 h-8 rounded-lg bg-[rgba(212,160,23,0.08)] flex items-center justify-center shrink-0">
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[var(--t-1)] group-hover:text-[var(--brand-gold)] transition-colors">
                    {item.label}
                  </div>
                  <div className="text-[11px] text-[var(--t-3)]">{item.sub}</div>
                </div>
                <ChevronRight size={14} className="text-[var(--t-3)] shrink-0" />
              </Link>
            ))}
          </Card>

          {/* Referral link */}
          {user.referralCode && (
            <Card padding="lg">
              <h2 className="text-sm font-semibold mb-3">Реферальная ссылка</h2>
              <ReferralCopy code={user.referralCode} baseUrl={SITE_URL} />
            </Card>
          )}

        </div>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[11px] uppercase tracking-wider text-[var(--t-3)]">
        {label}
      </span>
      <span className="text-sm text-[var(--t-1)]">{children}</span>
    </div>
  );
}
