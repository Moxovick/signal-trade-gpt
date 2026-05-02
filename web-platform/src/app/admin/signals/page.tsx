/**
 * /admin/signals — full signal control v2.
 *
 * - Inline create form (any pair, direction, expiration, confidence, tier).
 * - Mark result (WIN/LOSS/pending), toggle active, delete.
 * - Auto-refresh after each mutation via router.refresh().
 */
import { prisma } from "@/lib/prisma";
import type { Signal, SignalDirection } from "@/generated/prisma/client";
import { CreateSignalForm } from "./_components/CreateSignalForm";
import { SignalRowActions } from "./_components/SignalRowActions";

const TIER_BADGE: Record<string, { label: string; color: string }> = {
  otc: { label: "OTC", color: "#8888ff" },
  exchange: { label: "Биржа", color: "#00e5a0" },
  elite: { label: "Elite", color: "#f5c518" },
};

export default async function AdminSignalsPage() {
  const signals = await prisma.signal.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const directionColor: Record<SignalDirection, string> = {
    CALL: "#00e5a0",
    PUT: "#f5c518",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Сигналы</h1>
          <p className="text-xs text-[#666] mt-0.5">
            Создавай вручную, отмечай результат, управляй видимостью.
          </p>
        </div>
        <span className="text-sm text-[#666]">Последние {signals.length}</span>
      </div>

      <CreateSignalForm />

      <div
        className="rounded-2xl border overflow-hidden"
        style={{
          background: "#0d0d18",
          borderColor: "rgba(255,255,255,0.07)",
        }}
      >
        <div
          className="grid grid-cols-12 px-5 py-3 text-xs text-[#555] border-b"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}
        >
          <span className="col-span-2">Пара</span>
          <span className="col-span-1">Напр.</span>
          <span className="col-span-1">Эксп.</span>
          <span className="col-span-1">Тир</span>
          <span className="col-span-1">Уверен.</span>
          <span className="col-span-1">Результат</span>
          <span className="col-span-2">Дата</span>
          <span className="col-span-3 text-right">Действия</span>
        </div>

        {signals.length === 0 && (
          <div className="px-5 py-12 text-center text-sm text-[#555]">
            Сигналов пока нет. Создай первый через форму выше.
          </div>
        )}

        {signals.map((s: Signal) => {
          const tierBadge = TIER_BADGE[s.tier];
          return (
            <div
              key={s.id}
              className="grid grid-cols-12 px-5 py-3 items-center border-b text-sm hover:bg-white/[0.02] gap-2"
              style={{ borderColor: "rgba(255,255,255,0.04)" }}
            >
              <span
                className="col-span-2 font-mono font-bold text-xs"
                style={{ color: s.isActive ? "#aaa" : "#555" }}
              >
                {s.pair}
              </span>
              <span
                className="col-span-1 font-bold text-xs"
                style={{ color: directionColor[s.direction] }}
              >
                {s.direction}
              </span>
              <span className="col-span-1 text-[#666] text-xs">
                {s.expiration}
              </span>
              <span className="col-span-1">
                {tierBadge && (
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                    style={{
                      background: `${tierBadge.color}20`,
                      color: tierBadge.color,
                    }}
                  >
                    {tierBadge.label}
                  </span>
                )}
              </span>
              <span
                className="col-span-1 font-mono font-bold text-xs"
                style={{ color: "#f5c518" }}
              >
                {s.confidence}%
              </span>
              <span className="col-span-1">
                {s.result === "win" && (
                  <span className="text-xs text-green-400 font-semibold">
                    WIN
                  </span>
                )}
                {s.result === "loss" && (
                  <span className="text-xs text-red-400 font-semibold">
                    LOSS
                  </span>
                )}
                {s.result === "pending" && (
                  <span className="text-xs text-[#555]">pending</span>
                )}
              </span>
              <span className="col-span-2 text-[#666] text-xs">
                {new Date(s.createdAt).toLocaleString("ru-RU", {
                  day: "2-digit",
                  month: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <div className="col-span-3 flex justify-end">
                <SignalRowActions
                  id={s.id}
                  result={s.result}
                  isActive={s.isActive}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
