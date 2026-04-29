import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  const userId = (session!.user as { id: string }).id;

  const [user, signalsToday, totalSignals] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        firstName: true,
        email: true,
        subscriptionPlan: true,
        referralCode: true,
        createdAt: true,
        _count: { select: { referrals: true } },
      },
    }),
    prisma.signal.count({
      where: {
        createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        isPremium: false,
      },
    }),
    prisma.signal.count(),
  ]);

  const planColors: Record<string, string> = {
    free: "#888",
    premium: "#f5c518",
    vip: "#00e5a0",
  };

  const stats = [
    { label: "Всего сигналов", value: totalSignals.toString(), icon: "📊" },
    { label: "Сигналов сегодня", value: signalsToday.toString(), icon: "⚡" },
    { label: "Рефералов", value: user?._count.referrals.toString() ?? "0", icon: "🔗" },
    { label: "Точность (AI)", value: "87.3%", icon: "🎯" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">
          Привет, {user?.firstName ?? user?.email?.split("@")[0]} 👋
        </h1>
        <p className="text-[#666] text-sm mt-1">
          Тариф:{" "}
          <span
            className="font-semibold"
            style={{ color: planColors[user?.subscriptionPlan ?? "free"] }}
          >
            {(user?.subscriptionPlan ?? "free").toUpperCase()}
          </span>
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon }) => (
          <div
            key={label}
            className="rounded-2xl p-5 border"
            style={{ background: "#0d0d18", borderColor: "rgba(255,255,255,0.07)" }}
          >
            <div className="text-2xl mb-3">{icon}</div>
            <div
              className="text-3xl font-bold mb-1"
              style={{ fontFamily: "var(--font-jetbrains)", color: "#f5c518" }}
            >
              {value}
            </div>
            <div className="text-xs text-[#666]">{label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid md:grid-cols-2 gap-4">
        <div
          className="rounded-2xl p-6 border"
          style={{ background: "#0d0d18", borderColor: "rgba(255,255,255,0.07)" }}
        >
          <h2 className="font-semibold mb-4">Быстрые действия</h2>
          <div className="space-y-2">
            <Link
              href="/dashboard/signals"
              className="flex items-center gap-3 p-3 rounded-xl text-sm hover:bg-white/5 transition-colors"
            >
              <span className="text-lg">📊</span>
              <span>Смотреть сигналы</span>
            </Link>
            <Link
              href="/dashboard/referrals"
              className="flex items-center gap-3 p-3 rounded-xl text-sm hover:bg-white/5 transition-colors"
            >
              <span className="text-lg">🔗</span>
              <span>Партнёрская программа</span>
            </Link>
            <a
              href="https://t.me/traitsignaltsest_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-xl text-sm hover:bg-white/5 transition-colors"
            >
              <span className="text-lg">✈</span>
              <span>Открыть Telegram бот</span>
            </a>
          </div>
        </div>

        <div
          className="rounded-2xl p-6 border"
          style={{ background: "#0d0d18", borderColor: "rgba(255,255,255,0.07)" }}
        >
          <h2 className="font-semibold mb-4">Ваш тариф</h2>
          {user?.subscriptionPlan === "free" ? (
            <div>
              <p className="text-sm text-[#666] mb-4">
                На Free-тарифе вы получаете 3-5 сигналов в день. Обновитесь до Premium для
                доступа к 15-25 сигналам.
              </p>
              <Link
                href="/pricing"
                className="inline-block px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                style={{ background: "#f5c518", color: "#07070d" }}
              >
                Обновить до Premium →
              </Link>
            </div>
          ) : (
            <div>
              <p className="text-sm text-[#888]">
                Тариф активен до:{" "}
                <span className="text-[#f5c518]">∞</span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-[#444] border-t pt-4" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        Signal Trade GPT не является финансовым советником. Все сигналы предоставляются в
        информационных целях. Торговля бинарными опционами сопряжена с высоким риском потери
        средств. Прошлые результаты не гарантируют будущей доходности.
      </p>
    </div>
  );
}
