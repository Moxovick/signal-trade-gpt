import type { NextConfig } from "next";

/**
 * Cross-origin tunnel hosts that the dev server should accept.
 *
 * Next.js 16 blocks `_next/*` (HMR, JS chunks, RSC payloads) from any host
 * other than localhost — this is what causes form submits to silently
 * fall back to native browser GET on tunneled URLs (loca.lt, ngrok, etc.).
 *
 * To allow a new tunnel host: add it here OR set DEV_ALLOWED_ORIGINS in .env
 * as a comma-separated list (preferred — no code change needed).
 */
const envOrigins = (process.env["DEV_ALLOWED_ORIGINS"] ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const allowedDevOrigins = [
  "stgsignaltest.loca.lt",
  "*.loca.lt",
  "*.ngrok-free.app",
  "*.ngrok.io",
  "*.trycloudflare.com",
  ...envOrigins,
];

const nextConfig: NextConfig = {
  allowedDevOrigins,
};

export default nextConfig;
