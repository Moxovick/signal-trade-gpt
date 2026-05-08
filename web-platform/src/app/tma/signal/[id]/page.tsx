"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { ArrowDownRight, ArrowLeft, ArrowUpRight, Clock } from "lucide-react";
import { TmaShell } from "../../_components/TmaShell";
import { useTma } from "../../_components/TmaProvider";
import { TmaSignalChart } from "../../_components/TmaSignalChart";

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
  exitPrice: number | null;
  analysis: string | null;
  createdAt: string;
  closedAt: string | null;
};

export default function TmaSignalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <TmaShell withNav={false}>{() => <SignalView id={id} />}</TmaShell>;
}

function SignalView({ id }: { id: string }) {
  const { tmaFetch } = useTma();
  const [signal, setSignal] = useState<Signal | null>(null);
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const r = await tmaFetch(`/api/tma/signals/${id}`);
        if (!r.ok) {
          if (alive) setError(`HTTP ${r.status}`);
          return;
        }
        const j = (await r.json()) as { signal: Signal };
        if (!alive) return;
        setSignal(j.signal);

        const ar = await fetch("/api/assets", { cache: "no-store" });
        if (ar.ok) {
          const aj = (await ar.json()) as { assets: Asset[] };
          if (alive) {
            setAsset(aj.assets.find((a) => a.symbol === j.signal.pair) ?? null);
          }
        }
      } finally {
        if (alive) setLoading(false);
      }
    }
    void load();
    return () => {
      alive = false;
    };
  }, [id, tmaFetch]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[var(--t-3)] text-sm animate-pulse">Загружаем…</div>
      </div>
    );
  }
  if (error || !signal) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="text-[var(--red)] font-semibold mb-2">Сигнал не найден</div>
        {error && <div className="text-xs text-[var(--t-3)]">{error}</div>}
        <Link
          href="/tma"
          className="mt-4 px-4 py-2 rounded-lg border border-[var(--b-soft)] text-sm"
        >
          К сигналам
        </Link>
      </div>
    );
  }

  const isCall = signal.direction === "CALL";
  const isOtc = asset?.isOtc ?? signal.tier === "otc";

  return (
    <main className="max-w-md mx-auto p-4 space-y-4">
      <Link
        href="/tma"
        className="inline-flex items-center gap-2 text-sm text-[var(--t-3)] hover:text-[var(--t-1)]"
      >
        <ArrowLeft size={14} />К сигналам
      </Link>

      <div
        className={`rounded-2xl border bg-[var(--bg-1)] p-5 ${
          signal.result === "pending"
            ? "border-[var(--brand-gold)]/30"
            : "border-[var(--b-soft)]"
        }`}
      >
        <div className="flex items-center gap-3 mb-4">
          <span
            className={`size-12 rounded-full flex items-center justify-center ${
              isCall
                ? "bg-[var(--green)]/15 text-[var(--green)]"
                : "bg-[var(--red)]/15 text-[var(--red)]"
            }`}
          >
            {isCall ? <ArrowUpRight size={24} /> : <ArrowDownRight size={24} />}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold">{signal.pair}</h1>
              {isOtc && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[rgba(136,136,255,0.15)] text-[#8888ff] uppercase">
                  OTC
                </span>
              )}
            </div>
            <div className={`text-sm font-semibold ${isCall ? "text-[var(--green)]" : "text-[var(--red)]"}`}>
              {isCall ? "BUY · Вверх" : "SELL · Вниз"}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <Stat label="Экспирация" value={signal.expiration} />
          <Stat label="Уверенность" value={`${signal.confidence}%`} accent />
          {asset && asset.payoutPct > 0 && <Stat label="Выплата" value={`+${asset.payoutPct}%`} accent />}
          {(!asset || asset.payoutPct === 0) && (
            <Stat label="Статус" value={signal.result.toUpperCase()} />
          )}
        </div>

        {isOtc ? (
          <div className="rounded-xl bg-[var(--bg-2)] border border-[var(--b-soft)] p-4 text-center">
            <Clock size={18} className="mx-auto mb-2 text-[var(--t-3)]" />
            <div className="text-sm font-semibold mb-1">Точка входа: по рынку</div>
            <p className="text-xs text-[var(--t-3)] leading-relaxed">
              OTC-актив — синтетический, графика реального рынка нет. Открывай позицию
              сразу по текущей цене PocketOption.
            </p>
          </div>
        ) : (
          <TmaSignalChart
            pair={signal.pair}
            providerSymbol={asset?.providerSymbol ?? signal.pair}
            entryPrice={signal.entryPrice}
            direction={signal.direction}
          />
        )}

        {signal.analysis && (
          <div className="mt-4 rounded-xl bg-[var(--bg-2)] border border-[var(--b-soft)] p-4">
            <div className="text-[10px] uppercase tracking-wider text-[var(--t-3)] mb-1">
              Анализ
            </div>
            <p className="text-sm text-[var(--t-2)] leading-relaxed">{signal.analysis}</p>
          </div>
        )}
      </div>

      <a
        href="https://pocketoption.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full text-center px-5 py-3.5 rounded-xl bg-[var(--brand-gold)] text-[#1a1208] font-semibold"
      >
        Открыть PocketOption
      </a>
    </main>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-lg bg-[var(--bg-2)] border border-[var(--b-soft)] px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-[var(--t-3)] mb-0.5">{label}</div>
      <div
        className={`text-sm font-bold ${accent ? "text-[var(--brand-gold)]" : "text-[var(--t-1)]"}`}
      >
        {value}
      </div>
    </div>
  );
}
