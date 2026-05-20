/**
 * Admin dashboard — v2 KPIs.
 *
 * Reflects the new monetization model: PocketOption RevShare via tier-based
 * accounts. Subscription stats removed; we now surface tier distribution,
 * total RevShare, postback throughput.
 */
import Link from "next/link";
import {
  Users,
  Layers,
  CircleDollarSign,
  Activity,
  ArrowRight,
  UserPlus,
  Mail,
  Wallet,
  Crown,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Stat } from "@/components/ui/Stat";
import { TierBadge } from "@/components/ui/TierBadge";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  // eslint-disable-next-line react-hooks/purity -- server component, request-scoped
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    totalSignals,
    poAccounts,
    poVerified,
    poEmailConfirmed,
    poRegistered,
    poProUsers,
    revShareAggregate,
    postbacksLast24,
    tierDist,
    recentAccounts,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.signal.count(),
    prisma.pocketOptionAccount.count(),
    prisma.pocketOptionAccount.count({ where: { status: "verified" } }),
    prisma.pocketOptionAccount.count({
      where: { emailConfirmedAt: { not: null } },
    }),
    prisma.pocketOptionAccount.count({
      where: { registeredAt: { not: null } },
    }),
    prisma.user.count({ where: { tier: { gte: 1 } } }),
    prisma.pocketOptionAccount.aggregate({
      _sum: { totalRevShare: true, totalDeposit: true },
    }),
    prisma.postback.count({ where: { receivedAt: { gte: since24h } } }),
    prisma.user.groupBy({
      by: ["tier"],
      _count: { _all: true },
      orderBy: { tier: "asc" },
    }),
    prisma.pocketOptionAccount.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { id: true, username: true, email: true, firstName: true } } },
    }),
  ]);

  const totalRevShare = revShareAggregate._sum.totalRevShare
    ? Number(revShareAggregate._sum.totalRevShare)
    : 0;
  const totalDeposit = revShareAggregate._sum.totalDeposit
    ? Number(revShareAggregate._sum.totalDeposit)
    : 0;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Admin · Обзор</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat icon={<Users size={18} />} label="Пользователей" value={totalUsers.toString()} />
        <Stat
          icon={<Layers size={18} />}
          label="PO-аккаунтов"
          value={`${poAccounts}`}
          delta={{ value: `${poVerified} verified`, positive: true }}
        />
        <Stat
          icon={<CircleDollarSign size={18} />}
          label="Total deposit"
          value={`$${totalDeposit.toLocaleString("en-US")}`}
        />
        <Stat
          icon={<Activity size={18} />}
          label="Postback-ов / 24ч"
          value={postbacksLast24.toString()}
        />
      </div>

      <Card padding="lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Воронка PocketOption</h2>
          <span className="text-xs text-[var(--t-3)]">
            от лида до Pro
          </span>
        </div>
        {(() => {
          const stages: Array<{
            label: string;
            icon: typeof UserPlus;
            count: number;
          }> = [
            { label: "Лидов всего", icon: Users, count: totalUsers },
            { label: "Регистрация в PO", icon: UserPlus, count: poRegistered },
            { label: "Подтвердили email", icon: Mail, count: poEmailConfirmed },
            { label: "Первый депозит", icon: Wallet, count: poVerified },
            { label: "Тир Pro (T1+)", icon: Crown, count: poProUsers },
          ];
          const max = stages.reduce((m, s) => Math.max(m, s.count), 0);
          return (
            <div className="space-y-2">
              {stages.map((stage, i) => {
                const prev = i === 0 ? null : stages[i - 1];
                const conv =
                  prev && prev.count > 0
                    ? Math.round((stage.count / prev.count) * 100)
                    : null;
                const pct = max > 0 ? (stage.count / max) * 100 : 0;
                const Icon = stage.icon;
                return (
                  <div key={stage.label} className="flex items-center gap-3">
                    <div className="w-44 shrink-0 flex items-center gap-2 text-sm text-[var(--t-2)]">
                      <Icon
                        size={14}
                        className="text-[var(--brand-gold)] shrink-0"
                      />
                      <span className="truncate">{stage.label}</span>
                    </div>
                    <div className="flex-1 h-6 rounded-lg bg-[var(--bg-2)] overflow-hidden relative">
                      <div
                        className="h-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          background:
                            i === stages.length - 1
                              ? "linear-gradient(90deg, var(--brand-gold-deep), var(--brand-gold-bright))"
                              : "linear-gradient(90deg, var(--brand-gold-deep), var(--brand-gold))",
                          opacity: 0.85,
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-end pr-3">
                        <span
                          className="text-xs font-semibold tabular-nums text-[var(--t-1)] mix-blend-screen"
                          style={{ fontFamily: "var(--font-jetbrains)" }}
                        >
                          {stage.count}
                        </span>
                      </div>
                    </div>
                    <div
                      className="w-14 shrink-0 text-right text-xs tabular-nums"
                      style={{ fontFamily: "var(--font-jetbrains)" }}
                    >
                      {conv != null ? (
                        <span
                          className={
                            conv >= 50
                              ? "text-[var(--green)]"
                              : conv >= 20
                              ? "text-[var(--brand-gold)]"
                              : "text-[var(--t-3)]"
                          }
                        >
                          {conv}%
                        </span>
                      ) : (
                        <span className="text-[var(--t-3)]">—</span>
                      )}
                    </div>
                  </div>
                );
              })}
              <p className="text-[11px] text-[var(--t-3)] pt-2">
                Конверсия — отношение к предыдущему шагу. Шаги PO заполняются
                по приходу постбэков (registration → email_confirm → ftd).
              </p>
            </div>
          );
        })()}
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card padding="lg">
          <h2 className="font-semibold mb-4">Распределение по тирам</h2>
          <div className="space-y-2">
            {[0, 1, 2, 3, 4].map((t) => {
              const row = tierDist.find((r) => r.tier === t);
              const count = row?._count._all ?? 0;
              const pct = totalUsers > 0 ? (count / totalUsers) * 100 : 0;
              return (
                <div key={t} className="flex items-center gap-3">
                  <TierBadge tier={t} size="sm" />
                  <div className="flex-1 h-2 rounded-full bg-[var(--bg-2)] overflow-hidden">
                    <div
                      className="h-full"
                      style={{
                        width: `${pct}%`,
                        background: "linear-gradient(90deg, var(--brand-gold-deep), var(--brand-gold))",
                      }}
                    />
                  </div>
                  <span
                    className="text-sm tabular-nums w-16 text-right"
                    style={{ fontFamily: "var(--font-jetbrains)" }}
                  >
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        <Card padding="lg">
          <h2 className="font-semibold mb-4">RevShare статистика</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-[var(--t-2)]">Заработано (всего)</span>
              <span
                className="text-2xl font-bold text-[var(--brand-gold)]"
                style={{ fontFamily: "var(--font-jetbrains)" }}
              >
                ${totalRevShare.toLocaleString("en-US")}
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-[var(--t-2)]">Средний депозит на трейдера</span>
              <span style={{ fontFamily: "var(--font-jetbrains)" }}>
                ${poVerified > 0 ? Math.round(totalDeposit / poVerified) : 0}
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-[var(--t-2)]">Сигналов выдано</span>
              <span style={{ fontFamily: "var(--font-jetbrains)" }}>{totalSignals}</span>
            </div>
          </div>
          <Link
            href="/admin/po-accounts"
            className="mt-6 inline-flex items-center gap-1.5 text-sm text-[var(--brand-gold)] hover:gap-2 transition-all"
          >
            Все PO-аккаунты
            <ArrowRight size={14} />
          </Link>
        </Card>
      </div>

      <Card padding="none">
        <div className="px-5 py-4 border-b border-[var(--b-soft)] flex items-center justify-between">
          <h2 className="font-semibold">Последние PO-аккаунты</h2>
          <Link
            href="/admin/po-accounts"
            className="text-xs text-[var(--brand-gold)] hover:underline inline-flex items-center gap-1"
          >
            Все <ArrowRight size={12} />
          </Link>
        </div>
        <div className="divide-y divide-[var(--b-soft)]">
          {recentAccounts.length === 0 && (
            <div className="px-5 py-8 text-sm text-[var(--t-3)] text-center">
              Пока нет привязанных PO-аккаунтов.
            </div>
          )}
          {recentAccounts.map((a) => {
            const userName =
              a.user.firstName ?? a.user.username ?? a.user.email ?? a.user.id.slice(0, 8);
            return (
              <div
                key={a.id}
                className="px-5 py-3 grid grid-cols-12 gap-4 items-center text-sm"
              >
                <div className="col-span-3 truncate">{userName}</div>
                <div
                  className="col-span-3 text-[var(--brand-gold)]"
                  style={{ fontFamily: "var(--font-jetbrains)" }}
                >
                  #{a.poTraderId ?? "—"}
                </div>
                <div className="col-span-2">
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{
                      background:
                        a.status === "verified"
                          ? "rgba(142,224,107,0.10)"
                          : "rgba(212,160,23,0.10)",
                      color: a.status === "verified" ? "var(--green)" : "var(--brand-gold)",
                    }}
                  >
                    {a.status}
                  </span>
                </div>
                <div
                  className="col-span-2 text-right tabular-nums"
                  style={{ fontFamily: "var(--font-jetbrains)" }}
                >
                  ${Number(a.totalDeposit).toLocaleString("en-US")}
                </div>
                <div className="col-span-2 text-right text-xs text-[var(--t-3)]">
                  {new Date(a.createdAt).toLocaleDateString("ru-RU")}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
