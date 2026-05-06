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
        "rounded-2xl border border-[var(--b-soft)] bg-[var(--bg-1)] p-5",
        "transition-all duration-300 hover:border-[var(--b-hard)] hover:shadow-[var(--glow-gold-soft)]",
        className ?? "",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="text-xs uppercase tracking-wider text-[var(--t-3)]">
          {label}
        </div>
        {icon && <div className="text-[var(--brand-gold)]">{icon}</div>}
      </div>
      <div
        className="mt-3 text-3xl font-bold"
        style={{
          fontFamily: "var(--font-jetbrains)",
          color: tone ? TONE_COLOR[tone] : "var(--t-1)",
        }}
      >
        {value}
      </div>
      {delta && (
        <div
          className="mt-2 text-xs font-semibold"
          style={{ color: delta.positive === false ? "var(--red)" : "var(--green)" }}
        >
          {delta.positive === false ? "▼" : "▲"} {delta.value}
        </div>
      )}
    </div>
  );
}
