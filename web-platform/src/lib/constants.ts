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
  process.env["NEXT_PUBLIC_PO_AFFILIATE_URL"] ??
  "https://po-ru4.click/register?utm_campaign=825519&utm_source=affiliate&utm_medium=sr&a=Be8CXM52oc4EOp&al=1769855&ac=signal&cid=960046&code=WELCOME50";
