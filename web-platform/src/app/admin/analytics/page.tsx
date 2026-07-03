import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getDictionaryForUser } from "@/lib/i18n";

export default async function AdminAnalyticsPage() {
  const session = await auth();
  const t = session?.user?.id ? await getDictionaryForUser(session.user.id) : null;
  const tan = t?.admin?.analytics ?? {};

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);
  const monthStart = new Date(todayStart);
  monthStart.setDate(monthStart.getDate() - 30);

  const [
    totalUsers,
    newToday,
    newWeek,
    newMonth,
    userTierCounts,
    totalSignals,
    signalsToday,
    signalResults,
    tierCounts,
    confirmedDeposits,
    pendingDeposits,
    totalReferrals,
    poAccounts,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.user.count({ where: { createdAt: { gte: weekStart } } }),
    prisma.user.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.user.groupBy({ by: ["tier"], _count: { _all: true } }),
    prisma.signal.count(),
    prisma.signal.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.signal.groupBy({ by: ["result"], _count: true }),
    prisma.signal.groupBy({ by: ["tier"], _count: true }),
    prisma.deposit.aggregate({ where: { status: "confirmed" }, _sum: { amount: true }, _count: true }),
    prisma.deposit.count({ where: { status: "pending" } }),
    prisma.referral.count(),
    prisma.pocketOptionAccount.count(),
  ]);

  const userTiers = Object.fromEntries(
    userTierCounts.map((t) => [t.tier, t._count._all]),
  );
  const results = Object.fromEntries(signalResults.map((r) => [r.result, r._count]));
  const tiers = Object.fromEntries(tierCounts.map((t) => [t.tier, t._count]));

  const totalResolved = (results.win ?? 0) + (results.loss ?? 0);
  const winRate = totalResolved > 0 ? ((results.win ?? 0) / totalResolved * 100).toFixed(1) : "—";

  const paidUsers = (userTiers[1] ?? 0) + (userTiers[2] ?? 0);
  const convRate = totalUsers > 0
    ? (paidUsers / totalUsers * 100).toFixed(1)
    : "0";

  const sections = [
    {
      title: tan.sections?.users ?? "ПОЛЬЗОВАТЕЛИ",
      color: "#f5c518",
      items: [
        { label: tan.items?.total ?? "Всего", value: totalUsers.toLocaleString(), sub: "" },
        { label: tan.items?.today ?? "Сегодня", value: newToday.toLocaleString(), sub: tan.items?.new ?? "новых" },
        { label: tan.items?.week ?? "За неделю", value: newWeek.toLocaleString(), sub: "" },
        { label: tan.items?.month ?? "За месяц", value: newMonth.toLocaleString(), sub: "" },
      ],
    },
    {
      title: tan.sections?.tiers ?? "ТИРЫ",
      color: "#00e5a0",
      items: [
        { label: "T0 Free", value: (userTiers[0] ?? 0).toLocaleString(), sub: "" },
        { label: "T1 Basic", value: (userTiers[1] ?? 0).toLocaleString(), sub: "" },
        { label: "T2 Pro", value: (userTiers[2] ?? 0).toLocaleString(), sub: "" },
        { label: tan.items?.poAccounts ?? "PO аккаунтов", value: poAccounts.toLocaleString(), sub: `${tan.items?.conversion ?? "конверсия"} ${convRate}%` },
      ],
    },
    {
      title: tan.sections?.signals ?? "СИГНАЛЫ",
      color: "#8888ff",
      items: [
        { label: tan.items?.total ?? "Всего", value: totalSignals.toLocaleString(), sub: `${tan.items?.today ?? "сегодня"}: ${signalsToday}` },
        { label: "OTC", value: (tiers.otc ?? 0).toLocaleString(), sub: "" },
        { label: tan.items?.exchange ?? "Биржевые", value: (tiers.exchange ?? 0).toLocaleString(), sub: "" },
        { label: "Elite", value: (tiers.elite ?? 0).toLocaleString(), sub: "" },
      ],
    },
    {
      title: tan.sections?.results ?? "РЕЗУЛЬТАТЫ",
      color: "#00e5a0",
      items: [
        { label: "Win Rate", value: `${winRate}%`, sub: "" },
        { label: "WIN", value: (results.win ?? 0).toLocaleString(), sub: "" },
        { label: "LOSS", value: (results.loss ?? 0).toLocaleString(), sub: "" },
        { label: "Pending", value: (results.pending ?? 0).toLocaleString(), sub: "" },
      ],
    },
    {
      title: tan.sections?.deposits ?? "ДЕПОЗИТЫ",
      color: "#f5c518",
      items: [
        { label: tan.items?.confirmed ?? "Подтверждено", value: `$${Number(confirmedDeposits._sum.amount ?? 0).toLocaleString()}`, sub: `${confirmedDeposits._count} шт` },
        { label: tan.items?.pending ?? "Ожидают", value: pendingDeposits.toLocaleString(), sub: tan.items?.onVerification ?? "на верификации" },
        { label: "T1+ (Basic+)", value: paidUsers.toLocaleString(), sub: tan.items?.depositMin20 ?? "депозит ≥ $20" },
        { label: tan.items?.poAccounts ?? "PO аккаунтов", value: poAccounts.toLocaleString(), sub: "" },
      ],
    },
    {
      title: tan.sections?.referrals ?? "РЕФЕРАЛЫ",
      color: "#00e5a0",
      items: [
        { label: tan.items?.totalReferrals ?? "Всего рефералов", value: totalReferrals.toLocaleString(), sub: "" },
        { label: "T1+ (Basic+)", value: paidUsers.toLocaleString(), sub: tan.items?.depositMin20 ?? "депозит ≥ $20" },
        { label: "T2 (Pro)", value: (userTiers[2] ?? 0).toLocaleString(), sub: tan.items?.depositMin100 ?? "депозит ≥ $100" },
      ],
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black tracking-wider">
          {tan.title ?? "ПОЛНАЯ АНАЛИТИКА"}
        </h1>
        <p className="text-sm text-[#888]">{tan.subtitle ?? "Все метрики платформы в одном месте"}</p>
      </div>

      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.title}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full" style={{ background: section.color }} />
              <h2 className="text-sm font-bold tracking-wider" style={{ color: section.color }}>
                {section.title}
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {section.items.map(({ label, value, sub }) => (
                <div key={label} className="card-premium rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-gold-gradient" style={{ fontFamily: "var(--font-jetbrains)" }}>{value}</div>
                  <div className="text-sm text-[#ccc] mt-1">{label}</div>
                  {sub && <div className="text-xs text-[#555] mt-0.5">{sub}</div>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
