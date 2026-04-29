import Link from "next/link";
import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

type CommonProps = {
  variant?: Variant;
  size?: Size;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
};

type ButtonProps = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: never;
  };

type LinkProps = CommonProps & {
  href: string;
  external?: boolean;
  children?: ReactNode;
  className?: string;
};

const SIZE_CLASS: Record<Size, string> = {
  sm: "h-9 px-4 text-[13px] gap-1.5",
  md: "h-11 px-6 text-sm gap-2",
  lg: "h-14 px-8 text-base gap-2.5",
};

const VARIANT_CLASS: Record<Variant, string> = {
  primary:
    "bg-[var(--brand-gold)] text-[#1a1208] hover:bg-[var(--brand-gold-bright)] " +
    "shadow-[0_0_24px_rgba(212,160,23,0.35)] hover:shadow-[0_0_36px_rgba(212,160,23,0.55)] " +
    "font-semibold",
  secondary:
    "bg-transparent text-[var(--brand-gold)] border border-[var(--b-hard)] " +
    "hover:border-[var(--b-glow)] hover:bg-[rgba(212,160,23,0.05)]",
  ghost:
    "bg-transparent text-[var(--t-2)] hover:text-[var(--t-1)] hover:bg-[var(--bg-2)]",
  danger:
    "bg-[var(--red)]/15 text-[var(--red)] border border-[var(--red)]/30 hover:bg-[var(--red)]/25",
};

const BASE =
  "inline-flex items-center justify-center rounded-full font-medium tracking-wide " +
  "transition-all duration-200 ease-out select-none whitespace-nowrap " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-gold)] " +
  "focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-0)] " +
  "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none active:scale-[.98]";

function compose(
  variant: Variant,
  size: Size,
  fullWidth: boolean,
  className?: string,
) {
  return [
    BASE,
    VARIANT_CLASS[variant],
    SIZE_CLASS[size],
    fullWidth ? "w-full" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    iconLeft,
    iconRight,
    fullWidth = false,
    className,
    children,
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      className={compose(variant, size, fullWidth, className)}
      {...rest}
    >
      {iconLeft}
      {children}
      {iconRight}
    </button>
  );
});

export function ButtonLink({
  variant = "primary",
  size = "md",
  iconLeft,
  iconRight,
  fullWidth = false,
  className,
  href,
  external,
  children,
}: LinkProps & { iconLeft?: ReactNode; iconRight?: ReactNode }) {
  const cls = compose(variant, size, fullWidth, className);
  if (external) {
    return (
      <a href={href} className={cls} target="_blank" rel="noreferrer noopener">
        {iconLeft}
        {children}
        {iconRight}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {iconLeft}
      {children}
      {iconRight}
    </Link>
  );
}
