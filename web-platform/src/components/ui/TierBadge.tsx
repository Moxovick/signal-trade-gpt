import { TIER_LABELS } from "@/lib/tier";

type Props = {
  tier: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
};

// 2-tier model: T0 — нейтральный, T1+ — золотой Pro.
// T2/T3/T4 ключи оставлены на случай возврата многоуровневой модели.
const PRO_COLOR = {
  bg: "linear-gradient(135deg, rgba(212,160,23,0.20), rgba(245,232,192,0.10))",
  fg: "#f5e8c0",
  border: "rgba(245,232,192,0.50)",
};
const TIER_COLORS: Record<number, { bg: string; fg: string; border: string }> = {
  0: { bg: "rgba(110,96,76,0.15)", fg: "#b6a586", border: "rgba(110,96,76,0.3)" },
  1: PRO_COLOR,
  2: PRO_COLOR,
  3: PRO_COLOR,
  4: PRO_COLOR,
};

const SIZE: Record<NonNullable<Props["size"]>, string> = {
  sm: "h-5 px-2 text-[10px]",
  md: "h-7 px-3 text-xs",
  lg: "h-9 px-4 text-sm",
};

export function TierBadge({ tier, size = "md", showLabel = true, className }: Props) {
  const c = TIER_COLORS[tier] ?? TIER_COLORS[0];
  const label = TIER_LABELS[tier] ?? "—";
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full font-semibold uppercase tracking-wider",
        SIZE[size],
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ background: c.bg, color: c.fg, border: `1px solid ${c.border}` }}
      data-tier={tier}
    >
      <span style={{ fontFamily: "var(--font-jetbrains)" }}>T{tier}</span>
      {showLabel && <span>{label}</span>}
    </span>
  );
}
