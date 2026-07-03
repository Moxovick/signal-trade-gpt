/**
 * @deprecated v2 — prefer `@/components/ui/Logo`. Kept for legacy imports;
 * re-exports the new component with backwards-compatible props.
 */
import { Logo as NewLogo } from "@/components/ui/Logo";

export function Logo({
  size = "md",
}: {
  size?: "sm" | "md" | "lg";
  /** @deprecated glow effect removed in redesign */
  glow?: boolean;
}) {
  return <NewLogo size={size} />;
}

export { Logo as LogoMark } from "@/components/ui/Logo";
