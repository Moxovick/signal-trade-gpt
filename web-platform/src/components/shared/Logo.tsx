export function Logo({ size = "md", glow = false }: { size?: "sm" | "md" | "lg"; glow?: boolean }) {
  const sizes = { sm: "h-6", md: "h-8", lg: "h-12" };
  return (
    <div className={`flex items-center gap-2 ${glow ? "logo-glow" : ""}`}>
      <svg className={sizes[size]} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="10" fill="url(#logo-bg)" />
        <path d="M12 28L16 12H20L24 28H21L20 24H16L15 28H12Z" fill="#f5c518" />
        <path d="M16.5 22H19.5L18 15L16.5 22Z" fill="#08081a" />
        <path d="M22 18L26 12H30L26 19L30 28H26L22 20V18Z" fill="#f5c518" />
        <circle cx="32" cy="10" r="3" fill="#00e5a0" />
        <circle cx="32" cy="10" r="3" fill="#00e5a0" opacity="0.4">
          <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite" />
        </circle>
        <defs>
          <linearGradient id="logo-bg" x1="0" y1="0" x2="40" y2="40">
            <stop stopColor="#1a1a35" />
            <stop offset="1" stopColor="#0e0e22" />
          </linearGradient>
        </defs>
      </svg>
      <span className="font-black tracking-wider" style={{ fontFamily: "var(--font-bebas)", color: "#f5c518" }}>
        SIGNAL<span className="text-white"> TRADE</span> GPT
      </span>
    </div>
  );
}

export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="10" fill="url(#lm-bg)" />
      <path d="M12 28L16 12H20L24 28H21L20 24H16L15 28H12Z" fill="#f5c518" />
      <path d="M16.5 22H19.5L18 15L16.5 22Z" fill="#08081a" />
      <path d="M22 18L26 12H30L26 19L30 28H26L22 20V18Z" fill="#f5c518" />
      <circle cx="32" cy="10" r="3" fill="#00e5a0" />
      <defs>
        <linearGradient id="lm-bg" x1="0" y1="0" x2="40" y2="40">
          <stop stopColor="#1a1a35" />
          <stop offset="1" stopColor="#0e0e22" />
        </linearGradient>
      </defs>
    </svg>
  );
}
