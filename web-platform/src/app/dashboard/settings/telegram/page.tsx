/**
 * Settings · Telegram — link / unlink Telegram account.
 */
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { TelegramLinkSection } from "./_components/TelegramLinkSection";

export default async function TelegramSettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { telegramId: true, username: true, firstName: true },
  });
  if (!user) redirect("/login");

  const botUsername = (process.env["NEXT_PUBLIC_TELEGRAM_LOGIN_BOT"] ?? "").trim();

  const initialLink = user.telegramId
    ? {
        id: user.telegramId.toString(),
        username: user.username,
        firstName: user.firstName,
      }
    : null;

  return (
    <div className="space-y-6">
      <Card padding="lg">
        <h2 className="text-lg font-semibold mb-1">Telegram</h2>
        <p className="text-sm text-[var(--t-3)] mb-6">
          Привязка Telegram-аккаунта к этому профилю. Используется для входа в бот и Mini App.
        </p>

        {!botUsername ? (
          <div className="text-sm text-[var(--t-3)] rounded-xl border border-[var(--b-soft)] bg-[var(--bg-2)] px-4 py-3">
            Telegram-бот не настроен на сервере (нет `NEXT_PUBLIC_TELEGRAM_LOGIN_BOT`). Свяжись с
            админом.
          </div>
        ) : (
          <TelegramLinkSection initialLink={initialLink} />
        )}
      </Card>
    </div>
  );
}
