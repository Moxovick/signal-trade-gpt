"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, FlaskConical, CheckCircle2, XCircle, Pencil } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/lib/i18n/context";

type Source = "db" | "env" | "unset";

/**
 * IMPORTANT: we deliberately do NOT receive the raw apiToken value here.
 * Server passes only a masked preview ("tZbV…CQy") + a boolean so the secret
 * never lands in the rendered HTML / DOM. Admin types a fresh value to replace.
 */
type Props = {
  apiTokenSet: boolean;
  apiTokenPreview: string;
  initialPartnerId: string;
  tokenSource: Source;
  partnerSource: Source;
};

const FIELD =
  "w-full h-11 px-4 rounded-xl text-sm outline-none bg-[var(--bg-2)] border " +
  "border-[var(--b-soft)] focus:border-[var(--b-hard)] transition-colors " +
  "font-mono";

type TestResult =
  | { kind: "idle" }
  | { kind: "pending" }
  | { kind: "ok"; deposit: number; ftdAt: string | null }
  | { kind: "error"; reason: string };

const REASON_RU_FALLBACK: Record<string, string> = {
  not_configured: "Не настроено: задай api token и partner id выше и сохрани.",
  not_found: "PO вернул 404. Этого трейдера нет в нашей сети — он не регался по нашей ссылке.",
  auth_failed: "PO вернул 401/403. Проверь api token и partner id.",
  network_error: "Не дозвонились до PO. Попробуй ещё раз.",
  invalid_response: "PO ответил, но в неожиданном формате. Возможно изменилась схема API.",
  invalid_id_format: "ID трейдера должен быть числом 4–12 цифр.",
  missing_id: "Введи ID трейдера.",
};

