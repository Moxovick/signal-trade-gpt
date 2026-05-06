"use client";

import { useState } from "react";
import { Copy, CheckCircle2 } from "lucide-react";

export function ReferralCopy({ code, baseUrl }: { code: string; baseUrl: string }) {
  const [copied, setCopied] = useState(false);
  const link = `${baseUrl.replace(/\/$/, "")}/register?ref=${encodeURIComponent(code)}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API blocked — silently ignore.
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <code
          className="flex-1 px-3 h-11 rounded-xl bg-[var(--bg-2)] border border-[var(--b-soft)] flex items-center text-sm truncate"
          style={{ fontFamily: "var(--font-jetbrains)" }}
        >
          {link}
        </code>
        <button
          onClick={copy}
          className="inline-flex items-center gap-1.5 h-11 px-4 rounded-xl border border-[var(--b-soft)] hover:border-[var(--brand-gold)] text-sm transition-colors"
        >
          {copied ? (
            <>
              <CheckCircle2 size={14} className="text-[var(--green)]" /> Скопировано
            </>
          ) : (
            <>
              <Copy size={14} /> Копировать
            </>
          )}
        </button>
      </div>
      <p className="text-xs text-[var(--t-3)]">
        Твой код:{" "}
        <code style={{ fontFamily: "var(--font-jetbrains)" }} className="text-[var(--t-1)]">
          {code}
        </code>
      </p>
    </div>
  );
}
