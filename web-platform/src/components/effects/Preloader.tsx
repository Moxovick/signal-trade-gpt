"use client";

import { useEffect, useState } from "react";

/**
 * 1.5s splash. Failsafe: even if React hydration is delayed/blocked, a
 * CSS animation removes the splash via `animation-fill-mode: forwards` +
 * `pointer-events: none` after 1.6s, so the page is never visually frozen.
 */
export function Preloader() {
  const [unmounted, setUnmounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setUnmounted(true), 1700);
    return () => clearTimeout(t);
  }, []);

  if (unmounted) return null;

  return (
    <div
      aria-hidden
      className="preloader-root fixed inset-0 flex flex-col items-center justify-center"
      style={{
        background: "var(--bg-0)",
        zIndex: 10000,
      }}
    >
      <div
        className="text-5xl tracking-widest"
        style={{
          fontFamily: "var(--font-bebas, 'Bebas Neue', sans-serif)",
          color: "var(--brand-gold)",
          letterSpacing: "0.18em",
          textShadow: "0 0 32px rgba(212, 160, 23, 0.5)",
        }}
      >
        SIGNAL · TRADE · GPT
      </div>
      <div
        className="mt-8 h-[2px] w-64 overflow-hidden rounded-full"
        style={{ background: "rgba(212, 160, 23, 0.15)" }}
      >
        <div
          style={{
            height: "100%",
            background: "var(--brand-gold)",
            animation: "preload-bar 1.2s ease-out forwards",
            boxShadow: "0 0 12px rgba(212, 160, 23, 0.7)",
          }}
        />
      </div>
      <style>{`
        @keyframes preload-bar {
          from { width: 0%; }
          to   { width: 100%; }
        }
        @keyframes preload-fade {
          0%, 80% { opacity: 1; pointer-events: auto; }
          100%    { opacity: 0; pointer-events: none; visibility: hidden; }
        }
        .preloader-root {
          animation: preload-fade 1.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
