import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/shared/Logo";

const adminNav = [
  { href: "/admin", label: "Дашборд", icon: "⚡" },
  { href: "/admin/leads", label: "Лиды", icon: "🎯" },
  { href: "/admin/users", label: "Пользователи", icon: "👥" },
  { href: "/admin/signals", label: "Сигналы", icon: "📊" },
  { href: "/admin/deposits", label: "Депозиты", icon: "💰" },
  { href: "/admin/promo", label: "Промо-коды", icon: "🎟" },
  { href: "/admin/templates", label: "Шаблоны бота", icon: "🤖" },
  { href: "/admin/faq", label: "FAQ", icon: "❓" },
  { href: "/admin/analytics", label: "Аналитика", icon: "📈" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
   
  if (!session || session.user.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen relative z-10">
      <aside className="w-56 shrink-0 border-r flex flex-col glass" style={{ borderColor: "rgba(245,197,24,0.06)" }}>
        <div className="p-4 border-b" style={{ borderColor: "rgba(245,197,24,0.06)" }}>
          <Logo size="sm" glow />
          <div className="text-xs text-[#f5c518] font-semibold mt-2 tracking-wider" style={{ fontFamily: "var(--font-bebas)" }}>ADMIN PANEL</div>
        </div>
        <nav className="p-3 space-y-0.5 flex-1">
          {adminNav.map(({ href, label, icon }) => (
            <Link key={href} href={href} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-[#888] hover:text-[#f5c518] hover:bg-white/5 transition-colors">
              <span>{icon}</span> {label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t" style={{ borderColor: "rgba(245,197,24,0.06)" }}>
          <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-[#555] hover:text-[#888] transition-colors">
            ← Назад к кабинету
          </Link>
        </div>
      </aside>
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
