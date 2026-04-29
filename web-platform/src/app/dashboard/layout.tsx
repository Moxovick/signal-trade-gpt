import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardSidebar from "@/components/dashboard/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const user = {
    name: session.user?.name ?? null,
    email: session.user?.email ?? null,
  };

  return (
    <div className="flex min-h-screen bg-[#07070d]">
      <DashboardSidebar user={user} />
      <main className="flex-1 ml-0 md:ml-64 p-6 overflow-y-auto">{children}</main>
    </div>
  );
}
