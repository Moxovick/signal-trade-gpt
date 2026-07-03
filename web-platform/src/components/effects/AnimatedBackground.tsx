"use client";

/**
 * CSS-based animated background — drifting gold radial glows + subtle twinkle dots.
 * Matches Landing.dc.html reference. Disabled on mobile / reduced-motion.
 */
export function AnimatedBackground() {
  return (
    <div
      aria-hidden
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
    >
      {/* Drifting gold glows */}
      <div
        className="absolute"
        style={{
          top: "-20%",
          left: "-10%",
          width: "60%",
          height: "70%",
          background: "radial-gradient(circle, rgba(212,160,23,.16), transparent 62%)",
          filter: "blur(20px)",
          animation: "glowA 26s ease-in-out infinite",
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: "-25%",
          left: "-5%",
          width: "55%",
          height: "65%",
          background: "radial-gradient(circle, rgba(212,160,23,.12), transparent 60%)",
          filter: "blur(20px)",
          animation: "glowB 32s ease-in-out infinite",
        }}
      />
      <div
        className="absolute"
        style={{
          top: "10%",
          right: "-15%",
          width: "50%",
          height: "55%",
          background: "radial-gradient(circle, rgba(91,141,239,.06), transparent 60%)",
          filter: "blur(24px)",
          animation: "glowB 38s ease-in-out infinite",
        }}
      />

      {/* Rare twinkle dots */}
      <div
        className="absolute rounded-full"
        style={{
          top: "62%",
          left: "31%",
          width: 4,
          height: 4,
          background: "#d4a017",
          animation: "twinkle 5s ease-in-out infinite",
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          top: "88%",
          left: "9%",
          width: 3,
          height: 3,
          background: "#d4a017",
          animation: "twinkle 7s ease-in-out infinite",
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          top: "8%",
          right: "6%",
          width: 3,
          height: 3,
          background: "#d4a017",
          animation: "twinkle 6s ease-in-out infinite",
        }}
      />
    </div>
  );
}
