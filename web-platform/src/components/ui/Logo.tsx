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
 * SpaceSignal logo — signal wave inside a hexagonal orbit.
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
          <linearGradient id="ss-logo-grad" x1="0" y1="0" x2="32" y2="32">
            <stop offset="0%" stopColor="#e6b840" />
            <stop offset="50%" stopColor="#d4a017" />
            <stop offset="100%" stopColor="#8a6500" />
          </linearGradient>
        </defs>
        {/* Outer orbit ring */}
        <circle cx="16" cy="16" r="14" stroke="url(#ss-logo-grad)" strokeWidth="1.2" opacity="0.5" />
        {/* Inner orbit ring */}
        <circle cx="16" cy="16" r="10.5" stroke="url(#ss-logo-grad)" strokeWidth="0.8" opacity="0.3" strokeDasharray="3 2" />
        {/* Signal wave — 3 bars ascending */}
        <rect x="9" y="19" width="3" height="5" rx="1" fill="url(#ss-logo-grad)" opacity="0.6" />
        <rect x="14" y="15" width="3" height="9" rx="1" fill="url(#ss-logo-grad)" opacity="0.8" />
        <rect x="19" y="10" width="3" height="14" rx="1" fill="url(#ss-logo-grad)" />
        {/* Star / dot accent */}
        <circle cx="25" cy="8" r="1.5" fill="#e6b840" />
      </svg>
      {withText && (
        <span
          className={`font-sans tracking-widest text-[var(--t-1)] ${s.text}`}
          style={{
            letterSpacing: "0.16em",
          }}
        >
          SPACE
          <span className="mx-1 text-[var(--brand-gold)]">·</span>
          <span className="text-[var(--brand-gold)] font-normal">SIGNAL</span>
        </span>
      )}
    </Link>
  );
}
