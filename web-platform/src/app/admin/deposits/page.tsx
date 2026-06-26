import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDictionaryForUser } from "@/lib/i18n";

export default async function AdminDepositsPage() {
  const session = await auth();
  if (!session?.user?.id || (session.user as { role?: string }).role !== "admin") redirect("/login");
  const t = session?.user?.id ? await getDictionaryForUser(session.user.id) : null;
  const td = t?.admin?.deposits ?? {};
  const [deposits, stats] = await Promise.all([
    prisma.deposit.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        user: { select: { id: true, email: true, username: true, tier: true } },
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
            {td.title ?? "ДЕПОЗИТЫ"}
          </h1>
          <p className="text-sm text-[#888]">{td.subtitle ?? "Депозиты пользователей"}</p>
        </div>
        <div className="flex gap-3">
          <div className="card-premium rounded-xl px-4 py-2 text-center">
            <div className="text-xl font-bold text-gold-gradient">${Number(stats._sum.amount ?? 0).toLocaleString()}</div>
            <div className="text-xs text-[#555]">{td.stats?.confirmed ?? "Подтверждено"}</div>
          </div>
          <div className="card-premium rounded-xl px-4 py-2 text-center">
            <div className="text-xl font-bold" style={{ color: pending > 0 ? "#f5c518" : "#00e5a0" }}>{pending}</div>
            <div className="text-xs text-[#555]">{td.stats?.pending ?? "Ожидают"}</div>
          </div>
          <div className="card-premium rounded-xl px-4 py-2 text-center">
            <div className="text-xl font-bold" style={{ color: "#00e5a0" }}>{stats._count}</div>
            <div className="text-xs text-[#555]">{td.stats?.total ?? "Всего"}</div>
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
                  {dep.status === "confirmed" ? (td.status?.confirmed ?? "Подтверждён") : dep.status === "pending" ? (td.status?.pending ?? "Ожидает") : (td.status?.rejected ?? "Отклонён")}
                </span>
                <span className="text-xs text-[#555]">{dep.platform}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#666]">
                <span>{dep.user.email}</span>
                <span>·</span>
                <span className={`tier-${dep.user.tier === 0 ? "free" : dep.user.tier === 1 ? "basic" : "pro"}`}>{dep.user.tier === 0 ? "Free" : dep.user.tier === 1 ? "Basic" : "Pro"}</span>
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
                <div className="text-xs text-[#555]">{td.table?.date ?? "Дата"}</div>
              </div>
            </div>
          </div>
        ))}

        {deposits.length === 0 && (
          <div className="card-premium rounded-xl p-8 text-center">
            <p className="text-[#555] text-sm">{td.empty ?? "Депозитов пока нет"}</p>
          </div>
        )}
      </div>
    </div>
  );
}
