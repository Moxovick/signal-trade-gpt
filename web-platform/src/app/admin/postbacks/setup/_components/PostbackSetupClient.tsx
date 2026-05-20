"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Copy, KeyRound, RefreshCw, Eye, EyeOff, Check } from "lucide-react";

type EventDef = { key: string; label: string; description: string };
type MacroDef = { macro: string; description: string };

type Props = {
  baseUrl: string;
  events: EventDef[];
  macros: MacroDef[];
  initialSecretSet: boolean;
  initialSecretSource: "db" | "env" | "unset";
};

/**
 * Build the full URL for a given event, using the SECRET_PLACEHOLDER token
 * for display when the actual secret isn't loaded.
 */
function buildUrl(baseUrl: string, event: string, secret: string): string {
  // Tailored macro list per event. We always include the universal attribution
  // macros at the tail so admins can compare across events.
  const common = [
    "click_id={click_id}",
    "trader_id={trader_id}",
    "site_id={site_id}",
    "cid={cid}",
    "ac={ac}",
    "country={country}",
    "device={device_type}",
    "os={os_version}",
    "browser={browser}",
    "promo={promo}",
    "link_type={link_type}",
    "dt={date_time}",
    "sub_id1={sub_id1}",
    "sub_id2={sub_id2}",
    "sub_id3={sub_id3}",
    "sub_id4={sub_id4}",
    "sub_id5={sub_id5}",
  ];
  const eventSpecific: Record<string, string[]> = {
    registration: [],
    email_confirm: [],
    ftd: ["sumdep={sumdep}"],
    redeposit: ["sumdep={sumdep}"],
    commission: ["commission={commission}"],
    withdrawal: ["wdr_sum={wdr_sum}", "status={status}"],
  };
  const allParams = [
    `event=${event}`,
    ...(eventSpecific[event] ?? []),
    ...common,
    `secret=${secret}`,
  ];
  return `${baseUrl}/api/po/postback?${allParams.join("&")}`;
}

const SECRET_PLACEHOLDER = "ВСТАВЬ_СЕКРЕТ";

