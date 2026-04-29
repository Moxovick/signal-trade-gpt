import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {
  const [totalUsers, totalSignals, premiumUsers, pendingSignals] = await Promise.all([
    prisma.user.count(),
    prisma.signal.count(),
    prisma.user.count({ where: { subscriptionPlan: { in: ["premium", "vip"] } } }),
    prisma.signal.count({ where: { result: "pending" } }),
  ]);

  const recentUsers = await prisma.user.findMany({
    select: { email: true, subscriptionPlan: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const stats = [
    { label: "Всего пользователей", value: totalUsers, icon: "👥", color: "#f5c518" },
    { label: "Платных", value: premiumUsers, icon: "💎", color: "#00e5a0" },
    { label: "Всего сигналов", value: totalSignals, icon: "📊", color: "#f5c518" },
    { label: "Ожидают результата", value: pendingSignals, icon: "⏳", color: "#888" },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon, color }) => (
          <div
            key={label}
            className="rounded-2xl p-5 border"
            style={{ background: "#0d0d18", borderColor: "rgba(255,255,255,0.07)" }}
          >
            <div className="text-2xl mb-3">{icon}</div>
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

      <div
        className="rounded-2xl border"
        style={{ background: "#0d0d18", borderColor: "rgba(255,255,255,0.07)" }}
      >
        <div className="p-5 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <h2 className="font-semibold">Последние регистрации</h2>
        </div>
        <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
          {recentUsers.map((u: typeof recentUsers[number]) => (
            <div key={u.email} className="px-5 py-3 flex items-center justify-between text-sm">
              <span>{u.email}</span>
              <div className="flex items-center gap-3">
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-semibold"
                  style={{
                    background:
                      u.subscriptionPlan === "free"
                        ? "rgba(136,136,136,0.1)"
                        : "rgba(245,197,24,0.1)",
                    color: u.subscriptionPlan === "free" ? "#666" : "#f5c518",
                  }}
                >
                  {u.subscriptionPlan.toUpperCase()}
                </span>
                <span className="text-[#555]">
                  {new Date(u.createdAt).toLocaleDateString("ru-RU")}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
