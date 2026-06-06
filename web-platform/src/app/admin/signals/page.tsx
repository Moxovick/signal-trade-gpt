/**
 * /admin/signals — on-demand signal model admin page.
 *
 * - Signal history/log (read-only list of all generated signals)
 * - Per-tier settings: daily limits, allowed signal types
 * - Signal statistics (total generated today, per tier breakdown)
 */
import { prisma } from "@/lib/prisma";
import type { Signal, SignalDirection } from "@/generated/prisma/client";
import { SignalRowActions } from "./_components/SignalRowActions";
import { TierSignalSettings } from "./_components/TierSignalSettings";

export const dynamic = "force-dynamic";

const TIER_BADGE: Record<string, { label: string; color: string }> = {
  otc: { label: "OTC", color: "#8888ff" },
  exchange: { label: "Биржа", color: "#00e5a0" },
  elite: { label: "Elite", color: "#f5c518" },
};

export default async function AdminSignalsPage() {
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);

  const [signals, todaySignals, tierSettings] = await Promise.all([
    prisma.signal.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        createdBy: { select: { username: true, firstName: true, tier: true } },
      },
    }),
    prisma.signal.findMany({
      where: { createdAt: { gte: startOfDay } },
      select: { tier: true, createdById: true },
    }),
    prisma.siteSettings.findUnique({
      where: { key: "on_demand_signal_config" },
    }),
  ]);

  const todayTotal = todaySignals.length;
  const todayByTier = {
    otc: todaySignals.filter((s) => s.tier === "otc").length,
    exchange: todaySignals.filter((s) => s.tier === "exchange").length,
    elite: todaySignals.filter((s) => s.tier === "elite").length,
  };
  const todayUniqueUsers = new Set(
    todaySignals.filter((s) => s.createdById).map((s) => s.createdById),
  ).size;

  const directionColor: Record<SignalDirection, string> = {
    CALL: "#00e5a0",
    PUT: "#f5c518",
  };

  type OnDemandConfig = {
    dailyLimits: Record<string, number | null>;
    allowedTypes: Record<string, string[]>;
    proFrequencySeconds: number;
  };

  const defaultConfig: OnDemandConfig = {
    dailyLimits: { "0": 3, "1": 10, "2": null },
    allowedTypes: {
      "0": ["otc"],
      "1": ["otc", "exchange"],
      "2": ["otc", "exchange", "elite"],
    },
    proFrequencySeconds: 0,
  };

  const config: OnDemandConfig = tierSettings?.value
    ? { ...defaultConfig, ...(tierSettings.value as Partial<OnDemandConfig>) }
    : defaultConfig;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Сигналы</h1>
          <p className="text-xs text-[#666] mt-0.5">
            On-demand модель: пользователи запрашивают сигналы по кнопке.
          </p>
        </div>
        <span className="text-sm text-[#666]">Последние {signals.length}</span>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Сегодня всего", value: todayTotal.toString() },
          { label: "OTC", value: todayByTier.otc.toString(), color: "#8888ff" },
          { label: "Биржа", value: todayByTier.exchange.toString(), color: "#00e5a0" },
          { label: "Elite", value: todayByTier.elite.toString(), color: "#f5c518" },
          { label: "Уникальных юзеров", value: todayUniqueUsers.toString() },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border p-4"
            style={{
              background: "#0d0d18",
              borderColor: "rgba(255,255,255,0.07)",
            }}
          >
            <p className="text-xs text-[#666]">{stat.label}</p>
            <p
              className="text-2xl font-bold mt-1"
              style={{ color: stat.color ?? "#fff" }}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Tier signal settings */}
      <TierSignalSettings initial={config} />

      {/* Signal history */}
      <div
        className="rounded-2xl border overflow-hidden"
        style={{
          background: "#0d0d18",
          borderColor: "rgba(255,255,255,0.07)",
        }}
      >
        <div className="px-5 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <h2 className="text-sm font-semibold">История сигналов</h2>
          <p className="text-xs text-[#555] mt-0.5">
            Все сигналы, сгенерированные по запросу пользователей.
          </p>
        </div>

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
          <span className="col-span-2">Юзер</span>
          <span className="col-span-2">Дата</span>
          <span className="col-span-1 text-right">Действия</span>
        </div>

        {signals.length === 0 && (
          <div className="px-5 py-12 text-center text-sm text-[#555]">
            Сигналов пока нет. Они появятся, когда пользователи начнут запрашивать.
          </div>
        )}

        {signals.map((s: Signal & { createdBy: { username: string | null; firstName: string | null; tier: number } | null }) => {
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
                  <span className="text-xs text-green-400 font-semibold">WIN</span>
                )}
                {s.result === "loss" && (
                  <span className="text-xs text-red-400 font-semibold">LOSS</span>
                )}
                {s.result === "pending" && (
                  <span className="text-xs text-[#555]">pending</span>
                )}
              </span>
              <span className="col-span-2 text-[#666] text-xs truncate">
                {s.createdBy?.username ?? s.createdBy?.firstName ?? "—"}
                {s.createdBy ? (
                  <span className="ml-1 text-[10px] text-[#444]">
                    T{s.createdBy.tier}
                  </span>
                ) : null}
              </span>
              <span className="col-span-2 text-[#666] text-xs">
                {new Date(s.createdAt).toLocaleString("ru-RU", {
                  day: "2-digit",
                  month: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <div className="col-span-1 flex justify-end">
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
