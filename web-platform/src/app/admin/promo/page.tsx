import { prisma } from "@/lib/prisma";

export default async function AdminPromoPage() {
  const promoCodes = await prisma.promoCode.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { usedBy: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black tracking-wider" style={{ fontFamily: "var(--font-bebas)" }}>
            ПРОМО-КОДЫ
          </h1>
          <p className="text-sm text-[#888]">Управление промо-кодами и акциями</p>
        </div>
        <div className="flex gap-3">
          <div className="card-premium rounded-xl px-4 py-2 text-center">
            <div className="text-xl font-bold text-gold-gradient">{promoCodes.length}</div>
            <div className="text-xs text-[#555]">Всего</div>
          </div>
          <div className="card-premium rounded-xl px-4 py-2 text-center">
            <div className="text-xl font-bold" style={{ color: "#00e5a0" }}>{promoCodes.filter((p) => p.isActive).length}</div>
            <div className="text-xs text-[#555]">Активных</div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {promoCodes.map((promo) => {
          const used = promo._count.usedBy;
          const maxUses = promo.maxUses;
          const expired = promo.expiresAt ? promo.expiresAt < new Date() : false;
          const exhausted = maxUses ? used >= maxUses : false;

          return (
            <div key={promo.id} className="card-premium rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono font-bold text-gold-gradient text-lg">{promo.code}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold tier-${promo.type === "trial" ? "exchange" : promo.type === "discount" ? "elite" : "otc"}`}>
                    {promo.type === "trial" ? `${promo.trialDays} дней` : promo.type === "discount" ? `${promo.discountPercent}%` : "Бонус"}
                  </span>
                  {!promo.isActive && <span className="text-xs px-2 py-0.5 rounded-full bg-red-900/30 text-red-400">Отключён</span>}
                  {expired && <span className="text-xs px-2 py-0.5 rounded-full bg-orange-900/30 text-orange-400">Истёк</span>}
                  {exhausted && <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-900/30 text-yellow-400">Исчерпан</span>}
                </div>
                {promo.description && <p className="text-xs text-[#666]">{promo.description}</p>}
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="text-center">
                  <div className="font-bold">{used}</div>
                  <div className="text-xs text-[#555]">Использован</div>
                </div>
                <div className="text-center">
                  <div className="font-bold">{maxUses ?? "∞"}</div>
                  <div className="text-xs text-[#555]">Лимит</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-xs text-[#666]">
                    {promo.expiresAt ? new Date(promo.expiresAt).toLocaleDateString("ru") : "—"}
                  </div>
                  <div className="text-xs text-[#555]">Срок</div>
                </div>
              </div>
            </div>
          );
        })}

        {promoCodes.length === 0 && (
          <div className="card-premium rounded-xl p-8 text-center">
            <p className="text-[#555] text-sm">Промо-кодов пока нет. Создайте через API: POST /api/admin/promo</p>
          </div>
        )}
      </div>
    </div>
  );
}
