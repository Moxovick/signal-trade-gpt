import type { HTMLAttributes, ReactNode } from "react";

type Props = HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "glass" | "highlight";
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
  children: ReactNode;
};

const PADDING: Record<NonNullable<Props["padding"]>, string> = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

const VARIANT: Record<NonNullable<Props["variant"]>, string> = {
  default:
    "bg-[var(--bg-1)] border border-[var(--b-soft)] rounded-2xl",
  glass: "glass rounded-2xl",
  highlight:
    "rounded-2xl border border-[var(--b-hard)] " +
    "bg-[linear-gradient(135deg,rgba(212,160,23,0.06)_0%,var(--bg-1)_100%)]",
};

export function Card({
  variant = "default",
  padding = "md",
  hover = false,
  className,
  children,
  ...rest
}: Props) {
  const hoverCls = hover
    ? "transition-all duration-300 hover:border-[var(--b-hard)] hover:shadow-[var(--glow-gold-soft)] hover:-translate-y-0.5"
    : "";
  return (
    <div
      className={[VARIANT[variant], PADDING[padding], hoverCls, className ?? ""]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {children}
    </div>
  );
}
