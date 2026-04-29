import { prisma } from "@/lib/prisma";

export default async function AdminTemplatesPage() {
  const templates = await prisma.botTemplate.findMany({
    orderBy: [{ tier: "asc" }, { plan: "asc" }, { name: "asc" }],
  });

  const grouped = {
    otc: templates.filter((t) => t.tier === "otc"),
    exchange: templates.filter((t) => t.tier === "exchange"),
    elite: templates.filter((t) => t.tier === "elite"),
    general: templates.filter((t) => !t.tier),
  };

  const tierLabels: Record<string, { name: string; color: string }> = {
    otc: { name: "OTC Угоди", color: "#8888ff" },
    exchange: { name: "Біржеві Угоди", color: "#00e5a0" },
    elite: { name: "Еліт Угоди", color: "#f5c518" },
    general: { name: "Общие шаблоны", color: "#888" },
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black tracking-wider" style={{ fontFamily: "var(--font-bebas)" }}>
            ШАБЛОНЫ БОТА
          </h1>
          <p className="text-sm text-[#888]">Управление шаблонами сообщений для Telegram-бота</p>
        </div>
        <div className="card-premium rounded-xl px-4 py-2 text-center">
          <div className="text-xl font-bold text-gold-gradient">{templates.length}</div>
          <div className="text-xs text-[#555]">Шаблонов</div>
        </div>
      </div>

      {Object.entries(grouped).map(([key, items]) => (
        <div key={key} className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full" style={{ background: tierLabels[key].color }} />
            <h2 className="text-lg font-bold" style={{ fontFamily: "var(--font-bebas)", letterSpacing: "0.05em", color: tierLabels[key].color }}>
              {tierLabels[key].name}
            </h2>
            <span className="text-xs text-[#555]">({items.length})</span>
          </div>

          {items.length > 0 ? (
            <div className="space-y-3">
              {items.map((t) => (
                <div key={t.id} className="card-premium rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-sm">{t.name}</span>
                    {t.plan && <span className={`text-xs px-2 py-0.5 rounded-full tier-${t.plan}`}>{t.plan.toUpperCase()}</span>}
                    {!t.isActive && <span className="text-xs px-2 py-0.5 rounded-full bg-red-900/30 text-red-400">Отключён</span>}
                  </div>
                  <div className="text-xs text-[#888] mb-2">Тема: {t.subject}</div>
                  <pre className="text-xs text-[#666] p-3 rounded-lg overflow-x-auto whitespace-pre-wrap" style={{ background: "rgba(0,0,0,0.3)" }}>
                    {t.body}
                  </pre>
                  {Array.isArray(t.variables) && (t.variables as string[]).length > 0 && (
                    <div className="mt-2 flex gap-1 flex-wrap">
                      {(t.variables as string[]).map((v) => (
                        <span key={v} className="text-xs px-2 py-0.5 rounded bg-[#1a1a35] text-[#888] font-mono">{`{${v}}`}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="card-premium rounded-xl p-4 text-center">
              <p className="text-xs text-[#555]">Шаблонов нет. Создайте через API: POST /api/admin/templates</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
