"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

export function ReferralCopy({ code, baseUrl }: { code: string; baseUrl: string }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const shortLink = `${baseUrl.replace(/\/$/, "")}/r/${code}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(shortLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // silently ignore
    }
  }

  return (
    <button
      onClick={copy}
      className="w-full group rounded-xl border border-[var(--b-soft)] hover:border-[var(--brand-gold)] bg-[var(--bg-2)] hover:bg-[rgba(212,160,23,0.05)] transition-all p-3 text-left"
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span
          className="text-xs font-mono text-[var(--t-2)] truncate"
          style={{ fontFamily: "var(--font-jetbrains)" }}
        >
          /r/{code}
        </span>
        <span className="shrink-0 flex items-center gap-1 text-[11px] text-[var(--brand-gold)] font-semibold">
          {copied
            ? <><Check size={12} /> {t.referralCopy.copied}</>
            : <><Copy size={12} /> {t.referralCopy.copy}</>
          }
        </span>
      </div>
      <p className="text-[11px] text-[var(--t-3)] leading-relaxed">
        {t.referralCopy.hint}
      </p>
    </button>
  );
}
