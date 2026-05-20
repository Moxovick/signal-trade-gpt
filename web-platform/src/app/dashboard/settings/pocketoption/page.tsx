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
import { TIER_LABELS } from "@/lib/tier";
import Link from "next/link";

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
  const po = user.poAccount;
  const deposits =
    po?.postbacks.filter(
      (p) => p.eventType === "ftd" || p.eventType === "redeposit",
    ) ?? [];

  const depositTotal = Number(user.depositTotal ?? 0);
  const PRO_THRESHOLD = 20;
  const isT1 = user.tier >= 1;
  const progressPct = isT1 ? 100 : Math.min((depositTotal / PRO_THRESHOLD) * 100, 100);

  const statusConfig = {
    verified: { icon: CheckCircle2, label: "Подтверждён", color: "var(--green)", bg: "rgba(142,224,107,0.10)" },
    pending: { icon: Clock, label: "На проверке", color: "var(--brand-gold)", bg: "rgba(212,160,23,0.10)" },
    rejected: { icon: XCircle, label: "Отклонён", color: "var(--red)", bg: "rgba(255,107,61,0.10)" },
  };

  return (
    <div className="space-y-5">
      {/* Tier progress card */}
      <div
        className="rounded-2xl border p-5 relative overflow-hidden"
        style={{
          borderColor: isT1 ? "var(--b-hard)" : "var(--b-soft)",
          background: isT1
            ? "linear-gradient(135deg,rgba(212,160,23,0.08) 0%,var(--bg-1) 100%)"
            : "var(--bg-1)",
        }}
      >
        <div className="flex items-start gap-3 mb-4">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: isT1 ? "rgba(212,160,23,0.15)" : "var(--bg-2)" }}
          >
            {isT1
              ? <Star size={20} className="text-[var(--brand-gold)]" fill="currentColor" />
              : <TrendingUp size={20} className="text-[var(--t-2)]" />
            }
          </div>
          <div>
            <div className="font-bold text-base">
              {TIER_LABELS[user.tier] ?? "Обычный"}
            </div>
            <div className="text-[12px] text-[var(--t-3)] mt-0.5">
              {isT1
                ? "Полный доступ: OTC, биржевые и Elite сигналы"
                : `До Про: депозит $${PRO_THRESHOLD} на PocketOption`}
            </div>
          </div>
        </div>

        {!isT1 && (
          <>
            <div className="flex justify-between text-xs text-[var(--t-3)] mb-1.5">
              <span>Депозит засчитан</span>
              <span style={{ fontFamily: "var(--font-jetbrains)" }}>
                ${depositTotal.toFixed(2)} / ${PRO_THRESHOLD}
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
              После первого депозита ≥ $20 уровень повышается до Про автоматически.
            </p>
          </>
        )}
      </div>

      {/* PO Account card */}
      <Card padding="lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Link2 size={16} className="text-[var(--brand-gold)]" />
            <h2 className="text-base font-semibold">PocketOption аккаунт</h2>
          </div>
          {!po && (
            <Link
              href="/onboarding/po-id"
              className="inline-flex items-center gap-1 text-xs text-[var(--brand-gold)] hover:text-[var(--brand-gold-bright)] transition-colors"
            >
              Привязать <ChevronRight size={12} />
            </Link>
          )}
        </div>

        {po ? (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* ID */}
              <div className="rounded-xl bg-[var(--bg-2)] border border-[var(--b-soft)] p-3">
                <div className="text-[11px] uppercase tracking-wider text-[var(--t-3)] mb-1">
                  Trader ID
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
                      Статус
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
                  Депозитов всего
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
                Зарегистрирован в PO:{" "}
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
              <div className="text-sm font-semibold mb-1">PO ID не привязан</div>
              <div className="text-[12px] text-[var(--t-3)] leading-relaxed">
                Привяжи PocketOption аккаунт, чтобы получить доступ к торговым сигналам
              </div>
            </div>
            <Link
              href="/onboarding/po-id"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--brand-gold)] hover:text-[var(--brand-gold-bright)] transition-colors"
            >
              Привязать аккаунт <ChevronRight size={14} />
            </Link>
          </div>
        )}
      </Card>

      {/* Deposit history */}
      <Card padding="none">
        <div className="px-5 py-4 border-b border-[var(--b-soft)] flex items-center gap-2">
          <TrendingUp size={15} className="text-[var(--brand-gold)]" />
          <h2 className="text-base font-semibold">История депозитов</h2>
          {deposits.length > 0 && (
            <span className="ml-auto text-xs text-[var(--t-3)]">
              {deposits.length} операций
            </span>
          )}
        </div>

        {deposits.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <Wallet size={28} className="text-[var(--t-3)]" />
            <div className="text-sm text-[var(--t-2)] font-medium">Пока депозитов нет</div>
            <div className="text-[11px] text-[var(--t-3)]">
              Они появятся здесь после пополнения счёта в PocketOption
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
                      {d.eventType === "ftd" ? "Первый" : "Повтор"}
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
