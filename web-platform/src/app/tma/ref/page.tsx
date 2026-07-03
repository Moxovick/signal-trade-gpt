"use client";

import { useState } from "react";
import { Check, Copy, Share2, Users } from "lucide-react";
import { TmaShell, type TmaUser } from "../_components/TmaShell";
import { useI18n } from "@/lib/i18n/context";

const BOT_URL = process.env["NEXT_PUBLIC_BOT_URL"] ?? "";

export default function TmaRefPage() {
  return <TmaShell>{(user) => <RefProgram user={user} />}</TmaShell>;
}

function RefProgram({ user }: { user: TmaUser }) {
  const { t } = useI18n();
  const refLink = `${BOT_URL}?start=ref_${user.referralCode}`;
  const [copied, setCopied] = useState(false);

  function copy() {
    void navigator.clipboard?.writeText(refLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(refLink)}&text=${encodeURIComponent(t.tma.ref.shareText)}`;

  return (
    <main className="max-w-md mx-auto p-4 space-y-4 pb-6">
      <header className="pt-2">
        <div className="text-xs text-[var(--t-3)] uppercase tracking-[0.2em]">{t.tma.ref.title}</div>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Users size={18} className="text-[var(--brand-gold)]" />
          {t.tma.ref.subtitle}
        </h1>
      </header>

      {/* Counter */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-[var(--b-soft)] bg-[var(--bg-1)] p-4 text-center">
          <div className="text-3xl font-bold text-[var(--brand-gold)]">{user.referralsCount}</div>
          <div className="text-xs text-[var(--t-3)] mt-1 uppercase tracking-wider">{t.tma.ref.stats.invited}</div>
        </div>
        <div className="rounded-2xl border border-[var(--b-soft)] bg-[var(--bg-1)] p-4 text-center">
          <div className="text-3xl font-bold text-[var(--brand-gold)]">5%</div>
          <div className="text-xs text-[var(--t-3)] mt-1 uppercase tracking-wider">{t.tma.ref.stats.subAffiliate}</div>
        </div>
      </div>

      {/* How it works */}
      <div className="rounded-2xl border border-[var(--b-soft)] bg-[var(--bg-1)] p-4 space-y-3">
        <div className="text-xs uppercase tracking-wider text-[var(--t-3)]">{t.tma.ref.howItWorks.title}</div>
        {[
          t.tma.ref.howItWorks.steps.step1,
          t.tma.ref.howItWorks.steps.step2,
          t.tma.ref.howItWorks.steps.step3,
        ].map((step, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="size-5 rounded-full bg-[var(--brand-gold)]/15 text-[var(--brand-gold)] text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
              {i + 1}
            </div>
            <p className="text-sm text-[var(--t-2)] leading-snug">{step}</p>
          </div>
        ))}
      </div>

      {/* Ref link */}
      <div className="rounded-2xl border border-[var(--b-soft)] bg-[var(--bg-1)] p-4 space-y-3">
        <div className="text-xs uppercase tracking-wider text-[var(--t-3)]">{t.tma.ref.yourLink}</div>
        <div className="text-xs font-mono bg-[var(--bg-2)] rounded-xl px-3 py-2.5 text-[var(--brand-gold)] break-all">
          {refLink}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={copy}
            className="flex items-center justify-center gap-2 rounded-xl border border-[var(--b-soft)] bg-[var(--bg-2)] px-4 py-2.5 text-sm font-medium text-[var(--t-1)] hover:border-[var(--b-hard)] active:scale-95 transition-all"
          >
            {copied ? <Check size={14} className="text-[var(--green)]" /> : <Copy size={14} />}
            {copied ? t.tma.ref.copied : t.tma.ref.copy}
          </button>
          <a
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl bg-[var(--brand-gold)] px-4 py-2.5 text-sm font-bold text-[#1a1208] active:scale-95 transition-all"
          >
            <Share2 size={14} />
            {t.tma.ref.share}
          </a>
        </div>
      </div>
    </main>
  );
}
