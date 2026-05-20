"use client";

import {
  CheckCircle2,
  XCircle,
  KeyRound,
  Mail,
  ShieldCheck,
  Clock,
  MonitorSmartphone,
  Smartphone,
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
  { label: string; icon: typeof CheckCircle2; color: string; bg: string }
> = {
  login_ok: {
    label: "Успешный вход",
    icon: CheckCircle2,
    color: "var(--green)",
    bg: "rgba(142,224,107,0.10)",
  },
  login_fail: {
    label: "Неудачный вход",
    icon: XCircle,
    color: "var(--red)",
    bg: "rgba(255,107,61,0.10)",
  },
  password_change: {
    label: "Смена пароля",
    icon: KeyRound,
    color: "var(--brand-gold)",
    bg: "rgba(212,160,23,0.10)",
  },
  email_change: {
    label: "Смена email",
    icon: Mail,
    color: "var(--brand-gold)",
    bg: "rgba(212,160,23,0.10)",
  },
  otp_sent: {
    label: "Код отправлен",
    icon: Mail,
    color: "var(--t-2)",
    bg: "var(--bg-3)",
  },
  otp_verified: {
    label: "Код подтверждён",
    icon: ShieldCheck,
    color: "var(--green)",
    bg: "rgba(142,224,107,0.10)",
  },
  otp_expired: {
    label: "Код просрочен",
    icon: Clock,
    color: "var(--t-3)",
    bg: "var(--bg-3)",
  },
};

function shortUA(ua: string | null): {
  browser: string;
  isMobile: boolean;
} {
  if (!ua) return { browser: "Неизвестно", isMobile: false };
  const isMobile = /mobile|android|iphone/i.test(ua);
  let browser = "Браузер";
  if (/chrome\/[\d.]+/i.test(ua) && !/edg\//i.test(ua)) browser = "Chrome";
  else if (/firefox/i.test(ua)) browser = "Firefox";
  else if (/edg\//i.test(ua)) browser = "Edge";
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = "Safari";
  else if (isMobile) browser = "Мобильный браузер";
  return { browser, isMobile };
}

function formatRelativeDate(iso: string): string {
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const diffH = Math.floor(diffMs / 3_600_000);
  if (diffH < 1) return "Только что";
  if (diffH < 24) return `${diffH} ч. назад`;
  return d.toLocaleString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function LoginLog({ events }: { events: Event[] }) {
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-center">
        <Clock size={24} className="text-[var(--t-3)]" />
        <div className="text-sm text-[var(--t-3)]">История событий пуста</div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {events.map((e) => {
        const meta = META[e.kind];
        const Icon = meta.icon;
        const ua = shortUA(e.userAgent);
        const UAIcon = ua.isMobile ? Smartphone : MonitorSmartphone;

        return (
          <div
            key={e.id}
            className="flex items-center gap-3 rounded-xl border border-[var(--b-soft)] bg-[var(--bg-1)] px-4 py-3 hover:border-[var(--b-hard)] hover:bg-[var(--bg-2)] transition-colors"
          >
            {/* Status icon */}
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: meta.bg }}
            >
              <Icon size={15} style={{ color: meta.color }} />
            </div>

            {/* Event + device */}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-[var(--t-1)]">
                {meta.label}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <UAIcon size={11} className="text-[var(--t-3)]" />
                <span className="text-[11px] text-[var(--t-3)] truncate">
                  {ua.browser}
                  {e.ip ? ` · ${e.ip}` : ""}
                </span>
              </div>
            </div>

            {/* Time */}
            <div className="text-[11px] text-[var(--t-3)] tabular-nums shrink-0 text-right">
              {formatRelativeDate(e.createdAt)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
