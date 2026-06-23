"use client";

/**
 * Inline "Привязать" widget on unmatched postback rows.
 *
 * Admin clicks the row's «Привязать» button → mini-form expands with a
 * user lookup (by username / email / firstName) and a confirm action.
 * On success the page is refreshed so the row shows the resolved user.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Link2, X, Check, AlertCircle, Search } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

type UserHit = {
  id: string;
  firstName: string | null;
  username: string | null;
  email: string | null;
};

const REASON_RU_FALLBACK: Record<string, string> = {
  forbidden: "Нет доступа.",
  missing_user_id: "Не указан user_id.",
  postback_not_found: "Postback не найден.",
  already_bound: "Этот postback уже привязан.",
  user_not_found: "Пользователь не найден.",
  missing_trader_id: "Не указан PocketOption trader id.",
  trader_id_taken: "Этот trader_id уже привязан к другому пользователю.",
};

type Props = {
  postbackId: string;
  defaultTraderId: string | null;
};

export function BindUnmatched({ postbackId, defaultTraderId }: Props) {
  const router = useRouter();
  const { t } = useI18n();
  const bu = t?.admin?.bindUnmatched ?? {};
  const buErrors = (bu as Record<string, Record<string, string>>).errors ?? {};
  const buUi = (bu as Record<string, Record<string, string>>).ui ?? {};
  const REASON_RU: Record<string, string> = {
    forbidden: buErrors.noAccess ?? REASON_RU_FALLBACK.forbidden,
    missing_user_id: buErrors.noUserId ?? REASON_RU_FALLBACK.missing_user_id,
    postback_not_found: buErrors.postbackNotFound ?? REASON_RU_FALLBACK.postback_not_found,
    already_bound: buErrors.alreadyBound ?? REASON_RU_FALLBACK.already_bound,
    user_not_found: buErrors.userNotFound ?? REASON_RU_FALLBACK.user_not_found,
    missing_trader_id: buErrors.noTraderId ?? REASON_RU_FALLBACK.missing_trader_id,
    trader_id_taken: buErrors.traderIdTaken ?? REASON_RU_FALLBACK.trader_id_taken,
  };
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<UserHit[]>([]);
  const [selected, setSelected] = useState<UserHit | null>(null);
  const [traderId, setTraderId] = useState(defaultTraderId ?? "");
  const [searching, setSearching] = useState(false);
  const [binding, setBinding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function search() {
    const q = query.trim();
    if (q.length < 2) {
      setHits([]);
      return;
    }
    setSearching(true);
    setError(null);
    try {
      const r = await fetch(
        `/api/admin/users/search?q=${encodeURIComponent(q)}`,
      );
      const data = (await r.json()) as { ok: boolean; users?: UserHit[] };
      setHits(data.ok && data.users ? data.users : []);
    } catch {
      setHits([]);
      setError(buUi.searchError ?? "Не удалось искать пользователей.");
    } finally {
      setSearching(false);
    }
  }

  async function bind() {
    if (!selected) return;
    setBinding(true);
    setError(null);
    try {
      const r = await fetch(`/api/admin/postbacks/${postbackId}/bind`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          userId: selected.id,
          poTraderId: traderId.trim() || undefined,
        }),
      });
      const data = (await r.json()) as { ok: boolean; reason?: string };
      if (!data.ok) {
        setError(REASON_RU[data.reason ?? ""] ?? data.reason ?? (buUi.error ?? "Ошибка"));
        return;
      }
      setDone(true);
      // Reload row state.
      router.refresh();
    } catch {
      setError(buUi.networkError ?? "Сетевая ошибка, попробуй ещё раз.");
    } finally {
      setBinding(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs text-[var(--brand-gold)] hover:text-[var(--brand-gold-bright)] inline-flex items-center gap-1"
      >
        <Link2 size={12} />
        {buUi.bind ?? "Привязать"}
      </button>
    );
  }

  if (done) {
    return (
      <span className="text-xs text-[var(--green)] inline-flex items-center gap-1">
        <Check size={12} />
        {buUi.bound ?? "Привязано"}
      </span>
    );
  }

  return (
    <div className="space-y-2 p-3 rounded-lg bg-[var(--bg-2)] border border-[var(--b-soft)]">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-[var(--t-3)]">
          {buUi.title ?? "Привязать postback к пользователю"}
        </span>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setQuery("");
            setHits([]);
            setSelected(null);
            setError(null);
          }}
          className="text-[var(--t-3)] hover:text-[var(--t-1)]"
          aria-label={buUi.close ?? "Закрыть"}
        >
          <X size={14} />
        </button>
      </div>

      {!selected ? (
        <>
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 px-3 h-9 rounded-lg bg-[var(--bg-1)] border border-[var(--b-soft)] focus-within:border-[var(--b-hard)]">
              <Search size={12} className="text-[var(--t-3)] shrink-0" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    search();
                  }
                }}
                placeholder="username / email / first name…"
                className="flex-1 bg-transparent text-xs outline-none"
              />
            </div>
            <button
              type="button"
              onClick={search}
              disabled={searching || query.trim().length < 2}
              className="text-xs h-9 px-3 rounded-lg bg-[var(--brand-gold)] text-[#1a1208] font-semibold disabled:opacity-50"
            >
              {searching ? (buUi.searching ?? "Ищу…") : (buUi.find ?? "Найти")}
            </button>
          </div>
          {hits.length === 0 && query.length >= 2 && !searching && (
            <div className="text-xs text-[var(--t-3)]">
              {buUi.noMatches ?? "Нет совпадений."}
            </div>
          )}
          {hits.length > 0 && (
            <div className="divide-y divide-[var(--b-soft)] rounded-lg border border-[var(--b-soft)] max-h-48 overflow-y-auto">
              {hits.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => setSelected(u)}
                  className="w-full px-3 py-2 flex items-center gap-3 text-left hover:bg-[var(--bg-1)]"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm truncate text-[var(--t-1)]">
                      {u.firstName ?? u.username ?? u.email ?? u.id.slice(0, 8)}
                    </div>
                    <div className="text-[10px] text-[var(--t-3)] truncate">
                      {u.email ?? u.username ?? u.id}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[var(--t-3)]">{buUi.user ?? "Юзер:"}</span>
            <span className="text-[var(--t-1)]">
              {selected.firstName ?? selected.username ?? selected.email}
            </span>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="ml-auto text-[var(--t-3)] hover:text-[var(--t-1)]"
            >
              {buUi.change ?? "Сменить"}
            </button>
          </div>
          <label className="block">
            <div className="text-[10px] uppercase tracking-wider text-[var(--t-3)] mb-1">
              PocketOption trader id
            </div>
            <input
              value={traderId}
              onChange={(e) => setTraderId(e.target.value)}
              placeholder="1234567"
              className="w-full h-9 px-3 rounded-lg bg-[var(--bg-1)] border border-[var(--b-soft)] text-xs outline-none focus:border-[var(--b-hard)]"
              style={{ fontFamily: "var(--font-jetbrains)" }}
              inputMode="numeric"
            />
          </label>
          <button
            type="button"
            onClick={bind}
            disabled={binding}
            className="w-full h-9 rounded-lg bg-[var(--brand-gold)] text-[#1a1208] font-semibold text-xs disabled:opacity-50"
          >
            {binding ? (buUi.binding ?? "Привязываем…") : (buUi.bind ?? "Привязать")}
          </button>
        </div>
      )}
      {error && (
        <div className="flex items-start gap-1.5 text-xs text-[var(--red)]">
          <AlertCircle size={12} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
