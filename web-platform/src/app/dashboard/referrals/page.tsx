/**
 * Dashboard — Referrals page.
 *
 * Site-level referral program:
 *  - User shares their /r/{code} link
 *  - Visitor clicks → cookie set → redirected to /register?ref={code}
 *  - After registration, a Referral row is created
 *  - When the referred user makes their first PO deposit, referrer earns 5%
 *  - Funds available 7 days after the referral's first deposit
 */
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Stat } from "@/components/ui/Stat";
import { ReferralWidget } from "../_components/ReferralWidget";
import { formatDate } from "@/lib/utils";
import { getDictionaryForUser } from "@/lib/i18n";
import {
  Users,
  TrendingUp,
  CircleDollarSign,
  UserCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  Info,
} from "lucide-react";

const SITE_URL =
  process.env["NEXT_PUBLIC_SITE_URL"] ?? "https://spacesignal.net";
const REVSHARE_PCT = 5;
const WITHDRAWAL_DAYS = 7;

function canWithdraw(ftdAt: Date | null): boolean {
  if (!ftdAt) return false;
  const unlockDate = new Date(ftdAt.getTime() + WITHDRAWAL_DAYS * 86400_000);
  return Date.now() >= unlockDate.getTime();
}

function daysUntilWithdraw(ftdAt: Date | null): number {
  if (!ftdAt) return WITHDRAWAL_DAYS;
  const unlockDate = new Date(ftdAt.getTime() + WITHDRAWAL_DAYS * 86400_000);
  const diff = unlockDate.getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86400_000));
}

