"use client";

/**
 * Dashboard hero — surfaces the user's current tier, PO trader ID, personal
 * referral link, and progress bar to next tier (Free->Basic->Pro).
 */
import { useState } from "react";
import { Copy, Check, ExternalLink, ShieldCheck, Sparkles } from "lucide-react";
import { TierBadge } from "@/components/ui/TierBadge";
import { TIER_LABELS } from "@/lib/tier";

type Props = {
  tier: number;
  poTraderId: string | null;
  poStatus: "verified" | "pending" | "rejected" | null;
  referralUrl: string;
  depositTotal: number;
  /** Threshold for the next tier (Basic or Pro). */
  nextThreshold: number | null;
  dailyLimit: number | null;
  signalsRemaining: number | null;
};

function formatUsd(n: number): string {
  return `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export function TierHero({
  tier,
  poTraderId,
  poStatus,
  referralUrl,
  depositTotal,
  nextThreshold,
  dailyLimit,
  signalsRemaining,
}: Props) {
  const [copied, setCopied] = useState<"link" | "id" | null>(null);

  const isPro = tier >= 2;
  const hasNextTier = nextThreshold !== null;
  const remaining = hasNextTier ? Math.max(0, nextThreshold - depositTotal) : 0;
  const progressPct = hasNextTier
    ? Math.min(100, Math.round((depositTotal / nextThreshold) * 100))
    : 100;
  const nextTierLabel = tier === 0 ? "Базового" : tier === 1 ? "Про" : null;

  async function copy(label: "link" | "id", value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      setTimeout(() => setCopied((cur) => (cur === label ? null : cur)), 1500);
    } catch {
      // Browser refused (e.g. http context). Silently no-op.
    }
  }

  return (
    <div
      className="rounded-3xl p-6 md:p-7 border relative overflow-hidden"
      style={{
        borderColor: isPro
          ? "rgba(245,232,192,0.40)"
          : "var(--b-soft)",
        background: isPro
          ? "linear-gradient(135deg, rgba(212,160,23,0.10), rgba(245,232,192,0.04) 60%, transparent)"
          : "var(--bg-1)",
      }}
    >
      <div className="grid md:grid-cols-[1fr_auto] gap-6 items-start">
        <div className="space-y-4 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <TierBadge tier={tier} size="md" />
            {isPro ? (
              <span className="inline-flex items-center gap-1 text-xs text-[var(--brand-gold-bright)] font-semibold">
                <Sparkles size={12} /> Полный доступ ко всем сигналам
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs text-[var(--t-2)]">
                <ShieldCheck size={12} className="text-[var(--brand-gold)]" />
                {dailyLimit != null
                  ? `${signalsRemaining ?? dailyLimit}/${dailyLimit} сигналов сегодня`
                  : "Безлимит сигналов"}
              </span>
            )}
          </div>

          <div>
            {poTraderId ? (
              <div className="flex items-baseline gap-3 flex-wrap">
                <div className="text-xs uppercase tracking-wider text-[var(--t-3)]">
                  PocketOption ID
                </div>
                <button
                  type="button"
                  onClick={() => copy("id", poTraderId)}
                  className="inline-flex items-center gap-2 text-lg font-bold text-[var(--brand-gold)] hover:text-[var(--brand-gold-bright)] transition-colors"
                  style={{ fontFamily: "var(--font-jetbrains)" }}
                  title="Скопировать"
                >
                  #{poTraderId}
                  {copied === "id" ? <Check size={14} /> : <Copy size={14} />}
                </button>
                {poStatus === "verified" && (
                  <span className="text-[10px] uppercase tracking-wider text-[var(--green)] bg-[rgba(142,224,107,0.10)] px-2 py-0.5 rounded-full">
                    verified
                  </span>
                )}
                {poStatus === "pending" && (
                  <span className="text-[10px] uppercase tracking-wider text-[var(--brand-gold)] bg-[rgba(212,160,23,0.10)] px-2 py-0.5 rounded-full">
                    pending
                  </span>
                )}
              </div>
            ) : (
              <div className="text-sm text-[var(--t-3)]">
                PO-аккаунт ещё не привязан.
              </div>
            )}
          </div>

          {hasNextTier && (
            <div className="space-y-2">
              <div className="flex items-baseline justify-between gap-3 flex-wrap">
                <div className="text-sm text-[var(--t-2)]">
                  До {nextTierLabel} осталось{" "}
                  <span
                    className="text-[var(--brand-gold-bright)] font-semibold"
                    style={{ fontFamily: "var(--font-jetbrains)" }}
                  >
                    {formatUsd(remaining)}
                  </span>{" "}
                  депозита
                </div>
                <div
                  className="text-xs text-[var(--t-3)] tabular-nums"
                  style={{ fontFamily: "var(--font-jetbrains)" }}
                >
                  {formatUsd(depositTotal)} / {formatUsd(nextThreshold)}
                </div>
              </div>
              <div className="h-2 rounded-full bg-[var(--bg-2)] overflow-hidden">
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${progressPct}%`,
                    background:
                      "linear-gradient(90deg, var(--brand-gold-deep), var(--brand-gold-bright))",
                  }}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div className="text-xs uppercase tracking-wider text-[var(--t-3)]">
              Твоя персональная ссылка
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-[var(--bg-2)] border border-[var(--b-soft)] px-3 py-2">
              <code
                className="flex-1 text-xs truncate text-[var(--t-2)]"
                style={{ fontFamily: "var(--font-jetbrains)" }}
                title={referralUrl}
              >
                {referralUrl}
              </code>
              <button
                type="button"
                onClick={() => copy("link", referralUrl)}
                className="shrink-0 inline-flex items-center gap-1 text-xs text-[var(--brand-gold)] hover:text-[var(--brand-gold-bright)] transition-colors"
              >
                {copied === "link" ? <Check size={14} /> : <Copy size={14} />}
                {copied === "link" ? "Скопировано" : "Копировать"}
              </button>
            </div>
            <p className="text-[11px] text-[var(--t-3)]">
              Каждый, кто зарегистрируется по этой ссылке, станет твоим рефералом.
            </p>
          </div>
        </div>

        <div className="flex md:flex-col gap-2 md:min-w-[180px]">
          <a
            href={referralUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full text-sm font-semibold bg-[var(--brand-gold)] text-[#1a1208] hover:bg-[var(--brand-gold-bright)] shadow-[0_0_24px_rgba(212,160,23,0.35)] transition-all"
          >
            Открыть PocketOption
            <ExternalLink size={14} />
          </a>
          {hasNextTier && (
            <a
              href={referralUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full text-sm bg-transparent text-[var(--brand-gold)] border border-[var(--b-hard)] hover:border-[var(--b-glow)] hover:bg-[rgba(212,160,23,0.05)] transition-all"
            >
              Пополнить → {TIER_LABELS[tier + 1] ?? "Про"}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
