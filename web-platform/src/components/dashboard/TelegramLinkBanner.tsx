"use client";

/**
 * Banner shown at the top of every dashboard page when the user hasn't linked
 * their Telegram account yet. Dismissed via localStorage (survives page nav).
 *
 * Rendered dynamically (no SSR) to avoid a hydration mismatch when reading
 * localStorage in the initial state.
 */
import dynamic from "next/dynamic";
import { useState } from "react";
import { Send, X } from "lucide-react";
import { TelegramDeeplinkButton } from "@/components/auth/TelegramDeeplinkButton";
import { useRouter } from "next/navigation";

const DISMISS_KEY = "tg_banner_dismissed_v1";

function Banner() {
  const router = useRouter();
  const [visible, setVisible] = useState(() => !localStorage.getItem(DISMISS_KEY));

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="mb-6 flex items-start gap-3 rounded-xl border border-[var(--brand-gold)]/30 bg-[var(--brand-gold)]/5 px-4 py-3">
      <div className="mt-0.5 shrink-0 text-[var(--brand-gold)]">
        <Send size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[var(--t-1)] mb-0.5">
          Привяжи Telegram — получай сигналы в чат
        </p>
        <p className="text-xs text-[var(--t-3)] mb-3">
          После привязки сигналы начнут приходить прямо в Telegram, а Mini App узнает тебя автоматически.
        </p>
        <TelegramDeeplinkButton
          purpose="link"
          label="Привязать Telegram"
          onLinked={() => {
            dismiss();
            router.refresh();
          }}
        />
      </div>
      <button
        onClick={dismiss}
        className="shrink-0 text-[var(--t-3)] hover:text-[var(--t-1)] transition-colors mt-0.5"
        aria-label="Закрыть"
      >
        <X size={16} />
      </button>
    </div>
  );
}

// No SSR: Banner reads localStorage in its initial state, which is not
// available on the server. The banner is cosmetic — hiding it during the
// server pass is fine.
export const TelegramLinkBanner = dynamic(() => Promise.resolve(Banner), {
  ssr: false,
});
