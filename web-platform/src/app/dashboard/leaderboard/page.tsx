export default async function LeaderboardPage() {
  const mockEntries = [
    { name: "Alex_Trade", plan: "vip", score: 94.2, signals: 847, rank: 1 },
    { name: "ProTrader_RU", plan: "vip", score: 91.8, signals: 763, rank: 2 },
    { name: "BinaryKing", plan: "premium", score: 89.5, signals: 695, rank: 3 },
    { name: "Signal_Master", plan: "premium", score: 87.3, signals: 612, rank: 4 },
    { name: "TradeFox", plan: "premium", score: 85.1, signals: 548, rank: 5 },
  ];

  const planBadge: Record<string, { label: string; color: string }> = {
    vip: { label: "VIP", color: "#00e5a0" },
    premium: { label: "PREMIUM", color: "#f5c518" },
    free: { label: "FREE", color: "#666" },
  };

  const medalColors = ["#f5c518", "#aaa", "#c87533"];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Лидерборд</h1>
        <p className="text-[#666] text-sm mt-1">Топ трейдеров по точности сигналов</p>
      </div>

      <div
        className="rounded-2xl border overflow-hidden"
        style={{ background: "#0d0d18", borderColor: "rgba(255,255,255,0.07)" }}
      >
        <div
          className="grid grid-cols-12 px-5 py-3 text-xs text-[#555] border-b"
          style={{ borderColor: "rgba(255,255,255,0.05)" }}
        >
          <span className="col-span-1">#</span>
          <span className="col-span-5">Трейдер</span>
          <span className="col-span-2 text-right">Сигналов</span>
          <span className="col-span-2 text-right">Точность</span>
          <span className="col-span-2 text-right">Тариф</span>
        </div>

        {mockEntries.map((entry, i) => {
          const badge = planBadge[entry.plan];
          const medal = i < 3 ? medalColors[i] : null;
          return (
            <div
              key={entry.rank}
              className="grid grid-cols-12 px-5 py-4 items-center border-b transition-colors hover:bg-white/[0.02]"
              style={{ borderColor: "rgba(255,255,255,0.04)" }}
            >
              <span
                className="col-span-1 text-sm font-bold"
                style={{ color: medal ?? "#555" }}
              >
                {i < 3 ? ["🥇", "🥈", "🥉"][i] : entry.rank}
              </span>
              <span className="col-span-5 text-sm font-medium">{entry.name}</span>
              <span
                className="col-span-2 text-right text-sm"
                style={{ fontFamily: "var(--font-jetbrains)", color: "#aaa" }}
              >
                {entry.signals}
              </span>
              <span
                className="col-span-2 text-right font-bold text-sm"
                style={{ fontFamily: "var(--font-jetbrains)", color: "#00e5a0" }}
              >
                {entry.score}%
              </span>
              <div className="col-span-2 text-right">
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: `${badge.color}20`, color: badge.color }}
                >
                  {badge.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div
        className="p-4 rounded-xl text-sm text-center"
        style={{ background: "rgba(245,197,24,0.06)", border: "1px solid rgba(245,197,24,0.15)", color: "#c8a010" }}
      >
        Для участия в лидерборде необходим тариф Premium или VIP
      </div>
    </div>
  );
}
