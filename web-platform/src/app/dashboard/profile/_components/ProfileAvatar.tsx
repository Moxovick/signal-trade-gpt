"use client";

import { useState } from "react";

export function ProfileAvatar({
  src,
  initials,
}: {
  src: string | null;
  initials: string;
}) {
  const [failed, setFailed] = useState(false);

  if (src && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt="Аватар"
        className="size-20 rounded-2xl object-cover border border-[var(--b-soft)] shrink-0"
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <div className="size-20 rounded-2xl bg-[var(--brand-gold)] text-[#1a1208] flex items-center justify-center text-3xl font-bold shrink-0 select-none">
      {initials}
    </div>
  );
}
