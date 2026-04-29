import { prisma } from "@/lib/prisma";

export default async function AdminAnalyticsPage() {
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
    planCounts,
    totalSignals,
    signalsToday,
    signalResults,
    tierCounts,
    confirmedDeposits,
    pendingDeposits,
    totalReferrals,
    promoTotal,
    promoActive,
    eliteUsers,
    trialUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.user.count({ where: { createdAt: { gte: weekStart } } }),
    prisma.user.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.user.groupBy({ by: ["subscriptionPlan"], _count: true }),
    prisma.signal.count(),
    prisma.signal.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.signal.groupBy({ by: ["result"], _count: true }),
    prisma.signal.groupBy({ by: ["tier"], _count: true }),
    prisma.deposit.aggregate({ where: { status: "confirmed" }, _sum: { amount: true }, _count: true }),
    prisma.deposit.count({ where: { status: "pending" } }),
    prisma.referral.count(),
    prisma.promoCode.count(),
    prisma.promoCode.count({ where: { isActive: true } }),
    prisma.user.count({ where: { eliteUnlocked: true } }),
    prisma.user.count({ where: { trialExpiresAt: { gte: now } } }),
  ]);

  const plans = Object.fromEntries(planCounts.map((p) => [p.subscriptionPlan, p._count]));
  const results = Object.fromEntries(signalResults.map((r) => [r.result, r._count]));
  const tiers = Object.fromEntries(tierCounts.map((t) => [t.tier, t._count]));

  const totalResolved = (results.win ?? 0) + (results.loss ?? 0);
  const winRate = totalResolved > 0 ? ((results.win ?? 0) / totalResolved * 100).toFixed(1) : "—";

  const convRate = totalUsers > 0
    ? (((plans.premium ?? 0) + (plans.vip ?? 0) + (plans.elite ?? 0)) / totalUsers * 100).toFixed(1)
    : "0";

  const sections = [
    {
      title: "ПОЛЬЗОВАТЕЛИ",
      color: "#f5c518",
      items: [
        { label: "Всего", value: totalUsers.toLocaleString(), sub: "" },
        { label: "Сегодня", value: newToday.toLocaleString(), sub: "новых" },
        { label: "За неделю", value: newWeek.toLocaleString(), sub: "" },
        { label: "За месяц", value: newMonth.toLocaleString(), sub: "" },
      ],
    },
    {
      title: "ПОДПИСКИ",
      color: "#00e5a0",
      items: [
        { label: "Free", value: (plans.free ?? 0).toLocaleString(), sub: "" },
        { label: "Premium", value: (plans.premium ?? 0).toLocaleString(), sub: "" },
        { label: "VIP", value: (plans.vip ?? 0).toLocaleString(), sub: "" },
        { label: "Elite", value: eliteUsers.toLocaleString(), sub: `конверсия ${convRate}%` },
      ],
    },
    {
      title: "СИГНАЛЫ",
      color: "#8888ff",
      items: [
        { label: "Всего", value: totalSignals.toLocaleString(), sub: `сегодня: ${signalsToday}` },
        { label: "OTC", value: (tiers.otc ?? 0).toLocaleString(), sub: "" },
        { label: "Биржевые", value: (tiers.exchange ?? 0).toLocaleString(), sub: "" },
        { label: "Elite", value: (tiers.elite ?? 0).toLocaleString(), sub: "" },
      ],
    },
    {
      title: "РЕЗУЛЬТАТЫ",
      color: "#00e5a0",
      items: [
        { label: "Win Rate", value: `${winRate}%`, sub: "" },
        { label: "WIN", value: (results.win ?? 0).toLocaleString(), sub: "" },
        { label: "LOSS", value: (results.loss ?? 0).toLocaleString(), sub: "" },
        { label: "Pending", value: (results.pending ?? 0).toLocaleString(), sub: "" },
      ],
    },
    {
      title: "ДЕПОЗИТЫ",
      color: "#f5c518",
      items: [
        { label: "Подтверждено", value: `$${Number(confirmedDeposits._sum.amount ?? 0).toLocaleString()}`, sub: `${confirmedDeposits._count} шт` },
        { label: "Ожидают", value: pendingDeposits.toLocaleString(), sub: "на верификации" },
        { label: "Trial", value: trialUsers.toLocaleString(), sub: "активных" },
        { label: "Промо", value: `${promoActive}/${promoTotal}`, sub: "активных/всего" },
      ],
    },
    {
      title: "РЕФЕРАЛЫ",
      color: "#00e5a0",
      items: [
        { label: "Всего рефералов", value: totalReferrals.toLocaleString(), sub: "" },
        { label: "Промо-коды", value: promoTotal.toLocaleString(), sub: `${promoActive} активных` },
        { label: "Elite Users", value: eliteUsers.toLocaleString(), sub: "$500+ dep" },
        { label: "Trial Users", value: trialUsers.toLocaleString(), sub: "по промо" },
      ],
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black tracking-wider" style={{ fontFamily: "var(--font-bebas)" }}>
          ПОЛНАЯ АНАЛИТИКА
        </h1>
        <p className="text-sm text-[#888]">Все метрики платформы в одном месте</p>
      </div>

      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.title}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full" style={{ background: section.color }} />
              <h2 className="text-sm font-bold tracking-wider" style={{ fontFamily: "var(--font-bebas)", color: section.color }}>
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
