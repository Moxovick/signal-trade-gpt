import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function HistoryPage() {
  const session = await auth();
  const userId = (session!.user as { id: string }).id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { createdAt: true, lastLogin: true, referralCode: true, subscriptionPlan: true },
  });

  const referrals = await prisma.referral.findMany({
    where: { referrerId: userId },
    include: { referred: { select: { email: true } } },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  type HistoryEvent = { date: Date | null | undefined; label: string; type: string };
  const events: HistoryEvent[] = [
    { date: user?.createdAt ?? null, label: "Регистрация аккаунта", type: "join" },
    ...referrals.map((r) => ({
      date: r.createdAt,
      label: `Новый реферал: ${r.referred.email}`,
      type: "referral",
    })),
  ].sort((a, b) => new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime());

  const typeIcon: Record<string, string> = {
    join: "🎉",
    referral: "🔗",
    upgrade: "⚡",
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">История</h1>

      <div
        className="rounded-2xl border overflow-hidden"
        style={{ background: "#0d0d18", borderColor: "rgba(255,255,255,0.07)" }}
      >
        {events.length === 0 ? (
          <div className="text-center py-12 text-[#555]">Активность не найдена</div>
        ) : (
          <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
            {events.map((ev, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg"
                  style={{ background: "rgba(245,197,24,0.08)" }}
                >
                  {typeIcon[ev.type] ?? "📌"}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{ev.label}</p>
                  <p className="text-xs text-[#555]">
                    {ev.date
                      ? new Date(ev.date).toLocaleString("ru-RU", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
