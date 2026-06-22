import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminSidebar } from "./_components/AdminSidebar";
import { getDictionaryForUser, getLocaleForUser } from "@/lib/i18n";
import { I18nProvider } from "@/lib/i18n/context";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    redirect("/dashboard");
  }

  // Live counter for the "Postback-лог" badge — unmatched rows need attention.
  const unmatched = await prisma.postback.count({
    where: { poAccountId: null },
  });

  const [dictionary, locale] = await Promise.all([
    getDictionaryForUser(session.user.id),
    getLocaleForUser(session.user.id),
  ]);

  return (
    <I18nProvider locale={locale} dictionary={dictionary}>
      <div className="flex min-h-screen relative z-10">
        <AdminSidebar badges={{ unmatched }} />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">{children}</main>
      </div>
    </I18nProvider>
  );
}
