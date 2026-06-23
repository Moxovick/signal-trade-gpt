/**
 * Admin · PocketOption API credentials.
 *
 * Manages api_token + partner_id (used by lib/po-api.ts to verify trader IDs).
 * SiteSettings is the preferred source; env vars are a fallback for local dev
 * (and so the page still works on a fresh deploy with no DB rows).
 */
import { Card } from "@/components/ui/Card";
import { getPoConfigSnapshot } from "@/lib/po-config";
import { PoApiForm } from "./_components/PoApiForm";
import { auth } from "@/lib/auth";
import { getDictionaryForUser } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function PoApiPage() {
  const session = await auth();
  const t = session?.user?.id ? await getDictionaryForUser(session.user.id) : null;
  const tpa = t?.admin?.poApi ?? {};

  const snap = await getPoConfigSnapshot();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">{(tpa as { pageTitle?: string }).pageTitle ?? "PocketOption · API креды"}</h1>
        <p className="text-sm text-[var(--t-3)] mt-1">
          Партнёрский <code>API token</code> и <code>partner_id</code> с
          <a
            href="https://pocketpartners.com/"
            target="_blank"
            rel="noreferrer noopener"
            className="text-[var(--brand-gold)] hover:underline mx-1"
          >
            pocketpartners.com
          </a>
          . Используются для прямого запроса информации о трейдере (deposit, FTD),
          когда юзер вручную привязывает свой PO ID — иначе верификация уходит в
          «pending» до прихода первого postback&apos;а.
        </p>
      </div>

      <Card padding="lg">
        <PoApiForm
          apiTokenSet={snap.apiToken.length > 0}
          apiTokenPreview={
            snap.apiToken.length > 0
              ? `${snap.apiToken.slice(0, 4)}…${snap.apiToken.slice(-4)}`
              : ""
          }
          initialPartnerId={snap.partnerId}
          tokenSource={snap.source.apiToken}
          partnerSource={snap.source.partnerId}
        />
      </Card>

      <Card padding="lg" className="space-y-2 text-sm text-[var(--t-2)]">
        <h2 className="text-base font-semibold text-[var(--t-1)]">
          Как это устроено
        </h2>
        <p>
          На каждый ручной ввод PO ID сайт делает GET-запрос на{" "}
          <code>https://affiliate.pocketoption.com/api/user-info/{`{user_id}/{partner_id}/{hash}`}</code>
          {" "}где
          <code> hash = md5(&quot;{`{user_id}:{partner_id}:{api_token}`}&quot;)</code>.
        </p>
        <p>
          Если PO отвечает 200 — мы верим, что трейдер действительно в нашей
          партнёрке, и сразу ставим статус <code>verified</code>. 404 — это
          {" «не в нашей сети»"}, 401/403 — {" «токен/partner id некорректны»"}.
          Подробнее см. <code>web-platform/src/lib/po-api.ts</code>.
        </p>
      </Card>
    </div>
  );
}
