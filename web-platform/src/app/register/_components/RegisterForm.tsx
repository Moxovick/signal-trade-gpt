"use client";

/**
 * Registration form (v6b).
 *
 * v6b changes:
 *  - Added a hard "Do you have a PocketOption account already?" gate before
 *    the form. Without choosing one of the two paths the form stays hidden.
 *  - When "Yes" is selected: a PO Trader ID field and an optional promo code
 *    field appear. The server action validates the trader ID against the PO
 *    affiliate API and rejects the registration if the account is not in our
 *    network OR has a deposit below the configured Pro threshold.
 *  - When "No" is selected: instructions appear with our referral link, the
 *    form stays hidden — the user must register on PO first, deposit, then
 *    return.
 *
 * Fields:
 *   - email (required)
 *   - password + confirm (required)
 *   - nickname (optional)
 *   - telegramUsername (optional)
 *   - referralCode (optional)
 *   - poTraderId (required for "Yes" path)
 *   - promoCode (optional, free-text — applied at PO side, we only echo it)
 */
import { useActionState, useEffect, useRef, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, ExternalLink, Info } from "lucide-react";
import {
  registerAction,
  type RegisterActionResult,
} from "../actions";

const FIELD =
  "w-full h-11 px-4 rounded-xl text-sm outline-none transition-colors bg-[var(--bg-2)] border border-[var(--b-soft)] focus:border-[var(--b-hard)]";

const INITIAL: RegisterActionResult = { ok: false };

type PoMode = "ask" | "yes" | "no";

