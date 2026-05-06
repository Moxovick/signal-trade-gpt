"use client";

/**
 * OnboardingChecklist — 3-step "next action" prompts on the dashboard.
 *
 * Auto-hides itself once all steps are done so it doesn't clutter the UI for
 * established users.
 */
import { useState } from "react";
import { CheckCircle2, Circle, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";

export type ChecklistStep = {
  id: string;
  label: string;
  description: string;
  done: boolean;
  cta?: { href: string; label: string; external?: boolean };
};

export function OnboardingChecklist({ steps }: { steps: ChecklistStep[] }) {
  const [open, setOpen] = useState(true);
  const completed = steps.filter((s) => s.done).length;
  if (completed === steps.length) return null;

  return (
    <div className="rounded-2xl border border-[var(--b-soft)] bg-[var(--bg-1)] overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full px-5 py-4 flex items-center justify-between gap-3 hover:bg-[var(--bg-2)] transition-colors text-left"
      >
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-[var(--brand-gold)]">
            Следующие шаги
          </div>
          <div className="text-sm font-semibold text-[var(--t-1)] mt-0.5">
            {completed} из {steps.length} готово
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-32 h-1.5 rounded-full bg-[var(--bg-3)] overflow-hidden">
            <div
              className="h-full bg-[var(--brand-gold)]"
              style={{ width: `${(completed / steps.length) * 100}%` }}
            />
          </div>
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {open ? (
        <ol className="border-t border-[var(--b-soft)] divide-y divide-[var(--b-soft)]">
          {steps.map((s) => (
            <li key={s.id} className="px-5 py-3 flex items-start gap-3">
              {s.done ? (
                <CheckCircle2
                  size={20}
                  className="shrink-0 text-[var(--green)] mt-0.5"
                />
              ) : (
                <Circle
                  size={20}
                  className="shrink-0 text-[var(--t-3)] mt-0.5"
                />
              )}
              <div className="flex-1 min-w-0">
                <div
                  className={`font-medium text-sm ${
                    s.done ? "text-[var(--t-3)] line-through" : "text-[var(--t-1)]"
                  }`}
                >
                  {s.label}
                </div>
                <div className="text-xs text-[var(--t-2)] mt-0.5">
                  {s.description}
                </div>
              </div>
              {!s.done && s.cta ? (
                s.cta.external ? (
                  <a
                    href={s.cta.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-xs font-semibold text-[var(--brand-gold)] hover:underline shrink-0 mt-0.5"
                  >
                    {s.cta.label} →
                  </a>
                ) : (
                  <Link
                    href={s.cta.href}
                    className="text-xs font-semibold text-[var(--brand-gold)] hover:underline shrink-0 mt-0.5"
                  >
                    {s.cta.label} →
                  </Link>
                )
              ) : null}
            </li>
          ))}
        </ol>
      ) : null}
    </div>
  );
}
