"use client";

import { Activity, ChevronRight, Flame, User2, Users } from "lucide-react";
import { TmaShell, type TmaUser } from "../_components/TmaShell";

const BOT_URL = process.env["NEXT_PUBLIC_BOT_URL"] ?? "";

export default function TmaProfilePage() {
  return <TmaShell>{(user) => <Profile user={user} />}</TmaShell>;
}

function Profile({ user }: { user: TmaUser }) {
  const name =
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    user.username ||
    "Трейдер";

  const level = user.tier >= 2 ? "Про" : user.tier === 1 ? "Базовый" : "Бесплатный";
  const levelColor = user.tier >= 2 ? "var(--brand-gold)" : user.tier === 1 ? "var(--brand-gold-deep)" : "var(--t-2)";

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
          <div className="text-[10px] uppercase tracking-wider text-[var(--t-3)]">Уровень</div>
          <div className="text-sm font-bold" style={{ color: levelColor }}>{level}</div>
        </div>
      </header>

      {/* Stats row */}
      <section className="grid grid-cols-3 gap-2">
        <Stat label="Сигналов" value={String(user.signalsReceived)} icon={Activity} />
        <Stat label="Стрик" value={`${user.streakDays} дн`} icon={Flame} />
        <Stat label="Рефералы" value={String(user.referralsCount)} icon={Users} />
      </section>

      {/* PocketOption account */}
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
                  {user.poAccount.status === "verified" ? "подтверждён" : "ожидание"}
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
              <div className="text-[var(--t-1)]">Привязать PocketOption ID</div>
              <div className="text-xs text-[var(--t-3)]">Нужно для получения сигналов</div>
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
          <div className="text-[var(--t-1)] font-semibold">Открыть Telegram-бот</div>
          <div className="text-xs text-[var(--t-3)]">Управление, настройки, уведомления</div>
        </div>
        <ChevronRight size={16} className="text-[var(--t-3)]" />
      </a>
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