export function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const refFromUrl = params.get("ref") ?? "";
  const errFromUrl = params.get("err");

  const [poMode, setPoMode] = useState<PoMode>("ask");
  const [state, action, isPending] = useActionState(registerAction, INITIAL);
  const [autoLoginError, setAutoLoginError] = useState<string | null>(null);
  const lastHandledRef = useRef<string | null>(null);

  useEffect(() => {
    if (!state.ok || !state.email || !state.password) return;
    const key = `${state.email}:${state.password}`;
    if (lastHandledRef.current === key) return;
    lastHandledRef.current = key;
    (async () => {
      const res = await signIn("credentials", {
        email: state.email,
        password: state.password,
        redirect: false,
      });
      if (res?.error) {
        setAutoLoginError(
          "Аккаунт создан, но автологин не удался. Войди вручную.",
        );
        return;
      }
      // Pro path: PO already attached → straight to dashboard.
      // Free path: PO not provided → still go to PO ID gate so user can attach later.
      router.push("/dashboard/signals");
    })();
  }, [state.ok, state.email, state.password, router]);

  const errorToShow = autoLoginError ?? state.error ?? errFromUrl ?? null;
  const poRefUrl = "/po/refer";

  if (poMode === "ask") {
    return (
      <div className="space-y-3">
        {errorToShow && (
          <div className="p-3 rounded-xl text-sm border border-[var(--red)]/30 bg-[var(--red)]/10 text-[var(--red)]">
            {errorToShow}
          </div>
        )}
        <p className="text-sm text-[var(--t-2)]">
          Перед регистрацией скажи: у тебя уже есть аккаунт на{" "}
          <span className="text-[var(--brand-gold)]">PocketOption</span>?
        </p>
        <button
          type="button"
          onClick={() => setPoMode("yes")}
          className="w-full h-12 rounded-xl border border-[var(--brand-gold)]/40 hover:border-[var(--brand-gold)] bg-[var(--bg-2)] text-sm font-semibold flex items-center justify-between px-4 transition-colors"
        >
          <span>Да, есть — у меня есть Trader ID</span>
          <ArrowRight size={16} />
        </button>
        <button
          type="button"
          onClick={() => setPoMode("no")}
          className="w-full h-12 rounded-xl border border-[var(--b-soft)] hover:border-[var(--b-hard)] bg-[var(--bg-2)] text-sm font-semibold flex items-center justify-between px-4 transition-colors"
        >
          <span>Нет — покажи как зарегистрировать</span>
          <ArrowRight size={16} />
        </button>
      </div>
    );
  }

  if (poMode === "no") {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setPoMode("ask")}
          className="text-xs text-[var(--t-3)] hover:text-[var(--t-1)] transition-colors"
        >
          ← назад
        </button>
        <div className="p-4 rounded-xl border border-[var(--brand-gold)]/30 bg-[var(--brand-gold)]/5 space-y-3">
          <div className="flex items-center gap-2 text-[var(--brand-gold)]">
            <Info size={16} />
            <span className="text-sm font-semibold">Как зарегистрироваться</span>
          </div>
          <ol className="text-sm text-[var(--t-2)] space-y-2 list-decimal list-inside">
            <li>
              Открой PocketOption по{" "}
              <a
                href={poRefUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--brand-gold)] underline inline-flex items-center gap-1"
              >
                нашей ссылке <ExternalLink size={12} />
              </a>{" "}
              и зарегистрируйся (email + пароль).
            </li>
            <li>
              На странице регистрации/первого депозита введи наш{" "}
              <span className="text-[var(--brand-gold)]">промокод</span> — даст
              бонус % к депозиту (промокод выдаст тебе наш менеджер в боте).
            </li>
            <li>
              Сделай первый депозит. Без депозита бот не пропустит регистрацию
              на сайте.
            </li>
            <li>Возвращайся сюда, нажми «Да, есть — у меня есть Trader ID».</li>
          </ol>
        </div>
        <a
          href={poRefUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full h-12 rounded-full bg-[var(--brand-gold)] text-[#1a1208] font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[var(--brand-gold-bright)] transition-colors"
        >
          Открыть PocketOption <ExternalLink size={14} />
        </a>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-3" noValidate>
      <button
        type="button"
        onClick={() => setPoMode("ask")}
        className="text-xs text-[var(--t-3)] hover:text-[var(--t-1)] transition-colors"
      >
        ← назад
      </button>
      {errorToShow && (
        <div className="p-3 rounded-xl text-sm border border-[var(--red)]/30 bg-[var(--red)]/10 text-[var(--red)]">
          {errorToShow}
        </div>
      )}
      <input
        type="text"
        name="poTraderId"
        required
        inputMode="numeric"
        autoComplete="off"
        placeholder="PocketOption Trader ID (обязательно)"
        className={FIELD}
      />
      <input
        type="text"
        name="promoCode"
        autoComplete="off"
        placeholder="Промокод (если активировал на PO — для записи)"
        className={FIELD}
        maxLength={32}
      />
      <input
        type="email"
        name="email"
        required
        autoComplete="email"
        placeholder="Email"
        className={FIELD}
      />
      <input
        type="password"
        name="password"
        required
        autoComplete="new-password"
        placeholder="Пароль (минимум 6 символов)"
        className={FIELD}
      />
      <input
        type="password"
        name="confirm"
        required
        autoComplete="new-password"
        placeholder="Повтори пароль"
        className={FIELD}
      />
      <input
        type="text"
        name="nickname"
        autoComplete="nickname"
        placeholder="Ник для leaderboard (необязательно)"
        className={FIELD}
        maxLength={32}
      />
      <input
        type="text"
        name="telegramUsername"
        autoComplete="off"
        placeholder="Telegram username, без @ (необязательно)"
        className={FIELD}
        maxLength={32}
      />
      <input
        type="text"
        name="referralCode"
        defaultValue={refFromUrl}
        placeholder="Реферальный код (если кто-то пригласил)"
        className={FIELD}
      />
      <button
        type="submit"
        disabled={isPending}
        className="w-full h-11 rounded-full bg-[var(--brand-gold)] text-[#1a1208] font-semibold text-sm hover:bg-[var(--brand-gold-bright)] transition-colors disabled:opacity-50"
      >
        {isPending ? "Проверяем PO ID и создаём аккаунт…" : "Зарегистрироваться"}
      </button>
      <p className="text-[11px] text-[var(--t-3)] text-center pt-1">
        Trader ID проверяется через PocketOption Affiliate API. Аккаунт должен
        быть зарегистрирован по нашей реф-ссылке и иметь депозит от $20.
      </p>
    </form>
  );
}
