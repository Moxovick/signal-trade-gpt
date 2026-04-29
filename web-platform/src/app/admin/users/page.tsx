import { prisma } from "@/lib/prisma";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const { page: pageStr = "1", search = "" } = await searchParams;
  const page = Number(pageStr);
  const limit = 20;

  const where = search
    ? { OR: [{ email: { contains: search } }, { username: { contains: search } }] }
    : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        status: true,
        subscriptionPlan: true,
        createdAt: true,
        lastLogin: true,
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  const pages = Math.ceil(total / limit);

  const statusColor: Record<string, string> = {
    active: "#00e5a0",
    banned: "#ef4444",
    pending: "#f5c518",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Пользователи</h1>
        <span className="text-sm text-[#666]">Всего: {total}</span>
      </div>

      <form method="GET">
        <input
          name="search"
          defaultValue={search}
          placeholder="Поиск по email или username..."
          className="w-full md:w-80 px-4 py-2.5 rounded-xl text-sm outline-none"
          style={{
            background: "#0d0d18",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "#e8e8f0",
          }}
        />
      </form>

      <div
        className="rounded-2xl border overflow-hidden"
        style={{ background: "#0d0d18", borderColor: "rgba(255,255,255,0.07)" }}
      >
        <div
          className="grid grid-cols-12 px-5 py-3 text-xs text-[#555] border-b"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}
        >
          <span className="col-span-4">Email</span>
          <span className="col-span-2">Тариф</span>
          <span className="col-span-2">Роль</span>
          <span className="col-span-2">Статус</span>
          <span className="col-span-2">Дата</span>
        </div>

        {users.map((u: typeof users[number]) => (
          <div
            key={u.id}
            className="grid grid-cols-12 px-5 py-3 items-center border-b text-sm hover:bg-white/[0.02]"
            style={{ borderColor: "rgba(255,255,255,0.04)" }}
          >
            <span className="col-span-4 truncate text-[#aaa]">{u.email}</span>
            <span className="col-span-2">
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{
                  background:
                    u.subscriptionPlan === "free"
                      ? "rgba(136,136,136,0.1)"
                      : "rgba(245,197,24,0.1)",
                  color: u.subscriptionPlan === "free" ? "#666" : "#f5c518",
                }}
              >
                {u.subscriptionPlan.toUpperCase()}
              </span>
            </span>
            <span className="col-span-2 text-[#666] capitalize">{u.role}</span>
            <span className="col-span-2">
              <span
                className="text-xs font-semibold"
                style={{ color: statusColor[u.status] ?? "#888" }}
              >
                {u.status}
              </span>
            </span>
            <span className="col-span-2 text-[#555] text-xs">
              {new Date(u.createdAt).toLocaleDateString("ru-RU")}
            </span>
          </div>
        ))}
      </div>

      {pages > 1 && (
        <div className="flex gap-2 justify-center">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={`?page=${p}&search=${search}`}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-colors"
              style={{
                background: p === page ? "#f5c518" : "#0d0d18",
                color: p === page ? "#07070d" : "#888",
              }}
            >
              {p}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
