"use client";

import { useEffect, useState } from "react";

/**
 * 1.2s splash screen with logo + progress bar. Fades out and unmounts.
 *
 * Always shown on initial mount; CSS animation handles fade-out so we don't
 * mutate state in the same render that triggered the effect.
 */
export function Preloader() {
  const [hidden, setHidden] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setDone(true), 1100);
    const t2 = setTimeout(() => setHidden(true), 1500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (hidden) return null;

  return (
    <div
      aria-hidden
      className="fixed inset-0 flex flex-col items-center justify-center"
      style={{
        background: "var(--bg-0)",
        zIndex: 10000,
        transition: "opacity .35s ease",
        opacity: done ? 0 : 1,
        pointerEvents: done ? "none" : undefined,
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
      `}</style>
    </div>
  );
}
