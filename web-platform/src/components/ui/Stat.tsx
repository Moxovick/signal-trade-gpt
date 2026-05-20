import type { ReactNode } from "react";

type Props = {
  value: ReactNode;
  label: ReactNode;
  delta?: { value: string; positive?: boolean };
  icon?: ReactNode;
  className?: string;
  /** Optional semantic tint applied to the value. */
  tone?: "positive" | "negative" | "neutral";
};

const TONE_COLOR: Record<NonNullable<Props["tone"]>, string> = {
  positive: "var(--green)",
  negative: "var(--red)",
  neutral: "var(--t-1)",
};

export function Stat({ value, label, delta, icon, className, tone }: Props) {
  return (
    <div
      className={[
        "rounded-2xl border border-[var(--b-soft)] bg-[var(--bg-1)] px-4 py-4",
        "transition-all duration-200 hover:border-[var(--b-hard)]",
        className ?? "",
      ].join(" ")}
    >
      {/* Label + icon row */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="text-[12px] font-medium text-[var(--t-2)] leading-tight">
          {label}
        </div>
        {icon && (
          <div className="text-[var(--brand-gold)] opacity-80 shrink-0">
            {icon}
          </div>
        )}
      </div>

      {/* Value */}
      <div
        className="text-2xl font-bold leading-none"
        style={{
          fontFamily: "var(--font-jetbrains)",
          color: tone ? TONE_COLOR[tone] : "var(--t-1)",
        }}
      >
        {value}
      </div>

      {/* Delta */}
      {delta && (
        <div
          className="mt-2 text-[12px] font-medium"
          style={{
            color: delta.positive === false ? "var(--red)" : "var(--green)",
          }}
        >
          {delta.positive === false ? "▼" : "▲"} {delta.value}
        </div>
      )}
    </div>
  );
}
