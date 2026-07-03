"use client";

/**
 * Subtle animated background for the Signals page.
 * Warm-tone glows + twinkling dots — matches Variant A palette.
 */
export function SpaceBackground() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes ss-drift1 { 0% { transform: translate(0,0) scale(1); } 100% { transform: translate(25px,-15px) scale(1.08); } }
        @keyframes ss-drift2 { 0% { transform: translate(0,0) scale(1); } 100% { transform: translate(-20px,20px) scale(1.05); } }
        @keyframes ss-twinkle { 0%,100% { opacity: 0.3; } 50% { opacity: 0.7; } }
      `}} />
      <div aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
        {/* Glow — warm gold top-left */}
        <div style={{ position: "absolute", width: 400, height: 400, top: "-8%", left: "-4%", borderRadius: "50%", filter: "blur(100px)", opacity: 0.12, background: "radial-gradient(circle, rgba(212,160,23,0.3) 0%, transparent 70%)", animation: "ss-drift1 28s ease-in-out infinite alternate" }} />
        {/* Glow — muted gold bottom-right */}
        <div style={{ position: "absolute", width: 350, height: 300, bottom: "5%", right: "-6%", borderRadius: "50%", filter: "blur(100px)", opacity: 0.1, background: "radial-gradient(circle, rgba(212,160,23,0.2) 0%, transparent 70%)", animation: "ss-drift2 32s ease-in-out infinite alternate" }} />

        {/* Stars — small */}
        <div style={{ position: "absolute", width: 1, height: 1, borderRadius: "50%", animation: "ss-twinkle 6s ease-in-out infinite alternate", boxShadow: "120px 50px rgba(244,236,221,0.25), 300px 130px rgba(244,236,221,0.2), 520px 80px rgba(244,236,221,0.15), 80px 220px rgba(244,236,221,0.25), 650px 200px rgba(244,236,221,0.2), 900px 90px rgba(244,236,221,0.15), 150px 350px rgba(244,236,221,0.2), 400px 420px rgba(244,236,221,0.15), 750px 310px rgba(244,236,221,0.25)" }} />
        {/* Stars — medium */}
        <div style={{ position: "absolute", width: 2, height: 2, borderRadius: "50%", animation: "ss-twinkle 8s ease-in-out infinite alternate-reverse", boxShadow: "200px 100px rgba(244,236,221,0.3), 450px 250px rgba(244,236,221,0.2), 700px 50px rgba(244,236,221,0.15), 100px 400px rgba(244,236,221,0.25), 350px 300px rgba(244,236,221,0.3), 600px 450px rgba(244,236,221,0.15)" }} />
      </div>
    </>
  );
}
