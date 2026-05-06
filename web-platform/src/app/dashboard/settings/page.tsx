/**
 * Settings · Appearance — theme, language, timezone, avatar.
 */
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPreferences } from "@/lib/user-preferences";
import { Card } from "@/components/ui/Card";
import { AppearanceForm } from "./_components/AppearanceForm";

export default async function AppearanceSettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [user, prefs] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { avatar: true, email: true, firstName: true, username: true },
    }),
    getPreferences(session.user.id),
  ]);
  if (!user) redirect("/login");

  return (
    <div className="space-y-6">
      <Card padding="lg">
        <h2 className="text-lg font-semibold mb-1">Внешний вид</h2>
        <p className="text-sm text-[var(--t-3)] mb-6">
          Тема оформления, язык интерфейса и часовой пояс для отображения
          сигналов.
        </p>
        <AppearanceForm initialPrefs={prefs} />
      </Card>
    </div>
  );
}
