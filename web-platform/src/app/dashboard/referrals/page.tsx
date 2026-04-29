import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function ReferralsPage() {
  const session = await auth();
  const userId = (session!.user as { id: string }).id;

  const [user, referrals] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { referralCode: true, subscriptionPlan: true },
    }),
    prisma.referral.findMany({
      where: { referrerId: userId },
      include: {
        referred: {
          select: { email: true, createdAt: true, subscriptionPlan: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const plan = user?.subscriptionPlan ?? "free";
  const commissionRate = plan === "vip" ? 20 : plan === "premium" ? 15 : 10;
  const refUrl = `${process.env.NEXTAUTH_URL ?? "https://yoursite.com"}/register?ref=${user?.referralCode}`;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Партнёрская программа</h1>

      {/* Commission info */}
      <div
        className="rounded-2xl p-6 border grid md:grid-cols-3 gap-6"
        style={{ background: "#0d0d18", borderColor: "rgba(255,255,255,0.07)" }}
      >
        {[
          { label: "Ваша комиссия", value: `${commissionRate}%`, color: "#f5c518" },
          { label: "Всего рефералов", value: referrals.length.toString(), color: "#00e5a0" },
          {
            label: "Активных (Premium+)",
            value: referrals
              .filter((r) => r.referred.subscriptionPlan !== "free")
              .length.toString(),
            color: "#f5c518",
          },
        ].map(({ label, value, color }) => (
          <div key={label} className="text-center">
            <div
              className="text-4xl font-bold mb-1"
              style={{ fontFamily: "var(--font-jetbrains)", color }}
            >
              {value}
            </div>
            <div className="text-xs text-[#666]">{label}</div>
          </div>
        ))}
      </div>

      {/* Referral link */}
      <div
        className="rounded-2xl p-6 border"
        style={{ background: "#0d0d18", borderColor: "rgba(255,255,255,0.07)" }}
      >
        <h2 className="font-semibold mb-4">Ваша реферальная ссылка</h2>
        <div className="flex gap-2">
          <input
            readOnly
            value={refUrl}
            className="flex-1 px-4 py-3 rounded-xl text-sm font-mono outline-none"
            style={{ background: "#111120", border: "1px solid rgba(255,255,255,0.08)", color: "#888" }}
          />
          <button
            onClick={undefined}
            className="px-5 py-3 rounded-xl text-sm font-semibold shrink-0 transition-colors"
            style={{ background: "#f5c518", color: "#07070d" }}
            id="copy-ref-btn"
          >
            Копировать
          </button>
        </div>
        <p className="text-xs text-[#555] mt-3">
          Реферальный код: <span className="text-[#888] font-mono">{user?.referralCode}</span>
        </p>
      </div>

      {/* Tiers */}
      <div
        className="rounded-2xl p-6 border"
        style={{ background: "#0d0d18", borderColor: "rgba(255,255,255,0.07)" }}
      >
        <h2 className="font-semibold mb-4">Условия партнёрки</h2>
        <div className="space-y-2 text-sm">
          {[
            { plan: "Free", rate: "10%", color: "#888" },
            { plan: "Premium", rate: "15%", color: "#f5c518" },
            { plan: "VIP", rate: "20%", color: "#00e5a0" },
          ].map(({ plan: p, rate, color }) => (
            <div
              key={p}
              className="flex items-center justify-between p-3 rounded-xl"
              style={{
                background: plan === p.toLowerCase() ? "rgba(245,197,24,0.06)" : "transparent",
                border:
                  plan === p.toLowerCase()
                    ? "1px solid rgba(245,197,24,0.15)"
                    : "1px solid transparent",
              }}
            >
              <span style={{ color }}>
                {plan === p.toLowerCase() && "✓ "}{p}
              </span>
              <span className="font-bold" style={{ color }}>
                {rate} с каждой оплаты
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Referrals list */}
      <div
        className="rounded-2xl border"
        style={{ background: "#0d0d18", borderColor: "rgba(255,255,255,0.07)" }}
      >
        <div className="p-5 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <h2 className="font-semibold">Ваши рефералы</h2>
        </div>
        {referrals.length === 0 ? (
          <div className="text-center py-10 text-[#555] text-sm">
            Рефералов пока нет. Поделитесь ссылкой!
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
            {referrals.map((r: typeof referrals[number]) => (
              <div key={r.id} className="px-5 py-4 flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium">{r.referred.email}</p>
                  <p className="text-xs text-[#555]">
                    {new Date(r.referred.createdAt).toLocaleDateString("ru-RU")}
                  </p>
                </div>
                <span
                  className="text-xs px-2 py-1 rounded-full font-semibold"
                  style={{
                    background:
                      r.referred.subscriptionPlan === "free"
                        ? "rgba(136,136,136,0.1)"
                        : "rgba(245,197,24,0.1)",
                    color:
                      r.referred.subscriptionPlan === "free" ? "#666" : "#f5c518",
                  }}
                >
                  {r.referred.subscriptionPlan.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
