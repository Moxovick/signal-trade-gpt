"use client";

/**
 * Animated space background for the Signals page.
 * Renders stars, nebula glows, and shooting stars via CSS.
 */
export function SpaceBackground() {
  return (
    <div className="signals-space-bg" aria-hidden="true">
      {/* Nebula glows */}
      <div className="nebula nebula-1" />
      <div className="nebula nebula-2" />
      <div className="nebula nebula-3" />

      {/* Star layers */}
      <div className="stars stars-sm" />
      <div className="stars stars-md" />
      <div className="stars stars-lg" />

      {/* Shooting stars */}
      <div className="shooting-star shooting-star-1" />
      <div className="shooting-star shooting-star-2" />
      <div className="shooting-star shooting-star-3" />
    </div>
  );
}
