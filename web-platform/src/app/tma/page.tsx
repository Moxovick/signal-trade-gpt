"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Activity, ArrowDownRight, ArrowUpRight, ChevronRight } from "lucide-react";
import { TmaShell, type TmaUser } from "./_components/TmaShell";
import { useTma } from "./_components/TmaProvider";

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
  const [signals, setSignals] = useState<Signal[]>([]);
  const [assets, setAssets] = useState<Record<string, Asset>>({});
  const [tier, setTier] = useState<number>(user.tier);
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
          const j = (await sr.json()) as { signals: Signal[]; tier: number };
          if (alive) {
            setSignals(j.signals);
            setTier(j.tier);
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

  const userName = user.firstName ?? user.username ?? "трейдер";

  return (
    <main className="max-w-md mx-auto p-4 space-y-4">
      <header className="flex items-center justify-between gap-3 pt-2">
        <div>
          <div className="text-xs text-[var(--t-3)] uppercase tracking-[0.2em]">Привет</div>
          <h1 className="text-xl font-bold text-[var(--t-1)]">{userName}</h1>
        </div>
        <div className="rounded-xl border border-[var(--b-soft)] bg-[var(--bg-1)] px-3 py-2 text-right">
          <div className="text-[10px] uppercase tracking-wider text-[var(--t-3)]">Тир</div>
          <div className="text-sm font-bold text-[var(--brand-gold)]">T{tier}</div>
        </div>
      </header>

      <div className="rounded-2xl border border-[var(--b-soft)] bg-[var(--bg-1)] p-4">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[var(--brand-gold)] mb-3">
          <Activity size={12} className="animate-pulse" />
          Live · сигналы
        </div>
        {loading && signals.length === 0 ? (
          <div className="py-12 text-center text-[var(--t-3)] text-sm animate-pulse">
            Загружаем…
          </div>
        ) : signals.length === 0 ? (
          <div className="py-10 text-center">
            <div className="font-semibold mb-1">Сигналов пока нет</div>
            <p className="text-xs text-[var(--t-3)] max-w-xs mx-auto">
              Как только админ опубликует — появятся здесь и в боте.
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
