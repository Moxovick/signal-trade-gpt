import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Signal, SignalDirection } from "@/generated/prisma/client";

const directionColors: Record<SignalDirection, string> = { CALL: "#00e5a0", PUT: "#f5c518" };
const directionArrows: Record<SignalDirection, string> = { CALL: "⬆", PUT: "⬇" };

export default async function SignalsPage() {
  const session = await auth();
  const plan = ((session!.user as Record<string, unknown>).subscriptionPlan as string) ?? "free";
  const isPremium = plan !== "free";

  const signals = await prisma.signal.findMany({
    where: isPremium ? {} : { isPremium: false },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Сигналы</h1>
        <span
          className="text-xs px-3 py-1 rounded-full font-semibold"
          style={{
            background: isPremium ? "rgba(245,197,24,0.12)" : "rgba(136,136,136,0.12)",
            color: isPremium ? "#f5c518" : "#888",
          }}
        >
          {plan.toUpperCase()}
        </span>
      </div>

      {!isPremium && (
        <div
          className="p-4 rounded-xl border text-sm"
          style={{
            background: "rgba(245,197,24,0.06)",
            borderColor: "rgba(245,197,24,0.2)",
            color: "#c8a010",
          }}
        >
          ⚡ На Free-тарифе доступны только базовые сигналы (3-5/день).{" "}
          <a href="/pricing" className="underline font-semibold">
            Обновить до Premium →
          </a>
        </div>
      )}

      <div className="space-y-3">
        {signals.length === 0 && (
          <div className="text-center py-16 text-[#555]">
            Сигналов ещё нет. Бот генерирует их каждые 5-15 минут.
          </div>
        )}

        {signals.map((s: Signal) => (
          <div
            key={s.id}
            className="rounded-2xl p-5 border flex items-center gap-4 transition-colors hover:border-white/10"
            style={{ background: "#0d0d18", borderColor: "rgba(255,255,255,0.07)" }}
          >
            {/* Direction badge */}
            <div
              className="w-14 h-14 rounded-xl flex flex-col items-center justify-center shrink-0 text-xs font-bold"
              style={{
                background:
                  s.direction === "CALL"
                    ? "rgba(0,229,160,0.12)"
                    : "rgba(245,197,24,0.12)",
                color: directionColors[s.direction],
              }}
            >
              <span className="text-lg">{directionArrows[s.direction]}</span>
              {s.direction}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="text-lg font-bold"
                  style={{ fontFamily: "var(--font-jetbrains)" }}
                >
                  {s.pair}
                </span>
                {s.isPremium && (
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-semibold"
                    style={{ background: "rgba(245,197,24,0.15)", color: "#f5c518" }}
                  >
                    PREMIUM
                  </span>
                )}
              </div>
              <div className="text-sm text-[#666] mt-1">
                Экспирация: <span className="text-[#aaa]">{s.expiration}</span> &nbsp;·&nbsp;
                Тип: <span className="text-[#aaa]">{s.type.toUpperCase()}</span>
              </div>
            </div>

            {/* Confidence */}
            <div className="text-right shrink-0">
              <div
                className="text-2xl font-bold"
                style={{ fontFamily: "var(--font-jetbrains)", color: "#f5c518" }}
              >
                {s.confidence}%
              </div>
              <div className="text-xs text-[#555]">AI confidence</div>
            </div>

            {/* Result */}
            <div className="shrink-0 w-16 text-center">
              {s.result === "win" && (
                <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-green-900/40 text-green-400">
                  WIN
                </span>
              )}
              {s.result === "loss" && (
                <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-red-900/30 text-red-400">
                  LOSS
                </span>
              )}
              {s.result === "pending" && (
                <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-white/5 text-[#555]">
                  —
                </span>
              )}
            </div>

            {/* Time */}
            <div className="text-xs text-[#444] shrink-0 hidden md:block">
              {new Date(s.createdAt).toLocaleTimeString("ru-RU", {
                hour: "2-digit",
                minute: "2-digit",
              })}
              <br />
              {new Date(s.createdAt).toLocaleDateString("ru-RU")}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
