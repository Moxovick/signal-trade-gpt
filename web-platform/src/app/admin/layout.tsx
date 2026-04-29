import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  Layers,
  Send,
  Sparkles,
  Activity,
  Settings as SettingsIcon,
  Users,
  Wallet,
  HelpCircle,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";

type NavItem = { href: string; label: string; icon: LucideIcon };

const adminNav: NavItem[] = [
  { href: "/admin", label: "Обзор", icon: BarChart3 },
  { href: "/admin/po-accounts", label: "PO-аккаунты", icon: Layers },
  { href: "/admin/postbacks", label: "Postbacks", icon: Activity },
  { href: "/admin/perks", label: "Перки бота", icon: Sparkles },
  { href: "/admin/users", label: "Пользователи", icon: Users },
  { href: "/admin/signals", label: "Сигналы", icon: Send },
  { href: "/admin/deposits", label: "Депозиты", icon: Wallet },
  { href: "/admin/faq", label: "FAQ", icon: HelpCircle },
  { href: "/admin/settings", label: "Настройки", icon: SettingsIcon },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen relative z-10">
      <aside className="w-60 shrink-0 border-r border-[var(--b-soft)] flex flex-col glass">
        <div className="p-5 border-b border-[var(--b-soft)]">
          <Logo size="sm" />
          <div
            className="text-xs text-[var(--brand-gold)] font-semibold mt-3 tracking-widest"
            style={{ fontFamily: "var(--font-bebas)" }}
          >
            ADMIN PANEL
          </div>
        </div>
        <nav className="p-3 space-y-0.5 flex-1">
          {adminNav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-[var(--t-2)] hover:text-[var(--brand-gold)] hover:bg-[var(--bg-2)] transition-colors"
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-[var(--b-soft)]">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-[var(--t-3)] hover:text-[var(--t-1)] transition-colors"
          >
            <ArrowLeft size={14} /> Назад к кабинету
          </Link>
        </div>
      </aside>
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
