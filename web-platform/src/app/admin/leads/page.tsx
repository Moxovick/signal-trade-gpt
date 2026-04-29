import { prisma } from "@/lib/prisma";

export default async function AdminLeadsPage() {
  const [users, totalUsers] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        subscriptionPlan: true,
        status: true,
        createdAt: true,
        lastLogin: true,
        depositTotal: true,
        eliteUnlocked: true,
        signalsReceived: true,
        trialExpiresAt: true,
        utmSource: true,
        referralCode: true,
        _count: {
          select: {
            referrals: true,
            referralsSent: true,
          },
        },
      },
    }),
    prisma.user.count(),
  ]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const leadsToday = users.filter((u) => new Date(u.createdAt) >= today).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black tracking-wider" style={{ fontFamily: "var(--font-bebas)" }}>
            ЛИДЫ
          </h1>
          <p className="text-sm text-[#888]">Все пользователи с детальной информацией</p>
        </div>
        <div className="flex gap-3">
          <div className="card-premium rounded-xl px-4 py-2 text-center">
            <div className="text-xl font-bold text-gold-gradient">{totalUsers}</div>
            <div className="text-xs text-[#555]">Всего</div>
          </div>
          <div className="card-premium rounded-xl px-4 py-2 text-center">
            <div className="text-xl font-bold" style={{ color: "#00e5a0" }}>{leadsToday}</div>
            <div className="text-xs text-[#555]">Сегодня</div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(245,197,24,0.1)" }}>
              <th className="text-left py-2 px-2 text-[#888] font-medium text-xs">Пользователь</th>
              <th className="py-2 px-2 text-[#888] font-medium text-xs">План</th>
              <th className="py-2 px-2 text-[#888] font-medium text-xs">Депозит</th>
              <th className="py-2 px-2 text-[#888] font-medium text-xs">Сигналов</th>
              <th className="py-2 px-2 text-[#888] font-medium text-xs">Рефералы</th>
              <th className="py-2 px-2 text-[#888] font-medium text-xs">Источник</th>
              <th className="py-2 px-2 text-[#888] font-medium text-xs">Дата</th>
              <th className="py-2 px-2 text-[#888] font-medium text-xs">Статус</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const isTrial = user.trialExpiresAt && new Date(user.trialExpiresAt) > new Date();
              return (
                <tr key={user.id} className="hover:bg-white/[0.02]" style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                  <td className="py-2 px-2">
                    <div className="text-sm font-medium">{user.email}</div>
                    <div className="text-xs text-[#555]">{user.firstName ?? user.username ?? "—"}</div>
                  </td>
                  <td className="py-2 px-2 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold tier-${user.subscriptionPlan}`}>
                      {user.subscriptionPlan.toUpperCase()}
                    </span>
                    {isTrial && <span className="block text-[10px] text-[#f5c518] mt-0.5">TRIAL</span>}
                  </td>
                  <td className="py-2 px-2 text-center">
                    <span className={Number(user.depositTotal) >= 500 ? "text-gold-gradient font-bold" : "text-[#888]"}>
                      ${Number(user.depositTotal).toLocaleString()}
                    </span>
                    {user.eliteUnlocked && <span className="block text-[10px] text-[#f5c518]">ELITE</span>}
                  </td>
                  <td className="py-2 px-2 text-center text-[#888]">{user.signalsReceived}</td>
                  <td className="py-2 px-2 text-center text-[#888]">{user._count.referralsSent}</td>
                  <td className="py-2 px-2 text-center text-xs text-[#555]">{user.utmSource ?? "—"}</td>
                  <td className="py-2 px-2 text-center text-xs text-[#555]">{new Date(user.createdAt).toLocaleDateString("ru")}</td>
                  <td className="py-2 px-2 text-center">
                    <span className={`text-xs ${user.status === "active" ? "text-[#00e5a0]" : user.status === "banned" ? "text-red-400" : "text-[#888]"}`}>
                      {user.status === "active" ? "●" : user.status === "banned" ? "⊘" : "○"} {user.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
