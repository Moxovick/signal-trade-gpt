import { prisma } from "@/lib/prisma";

export default async function AdminAnalyticsPage() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    newUsersToday,
    newUsersWeek,
    newUsersMonth,
    totalSignals,
    signalsToday,
    winSignals,
    lossSignals,
    pendingSignals,
    premiumUsers,
    vipUsers,
    totalReferrals,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.user.count({ where: { createdAt: { gte: monthAgo } } }),
    prisma.signal.count(),
    prisma.signal.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.signal.count({ where: { result: "win" } }),
    prisma.signal.count({ where: { result: "loss" } }),
    prisma.signal.count({ where: { result: "pending" } }),
    prisma.user.count({ where: { subscriptionPlan: "premium" } }),
    prisma.user.count({ where: { subscriptionPlan: "vip" } }),
    prisma.referral.count(),
  ]);

  const winRate = winSignals + lossSignals > 0
    ? ((winSignals / (winSignals + lossSignals)) * 100).toFixed(1)
    : "—";

  const sections = [
    {
      title: "Пользователи",
      stats: [
        { label: "Всего", value: totalUsers, color: "#f5c518" },
        { label: "Сегодня", value: newUsersToday, color: "#00e5a0" },
        { label: "За неделю", value: newUsersWeek, color: "#00e5a0" },
        { label: "За месяц", value: newUsersMonth, color: "#00e5a0" },
      ],
    },
    {
      title: "Подписки",
      stats: [
        { label: "Free", value: totalUsers - premiumUsers - vipUsers, color: "#888" },
        { label: "Premium", value: premiumUsers, color: "#f5c518" },
        { label: "VIP", value: vipUsers, color: "#00e5a0" },
        { label: "Конверсия", value: `${totalUsers > 0 ? (((premiumUsers + vipUsers) / totalUsers) * 100).toFixed(1) : 0}%`, color: "#f5c518" },
      ],
    },
    {
      title: "Сигналы",
      stats: [
        { label: "Всего", value: totalSignals, color: "#f5c518" },
        { label: "Сегодня", value: signalsToday, color: "#00e5a0" },
        { label: "Win Rate", value: `${winRate}%`, color: "#00e5a0" },
        { label: "Ожидают", value: pendingSignals, color: "#888" },
      ],
    },
    {
      title: "Результаты сигналов",
      stats: [
        { label: "WIN", value: winSignals, color: "#00e5a0" },
        { label: "LOSS", value: lossSignals, color: "#ef4444" },
        { label: "Pending", value: pendingSignals, color: "#888" },
        { label: "Рефералы", value: totalReferrals, color: "#f5c518" },
      ],
    },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Аналитика</h1>

      {sections.map((section) => (
        <div key={section.title}>
          <h2 className="text-sm font-semibold mb-3" style={{ color: "#f5c518" }}>
            {section.title}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {section.stats.map(({ label, value, color }) => (
              <div
                key={label}
                className="rounded-2xl p-5 border"
                style={{ background: "#0d0d18", borderColor: "rgba(255,255,255,0.07)" }}
              >
                <div
                  className="text-3xl font-bold mb-1"
                  style={{ fontFamily: "var(--font-jetbrains)", color }}
                >
                  {value}
                </div>
                <div className="text-xs text-[#666]">{label}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
