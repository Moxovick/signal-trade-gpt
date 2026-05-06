"use client";

import {
  CheckCircle2,
  XCircle,
  KeyRound,
  Mail,
  ShieldCheck,
  Clock,
} from "lucide-react";

type Event = {
  id: string;
  kind:
    | "login_ok"
    | "login_fail"
    | "password_change"
    | "email_change"
    | "otp_sent"
    | "otp_verified"
    | "otp_expired";
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
};

const META: Record<
  Event["kind"],
  { label: string; icon: typeof CheckCircle2; color: string }
> = {
  login_ok: {
    label: "Успешный вход",
    icon: CheckCircle2,
    color: "var(--green)",
  },
  login_fail: {
    label: "Неудачный вход",
    icon: XCircle,
    color: "var(--red)",
  },
  password_change: {
    label: "Смена пароля",
    icon: KeyRound,
    color: "var(--brand-gold)",
  },
  email_change: {
    label: "Смена email",
    icon: Mail,
    color: "var(--brand-gold)",
  },
  otp_sent: {
    label: "Код отправлен",
    icon: Mail,
    color: "var(--t-2)",
  },
  otp_verified: {
    label: "Код подтверждён",
    icon: ShieldCheck,
    color: "var(--green)",
  },
  otp_expired: {
    label: "Код просрочен",
    icon: Clock,
    color: "var(--t-3)",
  },
};

function shortUA(ua: string | null): string {
  if (!ua) return "неизвестно";
  if (/mobile|android|iphone/i.test(ua)) return "Мобильный";
  if (/chrome/i.test(ua)) return "Chrome";
  if (/firefox/i.test(ua)) return "Firefox";
  if (/safari/i.test(ua)) return "Safari";
  if (/edge/i.test(ua)) return "Edge";
  return ua.slice(0, 40);
}

export function LoginLog({ events }: { events: Event[] }) {
  if (events.length === 0) {
    return (
      <div className="text-sm text-[var(--t-3)] text-center py-6">
        Пока событий нет.
      </div>
    );
  }
  return (
    <div className="space-y-1">
      {events.map((e) => {
        const meta = META[e.kind];
        const Icon = meta.icon;
        const d = new Date(e.createdAt);
        return (
          <div
            key={e.id}
            className="flex items-center gap-3 py-2 border-b border-[var(--b-soft)] last:border-0 text-sm"
          >
            <Icon
              size={14}
              style={{ color: meta.color }}
              className="shrink-0"
            />
            <span className="font-medium w-48 shrink-0">{meta.label}</span>
            <span className="text-[var(--t-3)] text-[12px] truncate flex-1">
              {shortUA(e.userAgent)} · {e.ip ?? "—"}
            </span>
            <span className="text-[var(--t-3)] text-[12px] tabular-nums">
              {d.toLocaleString("ru-RU", {
                dateStyle: "short",
                timeStyle: "short",
              })}
            </span>
          </div>
        );
      })}
    </div>
  );
}
