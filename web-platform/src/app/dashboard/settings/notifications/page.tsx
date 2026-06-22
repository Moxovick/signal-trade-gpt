import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getPreferences } from "@/lib/user-preferences";
import { Card } from "@/components/ui/Card";
import { NotificationsForm } from "./_components/NotificationsForm";
import { getDictionaryForUser } from "@/lib/i18n";

export default async function NotificationsSettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const prefs = await getPreferences(session.user.id);
  const t = await getDictionaryForUser(session.user.id);

  return (
    <div className="space-y-6">
      <Card padding="lg">
        <h2 className="text-lg font-semibold mb-1">{t.notifications.pageTitle}</h2>
        <p className="text-sm text-[var(--t-3)] mb-6">
          {t.notifications.pageDesc}
        </p>
        <NotificationsForm initialPrefs={prefs} />
      </Card>
    </div>
  );
}
