"use client";

import { useState, useTransition } from "react";
import { Save } from "lucide-react";
import { useRouter } from "next/navigation";

type Props = {
  tierThresholds: unknown;
  refLinkTemplate: unknown;
  partnerAccount: unknown;
  subAffiliateRate: unknown;
  siteDisclaimer: unknown;
};

const FIELD =
  "w-full h-11 px-4 rounded-xl text-sm outline-none bg-[var(--bg-2)] border border-[var(--b-soft)] focus:border-[var(--b-hard)] transition-colors";

function asNumber(v: unknown, fallback: number): number {
  return typeof v === "number" ? v : fallback;
}

function asString(v: unknown, fallback: string): string {
  return typeof v === "string" ? v : fallback;
}

export function SettingsForm({
  tierThresholds,
  refLinkTemplate,
  partnerAccount,
  subAffiliateRate,
  siteDisclaimer,
}: Props) {
  const initialThresholds: Record<string, unknown> =
    tierThresholds && typeof tierThresholds === "object" && !Array.isArray(tierThresholds)
      ? (tierThresholds as Record<string, unknown>)
      : {};

  const router = useRouter();
  // 2-tier модель: редактируем только T1; T2-T4 выставлены недостижимыми.
  const [t1, setT1] = useState(asNumber(initialThresholds["1"], 20));
  // T2-T4 — фактически выключены. Храним MAX_SAFE_INTEGER, чтобы
  // tier engine без хаков продолжал работать (см. lib/tier.ts).
  const t2 = asNumber(initialThresholds["2"], Number.MAX_SAFE_INTEGER);
  const t3 = asNumber(initialThresholds["3"], Number.MAX_SAFE_INTEGER);
  const t4 = asNumber(initialThresholds["4"], Number.MAX_SAFE_INTEGER);
  const [refTpl, setRefTpl] = useState(asString(refLinkTemplate, ""));
  const [partner, setPartner] = useState(asString(partnerAccount, ""));
  const [subRate, setSubRate] = useState(asNumber(subAffiliateRate, 5));
  const [disclaimer, setDisclaimer] = useState(asString(siteDisclaimer, ""));
  const [pending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  function save(e: React.FormEvent) {
    e.preventDefault();
    const updates: Array<{ key: string; value: unknown }> = [
      { key: "tier_thresholds", value: { 1: t1, 2: t2, 3: t3, 4: t4 } },
      { key: "po_referral_link_template", value: refTpl },
      { key: "po_partner_account", value: partner },
      { key: "sub_affiliate_rate", value: subRate },
      { key: "site_disclaimer", value: disclaimer },
    ];
    startTransition(async () => {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ updates }),
      });
      if (res.ok) {
        setSavedAt(new Date());
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={save} className="space-y-8">
      {/* Tiers */}
      <fieldset>
        <legend className="text-sm font-semibold mb-3">
          Порог депозита для T1 · Pro (USD)
        </legend>
        <p className="text-xs text-[var(--t-3)] mb-3">
          Сейчас работает 2-тирная модель: T0 — регистрация по нашей PO-ссылке,
          T1 — депозит ≥ этого значения. T2/T3/T4 выключены.
        </p>
        <label className="block max-w-xs">
          <span className="text-xs text-[var(--t-3)] uppercase tracking-wider">
            T1 · Pro
          </span>
          <input
            type="number"
            min={0}
            step={10}
            value={t1}
            onChange={(e) => setT1(Number(e.target.value))}
            className={`${FIELD} mt-1`}
          />
        </label>
      </fieldset>

      {/* Ref link */}
      <label className="block">
        <span className="text-sm font-semibold">PocketOption · шаблон реферальной ссылки</span>
        <p className="text-xs text-[var(--t-3)] mt-1 mb-2">
          Поддерживается плейсхолдер <code>{"{click_id}"}</code> — он подставляется как user.id.
        </p>
        <input
          value={refTpl}
          onChange={(e) => setRefTpl(e.target.value)}
          className={FIELD}
          placeholder="https://po.cash/smart/aff?click_id={click_id}"
        />
      </label>

      <label className="block">
        <span className="text-sm font-semibold">PocketOption · partner account ID</span>
        <input
          value={partner}
          onChange={(e) => setPartner(e.target.value)}
          className={`${FIELD} mt-2`}
          placeholder="123456"
        />
      </label>

      <label className="block">
        <span className="text-sm font-semibold">Sub-affiliate (%)</span>
        <p className="text-xs text-[var(--t-3)] mt-1 mb-2">
          Сколько процентов от FTD рефералов 2-го уровня мы выплачиваем нашему юзеру.
        </p>
        <input
          type="number"
          min={0}
          max={100}
          step={0.5}
          value={subRate}
          onChange={(e) => setSubRate(Number(e.target.value))}
          className={FIELD}
        />
      </label>

      <label className="block">
        <span className="text-sm font-semibold">Дисклеймер</span>
        <textarea
          value={disclaimer}
          onChange={(e) => setDisclaimer(e.target.value)}
          rows={4}
          className={`${FIELD.replace("h-11", "min-h-[110px] py-3")} resize-y`}
        />
      </label>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 h-11 px-6 rounded-full bg-[var(--brand-gold)] text-[#1a1208] font-semibold text-sm hover:bg-[var(--brand-gold-bright)] transition-colors disabled:opacity-50"
        >
          <Save size={16} />
          {pending ? "Сохраняем…" : "Сохранить"}
        </button>
        {savedAt && (
          <span className="text-xs text-[var(--green)]">
            Сохранено в {savedAt.toLocaleTimeString("ru-RU")}
          </span>
        )}
      </div>
    </form>
  );
}
