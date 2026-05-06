/**
 * Signal templates + per-tier auto-publish schedule.
 *
 * Stored in SiteSettings as JSON under `signal_templates` and
 * `signal_schedule`. Read/write via the admin power-tools UI.
 *
 * Templates are pre-baked signal configurations (pair/direction/expiration/
 * confidence/tier/analysis); the bulk generator and auto-publisher both pull
 * from this catalogue. Schedule defines per-band intervals — when the cron
 * endpoint runs, it picks each band whose last signal is older than its
 * interval and publishes a randomly-chosen template.
 */
import { prisma } from "@/lib/prisma";

export const SETTING_SIGNAL_TEMPLATES = "signal_templates";
export const SETTING_SIGNAL_SCHEDULE = "signal_schedule";

export type SignalDirection = "CALL" | "PUT";
export type SignalBand = "otc" | "exchange" | "elite";

export type SignalTemplate = {
  id: string;
  name: string;
  pair: string;
  direction: SignalDirection;
  expiration: string;
  confidence: number;
  tier: SignalBand;
  analysis: string | null;
  /** weight for random selection (default 1) */
  weight: number;
  /** Whether this template is eligible for auto-publish */
  autoPublish: boolean;
};

export type SignalSchedule = {
  enabled: boolean;
  /** Per-band interval in minutes (0 disables that band) */
  intervalMinutes: {
    otc: number;
    exchange: number;
    elite: number;
  };
  /**
   * Optional working-hours window (24h, server time).
   * `start` / `end` are integer hours. If start === end, runs 24/7.
   */
  workingHours: { start: number; end: number };
};

export const DEFAULT_SCHEDULE: SignalSchedule = {
  enabled: false,
  intervalMinutes: { otc: 45, exchange: 60, elite: 120 },
  workingHours: { start: 8, end: 22 },
};

export const DEFAULT_TEMPLATES: SignalTemplate[] = [
  {
    id: "tpl-eurusd-otc-call",
    name: "EUR/USD OTC CALL",
    pair: "EUR/USD-OTC",
    direction: "CALL",
    expiration: "3m",
    confidence: 86,
    tier: "otc",
    analysis: "Пробой уровня сопротивления на M5, RSI > 60",
    weight: 2,
    autoPublish: true,
  },
  {
    id: "tpl-gbpusd-otc-put",
    name: "GBP/USD OTC PUT",
    pair: "GBP/USD-OTC",
    direction: "PUT",
    expiration: "5m",
    confidence: 82,
    tier: "otc",
    analysis: "Отбой от сопротивления, дивергенция MACD",
    weight: 1,
    autoPublish: true,
  },
];

function isDirection(v: unknown): v is SignalDirection {
  return v === "CALL" || v === "PUT";
}

function isBand(v: unknown): v is SignalBand {
  return v === "otc" || v === "exchange" || v === "elite";
}

function asTemplate(raw: unknown): SignalTemplate | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (typeof o["id"] !== "string") return null;
  if (typeof o["pair"] !== "string") return null;
  if (!isDirection(o["direction"])) return null;
  if (typeof o["expiration"] !== "string") return null;
  const conf = Number(o["confidence"]);
  if (!Number.isFinite(conf)) return null;
  if (!isBand(o["tier"])) return null;
  return {
    id: o["id"],
    name: typeof o["name"] === "string" ? o["name"] : o["pair"],
    pair: o["pair"],
    direction: o["direction"],
    expiration: o["expiration"],
    confidence: Math.max(0, Math.min(100, Math.round(conf))),
    tier: o["tier"],
    analysis: typeof o["analysis"] === "string" ? o["analysis"] : null,
    weight:
      typeof o["weight"] === "number" && o["weight"] > 0
        ? Math.floor(o["weight"])
        : 1,
    autoPublish: o["autoPublish"] === true,
  };
}

export function parseTemplates(value: unknown): SignalTemplate[] {
  if (!Array.isArray(value)) return [];
  return value
    .map(asTemplate)
    .filter((t): t is SignalTemplate => t !== null);
}

export function parseSchedule(value: unknown): SignalSchedule {
  if (!value || typeof value !== "object") return DEFAULT_SCHEDULE;
  const o = value as Record<string, unknown>;
  const iv = (o["intervalMinutes"] ?? {}) as Record<string, unknown>;
  const wh = (o["workingHours"] ?? {}) as Record<string, unknown>;
  const num = (v: unknown, fallback: number) =>
    Number.isFinite(Number(v)) && Number(v) >= 0
      ? Math.floor(Number(v))
      : fallback;
  return {
    enabled: o["enabled"] === true,
    intervalMinutes: {
      otc: num(iv["otc"], DEFAULT_SCHEDULE.intervalMinutes.otc),
      exchange: num(iv["exchange"], DEFAULT_SCHEDULE.intervalMinutes.exchange),
      elite: num(iv["elite"], DEFAULT_SCHEDULE.intervalMinutes.elite),
    },
    workingHours: {
      start: Math.max(
        0,
        Math.min(23, num(wh["start"], DEFAULT_SCHEDULE.workingHours.start)),
      ),
      end: Math.max(
        0,
        Math.min(24, num(wh["end"], DEFAULT_SCHEDULE.workingHours.end)),
      ),
    },
  };
}

export async function loadTemplates(): Promise<SignalTemplate[]> {
  const row = await prisma.siteSettings.findUnique({
    where: { key: SETTING_SIGNAL_TEMPLATES },
  });
  return parseTemplates(row?.value);
}

export async function loadSchedule(): Promise<SignalSchedule> {
  const row = await prisma.siteSettings.findUnique({
    where: { key: SETTING_SIGNAL_SCHEDULE },
  });
  return parseSchedule(row?.value);
}

export async function saveTemplates(
  templates: SignalTemplate[],
): Promise<void> {
  await prisma.siteSettings.upsert({
    where: { key: SETTING_SIGNAL_TEMPLATES },
    create: { key: SETTING_SIGNAL_TEMPLATES, value: templates },
    update: { value: templates },
  });
}

export async function saveSchedule(schedule: SignalSchedule): Promise<void> {
  await prisma.siteSettings.upsert({
    where: { key: SETTING_SIGNAL_SCHEDULE },
    create: { key: SETTING_SIGNAL_SCHEDULE, value: schedule },
    update: { value: schedule },
  });
}

/** Pick a template at random weighted by `weight`. */
export function pickWeighted(
  templates: SignalTemplate[],
): SignalTemplate | null {
  if (templates.length === 0) return null;
  const total = templates.reduce((s, t) => s + Math.max(1, t.weight), 0);
  let r = Math.random() * total;
  for (const t of templates) {
    r -= Math.max(1, t.weight);
    if (r <= 0) return t;
  }
  return templates[templates.length - 1];
}

export function isWithinWorkingHours(
  schedule: SignalSchedule,
  now: Date = new Date(),
): boolean {
  const { start, end } = schedule.workingHours;
  if (start === end) return true;
  const h = now.getUTCHours();
  if (start < end) return h >= start && h < end;
  // wrap-around (e.g. 22..6)
  return h >= start || h < end;
}
