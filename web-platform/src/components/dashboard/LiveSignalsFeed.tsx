"use client";

/**
 * LiveSignalsFeed — polled, near-realtime feed of admin-published signals
 * filtered to the current user's tier. Polls /api/signals/recent every 5s,
 * prepends new entries, and (optionally) plays a sound + browser notification
 * when a new signal arrives.
 *
 * Lives on the dashboard hero: signals are the headline, not a footer card.
 */
import { useEffect, useRef, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Bell,
  BellOff,
  Volume2,
  VolumeX,
  CircleDot,
  Activity,
} from "lucide-react";

export type Signal = {
  id: string;
  pair: string;
  direction: "CALL" | "PUT";
  expiration: string;
  confidence: number;
  tier: "otc" | "exchange" | "elite";
  result: "win" | "loss" | "pending";
  entryPrice: number | null;
  exitPrice: number | null;
  analysis: string | null;
  createdAt: string;
  closedAt: string | null;
};

type Props = {
  initial: Signal[];
  pollIntervalMs?: number;
};

const POLL_DEFAULT = 5_000;
const SOUND_KEY = "stg_signal_sound";
const NOTIF_KEY = "stg_signal_notif";

const TIER_BAND_LABELS: Record<Signal["tier"], { label: string; cls: string }> = {
  otc: { label: "OTC", cls: "text-[#8888ff]" },
  exchange: { label: "Биржа", cls: "text-[var(--green)]" },
  elite: { label: "Elite", cls: "text-[var(--brand-gold)]" },
};

function formatTimeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 60_000) return "только что";
  const min = Math.floor(ms / 60_000);
  if (min < 60) return `${min} мин назад`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} ч назад`;
  const d = Math.floor(hr / 24);
  return `${d} д назад`;
}

type AssetMeta = {
  symbol: string;
  isOtc: boolean;
  payoutPct: number;
  provider: string;
  providerSymbol: string | null;
};

export function LiveSignalsFeed({ initial, pollIntervalMs = POLL_DEFAULT }: Props) {
  const [signals, setSignals] = useState<Signal[]>(initial);
  const [soundOn, setSoundOn] = useState(false);
  const [notifOn, setNotifOn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assets, setAssets] = useState<Record<string, AssetMeta>>({});
  const lastSeenRef = useRef<string | null>(initial[0]?.createdAt ?? null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSoundOn(window.localStorage.getItem(SOUND_KEY) === "1");
    setNotifOn(
      window.localStorage.getItem(NOTIF_KEY) === "1" &&
        typeof Notification !== "undefined" &&
        Notification.permission === "granted",
    );
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        const r = await fetch("/api/assets", { cache: "no-store" });
        const j = (await r.json()) as { assets?: AssetMeta[] };
        const map: Record<string, AssetMeta> = {};
        for (const a of j.assets ?? []) map[a.symbol] = a;
        setAssets(map);
      } catch {
        // assets not loaded — cards just won't show payout/chart
      }
    })();
  }, []);

  useEffect(() => {
    let alive = true;

    async function tick() {
      try {
        const url = new URL("/api/signals/recent", window.location.origin);
        if (lastSeenRef.current) url.searchParams.set("after", lastSeenRef.current);
        url.searchParams.set("limit", "20");
        const r = await fetch(url.toString(), { cache: "no-store" });
        if (!r.ok) {
          setError(`HTTP ${r.status}`);
          return;
        }
        const j = (await r.json()) as { signals?: Signal[] };
        const fresh = j.signals ?? [];
        if (!alive || fresh.length === 0) return;
        setSignals((prev) => mergeSignals(fresh, prev));
        lastSeenRef.current = fresh[0]?.createdAt ?? lastSeenRef.current;
        if (soundOn) playPing();
        if (notifOn && fresh[0]) showNotif(fresh[0]);
        setError(null);
      } catch {
        // Network blips are fine — next tick will retry.
      }
    }

    const id = window.setInterval(tick, pollIntervalMs);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, [pollIntervalMs, soundOn, notifOn]);

  async function toggleSound() {
    const next = !soundOn;
    setSoundOn(next);
    window.localStorage.setItem(SOUND_KEY, next ? "1" : "0");
  }

  async function toggleNotif() {
    if (notifOn) {
      setNotifOn(false);
      window.localStorage.setItem(NOTIF_KEY, "0");
      return;
    }
    if (typeof Notification === "undefined") return;
    const perm =
      Notification.permission === "default"
        ? await Notification.requestPermission()
        : Notification.permission;
    const ok = perm === "granted";
    setNotifOn(ok);
    window.localStorage.setItem(NOTIF_KEY, ok ? "1" : "0");
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-[var(--brand-gold)]">
            <Activity size={12} className="animate-pulse" />
            Live · сигналы
          </span>
          {error ? (
            <span className="text-xs text-[var(--t-3)]">offline · {error}</span>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSound}
            className="size-9 rounded-full border border-[var(--b-soft)] hover:border-[var(--b-hard)] flex items-center justify-center text-[var(--t-2)] hover:text-[var(--brand-gold)] transition-colors"
            title={soundOn ? "Выключить звук" : "Включить звук"}
          >
            {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
          <button
            onClick={toggleNotif}
            className="size-9 rounded-full border border-[var(--b-soft)] hover:border-[var(--b-hard)] flex items-center justify-center text-[var(--t-2)] hover:text-[var(--brand-gold)] transition-colors"
            title={notifOn ? "Отключить уведомления" : "Включить уведомления браузера"}
          >
            {notifOn ? <Bell size={16} /> : <BellOff size={16} />}
          </button>
        </div>
      </div>

      {signals.length === 0 ? (
        <div className="rounded-2xl border border-[var(--b-soft)] bg-[var(--bg-1)] px-6 py-12 text-center">
          <CircleDot size={28} className="mx-auto text-[var(--t-3)] mb-2" />
          <div className="text-[var(--t-2)] font-semibold">Сигналов пока нет</div>
          <p className="text-sm text-[var(--t-3)] mt-1">
            Как только админ опубликует — появится здесь, в Telegram-боте
            и придёт уведомление в браузер (если включено).
          </p>
        </div>
      ) : (
        <div className="grid gap-2">
          {signals.slice(0, 12).map((s) => (
            <SignalRow key={s.id} signal={s} asset={assets[s.pair]} />
          ))}
        </div>
      )}
    </div>
  );
}

function SignalRow({ signal, asset }: { signal: Signal; asset: AssetMeta | undefined }) {
  const isCall = signal.direction === "CALL";
  const band = TIER_BAND_LABELS[signal.tier];
  const isOtc = asset?.isOtc ?? signal.tier === "otc";
  const resultColor =
    signal.result === "win"
      ? "text-[var(--green)]"
      : signal.result === "loss"
        ? "text-[var(--red)]"
        : "text-[var(--t-3)]";
  return (
    <div
      className={`rounded-xl border bg-[var(--bg-1)] hover:bg-[var(--bg-2)] transition-colors px-4 py-3 flex items-center justify-between gap-3 ${
        signal.result === "pending"
          ? "border-[var(--brand-gold)]/35 shadow-[0_0_12px_rgba(212,160,23,0.12)]"
          : "border-[var(--b-soft)]"
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span
          className={`size-9 rounded-full flex items-center justify-center ${
            isCall
              ? "bg-[var(--green)]/15 text-[var(--green)]"
              : "bg-[var(--red)]/15 text-[var(--red)]"
          }`}
        >
          {isCall ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
        </span>
        <div className="min-w-0">
          <div className="font-semibold truncate flex items-center gap-2">
            <span>{signal.pair}</span>
            {isOtc && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[rgba(136,136,255,0.15)] text-[#8888ff] uppercase tracking-wider">
                OTC
              </span>
            )}
            <span className="text-[var(--t-3)]">·</span>
            <span className={isCall ? "text-[var(--green)]" : "text-[var(--red)]"}>
              {signal.direction}
            </span>
          </div>
          <div className="text-xs text-[var(--t-3)] flex items-center gap-2">
            <span className={band.cls}>{band.label}</span>
            <span>·</span>
            <span>{signal.expiration}</span>
            {asset && asset.payoutPct > 0 && (
              <>
                <span>·</span>
                <span className="text-[var(--brand-gold)] font-semibold">+{asset.payoutPct}%</span>
              </>
            )}
            <span>·</span>
            <span>{formatTimeAgo(signal.createdAt)}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <div className="text-right">
          <div className="text-sm font-semibold text-[var(--brand-gold)]">
            {signal.confidence}%
          </div>
          <div className={`text-[11px] uppercase tracking-wider ${resultColor}`}>
            {signal.result}
          </div>
        </div>
      </div>
    </div>
  );
}

function mergeSignals(fresh: Signal[], existing: Signal[]): Signal[] {
  const map = new Map<string, Signal>();
  for (const s of [...fresh, ...existing]) map.set(s.id, s);
  return Array.from(map.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

function playPing() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.32);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch {
    // Audio not available — silently skip.
  }
}

function showNotif(s: Signal) {
  try {
    new Notification(`Сигнал ${s.pair} — ${s.direction}`, {
      body: `${s.confidence}% · ${s.expiration}`,
      icon: "/icon.png",
      tag: `signal-${s.id}`,
    });
  } catch {
    // Browser refused — silently skip.
  }
}
