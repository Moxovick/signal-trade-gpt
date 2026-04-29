import { prisma } from "@/lib/prisma";
import type { Signal, SignalDirection } from "@/generated/prisma/client";

export default async function AdminSignalsPage() {
  const signals = await prisma.signal.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const directionColor: Record<SignalDirection, string> = { CALL: "#00e5a0", PUT: "#f5c518" };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Сигналы</h1>
        <span className="text-sm text-[#666]">Последние {signals.length}</span>
      </div>

      <div
        className="rounded-2xl border overflow-hidden"
        style={{ background: "#0d0d18", borderColor: "rgba(255,255,255,0.07)" }}
      >
        <div
          className="grid grid-cols-12 px-5 py-3 text-xs text-[#555] border-b"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}
        >
          <span className="col-span-2">Пара</span>
          <span className="col-span-2">Направление</span>
          <span className="col-span-2">Экспирация</span>
          <span className="col-span-2">Уверенность</span>
          <span className="col-span-2">Результат</span>
          <span className="col-span-2">Дата</span>
        </div>

        {signals.map((s: Signal) => (
          <div
            key={s.id}
            className="grid grid-cols-12 px-5 py-3 items-center border-b text-sm hover:bg-white/[0.02]"
            style={{ borderColor: "rgba(255,255,255,0.04)" }}
          >
            <span
              className="col-span-2 font-mono font-bold text-xs"
              style={{ color: "#aaa" }}
            >
              {s.pair}
            </span>
            <span
              className="col-span-2 font-bold text-xs"
              style={{ color: directionColor[s.direction] }}
            >
              {s.direction}
            </span>
            <span className="col-span-2 text-[#666] text-xs">{s.expiration}</span>
            <span
              className="col-span-2 font-mono font-bold text-xs"
              style={{ color: "#f5c518" }}
            >
              {s.confidence}%
            </span>
            <span className="col-span-2">
              {s.result === "win" && (
                <span className="text-xs text-green-400 font-semibold">WIN</span>
              )}
              {s.result === "loss" && (
                <span className="text-xs text-red-400 font-semibold">LOSS</span>
              )}
              {s.result === "pending" && (
                <span className="text-xs text-[#555]">—</span>
              )}
            </span>
            <span className="col-span-2 text-[#444] text-xs">
              {new Date(s.createdAt).toLocaleString("ru-RU", {
                day: "2-digit",
                month: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
