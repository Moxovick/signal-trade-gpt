"use client";

import { useEffect, useRef } from "react";

/**
 * Two-layer cursor: 8px dot follows the mouse 1:1, 36px ring trails with lag.
 *
 * On hover over interactive elements (a, button, [role="button"], [data-cursor="hover"])
 * the ring grows to 52px and brightens.
 *
 * Mobile / coarse-pointer / reduced-motion: do nothing.
 */
const HOVER_SELECTOR = 'a, button, [role="button"], [data-cursor="hover"], input, textarea, select, label';

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduceMotion) return;

    document.body.classList.add("has-custom-cursor");

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let raf = 0;

    function onMove(e: MouseEvent) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (dot) {
        dot.style.transform = `translate3d(${mouseX - 4}px, ${mouseY - 4}px, 0)`;
      }
    }

    function onOver(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      if (!ring || !target) return;
      if (target.closest?.(HOVER_SELECTOR)) {
        ring.dataset.hovering = "1";
      } else {
        delete ring.dataset.hovering;
      }
    }

    function tick() {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      if (ring) {
        const size = ring.dataset.hovering ? 52 : 36;
        ring.style.width = `${size}px`;
        ring.style.height = `${size}px`;
        ring.style.transform = `translate3d(${ringX - size / 2}px, ${ringY - size / 2}px, 0)`;
      }
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onOver);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      document.body.classList.remove("has-custom-cursor");
    };
  }, []);

  return (
    <>
      <div
        ref={dotRef}
        aria-hidden
        className="fixed top-0 left-0 pointer-events-none rounded-full"
        style={{
          width: 8,
          height: 8,
          background: "var(--brand-gold)",
          mixBlendMode: "screen",
          zIndex: 9999,
          willChange: "transform",
        }}
      />
      <div
        ref={ringRef}
        aria-hidden
        className="fixed top-0 left-0 pointer-events-none rounded-full transition-[width,height,border-color] duration-150"
        style={{
          border: "1.5px solid rgba(212, 160, 23, 0.55)",
          zIndex: 9998,
          willChange: "transform, width, height",
        }}
      />
    </>
  );
}
