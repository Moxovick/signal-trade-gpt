"use client";

import { useState } from "react";
import { Activity, ChevronRight, Flame, Globe, User2, Users } from "lucide-react";
import { TmaShell, type TmaUser } from "../_components/TmaShell";
import { useTma } from "../_components/TmaProvider";
import { DEFAULT_TIER_THRESHOLDS, TIER_LABELS } from "@/lib/tier-constants";
import { useI18n, useLocale } from "@/lib/i18n/context";

const BOT_URL = process.env["NEXT_PUBLIC_BOT_URL"] ?? "";

export default function TmaProfilePage() {
  return <TmaShell>{(user) => <Profile user={user} />}</TmaShell>;
}

function Profile({ user }: { user: TmaUser }) {
  const { t } = useI18n();
  const name =
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    user.username ||
    t.tma.profile.defaultName;

  const level = user.tier >= 2 ? t.tma.profile.levelLabels.pro : user.tier === 1 ? t.tma.profile.levelLabels.basic : t.tma.profile.levelLabels.free;
  const levelColor = user.tier >= 2 ? "var(--brand-gold)" : user.tier === 1 ? "var(--brand-gold-deep)" : "var(--t-2)";

  const depositTotal = user.poAccount ? Math.round(Number(user.poAccount.totalDeposit)) : 0;
  const nextTierKey = (user.tier + 1) as 1 | 2 | 3 | 4;
  const nextThreshold = nextTierKey <= 4 ? DEFAULT_TIER_THRESHOLDS[nextTierKey] : null;
  const hasNextTier = nextThreshold !== null && nextThreshold < Number.MAX_SAFE_INTEGER;
  const neededForNext = hasNextTier ? Math.max(0, nextThreshold - depositTotal) : 0;

  return (
    <main className="max-w-md mx-auto p-4 space-y-4 pb-6">
      {/* Avatar + name */}
      <header className="flex items-center gap-3 pt-2">
        {user.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.avatar}
            alt={name}
            className="size-14 rounded-2xl object-cover border border-[var(--b-soft)]"
          />
        ) : (
          <div className="size-14 rounded-2xl bg-[var(--bg-2)] border border-[var(--b-soft)] flex items-center justify-center text-[var(--brand-gold)]">
            <User2 size={24} />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-bold truncate">{name}</h1>
          {user.username && (
            <div className="text-xs text-[var(--t-3)]">@{user.username}</div>
          )}
        </div>
        <div className="rounded-xl border border-[var(--b-soft)] bg-[var(--bg-1)] px-3 py-2 text-right">
          <div className="text-[10px] uppercase tracking-wider text-[var(--t-3)]">{t.tma.profile.level}</div>
          <div className="text-sm font-bold" style={{ color: levelColor }}>{level}</div>
          {hasNextTier ? (
            <div className="text-[10px] text-[var(--brand-gold)] mt-0.5">
              {t.tma.profile.untilTier} {TIER_LABELS[nextTierKey] ?? `Tier ${nextTierKey}`}: ${neededForNext}
            </div>
          ) : user.tier >= 2 ? (
            <div className="text-[10px] text-[var(--green)] mt-0.5">{t.tma.profile.maxLevel}</div>
          ) : null}
        </div>
      </header>

      {/* Stats row */}
      <section className="grid grid-cols-3 gap-2">
        <Stat label={t.tma.profile.signals} value={String(user.signalsReceived)} icon={Activity} />
        <Stat label={t.tma.profile.streak} value={`${user.streakDays} ${t.tma.profile.daysShort}`} icon={Flame} />
        <Stat label={t.tma.profile.referrals} value={String(user.referralsCount)} icon={Users} />
      </section>

      {/* PocketOption account */}
      <section className="rounded-2xl border border-[var(--b-soft)] bg-[var(--bg-1)] p-4">
        <div className="text-[10px] uppercase tracking-wider text-[var(--t-3)] mb-1">
          {t.tma.profile.pocketOption.title}
        </div>
        {user.poAccount ? (
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-mono text-[var(--t-1)]">
                ID {user.poAccount.poTraderId}
              </div>
              <div className="text-xs text-[var(--t-3)]">
                {t.tma.profile.pocketOption.deposit} ${Math.round(Number(user.poAccount.totalDeposit))} ·{" "}
                <span
                  className={
                    user.poAccount.status === "verified"
                      ? "text-[var(--green)]"
                      : "text-[var(--brand-gold)]"
                  }
                >
                  {user.poAccount.status === "verified" ? t.tma.profile.pocketOption.confirmed : t.tma.profile.pocketOption.pending}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <a
            href={`${process.env["NEXT_PUBLIC_APP_URL"] ?? ""}/dashboard`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between gap-3"
          >
            <div className="text-sm">
              <div className="text-[var(--t-1)]">{t.tma.profile.linkPo.label}</div>
              <div className="text-xs text-[var(--t-3)]">{t.tma.profile.linkPo.hint}</div>
            </div>
            <ChevronRight size={16} className="text-[var(--t-3)]" />
          </a>
        )}
      </section>

      {/* Open bot */}
      <a
        href={BOT_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--b-soft)] bg-[var(--bg-1)] p-4"
      >
        <div className="text-sm">
          <div className="text-[var(--t-1)] font-semibold">{t.tma.profile.bot.label}</div>
          <div className="text-xs text-[var(--t-3)]">{t.tma.profile.bot.hint}</div>
        </div>
        <ChevronRight size={16} className="text-[var(--t-3)]" />
      </a>

      {/* Language */}
      <TmaLanguagePicker />
    </main>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}) {
  return (
    <div className="rounded-xl bg-[var(--bg-1)] border border-[var(--b-soft)] px-3 py-3">
      <Icon size={14} className="text-[var(--brand-gold)] mb-1" />
      <div className="text-[10px] uppercase tracking-wider text-[var(--t-3)]">{label}</div>
      <div className="text-sm font-bold text-[var(--t-1)] mt-0.5">{value}</div>
    </div>
  );
}

function TmaLanguagePicker() {
  const { t } = useI18n();
  const locale = useLocale();
  const { tmaFetch } = useTma();
  const [busy, setBusy] = useState(false);

  const lang = t.tma?.profile?.language ?? { title: "Язык", ru: "RU", uk: "UK" };

  async function pick(next: "ru" | "uk") {
    if (next === locale || busy) return;
    setBusy(true);
    try {
      await tmaFetch("/api/tma/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: next }),
      });
      window.location.reload();
    } catch {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-2xl border border-[var(--b-soft)] bg-[var(--bg-1)] p-4">
      <div className="flex items-center gap-2 mb-3">
        <Globe size={14} className="text-[var(--brand-gold)]" />
        <span className="text-[10px] uppercase tracking-wider text-[var(--t-3)]">
          {lang.title}
        </span>
      </div>
      <div className="flex gap-2">
        {(["ru", "uk"] as const).map((l) => (
          <button
            key={l}
            onClick={() => pick(l)}
            disabled={busy}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              locale === l
                ? "bg-[var(--brand-gold)] text-[#1a1208]"
                : "bg-[var(--bg-2)] border border-[var(--b-soft)] text-[var(--t-2)] hover:border-[var(--brand-gold)]"
            } disabled:opacity-50`}
          >
            {lang[l]}
          </button>
        ))}
      </div>
    </section>
  );
}
