/**
 * Settings · PocketOption — show attached PO ID and deposit history.
 *
 * Note: "Estimated P&L" card was removed in v6a — showing speculative dollar
 * losses on the profile scared users. We keep tier + deposit info only.
 */
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Stat } from "@/components/ui/Stat";
import { Link2, TrendingUp, AlertCircle } from "lucide-react";
import { TIER_LABELS } from "@/lib/tier";

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
  const deposits = po?.postbacks.filter((p) => p.eventType === "ftd" || p.eventType === "redeposit") ?? [];

  return (
    <div className="space-y-6">
      <Card padding="lg">
        <div className="flex items-center gap-2 mb-1">
          <Link2 size={18} className="text-[var(--brand-gold)]" />
          <h2 className="text-lg font-semibold">Твой PocketOption</h2>
        </div>
        <p className="text-sm text-[var(--t-3)] mb-6">
          Текущий привязанный аккаунт. Чтобы перепривязать другой ID — обратись
          в поддержку (нужен ручной перенос постбэков).
        </p>
        {po ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Stat label="PocketOption ID" value={`#${po.poTraderId}`} />
            <Stat
              label="Статус"
              value={
                po.status === "verified"
                  ? "Подтверждён"
                  : po.status === "pending"
                    ? "Ожидает"
                    : "Отклонён"
              }
              tone={
                po.status === "verified"
                  ? "positive"
                  : po.status === "rejected"
                    ? "negative"
                    : "neutral"
              }
            />
            <Stat
              label="Депозитов всего"
              value={`$${Number(po.totalDeposit).toFixed(2)}`}
            />
          </div>
        ) : (
          <div className="rounded-xl border border-[var(--b-soft)] bg-[var(--bg-2)] p-4 flex items-start gap-2">
            <AlertCircle
              size={16}
              className="text-[var(--red)] shrink-0 mt-0.5"
            />
            <div>
              <div className="text-sm font-semibold">PO ID не привязан</div>
              <div className="text-[12px] text-[var(--t-3)]">
                Перейди на{" "}
                <a
                  href="/onboarding/po-id"
                  className="text-[var(--brand-gold)] underline"
                >
                  экран привязки
                </a>
                , чтобы подключить аккаунт.
              </div>
            </div>
          </div>
        )}
      </Card>

      <Card padding="lg">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp size={18} className="text-[var(--brand-gold)]" />
          <h2 className="text-lg font-semibold">История депозитов</h2>
        </div>
        <p className="text-sm text-[var(--t-3)] mb-6">
          Постбэки с PocketOption. FTD — первый депозит, Redeposit — каждый
          следующий.
        </p>
        {deposits.length === 0 ? (
          <div className="text-sm text-[var(--t-3)] text-center py-6">
            Пока депозитов нет.
          </div>
        ) : (
          <div className="divide-y divide-[var(--b-soft)]">
            {deposits.map((d) => (
              <div
                key={d.id}
                className="flex items-center gap-4 py-3 text-sm"
              >
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-semibold ${
                    d.eventType === "ftd"
                      ? "bg-[rgba(142,224,107,0.12)] text-[var(--green)]"
                      : "bg-[var(--bg-2)] text-[var(--t-2)]"
                  }`}
                >
                  {d.eventType === "ftd" ? "FTD" : "Redeposit"}
                </span>
                <span className="flex-1 font-medium tabular-nums">
                  ${Number(d.amount ?? 0).toFixed(2)} {d.currency ?? "USD"}
                </span>
                <span className="text-[var(--t-3)] text-[12px] tabular-nums">
                  {new Date(d.receivedAt).toLocaleString("ru-RU", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card padding="lg">
        <div className="text-xs uppercase tracking-widest text-[var(--t-3)] mb-1">
          Текущий уровень
        </div>
        <div className="text-2xl font-bold">
          T{user.tier} — {TIER_LABELS[user.tier] ?? ""}
        </div>
        <div className="text-sm text-[var(--t-2)] mt-1">
          Засчитанный депозит: ${Number(user.depositTotal).toFixed(2)}
        </div>
      </Card>
    </div>
  );
}
