/**
 * Dashboard — Signals page (on-demand model).
 *
 * Users press "Получить сигнал" to request a signal on-demand.
 * Shows daily limit usage, signal history, and tier info.
 */
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAccessReport } from "@/lib/access";
import { TIER_LABELS } from "@/lib/tier";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { buildReferralLink } from "@/lib/pocketoption";
import { Activity } from "lucide-react";
import { SignalRequestButton } from "./_components/SignalRequestButton";
import { SignalHistoryList } from "./_components/SignalHistoryList";
import { SpaceBackground } from "./_components/SpaceBackground";
import { getDictionaryForUser } from "@/lib/i18n";

export default async function SignalsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const [report, referralUrl] = await Promise.all([
    getAccessReport(userId),
    buildReferralLink(userId),
  ]);
  if (!report) redirect("/login");
  const t = await getDictionaryForUser(userId);
  const tier = report.tier;
  // Fetch user's own signals (on-demand model: each user sees their own)
  const signals = await prisma.signal.findMany({
    where: {
      createdById: userId,
      isActive: true,
    },
    orderBy: { createdAt: "desc" },
    take: 60,
  });

  const dailyLimit = report.dailySignalLimit;
  const used = report.signalsTodayUsed;
  const remaining = dailyLimit != null ? Math.max(0, dailyLimit - used) : null;
  const limitReached = dailyLimit != null && used >= dailyLimit;

  const tierLabel = TIER_LABELS[tier] ?? `T${tier}`;

  return (
    <div className="relative">
      <SpaceBackground />

      <div className="relative z-10 space-y-6">
      {/* Page header */}
      <div>
        <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--brand-gold)] mb-1">
          {t.signals.pageLabel}
        </p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{t.signals.pageTitle}</h1>
      </div>

      {/* Signal request — daily usage bar + pair picker (no Card wrapper) */}
      <div>
        <div style={{ marginBottom: 12 }}>
          {dailyLimit != null ? (
            <div className="flex items-center gap-2 text-sm text-[var(--t-2)]">
              <Activity size={16} className="text-[var(--brand-gold)]" />
              <span>
                {t.signals.usedOf}{" "}
                <span className="font-bold text-[var(--t-1)]">{used}</span>
                {" "}{t.signals.of}{" "}
                <span className="font-bold text-[var(--t-1)]">{dailyLimit}</span>
                {" "}{t.signals.signalsToday}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-[var(--t-2)]">
              <Activity size={16} className="text-[var(--brand-gold)]" />
              <span>
                {t.signals.receivedToday}{" "}
                <span className="font-bold text-[var(--t-1)]">{used}</span>
              </span>
              <span
                className="text-[10px] font-semibold uppercase tracking-widest px-2.5 py-0.5 rounded-full"
                style={{
                  background: "rgba(212,160,23,0.12)",
                  color: "var(--brand-gold)",
                }}
              >
                {t.signals.unlimited}
              </span>
            </div>
          )}

          {dailyLimit != null && (
            <div style={{ maxWidth: 320, marginTop: 8 }}>
              <div className="h-1.5 rounded-full bg-[var(--bg-2)] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (used / dailyLimit) * 100)}%`,
                    background: limitReached
                      ? "var(--red)"
                      : "linear-gradient(90deg, var(--brand-gold-deep), var(--brand-gold-bright))",
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <SignalRequestButton
          limitReached={limitReached}
          remaining={remaining}
          tierLabel={tierLabel}
          referralUrl={referralUrl}
          tier={tier}
        />

        {limitReached && (
          <div className="mt-3 space-y-1">
            <p className="text-sm text-[var(--red)]">
              {t.signals.limitReached}
            </p>
            <p className="text-xs text-[var(--t-3)]">
              {t.signals.limitResetAt}
              {tier < 2 && (
                <>{" "}{t.signals.upgradeHint}</>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Signal history */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-[var(--t-1)]">
            {t.signals.yourSignals}
          </h2>
          <span className="text-xs text-[var(--t-3)]">
            {signals.length} {t.signals.records}
          </span>
        </div>

        {signals.length === 0 ? (
          <Card padding="lg">
            <div className="flex flex-col items-center py-12 text-center">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: "rgba(212,160,23,0.08)", border: "1px solid var(--b-soft)" }}
              >
                <Activity size={28} className="text-[var(--brand-gold)] opacity-60" />
              </div>
              <h3 className="text-lg font-semibold mb-1">{t.signals.noSignalsTitle}</h3>
              <p className="text-sm text-[var(--t-2)] max-w-xs">
                {t.signals.noSignalsDesc}
              </p>
            </div>
          </Card>
        ) : (
          <SignalHistoryList
            signals={signals.map((s) => ({
              id: s.id,
              pair: s.pair,
              direction: s.direction as "CALL" | "PUT",
              confidence: s.confidence ? Number(s.confidence) : null,
              tier: s.tier,
              result: s.result,
              expiration: s.expiration,
              analysis: s.analysis,
              chartData: s.chartData as {
                candles: Array<{ time: number; open: number; high: number; low: number; close: number }>;
                indicators: { rsi: number; ema20: number; ema50: number };
                levels: { support: number; resistance: number };
                entryPrice: number;
                source?: string;
              } | null,
              createdAt: s.createdAt.toISOString(),
            }))}
          />
        )}
      </div>
      </div>
    </div>
  );
}
