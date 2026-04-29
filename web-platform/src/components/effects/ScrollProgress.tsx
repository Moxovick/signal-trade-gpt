"use client";

import { useEffect, useState } from "react";

/** 2px gold progress bar pinned to the top of the viewport. */
export function ScrollProgress() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    function onScroll() {
      const el = document.documentElement;
      const scrolled = el.scrollTop / Math.max(1, el.scrollHeight - el.clientHeight);
      setPct(Math.min(100, Math.max(0, scrolled * 100)));
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      aria-hidden
      className="fixed top-0 left-0 right-0 pointer-events-none"
      style={{
        height: 2,
        background: "transparent",
        zIndex: 50,
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${pct}%`,
          background: "linear-gradient(90deg, var(--brand-gold-deep), var(--brand-gold), var(--brand-gold-bright))",
          boxShadow: "0 0 10px rgba(212, 160, 23, 0.6)",
          transition: "width .15s linear",
        }}
      />
    </div>
  );
}
