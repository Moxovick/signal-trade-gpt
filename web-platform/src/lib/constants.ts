/**
 * Client-safe constants (available in both Server and Client Components).
 *
 * All values that must be accessible in "use client" components MUST use
 * NEXT_PUBLIC_ env vars.
 */

/**
 * PocketOption affiliate/referral URL shown in client-side UI.
 * Set NEXT_PUBLIC_PO_AFFILIATE_URL in .env to override (e.g. a tracked
 * short-link). Falls back to the canonical PocketOption homepage.
 */
export const PO_AFFILIATE_URL =
  process.env["NEXT_PUBLIC_PO_AFFILIATE_URL"] ?? "https://pocketoption.com/";
