"use client";

import { useState } from "react";
import { Copy, Check, Users } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export function ReferralWidget({
  code,
  count,
  baseUrl,
}: {
  code: string;
  count: number;
  baseUrl: string;
}) {
  const [copied, setCopied] = useState(false);
  const refUrl = `${baseUrl}/r/${code}`;

  async function copy() {
    await navigator.clipboard.writeText(refUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="rounded-2xl border border-[var(--b-soft)] bg-[var(--bg-1)] p-6">
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <div className="text-xs uppercase tracking-widest text-[var(--brand-gold)] mb-1">
            Реф-программа
          </div>
          <div className="text-lg font-semibold">Зови трейдеров — получай 5%</div>
        </div>
        <div
          className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold"
          style={{
            background: "rgba(212,160,23,0.1)",
            color: "var(--brand-gold)",
          }}
        >
          <Users size={12} /> {count}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="bg-white p-2 rounded-lg shrink-0">
          <QRCodeSVG value={refUrl} size={88} bgColor="#ffffff" fgColor="#0a0a0a" level="M" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-[var(--t-3)] mb-1">Твоя ссылка</div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--bg-2)] border border-[var(--b-soft)]">
            <code
              className="text-xs flex-1 truncate text-[var(--t-1)]"
              style={{ fontFamily: "var(--font-jetbrains)" }}
              title={refUrl}
            >
              {refUrl}
            </code>
            <button
              onClick={copy}
              className="text-[var(--brand-gold)] hover:text-[var(--brand-gold-bright)] shrink-0"
              aria-label="Скопировать"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
          <div className="mt-3 text-xs text-[var(--t-2)] leading-relaxed">
            Реферал депонирует — ты получаешь{" "}
            <span className="text-[var(--brand-gold)] font-semibold">5%</span> от его
            оборота, без потолка.
          </div>
        </div>
      </div>
    </div>
  );
}
