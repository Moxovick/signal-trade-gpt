"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const PERIODS = [
  { v: "all", l: "Все время" },
  { v: "month", l: "Месяц" },
  { v: "week", l: "Неделя" },
];

const TIERS = [
  { v: "all", l: "Все" },
  { v: "1", l: "Basic+" },
];

function FilterGroup({
  label,
  items,
  current,
  kind,
  build,
}: {
  label: string;
  items: { v: string; l: string }[];
  current: string;
  kind: string;
  build: (kind: string, value: string) => string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <span
        style={{
          fontSize: "11px",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          color: "var(--t-3)",
          fontWeight: 600,
        }}
      >
        {label}
      </span>
      <div
        style={{
          display: "inline-flex",
          border: "1px solid var(--b-soft)",
          borderRadius: "4px",
          overflow: "hidden",
        }}
      >
        {items.map((item) => {
          const active = current === item.v;
          return (
            <Link
              key={item.v}
              href={build(kind, item.v)}
              style={{
                padding: "5px 12px",
                fontSize: "12px",
                fontWeight: active ? 600 : 400,
                color: active ? "#1a1208" : "var(--t-2)",
                background: active ? "var(--brand-gold)" : "transparent",
                textDecoration: "none",
                transition: "background 0.15s, color 0.15s",
              }}
            >
              {item.l}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function LeaderboardFilters() {
  const pathname = usePathname();
  const sp = useSearchParams();
  const period = sp.get("period") ?? "all";
  const tier = sp.get("tier") ?? "all";

  function build(kind: string, value: string): string {
    const next = new URLSearchParams(sp);
    if (value === "all") next.delete(kind);
    else next.set(kind, value);
    const q = next.toString();
    return `${pathname}${q ? `?${q}` : ""}`;
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "16px" }}>
      <FilterGroup label="Период:" items={PERIODS} current={period} kind="period" build={build} />
      <FilterGroup label="Тир:" items={TIERS} current={tier} kind="tier" build={build} />
    </div>
  );
}
