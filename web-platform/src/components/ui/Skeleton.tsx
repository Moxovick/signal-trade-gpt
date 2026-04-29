type Props = {
  className?: string;
  rounded?: "sm" | "md" | "lg" | "full";
};

const RND: Record<NonNullable<Props["rounded"]>, string> = {
  sm: "rounded",
  md: "rounded-lg",
  lg: "rounded-2xl",
  full: "rounded-full",
};

export function Skeleton({ className = "", rounded = "md" }: Props) {
  return (
    <div
      className={`shimmer-block ${RND[rounded]} ${className}`}
      style={{ background: "var(--bg-2)" }}
      aria-hidden
    />
  );
}
