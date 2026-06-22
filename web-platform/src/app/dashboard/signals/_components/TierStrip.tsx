"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { TierBadge } from "@/components/ui/TierBadge";
import { useI18n } from "@/lib/i18n/context";

type Props = {
  tier: number;
  depositTotal: number;
  nextThreshold: number | null;
  dailyLimit: number | null;
  signalsRemaining: number | null;
};

export function TierStrip({ tier, depositTotal, nextThreshold, dailyLimit, signalsRemaining }: Props) {
  const { t } = useI18n();
  const isPro = tier >= 2;
  const hasNextTier = nextThreshold !== null;
  const remaining = hasNextTier ? Math.max(0, nextThreshold - depositTotal) : 0;
  const progressPct = hasNextTier
    ? Math.min(100, Math.round((depositTotal / nextThreshold) * 100))
    : 100;
  const nextLabel = tier === 0 ? "Basic" : tier === 1 ? "Pro" : null;

  return (
    <div
      className="flex items-center gap-3 rounded-xl border px-4 py-2.5"
      style={{
        borderColor: isPro ? "rgba(245,232,192,0.30)" : "var(--b-soft)",
        background: isPro
          ? "linear-gradient(135deg, rgba(212,160,23,0.08), transparent 60%)"
          : "var(--bg-1)",
        maxHeight: 48,
      }}
    >
      <TierBadge tier={tier} size="sm" />

      {isPro ? (
        <span className="flex-1 text-xs text-[var(--t-2)]">
          {t.tierStrip.fullAccess}
        </span>
      ) : (
        <div className="flex flex-1 items-center gap-3 min-w-0">
          {dailyLimit != null && (
            <span className="text-xs text-[var(--t-2)] whitespace-nowrap">
              {signalsRemaining ?? dailyLimit}/{dailyLimit}
            </span>
          )}
          {hasNextTier && (
            <>
              <div className="w-20 shrink-0">
                <div className="h-1.5 rounded-full bg-[var(--bg-2)] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${progressPct}%`,
                      background:
                        "linear-gradient(90deg, var(--brand-gold-deep), var(--brand-gold-bright))",
                    }}
                  />
                </div>
              </div>
              <span
                className="text-xs text-[var(--t-2)] whitespace-nowrap"
                style={{ fontFamily: "var(--font-jetbrains)" }}
              >
                ${remaining} до {nextLabel}
              </span>
            </>
          )}
        </div>
      )}

      <Link
        href="/dashboard/pocket-option"
        className="inline-flex items-center gap-0.5 text-xs text-[var(--brand-gold)] hover:text-[var(--brand-gold-bright)] transition-colors whitespace-nowrap shrink-0"
      >
        {isPro ? t.tierStrip.account : t.tierStrip.details}
        <ChevronRight size={14} />
      </Link>
    </div>
  );
}
