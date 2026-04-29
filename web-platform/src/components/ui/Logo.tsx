import Link from "next/link";

type Props = {
  href?: string;
  size?: "sm" | "md" | "lg";
  withText?: boolean;
  className?: string;
};

const SIZE: Record<NonNullable<Props["size"]>, { icon: number; text: string }> = {
  sm: { icon: 22, text: "text-base" },
  md: { icon: 30, text: "text-lg" },
  lg: { icon: 42, text: "text-2xl" },
};

/**
 * Custom mark: candlestick-like glyph + wordmark in Bebas Neue.
 *
 * Replaces the generic emoji-based logo from v1.
 */
export function Logo({ href = "/", size = "md", withText = true, className }: Props) {
  const s = SIZE[size];
  return (
    <Link
      href={href}
      className={["inline-flex items-center gap-2.5 group", className ?? ""].join(" ")}
    >
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
        className="transition-transform duration-300 group-hover:scale-110"
      >
        <defs>
          <linearGradient id="stg-logo-grad" x1="0" y1="0" x2="0" y2="32">
            <stop offset="0%" stopColor="#e6b840" />
            <stop offset="50%" stopColor="#d4a017" />
            <stop offset="100%" stopColor="#8a6500" />
          </linearGradient>
        </defs>
        {/* Outer ring */}
        <circle cx="16" cy="16" r="14" stroke="url(#stg-logo-grad)" strokeWidth="1.5" />
        {/* Candlestick body */}
        <rect x="13" y="9" width="6" height="14" rx="1" fill="url(#stg-logo-grad)" />
        {/* Upper wick */}
        <line x1="16" y1="5" x2="16" y2="9" stroke="url(#stg-logo-grad)" strokeWidth="1.6" strokeLinecap="round" />
        {/* Lower wick */}
        <line x1="16" y1="23" x2="16" y2="27" stroke="url(#stg-logo-grad)" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      {withText && (
        <span
          className={`font-display tracking-widest text-[var(--t-1)] ${s.text}`}
          style={{
            fontFamily: "var(--font-bebas, 'Bebas Neue', sans-serif)",
            letterSpacing: "0.16em",
          }}
        >
          STG
          <span className="ml-1 text-[var(--brand-gold)]">·</span>
          <span className="ml-1 text-[var(--t-2)] text-[0.85em] font-normal">SIGNALS</span>
        </span>
      )}
    </Link>
  );
}
