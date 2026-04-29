/**
 * Admin · PocketOption accounts.
 *
 * Read-only listing for now. Filters: status, tier, search by trader id /
 * email / username.  Action menu (verify/reject/recompute tier) is intentionally
 * deferred until we have a moderation flow.
 */
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { TierBadge } from "@/components/ui/TierBadge";

export const dynamic = "force-dynamic";

const STATUS_COLOR: Record<string, { bg: string; fg: string }> = {
  verified: { bg: "rgba(142,224,107,0.10)", fg: "var(--green)" },
  pending: { bg: "rgba(212,160,23,0.10)", fg: "var(--brand-gold)" },
  rejected: { bg: "rgba(255,107,61,0.10)", fg: "var(--red)" },
};

export default async function PoAccountsPage() {
  const accounts = await prisma.pocketOptionAccount.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: { select: { id: true, email: true, username: true, firstName: true, tier: true } },
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">PocketOption · аккаунты</h1>

      <Card padding="none">
        <div className="px-5 py-3 border-b border-[var(--b-soft)] grid grid-cols-12 gap-4 text-xs uppercase tracking-wider text-[var(--t-3)]">
          <div className="col-span-3">Пользователь</div>
          <div className="col-span-2">PO ID</div>
          <div className="col-span-2">Статус</div>
          <div className="col-span-1">Tier</div>
          <div className="col-span-2 text-right">Депозит</div>
          <div className="col-span-2 text-right">RevShare</div>
        </div>
        <div className="divide-y divide-[var(--b-soft)]">
          {accounts.length === 0 && (
            <div className="px-5 py-10 text-center text-sm text-[var(--t-3)]">
              Нет привязанных аккаунтов.
            </div>
          )}
          {accounts.map((a) => {
            const userLabel =
              a.user.firstName ?? a.user.username ?? a.user.email ?? a.user.id.slice(0, 8);
            const colors = STATUS_COLOR[a.status] ?? STATUS_COLOR.pending!;
            return (
              <div
                key={a.id}
                className="px-5 py-3 grid grid-cols-12 gap-4 items-center text-sm"
              >
                <div className="col-span-3 truncate">{userLabel}</div>
                <div
                  className="col-span-2 text-[var(--brand-gold)]"
                  style={{ fontFamily: "var(--font-jetbrains)" }}
                >
                  #{a.poTraderId ?? "—"}
                </div>
                <div className="col-span-2">
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: colors.bg, color: colors.fg }}
                  >
                    {a.status}
                  </span>
                </div>
                <div className="col-span-1">
                  <TierBadge tier={a.user.tier} size="sm" showLabel={false} />
                </div>
                <div
                  className="col-span-2 text-right tabular-nums"
                  style={{ fontFamily: "var(--font-jetbrains)" }}
                >
                  ${Number(a.totalDeposit).toLocaleString("en-US")}
                </div>
                <div
                  className="col-span-2 text-right tabular-nums text-[var(--t-2)]"
                  style={{ fontFamily: "var(--font-jetbrains)" }}
                >
                  ${Number(a.totalRevShare).toLocaleString("en-US")}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
