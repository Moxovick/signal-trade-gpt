"use client";

import { useI18n } from "@/lib/i18n/context";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Save, Plus, Trash2, MessageSquare, Send, Activity, HelpCircle, LineChart, BarChart3, Layers } from "lucide-react";
import {
  type BotConfig,
  type BotFaqEntry,
  type PriceSource,
  type TierFeatureFlags,
  type TierFeatures,
  type TierThresholds,
  SETTING_KEYS,
} from "@/lib/bot-config";

const FIELD =
  "w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-colors bg-[#0a0a13] border border-white/[0.08] focus:border-white/20 text-white placeholder-[#555]";

const SECTION_CARD =
  "rounded-2xl border p-5 space-y-4";
const SECTION_STYLE = {
  background: "#0d0d18",
  borderColor: "rgba(255,255,255,0.07)",
};

const SECTION_HEADER = "flex items-center gap-2 text-sm font-semibold mb-3 text-white/90";

export function BotConfigForm({ initial }: { initial: BotConfig }) {
  const router = useRouter();
  const { t } = useI18n();
  const bc = t?.admin?.botConfig ?? {};
  const bcSections = (bc as Record<string, Record<string, string>>).sections ?? {};
  const bcFeatureFlags = (bc as Record<string, Record<string, string>>).featureFlags ?? {};
  const bcPriceProvider = (bc as Record<string, Record<string, string>>).priceProvider ?? {};
  const bcFaqFields = (bc as Record<string, Record<string, string>>).faqFields ?? {};
  const bcBtns = (bc as Record<string, Record<string, string>>).buttons ?? {};
  const [welcome, setWelcome] = useState(initial.welcome);
  const [signalTemplate, setSignalTemplate] = useState(initial.signalTemplate);
  const [disclaimer, setDisclaimer] = useState(initial.disclaimer);
  const [tierFeatures, setTierFeatures] = useState<TierFeatures>(
    initial.tierFeatures,
  );
  const [tierThresholds, setTierThresholds] = useState<TierThresholds>(
    initial.tierThresholds,
  );
  const [autoEnabled] = useState(initial.autopost.enabled);
  const [autoInterval] = useState(
    initial.autopost.intervalMinutes,
  );
  const [autoPairs] = useState(
    initial.autopost.pairs.join(", "),
  );
  const [faq, setFaq] = useState<BotFaqEntry[]>(initial.faq);
  const [priceSource, setPriceSource] = useState<PriceSource>(
    initial.priceSource,
  );
  const [pending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  function setTierFeature(
    tier: keyof TierFeatures,
    patch: Partial<TierFeatureFlags>,
  ) {
    setTierFeatures((prev) => ({
      ...prev,
      [tier]: { ...prev[tier], ...patch },
    }));
  }

  function setThreshold(tier: keyof TierThresholds, value: number) {
    setTierThresholds((prev) => ({ ...prev, [tier]: value }));
  }

  function addFaq() {
    setFaq((prev) => [...prev, { question: "", answer: "" }]);
  }
  function removeFaq(idx: number) {
    setFaq((prev) => prev.filter((_, i) => i !== idx));
  }
  function updateFaq(idx: number, patch: Partial<BotFaqEntry>) {
    setFaq((prev) =>
      prev.map((f, i) => (i === idx ? { ...f, ...patch } : f)),
    );
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const pairs = autoPairs
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);

    const updates = [
      { key: SETTING_KEYS.welcome, value: welcome },
      { key: SETTING_KEYS.signalTemplate, value: signalTemplate },
      { key: SETTING_KEYS.disclaimer, value: disclaimer },
      { key: SETTING_KEYS.tierFeatures, value: tierFeatures },
      { key: SETTING_KEYS.tierThresholds, value: tierThresholds },
      {
        key: SETTING_KEYS.autopost,
        value: {
          enabled: autoEnabled,
          intervalMinutes: autoInterval,
          pairs,
        },
      },
      { key: SETTING_KEYS.faq, value: faq },
      { key: SETTING_KEYS.priceSource, value: priceSource },
    ];

    startTransition(async () => {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ updates }),
      });
      if (!res.ok) {
        const data: { reason?: string } = await res.json().catch(() => ({}));
        setError(data.reason ?? `${(bc as Record<string, string>).errorPrefix ?? "Ошибка"} ${res.status}`);
        return;
      }
      setSavedAt(new Date());
      router.refresh();
    });
  }

  return (
    <form onSubmit={save} className="space-y-6">
      {error && (
        <div className="px-4 py-3 rounded-xl text-sm border border-red-500/30 bg-red-500/10 text-red-400">
          {error}
        </div>
      )}

      {/* Welcome message */}
      <div className={SECTION_CARD} style={SECTION_STYLE}>
        <div className={SECTION_HEADER}>
          <MessageSquare size={16} className="text-[#f5c518]" />
          {bcSections.welcome ?? "Приветственное сообщение бота"}
        </div>
        <p className="text-xs text-[#777]">
          Отправляется при <code>/start</code>. Доступные переменные:{" "}
          <code>{`{first_name}`}</code>, <code>{`{tier}`}</code>,{" "}
          <code>{`{deposit}`}</code>.
        </p>
        <textarea
          value={welcome}
          onChange={(e) => setWelcome(e.target.value)}
          rows={6}
          className={`${FIELD} font-mono text-xs leading-relaxed`}
        />
      </div>

      {/* Signal template */}
      <div className={SECTION_CARD} style={SECTION_STYLE}>
        <div className={SECTION_HEADER}>
          <Send size={16} className="text-[#f5c518]" />
          {bcSections.signalTemplate ?? "Шаблон сообщения сигнала"}
        </div>
        <p className="text-xs text-[#777]">
          Как бот форматирует каждый сигнал. Переменные:{" "}
          <code>{`{pair}`}</code>, <code>{`{direction_word}`}</code>,{" "}
          <code>{`{direction_emoji}`}</code>, <code>{`{expiration}`}</code>,{" "}
          <code>{`{confidence}`}</code>, <code>{`{entry_price}`}</code>,{" "}
          <code>{`{entry_line}`}</code>, <code>{`{analysis_line}`}</code>.
        </p>
        <textarea
          value={signalTemplate}
          onChange={(e) => setSignalTemplate(e.target.value)}
          rows={8}
          className={`${FIELD} font-mono text-xs leading-relaxed`}
        />
      </div>

      {/* On-demand model notice */}
      <div className={SECTION_CARD} style={SECTION_STYLE}>
        <div className={SECTION_HEADER}>
          <Activity size={16} className="text-[#f5c518]" />
          {bcSections.onDemandModel ?? "Модель сигналов: On-demand"}
        </div>
        <p className="text-sm text-[#aaa]">
          Сигналы генерируются по запросу пользователя (кнопка в дашборде или
          команда /signal в боте). Дневные лимиты и типы сигналов настраиваются
          в разделе{" "}
          <a href="/admin/signals" className="text-[#f5c518] hover:underline">
            Сигналы
          </a>.
        </p>
      </div>

      {/* Tier deposit thresholds */}
      <div className={SECTION_CARD} style={SECTION_STYLE}>
        <div className={SECTION_HEADER}>
          <Layers size={16} className="text-[#f5c518]" />
          {bcSections.tierThresholds ?? "Пороги депозита для тиров (USD)"}
        </div>
        <p className="text-xs text-[#777]">
          Минимальная сумма депозита на PocketOption, при которой открывается
          соответствующий тир. T0 — без депозита.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(["1", "2", "3", "4"] as const).map((t) => (
            <label
              key={t}
              className="text-xs text-[#777] flex flex-col gap-1"
            >
              T{t} (USD)
              <input
                type="number"
                min={0}
                value={tierThresholds[t]}
                onChange={(e) =>
                  setThreshold(t, Number(e.target.value))
                }
                className={FIELD}
              />
            </label>
          ))}
        </div>
      </div>

      {/* Tier features */}
      <div className={SECTION_CARD} style={SECTION_STYLE}>
        <div className={SECTION_HEADER}>
          <BarChart3 size={16} className="text-[#f5c518]" />
          {bcSections.tierPerks ?? "Перки на тир"}
        </div>
        <p className="text-xs text-[#777]">
          Что открывается на каждом уровне. T0 (Free) = 3 сигнала/день OTC,
          T1 (Basic) = 10/день OTC+биржа, T2 (Pro) = безлимит все типы.
        </p>
        <div className="space-y-2">
          {(["0", "1", "2", "3", "4"] as const).map((t) => (
            <div
              key={t}
              className="grid grid-cols-1 md:grid-cols-[60px_1fr_1fr_1fr] gap-3 items-center px-3 py-2 rounded-xl border border-white/[0.05]"
            >
              <div className="text-xs font-mono text-[#f5c518]">T{t}</div>
              <label className="flex items-center gap-2 text-xs text-[#aaa] cursor-pointer">
                <input
                  type="checkbox"
                  checked={tierFeatures[t].chartIndicators}
                  onChange={(e) =>
                    setTierFeature(t, { chartIndicators: e.target.checked })
                  }
                  className="w-4 h-4 accent-[#f5c518]"
                />
                {bcFeatureFlags.chartWithIndicators ?? "График с RSI / MACD / объёмом"}
              </label>
              <label className="flex items-center gap-2 text-xs text-[#aaa]">
                {bcFeatureFlags.earlyAccess ?? "Ранний доступ (сек)"}
                <input
                  type="number"
                  min={0}
                  value={tierFeatures[t].earlyAccessSeconds}
                  onChange={(e) =>
                    setTierFeature(t, {
                      earlyAccessSeconds: Number(e.target.value),
                    })
                  }
                  className={`${FIELD} w-20`}
                />
              </label>
              <label className="flex items-center gap-2 text-xs text-[#aaa] cursor-pointer">
                <input
                  type="checkbox"
                  checked={tierFeatures[t].elitePairs}
                  onChange={(e) =>
                    setTierFeature(t, { elitePairs: e.target.checked })
                  }
                  className="w-4 h-4 accent-[#f5c518]"
                />
                {bcFeatureFlags.elitePairs ?? "Elite-пары (≥90%)"}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Price source */}
      <div className={SECTION_CARD} style={SECTION_STYLE}>
        <div className={SECTION_HEADER}>
          <LineChart size={16} className="text-[#f5c518]" />
          {bcSections.priceSource ?? "Источник цен"}
        </div>
        <p className="text-xs text-[#777]">
          Откуда брать реальные цены для расчёта входа/прогноза. PocketOption
          API подключим, когда сапорт пришлёт ключ — остальные провайдеры
          доступны сразу.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <label className="text-xs text-[#777] flex flex-col gap-1">
            {bcPriceProvider.provider ?? "Провайдер"}
            <select
              value={priceSource.provider}
              onChange={(e) =>
                setPriceSource({
                  ...priceSource,
                  provider: e.target.value as PriceSource["provider"],
                })
              }
              className={FIELD}
            >
              <option value="off">{bcPriceProvider.disabled ?? "Выкл (генерировать случайно)"}</option>
              <option value="twelvedata">TwelveData (forex realtime)</option>
              <option value="yahoo">{bcPriceProvider.yahoo ?? "Yahoo Finance (15-min задержка)"}</option>
              <option value="binance">{bcPriceProvider.binance ?? "Binance (только крипта)"}</option>
              <option value="pocketoption">{bcPriceProvider.pocketOption ?? "PocketOption (когда дадут API)"}</option>
            </select>
          </label>
          <label className="text-xs text-[#777] flex flex-col gap-1">
            {bcPriceProvider.endpoint ?? "Endpoint (необязательно)"}
            <input
              value={priceSource.endpoint ?? ""}
              onChange={(e) =>
                setPriceSource({ ...priceSource, endpoint: e.target.value })
              }
              className={FIELD}
              placeholder="https://api.twelvedata.com"
            />
          </label>
          <label className="text-xs text-[#777] flex flex-col gap-1">
            {bcPriceProvider.apiKey ?? "API ключ (если требуется)"}
            <input
              type="password"
              value={priceSource.apiKey ?? ""}
              onChange={(e) =>
                setPriceSource({ ...priceSource, apiKey: e.target.value })
              }
              className={FIELD}
              placeholder="••••••••"
            />
          </label>
        </div>
      </div>

      {/* FAQ */}
      <div className={SECTION_CARD} style={SECTION_STYLE}>
        <div className={SECTION_HEADER}>
          <HelpCircle size={16} className="text-[#f5c518]" />
          {(bcSections.faq ?? "FAQ бота ({n})").replace("{n}", String(faq.length))}
        </div>
        <div className="space-y-3">
          {faq.map((entry, i) => (
            <div
              key={i}
              className="grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] gap-2"
            >
              <input
                value={entry.question}
                onChange={(e) => updateFaq(i, { question: e.target.value })}
                placeholder={bcFaqFields.question ?? "Вопрос"}
                className={FIELD}
              />
              <textarea
                value={entry.answer}
                onChange={(e) => updateFaq(i, { answer: e.target.value })}
                placeholder={bcFaqFields.answer ?? "Ответ"}
                rows={2}
                className={`${FIELD} py-2`}
              />
              <button
                type="button"
                onClick={() => removeFaq(i)}
                className="px-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 self-start"
                title="Удалить"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addFaq}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.08] text-white/80"
          >
            <Plus size={14} /> {bcFaqFields.addQuestion ?? "Добавить вопрос"}
          </button>
        </div>
      </div>

      {/* Disclaimer */}
      <div className={SECTION_CARD} style={SECTION_STYLE}>
        <div className={SECTION_HEADER}>
          <MessageSquare size={16} className="text-[#f5c518]" />
          {bcSections.disclaimer ?? "Дисклеймер"}
        </div>
        <textarea
          value={disclaimer}
          onChange={(e) => setDisclaimer(e.target.value)}
          rows={3}
          className={`${FIELD} text-xs`}
        />
      </div>

      {/* Save */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm disabled:opacity-50"
          style={{ background: "#f5c518", color: "#1a1208" }}
        >
          <Save size={14} />
          {pending ? (bcBtns.saving ?? "Сохраняем…") : (bcBtns.save ?? "Сохранить весь конфиг")}
        </button>
        {savedAt && (
          <span className="text-xs text-green-400">
            {(bcBtns.savedAt ?? "Сохранено в {time}").replace("{time}", savedAt.toLocaleTimeString("ru-RU"))}
          </span>
        )}
      </div>
    </form>
  );
}