export function PostbackSetupClient({
  baseUrl,
  events,
  macros,
  initialSecretSet,
  initialSecretSource,
}: Props) {
  const [secret, setSecret] = useState<string>(""); // only present after rotate/reveal
  const [secretSet, setSecretSet] = useState<boolean>(initialSecretSet);
  const [secretSource, setSecretSource] = useState<typeof initialSecretSource>(
    initialSecretSource,
  );
  const [showSecret, setShowSecret] = useState<boolean>(false);
  const [pending, setPending] = useState<"rotate" | "reveal" | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const displaySecret = useMemo(() => {
    if (!secretSet) return SECRET_PLACEHOLDER;
    if (!secret) return SECRET_PLACEHOLDER;
    return showSecret ? secret : `${secret.slice(0, 4)}…${secret.slice(-4)}`;
  }, [secret, secretSet, showSecret]);

  async function rotate(confirmIfExisting: boolean) {
    if (
      confirmIfExisting &&
      secretSet &&
      !window.confirm(
        "Сгенерировать новый секрет?\n\nСтарые URL в Pocket Partners перестанут работать — придётся обновить их.",
      )
    ) {
      return;
    }
    setPending("rotate");
    setError(null);
    try {
      const r = await fetch("/api/admin/po-config/rotate-secret", { method: "POST" });
      const data = (await r.json()) as { ok?: boolean; secret?: string; reason?: string };
      if (!data.ok || !data.secret) {
        setError(data.reason ?? "rotate_failed");
        return;
      }
      setSecret(data.secret);
      setSecretSet(true);
      setSecretSource("db");
      setShowSecret(true);
    } finally {
      setPending(null);
    }
  }

  async function reveal() {
    setPending("reveal");
    setError(null);
    try {
      const r = await fetch("/api/admin/po-config/rotate-secret?reveal=1", {
        method: "POST",
      });
      const data = (await r.json()) as { ok?: boolean; secret?: string; reason?: string };
      if (!data.ok || !data.secret) {
        setError(data.reason ?? "reveal_failed");
        return;
      }
      setSecret(data.secret);
      setSecretSet(true);
      setShowSecret(true);
    } finally {
      setPending(null);
    }
  }

  async function copyText(label: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied((cur) => (cur === label ? null : cur)), 1500);
    } catch {
      setError("Не удалось скопировать. Скопируй вручную.");
    }
  }

  const effectiveSecret = secret || SECRET_PLACEHOLDER;

  return (
    <div className="space-y-6">
      {/* Secret block */}
      <Card padding="lg" className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="size-9 rounded-xl bg-[var(--bg-2)] border border-[var(--b-soft)] flex items-center justify-center">
            <KeyRound size={16} className="text-[var(--brand-gold)]" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold">Секрет постбэков</h2>
            <p className="text-xs text-[var(--t-3)] mt-1">
              Этот секрет вставляется в URL постбэка (<code>?secret=…</code>).
              Сайт принимает только запросы, в которых он совпадает.
              {secretSource === "env" && (
                <>
                  {" "}
                  Сейчас секрет берётся из <code>.env</code> — нажми «сгенерировать», чтобы перенести его в БД.
                </>
              )}
              {secretSource === "unset" && (
                <>
                  {" "}
                  Секрет ещё не задан — без него постбэки не сработают в проде.
                </>
              )}
            </p>
          </div>
          <span
            className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
              secretSet
                ? "bg-[rgba(142,224,107,0.10)] text-[var(--green)]"
                : "bg-[rgba(255,90,90,0.10)] text-[var(--red)]"
            }`}
          >
            {secretSet ? `задан · ${secretSource}` : "не задан"}
          </span>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <code
            className="px-3 py-2 rounded-xl bg-[var(--bg-2)] border border-[var(--b-soft)] text-sm flex-1 min-w-[260px] break-all"
            style={{ fontFamily: "var(--font-jetbrains)" }}
          >
            {displaySecret}
          </code>
          {secret && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSecret((s) => !s)}
              iconLeft={showSecret ? <EyeOff size={14} /> : <Eye size={14} />}
            >
              {showSecret ? "Скрыть" : "Показать"}
            </Button>
          )}
          {secret && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyText("secret", secret)}
              iconLeft={copied === "secret" ? <Check size={14} /> : <Copy size={14} />}
            >
              {copied === "secret" ? "Скопировано" : "Копировать"}
            </Button>
          )}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Button
            variant="primary"
            size="sm"
            disabled={pending !== null}
            onClick={() => rotate(true)}
            iconLeft={<RefreshCw size={14} />}
          >
            {secretSet ? "Сгенерировать новый" : "Сгенерировать секрет"}
          </Button>
          {secretSet && secretSource === "db" && !secret && (
            <Button
              variant="secondary"
              size="sm"
              disabled={pending !== null}
              onClick={reveal}
              iconLeft={<Eye size={14} />}
            >
              Показать текущий
            </Button>
          )}
        </div>

        {error && (
          <p className="text-xs text-[var(--red)]">Ошибка: {error}</p>
        )}
      </Card>

      {/* Per-event URLs */}
      <Card padding="none">
        <div className="px-5 py-3 border-b border-[var(--b-soft)] text-sm font-semibold">
          URL для вставки в Pocket Partners
        </div>
        <div className="divide-y divide-[var(--b-soft)]">
          {events.map((ev) => {
            const url = buildUrl(baseUrl, ev.key, effectiveSecret);
            return (
              <div key={ev.key} className="px-5 py-4 space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="font-semibold text-sm">{ev.label}</div>
                    <div className="text-xs text-[var(--t-3)] mt-0.5">
                      event=<code>{ev.key}</code>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyText(ev.key, url)}
                    iconLeft={
                      copied === ev.key ? <Check size={14} /> : <Copy size={14} />
                    }
                  >
                    {copied === ev.key ? "Скопировано" : "Копировать URL"}
                  </Button>
                </div>
                <p className="text-xs text-[var(--t-3)]">{ev.description}</p>
                <code
                  className="block text-xs px-3 py-2 rounded-lg bg-[var(--bg-2)] border border-[var(--b-soft)] break-all"
                  style={{ fontFamily: "var(--font-jetbrains)" }}
                >
                  {url}
                </code>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Macros cheat-sheet */}
      <Card padding="lg">
        <h2 className="text-base font-semibold mb-1">Шпаргалка по макросам PO</h2>
        <p className="text-xs text-[var(--t-3)] mb-3">
          Эти плейсхолдеры PocketOption подставит автоматически — менять их
          вручную не нужно.
        </p>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-xs">
          {macros.map((m) => (
            <li key={m.macro} className="flex gap-2">
              <code
                className="text-[var(--brand-gold)] shrink-0"
                style={{ fontFamily: "var(--font-jetbrains)" }}
              >
                {m.macro}
              </code>
              <span className="text-[var(--t-2)]">— {m.description}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
