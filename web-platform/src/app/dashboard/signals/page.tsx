import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

const TIER_ACCESS: Record<string, string[]> = {
  free: ["otc"],
  premium: ["otc", "exchange"],
  vip: ["otc", "exchange"],
  elite: ["otc", "exchange", "elite"],
};

const TIER_LABELS: Record<string, { name: string; color: string }> = {
  otc: { name: "OTC", color: "#8888ff" },
  exchange: { name: "Биржа", color: "#00e5a0" },
  elite: { name: "Elite", color: "#f5c518" },
};

export default async function SignalsPage() {
  const session = await auth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const plan = ((session!.user as any).subscriptionPlan as string) ?? "free";
  const allowedTiers = TIER_ACCESS[plan] ?? ["otc"];

  const signals = await prisma.signal.findMany({
    where: { tier: { in: allowedTiers as ("otc" | "exchange" | "elite")[] }, isActive: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const grouped = {
    otc: signals.filter((s) => s.tier === "otc"),
    exchange: signals.filter((s) => s.tier === "exchange"),
    elite: signals.filter((s) => s.tier === "elite"),
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black tracking-wider" style={{ fontFamily: "var(--font-bebas)" }}>СИГНАЛЫ</h1>
        <span className={`text-xs px-3 py-1 rounded-full font-semibold tier-${plan}`}>{plan.toUpperCase()}</span>
      </div>

      {/* Tier tabs */}
      <div className="flex gap-2 flex-wrap">
        {(["otc", "exchange", "elite"] as const).map((tier) => {
          const info = TIER_LABELS[tier];
          const hasAccess = allowedTiers.includes(tier);
          return (
            <div key={tier} className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 ${hasAccess ? "card-premium" : "opacity-30"}`} style={{ borderColor: hasAccess ? `${info.color}33` : undefined }}>
              <span className="w-2 h-2 rounded-full" style={{ background: info.color }} />
              <span style={{ color: info.color }}>{info.name}</span>
              <span className="text-xs text-[#555]">({grouped[tier].length})</span>
              {!hasAccess && <span className="text-xs text-[#555]">🔒</span>}
            </div>
          );
        })}
      </div>

      {plan === "free" && (
        <div className="p-4 rounded-xl text-sm card-premium" style={{ borderColor: "rgba(245,197,24,0.2)" }}>
          ⚡ На Free-тарифе доступны только OTC-сигналы (3-5/день).{" "}
          <Link href="/pricing" className="underline font-semibold text-[#f5c518]">Обновить до Premium →</Link>
        </div>
      )}

      {!allowedTiers.includes("elite") && (
        <div className="p-4 rounded-xl text-sm signal-card-elite" style={{ borderColor: "rgba(245,197,24,0.15)" }}>
          💎 Elite-сигналы доступны при VIP-подписке + депозите от $500.{" "}
          <Link href="/pricing" className="underline font-semibold text-[#f5c518]">Подробнее →</Link>
        </div>
      )}

      {/* Signal list */}
      <div className="space-y-3">
        {signals.length === 0 && (
          <div className="text-center py-16 text-[#555]">Сигналов ещё нет. Бот генерирует их каждые 5-15 минут.</div>
        )}

        {signals.map((s) => {
          const tierInfo = TIER_LABELS[s.tier] ?? TIER_LABELS.otc;
          return (
            <div key={s.id} className={`rounded-2xl p-4 md:p-5 card-premium flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4 ${s.tier === "elite" ? "signal-card-elite" : ""}`}>
              {/* Direction */}
              <div className="w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 text-xs font-bold" style={{ background: s.direction === "CALL" ? "rgba(0,229,160,0.12)" : "rgba(245,197,24,0.12)", color: s.direction === "CALL" ? "#00e5a0" : "#f5c518" }}>
                <span className="text-lg">{s.direction === "CALL" ? "⬆" : "⬇"}</span>
                {s.direction}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-lg font-bold" style={{ fontFamily: "var(--font-jetbrains)" }}>{s.pair}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold tier-${s.tier}`}>{tierInfo.name}</span>
                </div>
                <div className="text-sm text-[#666] mt-1">
                  Экспирация: <span className="text-[#aaa]">{s.expiration}</span> · {s.type.toUpperCase()}
                </div>
                {s.analysis && <p className="text-xs text-[#888] mt-1 line-clamp-1">{s.analysis}</p>}
              </div>

              {/* Confidence */}
              <div className="text-right shrink-0">
                <div className="text-2xl font-bold text-gold-gradient" style={{ fontFamily: "var(--font-jetbrains)" }}>{s.confidence}%</div>
                <div className="text-xs text-[#555]">AI confidence</div>
              </div>

              {/* Result */}
              <div className="shrink-0 w-16 text-center">
                {s.result === "win" && <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-green-900/40 text-green-400">WIN</span>}
                {s.result === "loss" && <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-red-900/30 text-red-400">LOSS</span>}
                {s.result === "pending" && <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-white/5 text-[#555]">—</span>}
              </div>

              {/* Time */}
              <div className="text-xs text-[#444] shrink-0 hidden md:block">
                {new Date(s.createdAt).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
