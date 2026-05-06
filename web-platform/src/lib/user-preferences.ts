/**
 * User preferences — free-form JSON blob stored on `User.preferences`.
 *
 * We parse on read (with defaults) so callers can destructure safely even for
 * users that never saved anything. Writes go through `setPreferences` which
 * performs a shallow merge — you never have to send the full blob to the
 * server.
 */
import { prisma } from "@/lib/prisma";

export type Theme = "light" | "dark" | "auto";
export type Language = "ru" | "en" | "uk";

/** Channels a user can opt into for each notification type. */
export type ChannelPrefs = {
  email: boolean;
  browser: boolean;
  telegram: boolean;
};

export type NotificationPrefs = {
  newSignal: ChannelPrefs;
  signalResult: ChannelPrefs;
  tierUpgrade: ChannelPrefs;
  deposit: ChannelPrefs;
  weeklyDigest: ChannelPrefs;
};

export type UserPreferences = {
  theme: Theme;
  language: Language;
  /** IANA timezone id, e.g. "Europe/Kyiv" */
  timezone: string;
  /** Pairs the user wants to receive in notifications (empty = all). */
  favoritePairs: string[];
  /** Pairs the user does NOT want. Beats favoritePairs. */
  mutedPairs: string[];
  notifications: NotificationPrefs;
  /** Enables 2FA code on every login via email. */
  twoFactorEmail: boolean;
  /** Streak opt-in (daily visit tracker). */
  streakTracking: boolean;
};

const DEFAULT_CHANNELS: ChannelPrefs = {
  email: false,
  browser: true,
  telegram: true,
};

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: "dark",
  language: "ru",
  timezone: "Europe/Kyiv",
  favoritePairs: [],
  mutedPairs: [],
  notifications: {
    newSignal: { ...DEFAULT_CHANNELS },
    signalResult: { ...DEFAULT_CHANNELS, email: false },
    tierUpgrade: { ...DEFAULT_CHANNELS, email: true },
    deposit: { ...DEFAULT_CHANNELS, email: true },
    weeklyDigest: {
      email: true,
      browser: false,
      telegram: false,
    },
  },
  twoFactorEmail: false,
  streakTracking: true,
};

function sanitizeChannels(v: unknown): ChannelPrefs {
  if (!v || typeof v !== "object") return { ...DEFAULT_CHANNELS };
  const o = v as Record<string, unknown>;
  return {
    email: o["email"] === true,
    browser: o["browser"] !== false,
    telegram: o["telegram"] !== false,
  };
}

function sanitizeNotifications(v: unknown): NotificationPrefs {
  const base = DEFAULT_PREFERENCES.notifications;
  if (!v || typeof v !== "object") return base;
  const o = v as Record<string, unknown>;
  return {
    newSignal: sanitizeChannels(o["newSignal"] ?? base.newSignal),
    signalResult: sanitizeChannels(o["signalResult"] ?? base.signalResult),
    tierUpgrade: sanitizeChannels(o["tierUpgrade"] ?? base.tierUpgrade),
    deposit: sanitizeChannels(o["deposit"] ?? base.deposit),
    weeklyDigest: sanitizeChannels(o["weeklyDigest"] ?? base.weeklyDigest),
  };
}

function sanitizePairs(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((s): s is string => typeof s === "string")
    .map((s) => s.trim().toUpperCase())
    .filter((s) => s.length > 0)
    .slice(0, 50);
}

export function parsePreferences(raw: unknown): UserPreferences {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_PREFERENCES };
  const o = raw as Record<string, unknown>;
  const theme =
    o["theme"] === "light" || o["theme"] === "dark" || o["theme"] === "auto"
      ? (o["theme"] as Theme)
      : DEFAULT_PREFERENCES.theme;
  const lang =
    o["language"] === "ru" || o["language"] === "en" || o["language"] === "uk"
      ? (o["language"] as Language)
      : DEFAULT_PREFERENCES.language;
  return {
    theme,
    language: lang,
    timezone:
      typeof o["timezone"] === "string" && o["timezone"].length > 0
        ? o["timezone"]
        : DEFAULT_PREFERENCES.timezone,
    favoritePairs: sanitizePairs(o["favoritePairs"]),
    mutedPairs: sanitizePairs(o["mutedPairs"]),
    notifications: sanitizeNotifications(o["notifications"]),
    twoFactorEmail: o["twoFactorEmail"] === true,
    streakTracking: o["streakTracking"] !== false,
  };
}

export async function getPreferences(
  userId: string,
): Promise<UserPreferences> {
  const u = await prisma.user.findUnique({
    where: { id: userId },
    select: { preferences: true },
  });
  return parsePreferences(u?.preferences ?? null);
}

export async function setPreferences(
  userId: string,
  patch: Partial<UserPreferences>,
): Promise<UserPreferences> {
  const current = await getPreferences(userId);
  const next: UserPreferences = {
    ...current,
    ...patch,
    notifications: {
      ...current.notifications,
      ...(patch.notifications ?? {}),
    },
  };
  await prisma.user.update({
    where: { id: userId },
    data: { preferences: next as unknown as object },
  });
  return next;
}
