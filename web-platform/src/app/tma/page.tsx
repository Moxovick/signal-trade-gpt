"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Activity, ArrowDownRight, ArrowUpRight, ChevronRight, Target } from "lucide-react";
import { TmaShell, type TmaUser } from "./_components/TmaShell";
import { useTma } from "./_components/TmaProvider";
import { useI18n } from "@/lib/i18n/context";

type Asset = {
  symbol: string;
  isOtc: boolean;
  payoutPct: number;
  provider: string;
  providerSymbol: string | null;
};

type Signal = {
  id: string;
  pair: string;
  direction: "CALL" | "PUT";
  expiration: string;
  confidence: number;
  tier: "otc" | "exchange" | "elite";
  result: "win" | "loss" | "pending";
  entryPrice: number | null;
  createdAt: string;
};

export default function TmaHomePage() {
  return <TmaShell>{(user) => <Home user={user} />}</TmaShell>;
}

function Home({ user }: { user: TmaUser }) {
  const { tmaFetch } = useTma();
  const { t } = useI18n();
  const [signals, setSignals] = useState<Signal[]>([]);
  const [assets, setAssets] = useState<Record<string, Asset>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const [sr, ar] = await Promise.all([
          tmaFetch("/api/tma/signals?limit=30"),
          fetch("/api/assets", { cache: "no-store" }),
        ]);
        if (sr.ok) {
          const j = (await sr.json()) as { signals: Signal[] };
          if (alive) {
            setSignals(j.signals);
          }
        }
        if (ar.ok) {
          const j = (await ar.json()) as { assets: Asset[] };
          const map: Record<string, Asset> = {};
          for (const a of j.assets) map[a.symbol] = a;
          if (alive) setAssets(map);
        }
      } finally {
        if (alive) setLoading(false);
      }
    }
    void load();
    const id = window.setInterval(load, 7000);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, [tmaFetch]);

  const userName = user.firstName ?? user.username ?? t.tma.profile.defaultName;

  return (
    <main className="max-w-md mx-auto p-4 space-y-4">
      <header className="flex items-center justify-between gap-3 pt-2">
        <div>
          <div className="text-xs text-[var(--t-3)] uppercase tracking-[0.2em]">{t.tma.home.greeting}</div>
          <h1 className="text-xl font-bold text-[var(--t-1)]">{userName}</h1>
        </div>
        <div className="rounded-xl border border-[var(--b-soft)] bg-[var(--bg-1)] px-3 py-2 text-right">
          <div className="text-[10px] uppercase tracking-wider text-[var(--t-3)]">{t.tma.home.level}</div>
          <div className="text-sm font-bold text-[var(--brand-gold)]">
            {user.tier >= 2 ? t.tma.home.tiers.pro : user.tier === 1 ? t.tma.home.tiers.basic : t.tma.home.tiers.free}
          </div>
        </div>
      </header>

      <Link
        href="/tma/signals"
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm transition-all active:scale-[0.98]"
        style={{ background: "linear-gradient(135deg, var(--brand-gold-deep), var(--brand-gold-bright))", color: "#1a1208" }}
      >
        <Activity size={16} />
        {t.tma.home.getSignal}
      </Link>

      {/* CTA: Get signal */}
      <Link
        href="/tma/signals"
        className="flex items-center gap-3 rounded-2xl border border-[var(--brand-gold)]/30 bg-[rgba(212,160,23,0.06)] p-4 active:scale-[0.98] transition-all"
      >
        <div className="size-10 rounded-xl bg-[var(--brand-gold)]/15 text-[var(--brand-gold)] flex items-center justify-center shrink-0">
          <Target size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-[var(--t-1)]">{t.tma.home.getSignal}</div>
          <div className="text-xs text-[var(--t-3)]">{t.tma.home.choosePairExpiration}</div>
        </div>
        <ChevronRight size={16} className="text-[var(--brand-gold)]" />
      </Link>

      <div className="rounded-2xl border border-[var(--b-soft)] bg-[var(--bg-1)] p-4">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[var(--brand-gold)] mb-3">
          <Activity size={12} className="animate-pulse" />
          {t.tma.home.liveSignals}
        </div>
        {loading && signals.length === 0 ? (
          <div className="py-12 text-center text-[var(--t-3)] text-sm animate-pulse">
            {t.tma.home.loading}
          </div>
        ) : signals.length === 0 ? (
          <div className="py-10 text-center">
            <div className="font-semibold mb-1">{t.tma.home.noSignals}</div>
            <p className="text-xs text-[var(--t-3)] max-w-xs mx-auto">
              {t.tma.home.noSignalsHint}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {signals.map((s) => (
              <SignalRow key={s.id} signal={s} asset={assets[s.pair]} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function SignalRow({ signal, asset }: { signal: Signal; asset: Asset | undefined }) {
  const isCall = signal.direction === "CALL";
  const isOtc = asset?.isOtc ?? signal.tier === "otc";
  return (
    <Link
      href={`/tma/signal/${signal.id}`}
      className={`block rounded-xl border bg-[var(--bg-2)] hover:bg-[var(--bg-3)] active:scale-[0.99] transition-all px-3 py-3 ${
        signal.result === "pending"
          ? "border-[var(--brand-gold)]/30"
          : "border-[var(--b-soft)]"
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`size-10 rounded-full flex items-center justify-center shrink-0 ${
            isCall
              ? "bg-[var(--green)]/15 text-[var(--green)]"
              : "bg-[var(--red)]/15 text-[var(--red)]"
          }`}
        >
          {isCall ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 font-semibold text-[var(--t-1)]">
            <span className="truncate">{signal.pair}</span>
            {isOtc && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[rgba(136,136,255,0.15)] text-[#8888ff] uppercase">
                OTC
              </span>
            )}
          </div>
          <div className="text-xs text-[var(--t-3)] flex items-center gap-2 mt-0.5">
            <span>{signal.expiration}</span>
            {asset && asset.payoutPct > 0 && (
              <>
                <span>·</span>
                <span className="text-[var(--brand-gold)]">+{asset.payoutPct}%</span>
              </>
            )}
            <span>·</span>
            <span>{signal.confidence}%</span>
          </div>
        </div>
        <ChevronRight size={16} className="text-[var(--t-3)]" />
      </div>
    </Link>
  );
}