function SourceBadge({ source }: { source: Source }) {
  const { t } = useI18n();
  const sourceBadges = (t?.admin?.poApi as Record<string, Record<string, string>> | undefined)?.sourceBadges ?? {};
  const colour: Record<Source, string> = {
    db: "bg-[rgba(76,195,138,0.10)] text-[var(--green)]",
    env: "bg-[rgba(212,160,23,0.12)] text-[var(--brand-gold)]",
    unset: "bg-[rgba(255,90,90,0.10)] text-[var(--red)]",
  };
  const labelFallback: Record<Source, string> = {
    db: "из БД",
    env: "из .env",
    unset: "не задано",
  };
  const label = sourceBadges[source] ?? labelFallback[source];
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider ${colour[source]}`}>
      {label}
    </span>
  );
}

export function PoApiForm({
  apiTokenSet,
  apiTokenPreview,
  initialPartnerId,
  tokenSource,
  partnerSource,
}: Props) {
  const router = useRouter();
  const { t } = useI18n();
  const pa = t?.admin?.poApi ?? {};
  const paErrors = (pa as Record<string, Record<string, string>>).errors ?? {};
  const paApiToken = (pa as Record<string, Record<string, string>>).apiToken ?? {};
  const paPartnerId = (pa as Record<string, Record<string, string>>).partnerId ?? {};
  const paBtns = (pa as Record<string, Record<string, string>>).buttons ?? {};
  const paTest = (pa as Record<string, Record<string, string>>).test ?? {};
  const REASON_RU: Record<string, string> = {
    not_configured: paErrors.notConfigured ?? REASON_RU_FALLBACK.not_configured,
    not_found: paErrors.notFound ?? REASON_RU_FALLBACK.not_found,
    auth_failed: paErrors.unauthorized ?? REASON_RU_FALLBACK.auth_failed,
    network_error: paErrors.networkError ?? REASON_RU_FALLBACK.network_error,
    invalid_response: paErrors.unexpectedFormat ?? REASON_RU_FALLBACK.invalid_response,
    invalid_id_format: paErrors.invalidTraderId ?? REASON_RU_FALLBACK.invalid_id_format,
    missing_id: paErrors.emptyTraderId ?? REASON_RU_FALLBACK.missing_id,
  };
  // Empty input means «не трогать токен в БД». Admin types a fresh value to
  // replace it; we never preload the real token into the DOM.
  const [apiTokenInput, setApiTokenInput] = useState("");
  const [editToken, setEditToken] = useState<boolean>(!apiTokenSet);
  const [partnerId, setPartnerId] = useState(initialPartnerId);
  const [testTraderId, setTestTraderId] = useState("");
  const [testResult, setTestResult] = useState<TestResult>({ kind: "idle" });
  const [pending, setPending] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      // Send api token ONLY if the admin typed something. Empty input = keep
      // existing value in the DB (or env fallback) untouched.
      const body: Record<string, string> = {
        partnerId: partnerId.trim(),
      };
      if (editToken && apiTokenInput.trim()) {
        body.apiToken = apiTokenInput.trim();
      }
      const nothingChanged =
        !("apiToken" in body) && body.partnerId === initialPartnerId.trim();
      if (nothingChanged) {
        setError(paErrors.nothingToSave ?? "Нечего сохранять — введи новое значение.");
        return;
      }
      const r = await fetch("/api/admin/po-config", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await r.json()) as { ok?: boolean; reason?: string };
      if (!data.ok) {
        setError(data.reason ?? "save_failed");
        return;
      }
      setSavedAt(new Date());
      setApiTokenInput("");
      setEditToken(false);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  async function runTest() {
    const id = testTraderId.trim();
    if (!id) {
      setTestResult({ kind: "error", reason: "missing_id" });
      return;
    }
    setTestResult({ kind: "pending" });
    try {
      const r = await fetch(
        `/api/admin/po-config/test-trader?id=${encodeURIComponent(id)}`,
      );
      const data = (await r.json()) as
        | { ok: true; info: { depositTotal: number; ftdAt: string | null } }
        | { ok: false; reason: string };
      if (data.ok) {
        setTestResult({
          kind: "ok",
          deposit: data.info.depositTotal,
          ftdAt: data.info.ftdAt,
        });
      } else {
        setTestResult({ kind: "error", reason: data.reason });
      }
    } catch {
      setTestResult({ kind: "error", reason: "network_error" });
    }
  }

  return (
    <form onSubmit={save} className="space-y-6">
      <div className="block">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold">API token</span>
          <SourceBadge source={tokenSource} />
        </div>
        <p className="text-xs text-[var(--t-3)] mb-2">
          {paApiToken.description ?? "Секретный токен, выданный сапортом PocketOption."}
        </p>
        {apiTokenSet && !editToken ? (
          <div className="flex items-center gap-3 flex-wrap">
            <code
              className={`${FIELD} flex items-center cursor-default select-all`}
              style={{ fontFamily: "var(--font-jetbrains)" }}
            >
              {apiTokenPreview}
            </code>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setEditToken(true)}
              iconLeft={<Pencil size={14} />}
            >
              {paApiToken.replace ?? "Заменить"}
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <input
              value={apiTokenInput}
              onChange={(e) => setApiTokenInput(e.target.value)}
              className={FIELD}
              placeholder={
                apiTokenSet
                  ? `Введи новый токен чтобы заменить (${apiTokenPreview})`
                  : "tZbVsAcRvjpZbV7mrCQy"
              }
              autoComplete="off"
              spellCheck={false}
              type="password"
            />
            {apiTokenSet && (
              <button
                type="button"
                onClick={() => {
                  setEditToken(false);
                  setApiTokenInput("");
                }}
                className="text-xs text-[var(--t-3)] hover:text-[var(--t-1)]"
              >
                {paApiToken.cancel ?? "Отмена"}
              </button>
            )}
          </div>
        )}
      </div>

      <label className="block">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold">Partner ID</span>
          <SourceBadge source={partnerId === initialPartnerId ? partnerSource : "db"} />
        </div>
        <p className="text-xs text-[var(--t-3)] mb-2">
          {paPartnerId.description ?? "Числовой ID партнёра с pocketpartners.com (вкладка «Профиль»)."}
        </p>
        <input
          value={partnerId}
          onChange={(e) => setPartnerId(e.target.value)}
          className={FIELD}
          placeholder="123456"
          autoComplete="off"
          spellCheck={false}
        />
      </label>

      <div className="flex items-center gap-4 flex-wrap">
        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={pending}
          iconLeft={<Save size={16} />}
        >
          {pending ? (paBtns.saving ?? "Сохраняем…") : (paBtns.save ?? "Сохранить")}
        </Button>
        {savedAt && (
          <span className="text-xs text-[var(--green)]">
            {(paBtns.savedAt ?? "Сохранено в {time}").replace("{time}", savedAt.toLocaleTimeString("ru-RU"))}
          </span>
        )}
        {error && (
          <span className="text-xs text-[var(--red)]">{(paBtns.error ?? "Ошибка: {msg}").replace("{msg}", error)}</span>
        )}
      </div>

      <div className="border-t border-[var(--b-soft)] pt-6 space-y-3">
        <div>
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <FlaskConical size={14} className="text-[var(--brand-gold)]" />
            {paTest.title ?? "Проверка API"}
          </h3>
          <p className="text-xs text-[var(--t-3)] mt-1">
            {paTest.description ?? "Введи ID реального трейдера из нашей сети — сайт сделает запрос к PocketOption Affiliate API с текущими кредами."}
          </p>
        </div>
        <div className="flex items-stretch gap-2 flex-wrap">
          <input
            value={testTraderId}
            onChange={(e) => setTestTraderId(e.target.value)}
            className={`${FIELD} max-w-xs`}
            placeholder={paTest.placeholder ?? "ID трейдера, напр. 1234567"}
            inputMode="numeric"
          />
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={runTest}
            disabled={testResult.kind === "pending"}
          >
            {testResult.kind === "pending" ? (paTest.requesting ?? "Запрашиваем…") : (paTest.request ?? "Запросить")}
          </Button>
        </div>
        {testResult.kind === "ok" && (
          <div className="flex items-start gap-2 text-sm text-[var(--green)]">
            <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
            <div>
              <div>{paTest.traderFound ?? "Трейдер найден в нашей сети."}</div>
              <div className="text-xs text-[var(--t-3)] mt-0.5">
                Total deposit: ${testResult.deposit.toFixed(2)}
                {testResult.ftdAt ? ` · FTD @ ${testResult.ftdAt}` : ` · ${paTest.noFtd ?? "FTD не зафиксирован"}`}
              </div>
            </div>
          </div>
        )}
        {testResult.kind === "error" && (
          <div className="flex items-start gap-2 text-sm text-[var(--red)]">
            <XCircle size={16} className="mt-0.5 shrink-0" />
            <div>{REASON_RU[testResult.reason] ?? `Неизвестная ошибка: ${testResult.reason}`}</div>
          </div>
        )}
      </div>
    </form>
  );
}
