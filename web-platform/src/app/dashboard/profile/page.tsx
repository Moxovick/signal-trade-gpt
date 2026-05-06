/**
 * Dashboard · Profile (v3, server-driven).
 *
 * Layout:
 *   - Header card: avatar + nickname + tier badge + member-since.
 *   - PocketOption section: ID, deposit total, status — read-only summary,
 *     edit happens at /onboarding/po-id.
 *   - Personal stats: signal counts + win/loss/winrate.
 *   - Editable form (nickname, telegram username) — actions update DB.
 *   - Referral block: code, copy button, signups count.
 *   - Account meta: id, created at, role.
 */
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAccessReport } from "@/lib/access";
import { TIER_LABELS } from "@/lib/tier";
import { Card } from "@/components/ui/Card";
import { TierBadge } from "@/components/ui/TierBadge";
import { Stat } from "@/components/ui/Stat";
import { ProfileEditForm } from "./_components/ProfileEditForm";
import { ReferralCopy } from "./_components/ReferralCopy";
import { EmailVerificationCard } from "./_components/EmailVerificationCard";
import { avatarUrl, initialsFromName } from "@/lib/avatar";
import {
  Award,
  CalendarDays,
  CheckCircle2,
  Hash,
  Mail,
  ShieldCheck,
  TrendingUp,
  Trophy,
  Users,
  XCircle,
} from "lucide-react";

export const dynamic = "force-dynamic";

const SITE_URL =
  process.env["NEXT_PUBLIC_SITE_URL"] ?? "http://localhost:3000";

