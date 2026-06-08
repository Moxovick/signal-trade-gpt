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
  const thresholds = await getTierThresholds();
  const isPro = user.tier >= 2;
  const nextThreshold = user.tier === 0 ? thresholds[1] : user.tier === 1 ? thresholds[2] : null;
  const progressPct = nextThreshold ? Math.min((depositTotal / nextThreshold) * 100, 100) : 100;
  const nextLabel = user.tier === 0 ? "Базового" : user.tier === 1 ? "Про" : null;

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
                ? "Полный доступ: OTC, биржевые и Elite сигналы"
                : nextLabel
                  ? `До ${nextLabel}: депозит $${nextThreshold} на PocketOption`
                  : ""}
            </div>
          </div>
        </div>

        {nextThreshold != null && (
          <>
            <div className="flex justify-between text-xs text-[var(--t-3)] mb-1.5">
              <span>Депозит засчитан</span>
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
              Уровень повышается автоматически при достижении порога депозита.
            </p>
          </>
        )}
      </div>

      {/* Tier comparison */}
      <Card padding="lg">
        <h2 className="text-base font-semibold mb-4">Уровни доступа</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {([
            {
              tier: 0,
              name: "Free",
              deposit: "$0",
              active: user.tier === 0,
              perks: [
                "3 OTC-сигнала в день",
                "Рандомные сигналы по запросу",
                "Доступ к боту и кабинету",
              ],
            },
            {
              tier: 1,
              name: "Basic",
              deposit: `от $${thresholds[1]}`,
              active: user.tier === 1,
              perks: [
                "10 сигналов в день",
                "OTC + биржевые сигналы",
                "Расширенные графики",
                "Приоритетная поддержка",
              ],
            },
            {
              tier: 2,
              name: "Pro",
              deposit: `от $${thresholds[2]}`,
              active: user.tier >= 2,
              perks: [
                "Безлимитные сигналы",
                "Все типы: OTC + биржа + Elite",
                "Аналитика и индикаторы",
                "Ранний доступ к функциям",
                "Полный разбор каждого сигнала",
              ],
            },
          ] as const).map((t) => (
            <div
              key={t.tier}
              className="rounded-xl border p-4 relative"
              style={{
                borderColor: t.active ? "var(--brand-gold)" : "var(--b-soft)",
                background: t.active
                  ? "linear-gradient(135deg,rgba(212,160,23,0.06) 0%,var(--bg-1) 100%)"
                  : "var(--bg-1)",
              }}
            >
              {t.active && (
                <div
                  className="absolute top-2.5 right-2.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
                  style={{
                    background: "rgba(212,160,23,0.15)",
                    color: "var(--brand-gold)",
                  }}
                >
                  Текущий
                </div>
              )}
              <div className="font-bold text-sm mb-0.5">{t.name}</div>
              <div
                className="text-[11px] text-[var(--t-3)] mb-3"
                style={{ fontFamily: "var(--font-jetbrains)" }}
              >
                Депозит {t.deposit}
              </div>
              <ul className="space-y-1.5">
                {t.perks.map((p) => (
                  <li
                    key={p}
                    className="flex items-start gap-2 text-[12px] text-[var(--t-2)] leading-snug"
                  >
                    <CheckCircle2
                      size={12}
                      className="shrink-0 mt-0.5"
                      style={{
                        color: t.active ? "var(--brand-gold)" : "var(--t-3)",
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
          Депозит считается по сумме пополнений на привязанном PocketOption аккаунте.
          Уровень повышается автоматически через постбэки от PocketOption.
          Чем выше депозит — тем больше типов сигналов и выше дневной лимит.
        </p>
      </Card>

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
