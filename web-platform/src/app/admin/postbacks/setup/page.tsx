/**
 * Admin · Postback setup.
 *
 * One-stop page for configuring the PocketOption postback integration.
 * Renders:
 *   - Current secret status (set / not set, source).
 *   - Per-event ready-to-paste URLs for Pocket Partners.
 *   - Macro cheat-sheet.
 *
 * All actual mutations happen in the client component (rotate secret, copy).
 */
import { headers } from "next/headers";
import { Card } from "@/components/ui/Card";
import { getPoConfigSnapshot } from "@/lib/po-config";
import { PostbackSetupClient } from "./_components/PostbackSetupClient";
import { getDictionary } from "@/lib/i18n";

export const dynamic = "force-dynamic";

async function detectBaseUrl(): Promise<string> {
  const h = await headers();
  const fromEnv =
    (process.env["NEXTAUTH_URL"] ?? "").trim() ||
    (process.env["NEXT_PUBLIC_APP_URL"] ?? "").trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  // Fall back to whatever host the admin is currently looking at.
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  if (host) return `${proto}://${host}`;
  return "https://your-domain.example";
}

const EVENTS_FALLBACK: Array<{ key: string; label: string; description: string }> = [
  {
    key: "registration",
    label: "Регистрация",
    description: "Трейдер зарегистрировался по нашей ссылке.",
  },
  {
    key: "email_confirm",
    label: "Подтверждение email",
    description: "Трейдер подтвердил почту на PocketOption.",
  },
  {
    key: "ftd",
    label: "FTD — первый депозит",
    description:
      "Первый депозит трейдера. PO передаёт сумму в макросе {sumdep}. " +
      "Именно по этому событию мы апаем пользователя до T1 · Basic или T2 · Pro " +
      "(если сумма ≥ порога из настроек).",
  },
  {
    key: "redeposit",
    label: "Повторный депозит",
    description: "Каждый последующий депозит. Сумма — {sumdep}.",
  },
  {
    key: "commission",
    label: "Комиссия (RevShare)",
    description:
      "Партнёрская выплата за активность трейдера. PO считает её ежедневно. " +
      "Сумма — {commission}.",
  },
  {
    key: "withdrawal",
    label: "Вывод средств",
    description:
      "Трейдер инициировал вывод. PO шлёт несколько постбэков на " +
      "один и тот же вывод (новый → обработан / отменён). Сумма — {wdr_sum}.",
  },
];

const MACROS: Array<{ macro: string; description: string }> = [
  { macro: "{click_id}", description: "User.id с нашей реф-ссылки (мы кладём его сами)." },
  { macro: "{trader_id}", description: "ID трейдера на PocketOption." },
  { macro: "{sumdep}", description: "Сумма депозита в USD (для FTD / redeposit)." },
  { macro: "{commission}", description: "Сумма комиссии в USD (для commission)." },
  { macro: "{wdr_sum}", description: "Сумма вывода в USD (для withdrawal)." },
  { macro: "{status}", description: "Статус вывода: new / processed / cancelled." },
  { macro: "{site_id}", description: "ID источника трафика партнёра." },
  { macro: "{cid}", description: "ID кампании в Pocket Partners." },
  { macro: "{ac}", description: "Название кампании." },
  { macro: "{sub_id1}..{sub_id5}", description: "Свободные суб-метки партнёра." },
  { macro: "{country}", description: "Страна трейдера (код)." },
  { macro: "{device_type}", description: "Mobile / desktop / tablet." },
  { macro: "{os_version}", description: "iOS / Android / Windows / MacOS / …" },
  { macro: "{browser}", description: "Chrome / Safari / Firefox / …" },
  { macro: "{promo}", description: "Промокод трейдера, если применил." },
  { macro: "{link_type}", description: "Слаг лендинга." },
  { macro: "{date_time}", description: "Дата/время события (как прислал PO)." },
];

export default async function PostbackSetupPage() {
  const baseUrl = await detectBaseUrl();
  const snap = await getPoConfigSnapshot();
  const dict = await getDictionary("ru");
  const ps = (dict?.admin?.postbackSetup ?? {}) as Record<string, Record<string, Record<string, string>>>;
  const psEvents = ps.events ?? {};

  const EVENTS = EVENTS_FALLBACK.map((ev) => {
    const evI18n = psEvents[ev.key === "email_confirm" ? "emailConfirm" : ev.key] ?? {};
    return {
      key: ev.key,
      label: (evI18n as Record<string, string>).name ?? ev.label,
      description: (evI18n as Record<string, string>).description ?? ev.description,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">PocketOption · настройка постбэков</h1>
        <p className="text-sm text-[var(--t-3)] mt-1">
          PocketOption шлёт нам GET-запросы на каждое событие.
          Чтобы не дёргать сайт «снаружи» постбэками с подделанными данными,
          в URL встроен общий секрет — он сверяется на каждом запросе.
        </p>
      </div>

      <PostbackSetupClient
        baseUrl={baseUrl}
        events={EVENTS}
        macros={MACROS}
        initialSecretSet={snap.postbackSecret.length > 0}
        initialSecretSource={snap.source.postbackSecret}
      />

      <Card padding="lg" className="space-y-2 text-sm text-[var(--t-2)]">
        <h2 className="text-base font-semibold text-[var(--t-1)]">
          Как это вставить в Pocket Partners
        </h2>
        <ol className="list-decimal pl-5 space-y-1">
          <li>
            Зайди в <span className="text-[var(--brand-gold)]">Pocket Partners → Postback</span>.
          </li>
          <li>
            Создай <b>глобальный</b> постбек на каждое из 6 событий (или
            настрой их на уровне конкретной кампании, если есть несколько).
          </li>
          <li>
            Скопируй URL из таблицы ниже — без изменений, макросы PO подставит сам.
          </li>
          <li>
            Сохрани. Дальше — открой <a href="/admin/postbacks" className="text-[var(--brand-gold)] hover:underline">«Postbacks» в админке</a> и убедись,
            что после первого тестового события появилась запись.
          </li>
        </ol>
      </Card>
    </div>
  );
}
