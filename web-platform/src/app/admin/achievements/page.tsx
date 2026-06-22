/**
 * Admin · Achievements — simple overview of the catalogue + unlock counts.
 *
 * The catalogue is code-defined in `lib/achievements.ts`; this page only
 * displays it and exposes a "Re-seed" button to refresh the DB copy from
 * the code catalogue.
 */
import { Card } from "@/components/ui/Card";
import { Stat } from "@/components/ui/Stat";
import { prisma } from "@/lib/prisma";
import { ReseedButton } from "./_components/ReseedButton";
import { Trophy } from "lucide-react";
import { auth } from "@/lib/auth";
import { getDictionaryForUser } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function AdminAchievementsPage() {
  const session = await auth();
  const t = session?.user?.id ? await getDictionaryForUser(session.user.id) : null;
  const ta = t?.admin?.achievements ?? {};

  const catalogue = await prisma.achievement.findMany({
    orderBy: { minTier: "asc" },
  });
  const total = await prisma.userAchievement.count();
  const users = await prisma.user.count();

  const stats = await prisma.userAchievement.groupBy({
    by: ["achievementId"],
    _count: { _all: true },
  });
  const statMap = new Map(stats.map((s) => [s.achievementId, s._count._all]));

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold mb-1">{ta.title ?? "Достижения"}</h1>
        <p className="text-sm text-[var(--t-3)]">
          {ta.description ?? "Каталог бейджей задан в коде (lib/achievements.ts). Если изменил список в коде — нажми «Пересеять»."}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Stat
          label={ta.stats?.totalBadges ?? "Всего бейджей"}
          value={catalogue.length}
          icon={<Trophy size={18} />}
        />
        <Stat label={ta.stats?.issuedToUsers ?? "Выдано пользователям"} value={total} />
        <Stat label={ta.stats?.totalUsers ?? "Всего юзеров"} value={users} />
      </div>

      <Card padding="lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{ta.catalogue ?? "Каталог"}</h2>
          <ReseedButton />
        </div>
        <div className="divide-y divide-[var(--b-soft)]">
          {catalogue.map((a) => (
            <div
              key={a.id}
              className="py-3 flex items-center gap-3 text-sm"
            >
              <span className="font-mono text-[11px] text-[var(--t-3)] w-32">
                {a.code}
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{a.name}</div>
                <div className="text-[12px] text-[var(--t-3)] truncate">
                  {a.description}
                </div>
              </div>
              <span className="text-[11px] text-[var(--t-3)]">
                T{a.minTier}+
              </span>
              <span className="font-semibold text-[var(--brand-gold)] tabular-nums w-16 text-right">
                {statMap.get(a.id) ?? 0}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
