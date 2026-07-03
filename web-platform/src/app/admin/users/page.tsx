import { prisma } from "@/lib/prisma";
import { UsersManagement } from "./_components/UsersManagement";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const total = await prisma.user.count();

  return <UsersManagement initialTotal={total} />;
}
