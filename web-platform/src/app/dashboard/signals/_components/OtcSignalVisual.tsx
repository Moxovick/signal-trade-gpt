"use client";

type Props = {
  pair: string;
  direction: "CALL" | "PUT";
  confidence: number;
  expiration: string;
};

/**
 * Decorative OTC signal card — dark/gold theme with animated SVG waves.
 */
export function OtcSignalVisual({ pair, direction, confidence, expiration }: Props) {
  const isCall = direction === "CALL";
  const dirColor = isCall ? "#22c55e" : "#ef4444";
  const gold = "#d4a017";
  const goldDim = "rgba(212,160,23,0.35)";
  const uid = `otc-${pair.replace(/[^a-zA-Z]/g, "")}`;

  // Generate SVG wave paths
  function wavePath(amplitude: number, frequency: number, phase: number, yOffset: number): string {
    const points: string[] = [];
    const width = 800;
    for (let x = 0; x <= width; x += 4) {
      const y = yOffset + amplitude * Math.sin((x / width) * Math.PI * 2 * frequency + phase);
      points.push(`${x === 0 ? "M" : "L"}${x},${y.toFixed(1)}`);
    }
    return points.join(" ");
  }

  const waves = [
    { amp: 18, freq: 1.5, phase: 0, opacity: 0.4, width: 1.5 },
    { amp: 12, freq: 2.2, phase: 1.2, opacity: 0.3, width: 1 },
    { amp: 25, freq: 1.0, phase: 2.5, opacity: 0.25, width: 2 },
    { amp: 8, freq: 3.0, phase: 0.8, opacity: 0.2, width: 0.8 },
    { amp: 15, freq: 1.8, phase: 3.8, opacity: 0.35, width: 1.2 },
  ];

  // Triangle points (centered at 400, 90 in the SVG viewBox)
  const triSize = 38;
  const triCx = 400;
  const triCy = 85;
  const triPoints = isCall
    ? `${triCx},${triCy - triSize} ${triCx - triSize * 0.9},${triCy + triSize * 0.6} ${triCx + triSize * 0.9},${triCy + triSize * 0.6}`
    : `${triCx},${triCy + triSize} ${triCx - triSize * 0.9},${triCy - triSize * 0.6} ${triCx + triSize * 0.9},${triCy - triSize * 0.6}`;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes ${uid}-wave1 { 0% { transform: translateX(0); } 100% { transform: translateX(-80px); } }
        @keyframes ${uid}-wave2 { 0% { transform: translateX(0); } 100% { transform: translateX(60px); } }
        @keyframes ${uid}-wave3 { 0% { transform: translateX(0); } 100% { transform: translateX(-50px); } }
        @keyframes ${uid}-wave4 { 0% { transform: translateX(0); } 100% { transform: translateX(40px); } }
        @keyframes ${uid}-wave5 { 0% { transform: translateX(0); } 100% { transform: translateX(-70px); } }
        @keyframes ${uid}-pulse { 0%,100% { opacity: 0.7; } 50% { opacity: 1; } }
        @keyframes ${uid}-glow { 0%,100% { filter: drop-shadow(0 0 8px ${dirColor}66); } 50% { filter: drop-shadow(0 0 20px ${dirColor}aa); } }
        @keyframes ${uid}-confbar { 0% { transform: scaleX(0); } 100% { transform: scaleX(1); } }
      `}} />
      <div
        style={{
          width: "100%",
          borderRadius: 16,
          overflow: "hidden",
          position: "relative",
          background: "linear-gradient(145deg, #0a0806 0%, #1a1208 40%, #12090a 100%)",
          border: `1px solid ${goldDim}`,
          fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)",
        }}
      >
        {/* Top section: pair + OTC badge + meta */}
        <div style={{ padding: "20px 24px 0 24px", position: "relative", zIndex: 2 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{
              fontSize: 24,
              fontWeight: 800,
              color: gold,
              letterSpacing: "0.02em",
            }}>
              {pair}
            </span>
            <span style={{
              fontSize: 10,
              fontWeight: 700,
              padding: "3px 10px",
              borderRadius: 6,
              border: `1.5px solid ${gold}`,
              color: gold,
              textTransform: "uppercase" as const,
              letterSpacing: "0.12em",
              background: "rgba(212,160,23,0.08)",
            }}>
              OTC
            </span>
          </div>
          <div style={{
            marginTop: 6,
            fontSize: 12,
            color: gold,
            opacity: 0.75,
            fontWeight: 500,
            letterSpacing: "0.03em",
          }}>
            Exp: {expiration} &middot; Conf: {confidence}%
          </div>
        </div>

        {/* SVG waves + triangle */}
        <div style={{ position: "relative", width: "100%", height: 180, zIndex: 1 }}>
          <svg
            viewBox="0 0 800 180"
            preserveAspectRatio="none"
            style={{ width: "100%", height: "100%", display: "block" }}
          >
            <defs>
              <linearGradient id={`${uid}-wgrad`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={gold} stopOpacity="0" />
                <stop offset="20%" stopColor={gold} stopOpacity="1" />
                <stop offset="80%" stopColor={gold} stopOpacity="1" />
                <stop offset="100%" stopColor={gold} stopOpacity="0" />
              </linearGradient>
              <filter id={`${uid}-triGlow`}>
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Wave lines */}
            {waves.map((w, i) => (
              <path
                key={i}
                d={wavePath(w.amp, w.freq, w.phase, 90)}
                fill="none"
                stroke={`url(#${uid}-wgrad)`}
                strokeWidth={w.width}
                opacity={w.opacity}
                style={{
                  animation: `${uid}-wave${i + 1} ${6 + i * 1.5}s ease-in-out infinite alternate`,
                }}
              />
            ))}

            {/* Direction triangle */}
            <polygon
              points={triPoints}
              fill={dirColor}
              opacity={0.9}
              filter={`url(#${uid}-triGlow)`}
              style={{
                animation: `${uid}-glow 3s ease-in-out infinite`,
              }}
            />
            {/* Inner lighter triangle */}
            <polygon
              points={isCall
                ? `${triCx},${triCy - triSize + 10} ${triCx - (triSize * 0.9 - 8)},${triCy + triSize * 0.6 - 6} ${triCx + (triSize * 0.9 - 8)},${triCy + triSize * 0.6 - 6}`
                : `${triCx},${triCy + triSize - 10} ${triCx - (triSize * 0.9 - 8)},${triCy - triSize * 0.6 + 6} ${triCx + (triSize * 0.9 - 8)},${triCy - triSize * 0.6 + 6}`
              }
              fill={dirColor}
              opacity={0.3}
            />
          </svg>

          {/* Direction label below triangle */}
          <div style={{
            position: "absolute",
            bottom: 12,
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: 16,
            fontWeight: 800,
            color: dirColor,
            letterSpacing: "0.2em",
            textTransform: "uppercase" as const,
            animation: `${uid}-pulse 2.5s ease-in-out infinite`,
          }}>
            {direction}
          </div>
        </div>

        {/* Confidence bar (subtle) */}
        <div style={{ padding: "0 24px 12px 24px", position: "relative", zIndex: 2 }}>
          <div style={{
            width: "100%",
            height: 3,
            borderRadius: 2,
            background: "rgba(255,255,255,0.06)",
            overflow: "hidden",
          }}>
            <div style={{
              width: `${confidence}%`,
              height: "100%",
              borderRadius: 2,
              background: `linear-gradient(90deg, ${gold}44, ${gold})`,
              transformOrigin: "left",
              animation: `${uid}-confbar 1.2s ease-out forwards`,
            }} />
          </div>
        </div>

        {/* Bottom branding bar */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          padding: "10px 24px",
          borderTop: "1px solid rgba(212,160,23,0.12)",
          background: "rgba(0,0,0,0.25)",
        }}>
          <span style={{
            fontSize: 9,
            fontWeight: 700,
            textTransform: "uppercase" as const,
            letterSpacing: "0.25em",
            color: gold,
            opacity: 0.5,
          }}>
            SIGNAL TRADE GPT
          </span>
        </div>
      </div>
    </>
  );
}
