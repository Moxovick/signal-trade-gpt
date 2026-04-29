/**
 * Admin · Postback log.
 *
 * Tail-of-log view of incoming PocketOption postbacks. Highlights unmatched
 * rows (no `poAccountId`) so the operator can investigate misconfigured links.
 */
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";

export const dynamic = "force-dynamic";

const EVENT_COLOR: Record<string, { bg: string; fg: string }> = {
  registration: { bg: "rgba(136,188,255,0.10)", fg: "#88bcff" },
  email_confirm: { bg: "rgba(212,160,23,0.10)", fg: "var(--brand-gold)" },
  ftd: { bg: "rgba(142,224,107,0.10)", fg: "var(--green)" },
  redeposit: { bg: "rgba(245,232,192,0.10)", fg: "var(--t-1)" },
  commission: { bg: "rgba(212,160,23,0.18)", fg: "var(--brand-gold-bright)" },
};

export default async function PostbacksPage() {
  const rows = await prisma.postback.findMany({
    orderBy: { receivedAt: "desc" },
    take: 100,
    include: {
      poAccount: { include: { user: { select: { firstName: true, username: true, email: true } } } },
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">PocketOption · postbacks</h1>

      <Card padding="none">
        <div className="px-5 py-3 border-b border-[var(--b-soft)] grid grid-cols-12 gap-4 text-xs uppercase tracking-wider text-[var(--t-3)]">
          <div className="col-span-2">Время</div>
          <div className="col-span-2">Событие</div>
          <div className="col-span-2">PO ID</div>
          <div className="col-span-3">Пользователь</div>
          <div className="col-span-2 text-right">Сумма</div>
          <div className="col-span-1 text-right">Click</div>
        </div>
        <div className="divide-y divide-[var(--b-soft)]">
          {rows.length === 0 && (
            <div className="px-5 py-10 text-center text-sm text-[var(--t-3)]">
              Postback-ов ещё не было.
            </div>
          )}
          {rows.map((p) => {
            const user = p.poAccount?.user;
            const userLabel = user?.firstName ?? user?.username ?? user?.email;
            const colors = EVENT_COLOR[p.eventType] ?? { bg: "var(--bg-2)", fg: "var(--t-2)" };
            return (
              <div
                key={p.id}
                className="px-5 py-3 grid grid-cols-12 gap-4 items-center text-sm"
              >
                <div
                  className="col-span-2 text-xs text-[var(--t-3)]"
                  style={{ fontFamily: "var(--font-jetbrains)" }}
                >
                  {new Date(p.receivedAt).toLocaleString("ru-RU")}
                </div>
                <div className="col-span-2">
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: colors.bg, color: colors.fg }}
                  >
                    {p.eventType}
                  </span>
                </div>
                <div
                  className="col-span-2 text-[var(--brand-gold)]"
                  style={{ fontFamily: "var(--font-jetbrains)" }}
                >
                  #{p.poTraderId ?? "—"}
                </div>
                <div className="col-span-3 truncate">
                  {userLabel ?? (
                    <span className="text-[var(--red)] text-xs">unmatched</span>
                  )}
                </div>
                <div
                  className="col-span-2 text-right tabular-nums"
                  style={{ fontFamily: "var(--font-jetbrains)" }}
                >
                  {p.amount ? `$${Number(p.amount).toLocaleString("en-US")}` : "—"}
                </div>
                <div
                  className="col-span-1 text-right text-xs text-[var(--t-3)] truncate"
                  style={{ fontFamily: "var(--font-jetbrains)" }}
                >
                  {p.clickId ? p.clickId.slice(0, 6) : "—"}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
