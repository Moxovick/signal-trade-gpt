"use client";

import { useState } from "react";
import { Calculator, TrendingDown, TrendingUp } from "lucide-react";
import { TmaShell } from "../_components/TmaShell";
import { useI18n } from "@/lib/i18n/context";

export default function TmaCalcPage() {
  return <TmaShell withNav>{() => <Calc />}</TmaShell>;
}

function Calc() {
  const { t } = useI18n();
  const [deposit, setDeposit] = useState(500);
  const [pct, setPct] = useState(2);
  const [payout, setPayout] = useState(82);

  const bet = (deposit * pct) / 100;
  const profit = (bet * payout) / 100;
  const loss = bet;
  const rr = profit / loss;

  return (
    <main className="max-w-md mx-auto p-4 space-y-4 pb-6">
      <header className="pt-2">
        <div className="text-xs text-[var(--t-3)] uppercase tracking-[0.2em]">{t.tma.calc.title}</div>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Calculator size={18} className="text-[var(--brand-gold)]" />
          {t.tma.calc.subtitle}
        </h1>
      </header>

      {/* Inputs */}
      <div className="space-y-3">
        <SliderField
          label={t.tma.calc.deposit}
          value={deposit}
          min={50}
          max={10000}
          step={50}
          format={(v) => `$${v.toLocaleString()}`}
          onChange={setDeposit}
        />
        <SliderField
          label={t.tma.calc.tradeSize}
          value={pct}
          min={1}
          max={10}
          step={0.5}
          format={(v) => `${v}%`}
          onChange={setPct}
        />
        <SliderField
          label={t.tma.calc.payout}
          value={payout}
          min={60}
          max={95}
          step={1}
          format={(v) => `${v}%`}
          onChange={setPayout}
        />
      </div>

      {/* Result card */}
      <div className="rounded-2xl border border-[var(--brand-gold)]/30 bg-[var(--brand-gold)]/5 p-5 space-y-4">
        <div className="text-xs uppercase tracking-wider text-[var(--t-3)]">{t.tma.calc.result}</div>

        <div className="text-center">
          <div className="text-xs text-[var(--t-3)] mb-1">{t.tma.calc.tradeSize}</div>
          <div className="text-3xl font-bold text-[var(--brand-gold)]" style={{ fontFamily: "var(--font-jetbrains)" }}>
            ${bet.toFixed(2)}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-[var(--green)]/10 border border-[var(--green)]/20 p-3 text-center">
            <TrendingUp size={14} className="text-[var(--green)] mx-auto mb-1" />
            <div className="text-xs text-[var(--t-3)]">{t.tma.calc.profit}</div>
            <div className="text-lg font-bold text-[var(--green)]">+${profit.toFixed(2)}</div>
          </div>
          <div className="rounded-xl bg-[var(--red)]/10 border border-[var(--red)]/20 p-3 text-center">
            <TrendingDown size={14} className="text-[var(--red)] mx-auto mb-1" />
            <div className="text-xs text-[var(--t-3)]">{t.tma.calc.loss}</div>
            <div className="text-lg font-bold text-[var(--red)]">-${loss.toFixed(2)}</div>
          </div>
        </div>

        <div className="text-center text-xs text-[var(--t-3)]">
          {t.tma.calc.rrBreakeven
            .replace("{n}", rr.toFixed(2))
            .replace("{n}", String(Math.ceil((1 / (1 + rr)) * 100)))}
        </div>
      </div>

      {/* Tip */}
      <p className="text-xs text-[var(--t-3)] text-center leading-relaxed px-2">
        {t.tma.calc.hint}
      </p>
    </main>
  );
}

function SliderField({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="rounded-2xl border border-[var(--b-soft)] bg-[var(--bg-1)] p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs uppercase tracking-wider text-[var(--t-3)]">{label}</div>
        <div className="text-sm font-bold text-[var(--brand-gold)]">{format(value)}</div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[var(--brand-gold)] h-1.5 rounded-full cursor-pointer"
      />
      <div className="flex justify-between text-[10px] text-[var(--t-3)] mt-1.5">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  );
}
