/**
 * @deprecated v2 — prefer `@/components/ui/Logo`. Kept for legacy imports;
 * re-exports the new component with backwards-compatible props.
 */
import { Logo as NewLogo } from "@/components/ui/Logo";

export function Logo({
  size = "md",
  glow = false,
}: {
  size?: "sm" | "md" | "lg";
  glow?: boolean;
}) {
  return <NewLogo size={size} className={glow ? "logo-glow" : undefined} />;
}

export { Logo as LogoMark } from "@/components/ui/Logo";
