import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardTopNav } from "@/components/dashboard/TopNav";

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
    role: (session.user as { role?: string }).role ?? "user",
  };

  return (
    <div className="min-h-screen">
      <DashboardTopNav user={user} />
      <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
