import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

const adminNav = [
  { href: "/admin", label: "Дашборд", icon: "⚡" },
  { href: "/admin/users", label: "Пользователи", icon: "👥" },
  { href: "/admin/signals", label: "Сигналы", icon: "📊" },
  { href: "/admin/faq", label: "FAQ", icon: "❓" },
  { href: "/admin/analytics", label: "Аналитика", icon: "📈" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || (session.user as any).role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen bg-[#07070d]">
      <aside
        className="w-56 shrink-0 border-r flex flex-col"
        style={{ background: "#0a0a14", borderColor: "rgba(255,255,255,0.06)" }}
      >
        <div className="p-5 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <span
            className="text-xl font-black tracking-wider"
            style={{ fontFamily: "var(--font-bebas)", color: "#f5c518" }}
          >
            ADMIN PANEL
          </span>
        </div>
        <nav className="p-3 space-y-1 flex-1">
          {adminNav.map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-[#888] hover:text-[#f5c518] hover:bg-white/5 transition-colors"
            >
              <span>{icon}</span> {label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-[#555] hover:text-[#888] transition-colors"
          >
            ← Назад к кабинету
          </Link>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