const TIER_ACCESS: Record<number, ("otc" | "exchange" | "elite")[]> = {
  0: ["otc"],
  1: ["otc"],
  2: ["otc", "exchange"],
  3: ["otc", "exchange", "elite"],
  4: ["otc", "exchange", "elite"],
};

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const [user, account, report] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        emailVerifiedAt: true,
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
  const wins = signals.filter((s) => s.result === "win").length;
  const losses = signals.filter((s) => s.result === "loss").length;
  const completed = wins + losses;
  const winrate = completed > 0 ? Math.round((wins / completed) * 100) : 0;

  const greeting =
    user.firstName ?? user.username ?? user.email?.split("@")[0] ?? "User";
  const totalDeposit = account?.totalDeposit ? Number(account.totalDeposit) : 0;
  const memberSince = user.createdAt.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-[var(--brand-gold)] mb-1">
          Профиль
        </p>
        <h1 className="text-3xl font-bold">{greeting}</h1>
      </div>

      {/* Identity card */}
      <Card variant="highlight" padding="lg">
        <div className="flex flex-col md:flex-row md:items-center gap-5">
          {(() => {
            const src = avatarUrl({ avatar: user.avatar, email: user.email });
            if (src) {
              return (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={src}
                  alt=""
                  className="size-16 rounded-2xl object-cover border border-[var(--b-soft)] shrink-0"
                />
              );
            }
            return (
              <div className="size-16 rounded-2xl bg-[var(--brand-gold)] text-[#1a1208] flex items-center justify-center text-2xl font-bold shrink-0">
                {initialsFromName(user)}
              </div>
            );
          })()}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-semibold truncate">{greeting}</h2>
              <TierBadge tier={tier} size="sm" />
              {user.role === "admin" ? (
                <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--brand-gold)]/15 text-[var(--brand-gold)] border border-[var(--brand-gold)]/30 uppercase tracking-wider">
                  admin
                </span>
              ) : null}
            </div>
            <div className="flex items-center gap-1.5 text-sm text-[var(--t-2)]">
              <Mail size={14} className="text-[var(--t-3)]" />
              {user.email ?? "—"}
              {user.email &&
                (user.emailVerifiedAt ? (
                  <span className="text-[10px] text-[var(--green)] uppercase tracking-wider">
                    подтверждён
                  </span>
                ) : (
                  <span className="text-[10px] text-[var(--brand-gold)] uppercase tracking-wider">
                    не подтверждён
                  </span>
                ))}
            </div>
            <div className="flex items-center gap-1.5 text-sm text-[var(--t-3)]">
              <CalendarDays size={14} />С нами с {memberSince}
            </div>
          </div>
          <div className="md:text-right shrink-0">
            <div className="text-xs uppercase tracking-widest text-[var(--t-3)] mb-1">
              {TIER_LABELS[tier]}
            </div>
            <div
              className="text-3xl font-bold text-[var(--brand-gold)]"
              style={{ fontFamily: "var(--font-jetbrains)" }}
            >
              ${totalDeposit.toLocaleString("en-US")}
            </div>
            <div className="text-[11px] text-[var(--t-3)]">депозит на PO</div>
          </div>
        </div>
      </Card>

      {/* Personal stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat
          icon={<TrendingUp size={18} />}
          label="Сигналов получено"
          value={user.signalsReceived.toString()}
        />
        <Stat
          icon={<Trophy size={18} />}
          label="Win / Loss"
          value={`${wins} / ${losses}`}
        />
        <Stat
          icon={<Award size={18} />}
          label="Винрейт"
          value={completed > 0 ? `${winrate}%` : "—"}
        />
        <Stat
          icon={<Users size={18} />}
          label="Рефералы"
          value={user._count.referrals.toString()}
        />
      </div>

      {/* PocketOption */}
      <Card padding="lg">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <ShieldCheck size={18} className="text-[var(--brand-gold)]" />
            PocketOption
          </h2>
          <Link
            href="/onboarding/po-id"
            className="text-xs text-[var(--brand-gold)] hover:underline"
          >
            {account ? "Перепривязать" : "Привязать"}
          </Link>
        </div>
        {account ? (
          <div className="grid sm:grid-cols-3 gap-3 text-sm">
            <KeyValue label="Trader ID" mono value={`#${account.poTraderId}`} />
            <KeyValue
              label="Депозит"
              mono
              value={`$${totalDeposit.toLocaleString("en-US")}`}
            />
            <div className="space-y-1">
              <div className="text-xs uppercase tracking-[0.18em] text-[var(--t-3)]">
                Статус
              </div>
              <div className="flex items-center gap-1.5 text-sm">
                {account.status === "verified" ? (
                  <>
                    <CheckCircle2 size={14} className="text-[var(--green)]" />
                    <span className="text-[var(--green)]">подтверждён</span>
                  </>
                ) : account.status === "pending" ? (
                  <>
                    <span className="size-2 rounded-full bg-[var(--brand-gold)]" />
                    <span>ожидание FTD</span>
                  </>
                ) : (
                  <>
                    <XCircle size={14} className="text-[var(--red)]" />
                    <span className="text-[var(--red)]">отклонён</span>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-[var(--t-2)]">
            Аккаунт не привязан.{" "}
            <Link href="/onboarding/po-id" className="text-[var(--brand-gold)] hover:underline">
              Привяжи PO ID →
            </Link>
          </p>
        )}
      </Card>

      {user.email && !user.emailVerifiedAt ? (
        <EmailVerificationCard email={user.email} />
      ) : null}

      {/* Edit form */}
      <Card padding="lg">
        <h2 className="text-lg font-semibold mb-4">Личные данные</h2>
        <ProfileEditForm
          email={user.email ?? ""}
          firstName={user.firstName ?? ""}
          username={user.username ?? ""}
          avatar={user.avatar ?? ""}
        />
      </Card>

      {/* Referral */}
      {user.referralCode ? (
        <Card padding="lg">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Реферальная программа</h2>
            <span className="text-xs text-[var(--t-3)]">
              Приглашено: {user._count.referrals}
            </span>
          </div>
          <ReferralCopy code={user.referralCode} baseUrl={SITE_URL} />
        </Card>
      ) : null}

      {/* Account meta */}
      <Card padding="lg">
        <h2 className="text-lg font-semibold mb-3">Аккаунт</h2>
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <KeyValue label="ID" mono icon={<Hash size={12} />} value={user.id} />
          <KeyValue
            label="Создан"
            value={user.createdAt.toLocaleString("ru-RU")}
          />
        </div>
      </Card>
    </div>
  );
}

function KeyValue({
  label,
  value,
  mono,
  icon,
}: {
  label: string;
  value: string;
  mono?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <div className="text-xs uppercase tracking-[0.18em] text-[var(--t-3)] flex items-center gap-1">
        {icon} {label}
      </div>
      <div
        className={`text-sm text-[var(--t-1)] truncate ${mono ? "" : ""}`}
        style={mono ? { fontFamily: "var(--font-jetbrains)" } : undefined}
      >
        {value}
      </div>
    </div>
  );
}
