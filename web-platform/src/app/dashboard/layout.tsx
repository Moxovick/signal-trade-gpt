import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DashboardTopNav } from "@/components/dashboard/TopNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // PO ID gate: every non-admin user must have a verified PO account before
  // dashboard access is unlocked. Admins are exempt for ops/testing.
  const role = (session.user as { role?: string }).role ?? "user";
  if (role !== "admin") {
    const account = await prisma.pocketOptionAccount.findUnique({
      where: { userId: session.user.id },
      select: { status: true },
    });
    if (!account || account.status !== "verified") {
      redirect("/onboarding/po-id");
    }
  }

  const user = {
    name: session.user?.name ?? null,
    email: session.user?.email ?? null,
    role,
  };

  return (
    <div className="min-h-screen">
      <DashboardTopNav user={user} />
      <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
