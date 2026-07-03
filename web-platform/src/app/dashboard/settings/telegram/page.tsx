/**
 * Settings · Telegram — link / unlink Telegram account.
 */
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { TelegramLinkSection } from "./_components/TelegramLinkSection";
import { Send, CheckCircle2, ExternalLink } from "lucide-react";
import { getDictionaryForUser } from "@/lib/i18n";

export default async function TelegramSettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { telegramId: true, username: true, firstName: true },
  });
  if (!user) redirect("/login");

  const t = await getDictionaryForUser(session.user.id);

  const botUsername = (process.env["NEXT_PUBLIC_TELEGRAM_LOGIN_BOT"] ?? "").trim();

  const initialLink = user.telegramId
    ? {
        id: user.telegramId.toString(),
        username: user.username,
        firstName: user.firstName,
      }
    : null;

  const BOT_URL = process.env["NEXT_PUBLIC_BOT_URL"] ?? "";

  return (
    <div className="space-y-5">
      {/* Status card */}
      <div
        className="rounded-2xl border p-5"
        style={{
          borderColor: initialLink ? "var(--b-hard)" : "var(--b-soft)",
          background: "var(--bg-1)",
        }}
      >
        <div className="flex items-start gap-4">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: initialLink
                ? "rgba(212,160,23,0.14)"
                : "var(--bg-2)",
            }}
          >
            <Send
              size={18}
              style={{ color: initialLink ? "var(--brand-gold)" : "var(--t-3)" }}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-semibold">Telegram</h2>
              {initialLink && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--green)] bg-[rgba(76,195,138,0.12)] px-2 py-0.5 rounded-full">
                  <CheckCircle2 size={10} />
                  {t.telegramSettings.linked}
                </span>
              )}
            </div>

            {initialLink ? (
              <div className="mt-1 space-y-0.5">
                {initialLink.firstName && (
                  <p className="text-sm text-[var(--t-2)]">
                    {initialLink.firstName}
                    {initialLink.username ? ` · @${initialLink.username}` : ""}
                  </p>
                )}
                <p className="text-[11px] text-[var(--t-3)]">
                  ID {initialLink.id}
                </p>
              </div>
            ) : (
              <p className="text-sm text-[var(--t-3)] mt-1">
                {t.telegramSettings.notLinked}
              </p>
            )}
          </div>

          {BOT_URL && (
            <a
              href={BOT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 inline-flex items-center gap-1 text-xs text-[var(--brand-gold)] hover:text-[var(--brand-gold-bright)] transition-colors"
            >
              {t.telegramSettings.openBot} <ExternalLink size={11} />
            </a>
          )}
        </div>
      </div>

      {/* Link widget card */}
      <Card padding="lg">
        <h3 className="text-sm font-semibold mb-1 text-[var(--t-1)]">
          {initialLink ? t.telegramSettings.manageLink : t.telegramSettings.linkAccount}
        </h3>
        <p className="text-[12px] text-[var(--t-3)] mb-5 leading-relaxed">
          {t.telegramSettings.linkDesc}
        </p>

        {!botUsername ? (
          <div className="rounded-xl border border-[var(--b-soft)] bg-[var(--bg-2)] p-4 text-sm text-[var(--t-3)]">
            {t.telegramSettings.botNotConfigured}
          </div>
        ) : (
          <TelegramLinkSection initialLink={initialLink} />
        )}
      </Card>

      {/* Info card */}
      <div className="rounded-xl border border-[var(--b-soft)] bg-[var(--bg-2)] px-4 py-3">
        <p className="text-[12px] text-[var(--t-3)] leading-relaxed">
          {t.telegramSettings.privacyNote}
        </p>
      </div>
    </div>
  );
}
