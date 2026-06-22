/**
 * Settings · PocketOption — linked account, deposit history, tier status.
 */
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import {
  Link2,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Wallet,
  ChevronRight,
  Star,
} from "lucide-react";
import { TIER_LABELS, getTierThresholds } from "@/lib/tier";
import Link from "next/link";
import { getDictionaryForUser } from "@/lib/i18n";

export default async function PocketOptionSettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      depositTotal: true,
      tier: true,
      poAccount: {
        select: {
          poTraderId: true,
          status: true,
          totalDeposit: true,
          totalRevShare: true,
          ftdAt: true,
          ftdAmount: true,
          registeredAt: true,
          emailConfirmedAt: true,
          postbacks: {
            orderBy: { receivedAt: "desc" },
            take: 20,
            select: {
              id: true,
              eventType: true,
              amount: true,
              currency: true,
              receivedAt: true,
            },
          },
        },
      },
    },
  });

  if (!user) redirect("/login");

  const t = await getDictionaryForUser(session.user.id);

  const po = user.poAccount;
  const deposits =
    po?.postbacks.filter(
      (p) => p.eventType === "ftd" || p.eventType === "redeposit",
    ) ?? [];

  const depositTotal = Number(user.depositTotal ?? 0);
  const thresholds = await getTierThresholds();
  const isPro = user.tier >= 2;
  const nextThreshold = user.tier === 0 ? thresholds[1] : user.tier === 1 ? thresholds[2] : null;
  const progressPct = nextThreshold ? Math.min((depositTotal / nextThreshold) * 100, 100) : 100;
  const nextLabel = user.tier === 0 ? "Базового" : user.tier === 1 ? "Про" : null;

  const statusConfig = {
    verified: { icon: CheckCircle2, label: t.pocketoption.statusVerified, color: "var(--green)", bg: "rgba(142,224,107,0.10)" },
    pending: { icon: Clock, label: t.pocketoption.statusReview, color: "var(--brand-gold)", bg: "rgba(212,160,23,0.10)" },
    rejected: { icon: XCircle, label: t.pocketoption.statusRejected, color: "var(--red)", bg: "rgba(255,107,61,0.10)" },
  };

  return (
    <div className="space-y-5">
      {/* Tier progress card */}
      <div
        className="rounded-2xl border p-5 relative overflow-hidden"
        style={{
          borderColor: isPro ? "var(--b-hard)" : "var(--b-soft)",
          background: isPro
            ? "linear-gradient(135deg,rgba(212,160,23,0.08) 0%,var(--bg-1) 100%)"
            : "var(--bg-1)",
        }}
      >
        <div className="flex items-start gap-3 mb-4">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: isPro ? "rgba(212,160,23,0.15)" : "var(--bg-2)" }}
          >
            {isPro
              ? <Star size={20} className="text-[var(--brand-gold)]" fill="currentColor" />
              : <TrendingUp size={20} className="text-[var(--t-2)]" />
            }
          </div>
          <div>
            <div className="font-bold text-base">
              {TIER_LABELS[user.tier] ?? "Бесплатный"}
            </div>
            <div className="text-[12px] text-[var(--t-3)] mt-0.5">
              {isPro
                ? t.pocketoption.tierFullAccess
                : nextLabel
                  ? `${t.pocketoption.tierUntil} ${nextLabel}: ${t.pocketoption.tierDepositRequired}${nextThreshold} ${t.pocketoption.tierDepositOnPO}`
                  : ""}
            </div>
          </div>
        </div>

        {nextThreshold != null && (
          <>
            <div className="flex justify-between text-xs text-[var(--t-3)] mb-1.5">
              <span>{t.pocketoption.depositCredited}</span>
              <span style={{ fontFamily: "var(--font-jetbrains)" }}>
                ${depositTotal.toFixed(2)} / ${nextThreshold}
              </span>
            </div>
            <div className="h-2 rounded-full bg-[var(--bg-3)] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${progressPct}%`,
                  background: "linear-gradient(90deg,var(--brand-gold-deep),var(--brand-gold-bright))",
                }}
              />
            </div>
            <p className="text-[11px] text-[var(--t-3)] mt-2">
              {t.pocketoption.autoUpgrade}
            </p>
          </>
        )}
      </div>

      {/* Tier comparison */}
      <Card padding="lg">
        <h2 className="text-base font-semibold mb-4">{t.pocketoption.accessLevels}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {([
            {
              tier: 0,
              name: "Free",
              deposit: "$0",
              active: user.tier === 0,
              perks: [
                t.pocketoption.freePerks1,
                t.pocketoption.freePerks2,
                t.pocketoption.freePerks3,
              ],
            },
            {
              tier: 1,
              name: "Basic",
              deposit: `${t.pocketoption.tierDepositFrom} $${thresholds[1]}`,
              active: user.tier === 1,
              perks: [
                t.pocketoption.basicPerks1,
                t.pocketoption.basicPerks2,
                t.pocketoption.basicPerks3,
                t.pocketoption.basicPerks4,
              ],
            },
            {
              tier: 2,
              name: "Pro",
              deposit: `${t.pocketoption.tierDepositFrom} $${thresholds[2]}`,
              active: user.tier >= 2,
              perks: [
                t.pocketoption.proPerks1,
                t.pocketoption.proPerks2,
                t.pocketoption.proPerks3,
                t.pocketoption.proPerks4,
                t.pocketoption.proPerks5,
              ],
            },
          ] as const).map((tierItem) => (
            <div
              key={tierItem.tier}
              className="rounded-xl border p-4 relative"
              style={{
                borderColor: tierItem.active ? "var(--brand-gold)" : "var(--b-soft)",
                background: tierItem.active
                  ? "linear-gradient(135deg,rgba(212,160,23,0.06) 0%,var(--bg-1) 100%)"
                  : "var(--bg-1)",
              }}
            >
              {tierItem.active && (
                <div
                  className="absolute top-2.5 right-2.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
                  style={{
                    background: "rgba(212,160,23,0.15)",
                    color: "var(--brand-gold)",
                  }}
                >
                  {t.pocketoption.tierCurrentBadge}
                </div>
              )}
              <div className="font-bold text-sm mb-0.5">{tierItem.name}</div>
              <div
                className="text-[11px] text-[var(--t-3)] mb-3"
                style={{ fontFamily: "var(--font-jetbrains)" }}
              >
                {tierItem.deposit}
              </div>
              <ul className="space-y-1.5">
                {tierItem.perks.map((p) => (
                  <li
                    key={p}
                    className="flex items-start gap-2 text-[12px] text-[var(--t-2)] leading-snug"
                  >
                    <CheckCircle2
                      size={12}
                      className="shrink-0 mt-0.5"
                      style={{
                        color: tierItem.active ? "var(--brand-gold)" : "var(--t-3)",
                      }}
                    />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-[var(--t-3)] mt-3 leading-relaxed">
          {t.pocketoption.tierNote}
        </p>
      </Card>

      {/* PO Account card */}
      <Card padding="lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Link2 size={16} className="text-[var(--brand-gold)]" />
            <h2 className="text-base font-semibold">{t.pocketoption.poAccountTitle}</h2>
          </div>
          {!po && (
            <Link
              href="/onboarding/po-id"
              className="inline-flex items-center gap-1 text-xs text-[var(--brand-gold)] hover:text-[var(--brand-gold-bright)] transition-colors"
            >
              {t.pocketoption.poLink} <ChevronRight size={12} />
            </Link>
          )}
        </div>

        {po ? (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* ID */}
              <div className="rounded-xl bg-[var(--bg-2)] border border-[var(--b-soft)] p-3">
                <div className="text-[11px] uppercase tracking-wider text-[var(--t-3)] mb-1">
                  {t.pocketoption.labelTraderId}
                </div>
                <div
                  className="text-lg font-bold text-[var(--t-1)]"
                  style={{ fontFamily: "var(--font-jetbrains)" }}
                >
                  #{po.poTraderId}
                </div>
              </div>

              {/* Status */}
              {(() => {
                const cfg = statusConfig[po.status as keyof typeof statusConfig] ?? statusConfig.pending;
                const StatusIcon = cfg.icon;
                return (
                  <div
                    className="rounded-xl border p-3"
                    style={{ background: cfg.bg, borderColor: "transparent" }}
                  >
                    <div className="text-[11px] uppercase tracking-wider text-[var(--t-3)] mb-1">
                      {t.pocketoption.labelStatus}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <StatusIcon size={14} style={{ color: cfg.color }} />
                      <span className="text-sm font-semibold" style={{ color: cfg.color }}>
                        {cfg.label}
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Total deposit */}
              <div className="rounded-xl bg-[var(--bg-2)] border border-[var(--b-soft)] p-3">
                <div className="text-[11px] uppercase tracking-wider text-[var(--t-3)] mb-1">
                  {t.pocketoption.labelTotalDeposit}
                </div>
                <div
                  className="text-lg font-bold text-[var(--t-1)]"
                  style={{ fontFamily: "var(--font-jetbrains)" }}
                >
                  ${Number(po.totalDeposit).toFixed(2)}
                </div>
              </div>
            </div>

            {po.registeredAt && (
              <p className="text-[11px] text-[var(--t-3)]">
                {t.pocketoption.registeredAt}{" "}
                {new Date(po.registeredAt).toLocaleDateString("ru-RU", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-[var(--b-soft)] p-6 flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[var(--bg-2)] flex items-center justify-center">
              <AlertCircle size={20} className="text-[var(--t-3)]" />
            </div>
            <div>
              <div className="text-sm font-semibold mb-1">{t.pocketoption.poNotLinkedTitle}</div>
              <div className="text-[12px] text-[var(--t-3)] leading-relaxed">
                {t.pocketoption.poNotLinkedDesc}
              </div>
            </div>
            <Link
              href="/onboarding/po-id"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--brand-gold)] hover:text-[var(--brand-gold-bright)] transition-colors"
            >
              {t.pocketoption.linkAccountAction} <ChevronRight size={14} />
            </Link>
          </div>
        )}
      </Card>

      {/* Deposit history */}
      <Card padding="none">
        <div className="px-5 py-4 border-b border-[var(--b-soft)] flex items-center gap-2">
          <TrendingUp size={15} className="text-[var(--brand-gold)]" />
          <h2 className="text-base font-semibold">{t.pocketoption.depositHistory}</h2>
          {deposits.length > 0 && (
            <span className="ml-auto text-xs text-[var(--t-3)]">
              {deposits.length} {t.pocketoption.operations}
            </span>
          )}
        </div>

        {deposits.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <Wallet size={28} className="text-[var(--t-3)]" />
            <div className="text-sm text-[var(--t-2)] font-medium">{t.pocketoption.noDepositsTitle}</div>
            <div className="text-[11px] text-[var(--t-3)]">
              {t.pocketoption.noDepositsDesc}
            </div>
          </div>
        ) : (
          <div className="divide-y divide-[var(--b-soft)]">
            {deposits.map((d) => (
              <div key={d.id} className="flex items-center gap-4 px-5 py-3.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    background:
                      d.eventType === "ftd"
                        ? "rgba(142,224,107,0.12)"
                        : "var(--bg-2)",
                  }}
                >
                  <TrendingUp
                    size={14}
                    style={{
                      color:
                        d.eventType === "ftd" ? "var(--green)" : "var(--t-3)",
                    }}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs px-1.5 py-0.5 rounded-md font-semibold uppercase tracking-wider"
                      style={{
                        background:
                          d.eventType === "ftd"
                            ? "rgba(142,224,107,0.12)"
                            : "var(--bg-2)",
                        color:
                          d.eventType === "ftd"
                            ? "var(--green)"
                            : "var(--t-2)",
                      }}
                    >
                      {d.eventType === "ftd" ? t.pocketoption.depositTypeFirst : t.pocketoption.depositTypeRepeat}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className="text-sm font-semibold tabular-nums"
                    style={{ fontFamily: "var(--font-jetbrains)" }}
                  >
                    ${Number(d.amount ?? 0).toFixed(2)}
                  </div>
                  <div className="text-[11px] text-[var(--t-3)] tabular-nums">
                    {new Date(d.receivedAt).toLocaleString("ru-RU", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
