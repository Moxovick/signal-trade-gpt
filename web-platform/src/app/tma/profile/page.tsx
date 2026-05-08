"use client";

import { Activity, ChevronRight, Copy, Flame, Trophy, User2 } from "lucide-react";
import { TmaShell, type TmaUser } from "../_components/TmaShell";

const TIER_NAMES: Record<number, string> = {
  0: "Demo",
  1: "Starter ($100)",
  2: "Trader ($500)",
  3: "Pro ($2000)",
  4: "Elite ($10000)",
};

export default function TmaProfilePage() {
  return <TmaShell>{(user) => <Profile user={user} />}</TmaShell>;
}

function Profile({ user }: { user: TmaUser }) {
  const name =
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    user.username ||
    "Трейдер";

  function copyRef() {
    const link = `https://signal-trade-gpt.vercel.app/?ref=${encodeURIComponent(user.referralCode)}`;
    void navigator.clipboard?.writeText(link).catch(() => undefined);
  }

  return (
    <main className="max-w-md mx-auto p-4 space-y-4">
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
        <div className="rounded-xl border border-[var(--brand-gold)]/30 bg-[var(--brand-gold)]/8 px-3 py-2 text-right">
          <div className="text-[10px] uppercase tracking-wider text-[var(--t-3)]">Тир</div>
          <div className="text-base font-bold text-[var(--brand-gold)]">T{user.tier}</div>
        </div>
      </header>

      <section className="grid grid-cols-3 gap-2">
        <Stat label="Сигналов" value={String(user.signalsReceived)} icon={Activity} />
        <Stat label="Стрик" value={`${user.streakDays} дн`} icon={Flame} />
        <Stat
          label="Депозит"
          value={`$${Math.round(Number(user.depositTotal))}`}
          icon={Trophy}
        />
      </section>

      <section className="rounded-2xl border border-[var(--b-soft)] bg-[var(--bg-1)] p-4">
        <div className="text-[10px] uppercase tracking-wider text-[var(--t-3)] mb-1">Тариф</div>
        <div className="text-base font-bold text-[var(--t-1)]">{TIER_NAMES[user.tier]}</div>
        <p className="text-xs text-[var(--t-3)] mt-1 leading-relaxed">
          Тир открывается депозитами в PocketOption. Чем выше тир — тем больше сигналов и пар.
        </p>
      </section>

      <section className="rounded-2xl border border-[var(--b-soft)] bg-[var(--bg-1)] p-4">
        <div className="text-[10px] uppercase tracking-wider text-[var(--t-3)] mb-1">
          PocketOption
        </div>
        {user.poAccount ? (
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-mono text-[var(--t-1)]">
                ID {user.poAccount.poTraderId}
              </div>
              <div className="text-xs text-[var(--t-3)]">
                Депозит: ${Math.round(Number(user.poAccount.totalDeposit))} ·{" "}
                <span
                  className={
                    user.poAccount.status === "verified"
                      ? "text-[var(--green)]"
                      : "text-[var(--brand-gold)]"
                  }
                >
                  {user.poAccount.status}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <a
            href="https://signal-trade-gpt.vercel.app/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between gap-3"
          >
            <div className="text-sm">
              <div className="text-[var(--t-1)]">Привязать PocketOption ID</div>
              <div className="text-xs text-[var(--t-3)]">Без него тир остаётся T0</div>
            </div>
            <ChevronRight size={16} className="text-[var(--t-3)]" />
          </a>
        )}
      </section>

      <section className="rounded-2xl border border-[var(--b-soft)] bg-[var(--bg-1)] p-4">
        <div className="text-[10px] uppercase tracking-wider text-[var(--t-3)] mb-1">
          Реферальный код
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-mono font-semibold text-[var(--brand-gold)]">
            {user.referralCode}
          </div>
          <button
            type="button"
            onClick={copyRef}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-[var(--b-soft)] hover:border-[var(--b-hard)] text-[var(--t-2)]"
          >
            <Copy size={12} />
            Копировать ссылку
          </button>
        </div>
      </section>
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
