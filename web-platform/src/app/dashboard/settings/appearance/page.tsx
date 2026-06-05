import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getPreferences } from "@/lib/user-preferences";
import { Card } from "@/components/ui/Card";
import { AppearanceForm } from "../_components/AppearanceForm";

export default async function AppearanceSettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const prefs = await getPreferences(session.user.id);

  return (
    <div className="space-y-6">
      <Card padding="lg">
        <h2 className="text-lg font-semibold mb-1">Внешний вид</h2>
        <p className="text-sm text-[var(--t-3)] mb-6">
          Тема оформления, язык интерфейса и часовой пояс.
        </p>
        <AppearanceForm initialPrefs={prefs} />
      </Card>
    </div>
  );
}