export default async function ReferralsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const userId = session.user.id;

  const [user, referrals] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { referralCode: true, tier: true },
    }),
    prisma.referral.findMany({
      where: { referrerId: userId },
      include: {
        referred: {
          select: {
            email: true,
            firstName: true,
            username: true,
            createdAt: true,
            tier: true,
            poAccount: {
              select: {
                totalDeposit: true,
                status: true,
                ftdAt: true,
                poTraderId: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!user) return null;

  const t = await getDictionaryForUser(userId);

  // Compute aggregates
  const withDeposit = referrals.filter(
    (r) => Number(r.referred.poAccount?.totalDeposit ?? 0) > 0,
  );
  const withPo = referrals.filter((r) => !!r.referred.poAccount);
  const totalDeposits = withDeposit.reduce(
    (s, r) => s + Number(r.referred.poAccount?.totalDeposit ?? 0),
    0,
  );
  const totalEarned = totalDeposits * (REVSHARE_PCT / 100);
  const withdrawable = withDeposit
    .filter((r) => canWithdraw(r.referred.poAccount?.ftdAt ?? null))
    .reduce(
      (s, r) => s + Number(r.referred.poAccount?.totalDeposit ?? 0) * (REVSHARE_PCT / 100),
      0,
    );

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--brand-gold)] mb-1">
          {t.referrals.pageLabel}
        </p>
        <h1 className="text-3xl font-bold tracking-tight">
          {REVSHARE_PCT}{t.referrals.pageTitle}
        </h1>
        <p className="text-[var(--t-2)] mt-1.5 text-sm">
          {t.referrals.pageDesc}
        </p>
      </div>

      {/* Referral link widget */}
      <ReferralWidget
        code={user.referralCode}
        count={referrals.length}
        baseUrl={SITE_URL}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat
          icon={<Users size={16} />}
          label={t.referrals.statRegistered}
          value={referrals.length.toString()}
        />
        <Stat
          icon={<UserCheck size={16} />}
          label={t.referrals.statConnectedPo}
          value={withPo.length.toString()}
        />
        <Stat
          icon={<CircleDollarSign size={16} />}
          label={t.referrals.statReferralDeposits}
          value={`$${Math.round(totalDeposits).toLocaleString()}`}
        />
        <Stat
          icon={<TrendingUp size={16} />}
          label={t.referrals.statEarned}
          value={`$${totalEarned.toFixed(2)}`}
          tone={totalEarned > 0 ? "positive" : "neutral"}
        />
      </div>

      {/* Withdrawal info */}
      {totalEarned > 0 && (
        <div
          className="rounded-2xl border p-4 flex items-start gap-3"
          style={{
            borderColor: withdrawable > 0 ? "var(--b-hard)" : "var(--b-soft)",
            background:
              withdrawable > 0
                ? "linear-gradient(135deg,rgba(142,224,107,0.06) 0%,var(--bg-1) 100%)"
                : "var(--bg-1)",
          }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background:
                withdrawable > 0
                  ? "rgba(142,224,107,0.12)"
                  : "rgba(212,160,23,0.10)",
            }}
          >
            {withdrawable > 0 ? (
              <CheckCircle2 size={17} className="text-[var(--green)]" />
            ) : (
              <Clock size={17} className="text-[var(--brand-gold)]" />
            )}
          </div>
          <div>
            <div className="text-sm font-semibold mb-0.5">
              {withdrawable > 0
                ? `${t.referrals.availableWithdraw} $${withdrawable.toFixed(2)}`
                : `${t.referrals.awaitingUnlock} $${totalEarned.toFixed(2)}`}
            </div>
            <div className="text-[12px] text-[var(--t-3)]">
              {t.referrals.withdrawInfo.replace("{n}", String(WITHDRAWAL_DAYS))}
            </div>
          </div>
        </div>
      )}

      {/* Referrals list */}
      <Card padding="none">
        <div className="px-5 py-4 border-b border-[var(--b-soft)] flex items-center justify-between">
          <h2 className="text-base font-semibold">{t.referrals.yourReferrals}</h2>
          <span className="text-xs text-[var(--t-3)]">
            {referrals.length} {t.referrals.persons}
          </span>
        </div>

        {referrals.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center px-5">
            <div className="w-12 h-12 rounded-xl bg-[var(--bg-2)] flex items-center justify-center">
              <Users size={22} className="text-[var(--t-3)]" />
            </div>
            <div>
              <div className="text-sm font-semibold text-[var(--t-1)] mb-1">
                {t.referrals.noReferralsTitle}
              </div>
              <div className="text-[12px] text-[var(--t-3)] leading-relaxed max-w-xs">
                {t.referrals.noReferralsDesc}
              </div>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-[var(--b-soft)]">
            {referrals.slice(0, 30).map((r) => {
              const dep = Number(r.referred.poAccount?.totalDeposit ?? 0);
              const hasFtd = dep > 0;
              const ftdAt = r.referred.poAccount?.ftdAt ?? null;
              const earned = dep * (REVSHARE_PCT / 100);
              const unlocked = canWithdraw(ftdAt);
              const daysLeft = daysUntilWithdraw(ftdAt);
              const hasPo = !!r.referred.poAccount;

              const name =
                r.referred.firstName ??
                r.referred.username ??
                (r.referred.email
                  ? r.referred.email.split("@")[0]
                  : t.referrals.anon);

              return (
                <div
                  key={r.id}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-[var(--bg-2)] transition-colors"
                >
                  {/* Avatar placeholder */}
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-sm font-bold"
                    style={{
                      background: hasFtd
                        ? "rgba(212,160,23,0.15)"
                        : "var(--bg-3)",
                      color: hasFtd ? "var(--brand-gold)" : "var(--t-3)",
                    }}
                  >
                    {name[0]?.toUpperCase() ?? "?"}
                  </div>

                  {/* Name + date */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-[var(--t-1)] truncate">
                      {name}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-[11px] text-[var(--t-3)]">
                        {formatDate(r.referred.createdAt)}
                      </span>
                      {/* PO status */}
                      {hasPo ? (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-[var(--green)]">
                          <CheckCircle2 size={9} /> {t.referrals.poConnected}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 text-[10px] text-[var(--t-3)]">
                          <AlertCircle size={9} /> {t.referrals.poNotLinked}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Earnings / unlock */}
                  <div className="text-right shrink-0">
                    {hasFtd ? (
                      <div className="space-y-0.5">
                        <div
                          className="text-sm font-bold text-[var(--brand-gold)]"
                          style={{ fontFamily: "var(--font-jetbrains)" }}
                        >
                          +${earned.toFixed(2)}
                        </div>
                        {unlocked ? (
                          <div className="text-[11px] text-[var(--green)] flex items-center gap-0.5 justify-end">
                            <CheckCircle2 size={10} /> {t.referrals.available}
                          </div>
                        ) : (
                          <div className="text-[11px] text-[var(--t-3)] flex items-center gap-0.5 justify-end">
                            <Clock size={10} /> {t.referrals.daysLeft} {daysLeft} {t.referrals.daysLeftSuffix}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-[11px] text-[var(--t-3)]">
                        {hasPo ? t.referrals.awaitDeposit : t.referrals.noPo}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {referrals.length > 30 && (
              <div className="px-5 py-3 text-xs text-[var(--t-3)] text-center">
                {t.referrals.moreReferrals} {referrals.length - 30} {t.referrals.moreReferralsSuffix}
              </div>
            )}
          </div>
        )}
      </Card>

      {/* How it works */}
      <Card padding="lg">
        <h2 className="text-base font-semibold mb-5">{t.referrals.howItWorks}</h2>
        <div className="space-y-4">
          {[
            {
              n: "01",
              title: t.referrals.step01Title,
              text: t.referrals.step01Text,
            },
            {
              n: "02",
              title: t.referrals.step02Title,
              text: t.referrals.step02Text,
            },
            {
              n: "03",
              title: t.referrals.step03Title,
              text: t.referrals.step03Text,
            },
            {
              n: "04",
              title: `${t.referrals.step04TitleTemplate.replace("%", String(REVSHARE_PCT))}`,
              text: `${t.referrals.step04TextTemplate.replace(/%/g, String(REVSHARE_PCT))}`,
            },
          ].map(({ n, title, text }) => (
            <div key={n} className="flex gap-4">
              <div
                className="text-xl font-black shrink-0 w-8 text-right"
                style={{
                  fontFamily: "var(--font-jetbrains)",
                  color: "var(--brand-gold)",
                  opacity: 0.7,
                }}
              >
                {n}
              </div>
              <div>
                <div className="text-sm font-semibold text-[var(--t-1)] mb-0.5">
                  {title}
                </div>
                <div className="text-[12px] text-[var(--t-2)] leading-relaxed">
                  {text}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 7-day rule callout */}
      <div className="rounded-2xl border border-[var(--b-soft)] bg-[var(--bg-1)] px-5 py-4 flex items-start gap-3">
        <Info size={15} className="text-[var(--brand-gold)] shrink-0 mt-0.5" />
        <div className="text-[12px] text-[var(--t-2)] leading-relaxed">
          <span className="font-semibold text-[var(--t-1)]">
            {t.referrals.ruleDays.replace("{n}", String(WITHDRAWAL_DAYS))}
          </span>{" "}
          {t.referrals.ruleText.replace(/{n}/g, String(WITHDRAWAL_DAYS))}
        </div>
      </div>
    </div>
  );
}
