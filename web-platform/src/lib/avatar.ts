/**
 * Avatar resolution — use custom `User.avatar` URL if present, otherwise
 * fall back to Gravatar (md5 hash of email), with a generated SVG as the
 * final fallback.
 */
import { createHash } from "node:crypto";

export function avatarUrl(
  user: { avatar?: string | null; email?: string | null },
): string | null {
  if (user.avatar && user.avatar.length > 0) return user.avatar;
  if (user.email && user.email.length > 0) {
    const hash = createHash("md5")
      .update(user.email.trim().toLowerCase())
      .digest("hex");
    return `https://www.gravatar.com/avatar/${hash}?d=404&s=160`;
  }
  return null;
}

export function initialsFromName(
  user: { firstName?: string | null; username?: string | null; email?: string | null },
): string {
  const raw =
    user.firstName ?? user.username ?? user.email?.split("@")[0] ?? "?";
  const parts = raw.split(/\s+/).filter(Boolean);
  const take = parts.slice(0, 2);
  const letters = take
    .map((p) => p[0] ?? "")
    .join("")
    .toUpperCase();
  return letters || "?";
}
