import { prisma } from "@/lib/prisma";

export default async function AdminDepositsPage() {
  const [deposits, stats] = await Promise.all([
    prisma.deposit.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        user: { select: { id: true, email: true, username: true, subscriptionPlan: true, eliteUnlocked: true } },
      },
    }),
    prisma.deposit.aggregate({
      where: { status: "confirmed" },
      _sum: { amount: true },
      _count: true,
    }),
  ]);

  const pending = deposits.filter((d) => d.status === "pending").length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black tracking-wider" style={{ fontFamily: "var(--font-bebas)" }}>
            ДЕПОЗИТЫ
          </h1>
          <p className="text-sm text-[#888]">Верификация депозитов для Elite доступа</p>
        </div>
        <div className="flex gap-3">
          <div className="card-premium rounded-xl px-4 py-2 text-center">
            <div className="text-xl font-bold text-gold-gradient">${Number(stats._sum.amount ?? 0).toLocaleString()}</div>
            <div className="text-xs text-[#555]">Подтверждено</div>
          </div>
          <div className="card-premium rounded-xl px-4 py-2 text-center">
            <div className="text-xl font-bold" style={{ color: pending > 0 ? "#f5c518" : "#00e5a0" }}>{pending}</div>
            <div className="text-xs text-[#555]">Ожидают</div>
          </div>
          <div className="card-premium rounded-xl px-4 py-2 text-center">
            <div className="text-xl font-bold" style={{ color: "#00e5a0" }}>{stats._count}</div>
            <div className="text-xs text-[#555]">Всего</div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {deposits.map((dep) => (
          <div key={dep.id} className="card-premium rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono font-bold text-lg">${Number(dep.amount).toLocaleString()}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${dep.status === "confirmed" ? "tier-exchange" : dep.status === "pending" ? "tier-elite" : "bg-red-900/30 text-red-400"}`}>
                  {dep.status === "confirmed" ? "Подтверждён" : dep.status === "pending" ? "Ожидает" : "Отклонён"}
                </span>
                <span className="text-xs text-[#555]">{dep.platform}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#666]">
                <span>{dep.user.email}</span>
                <span>·</span>
                <span className={`tier-${dep.user.subscriptionPlan}`}>{dep.user.subscriptionPlan.toUpperCase()}</span>
                {dep.user.eliteUnlocked && <span className="tier-elite">ELITE ✓</span>}
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              {dep.txHash && (
                <div className="text-center">
                  <div className="font-mono text-xs text-[#555] truncate max-w-[100px]">{dep.txHash}</div>
                  <div className="text-xs text-[#555]">TX Hash</div>
                </div>
              )}
              <div className="text-center">
                <div className="text-xs text-[#666]">{new Date(dep.createdAt).toLocaleDateString("ru")}</div>
                <div className="text-xs text-[#555]">Дата</div>
              </div>
            </div>
          </div>
        ))}

        {deposits.length === 0 && (
          <div className="card-premium rounded-xl p-8 text-center">
            <p className="text-[#555] text-sm">Депозитов пока нет</p>
          </div>
        )}
      </div>
    </div>
  );
}
