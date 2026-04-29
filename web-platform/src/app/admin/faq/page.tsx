import { prisma } from "@/lib/prisma";

export default async function AdminFaqPage() {
  const faqs = await prisma.faq.findMany({
    orderBy: [{ category: "asc" }, { order: "asc" }],
  });

  const categories = [...new Set(faqs.map((f) => f.category))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Управление FAQ</h1>
        <span className="text-sm text-[#666]">Всего: {faqs.length}</span>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-12 text-[#555]">
          FAQ ещё не добавлены. Создайте первый вопрос через API.
        </div>
      ) : (
        categories.map((cat) => (
          <div key={cat}>
            <h2 className="text-sm font-semibold mb-3 capitalize" style={{ color: "#f5c518" }}>
              {cat}
            </h2>
            <div className="rounded-2xl border overflow-hidden" style={{ background: "#0d0d18", borderColor: "rgba(255,255,255,0.07)" }}>
              {faqs
                .filter((f) => f.category === cat)
                .map((faq) => (
                  <div
                    key={faq.id}
                    className="px-5 py-4 border-b flex items-start gap-4"
                    style={{ borderColor: "rgba(255,255,255,0.04)" }}
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium">{faq.question}</p>
                      <p className="text-xs text-[#666] mt-1 line-clamp-2">{faq.answer}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-[#555]">#{faq.order}</span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-semibold"
                        style={{
                          background: faq.isActive ? "rgba(0,229,160,0.1)" : "rgba(136,136,136,0.1)",
                          color: faq.isActive ? "#00e5a0" : "#666",
                        }}
                      >
                        {faq.isActive ? "Active" : "Hidden"}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
