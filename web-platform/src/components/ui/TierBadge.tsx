import { TIER_LABELS } from "@/lib/tier";

type Props = {
  tier: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
};

const TIER_COLORS: Record<number, { bg: string; fg: string; border: string }> = {
  0: { bg: "rgba(110,96,76,0.15)", fg: "#b6a586", border: "rgba(110,96,76,0.3)" },
  1: { bg: "rgba(142,224,107,0.10)", fg: "#8ee06b", border: "rgba(142,224,107,0.30)" },
  2: { bg: "rgba(136,188,255,0.10)", fg: "#88bcff", border: "rgba(136,188,255,0.30)" },
  3: { bg: "rgba(212,160,23,0.10)", fg: "#d4a017", border: "rgba(212,160,23,0.30)" },
  4: {
    bg: "linear-gradient(135deg, rgba(212,160,23,0.20), rgba(245,232,192,0.10))",
    fg: "#f5e8c0",
    border: "rgba(245,232,192,0.50)",
  },
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
