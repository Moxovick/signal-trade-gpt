/**
 * /admin/bot-config — single page that consolidates all bot-facing config.
 *
 * Reads all SiteSettings rows, parses with defaults via `parseBotConfig`, and
 * passes them to a client form that bulk-saves via /api/admin/settings.
 */
import { prisma } from "@/lib/prisma";
import { parseBotConfig } from "@/lib/bot-config";
import { BotConfigForm } from "./_components/BotConfigForm";

export const dynamic = "force-dynamic";

export default async function BotConfigPage() {
  const rows = await prisma.siteSettings.findMany({
    where: { key: { startsWith: "bot_" } },
  });

  const config = parseBotConfig(
    rows.map((r) => ({ key: r.key, value: r.value })),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Конфиг бота</h1>
        <p className="text-xs text-[#666] mt-1 max-w-2xl">
          Все настройки бота в одном месте. Бот синхронизируется с этими
          значениями через <code>/api/bot/sync</code> каждые 60 секунд. Не
          требует редеплоя — изменения подхватываются автоматически.
        </p>
      </div>
      <BotConfigForm initial={config} />
    </div>
  );
}
