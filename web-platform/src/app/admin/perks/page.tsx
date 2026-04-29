/**
 * Admin · BotPerk catalogue.
 *
 * Read-only view; toggling perks in/out and editing config is API-driven and
 * deferred to the next iteration. The seeded perks are always present.
 */
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { TierBadge } from "@/components/ui/TierBadge";
import { CheckCircle2, XCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PerksPage() {
  const perks = await prisma.botPerk.findMany({
    orderBy: [{ minTier: "asc" }, { name: "asc" }],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-bold">Перки бота</h1>
        <span className="text-sm text-[var(--t-3)]">{perks.length} активных конфигов</span>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {perks.map((p) => (
          <Card key={p.id} padding="lg">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <h3 className="font-semibold text-lg">{p.name}</h3>
                <code
                  className="text-xs text-[var(--t-3)]"
                  style={{ fontFamily: "var(--font-jetbrains)" }}
                >
                  {p.code}
                </code>
              </div>
              <TierBadge tier={p.minTier} size="sm" />
            </div>
            <p className="text-sm text-[var(--t-2)] mb-4">{p.description}</p>
            <div className="flex items-center justify-between text-xs">
              <pre
                className="text-[var(--t-3)] overflow-x-auto flex-1"
                style={{ fontFamily: "var(--font-jetbrains)" }}
              >
                {JSON.stringify(p.config, null, 0)}
              </pre>
              {p.isActive ? (
                <span className="inline-flex items-center gap-1 text-[var(--green)] ml-3">
                  <CheckCircle2 size={14} /> active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[var(--t-3)] ml-3">
                  <XCircle size={14} /> off
                </span>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
