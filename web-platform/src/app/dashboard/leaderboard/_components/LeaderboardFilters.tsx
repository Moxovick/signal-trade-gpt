"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const PERIODS = [
  { v: "all", l: "Всё время" },
  { v: "month", l: "Месяц" },
  { v: "week", l: "Неделя" },
];

const TIERS = [
  { v: "all", l: "Все тиры" },
  { v: "1", l: "T1+" },
  { v: "2", l: "T2+" },
  { v: "3", l: "T3+" },
  { v: "4", l: "T4" },
];

export function LeaderboardFilters() {
  const pathname = usePathname();
  const sp = useSearchParams();
  const period = sp.get("period") ?? "all";
  const tier = sp.get("tier") ?? "all";

  function build(kind: "period" | "tier", value: string): string {
    const next = new URLSearchParams(sp);
    if (value === "all") next.delete(kind);
    else next.set(kind, value);
    const q = next.toString();
    return `${pathname}${q ? `?${q}` : ""}`;
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2">
        <span className="text-[11px] uppercase tracking-wider text-[var(--t-3)]">
          Период:
        </span>
        <div className="inline-flex rounded-full border border-[var(--b-soft)] overflow-hidden">
          {PERIODS.map((p) => (
            <Link
              key={p.v}
              href={build("period", p.v)}
              className={`px-3 py-1.5 text-[12px] ${
                period === p.v
                  ? "bg-[var(--brand-gold)] text-[#1a1208] font-semibold"
                  : "text-[var(--t-2)] hover:bg-[var(--bg-2)]"
              }`}
            >
              {p.l}
            </Link>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[11px] uppercase tracking-wider text-[var(--t-3)]">
          Тир:
        </span>
        <div className="inline-flex rounded-full border border-[var(--b-soft)] overflow-hidden">
          {TIERS.map((t) => (
            <Link
              key={t.v}
              href={build("tier", t.v)}
              className={`px-3 py-1.5 text-[12px] ${
                tier === t.v
                  ? "bg-[var(--brand-gold)] text-[#1a1208] font-semibold"
                  : "text-[var(--t-2)] hover:bg-[var(--bg-2)]"
              }`}
            >
              {t.l}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
