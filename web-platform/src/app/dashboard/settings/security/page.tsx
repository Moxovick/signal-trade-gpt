import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { ChangePasswordForm } from "./_components/ChangePasswordForm";
import { LoginLog } from "./_components/LoginLog";
import { KeyRound, ScrollText } from "lucide-react";
import { getDictionaryForUser } from "@/lib/i18n";

export default async function SecuritySettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [user, events] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        email: true,
        passwordHash: true,
      },
    }),
    prisma.loginEvent.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);
  if (!user) redirect("/login");

  const t = await getDictionaryForUser(session.user.id);

  return (
    <div className="space-y-6">
      <Card padding="lg">
        <div className="flex items-center gap-2 mb-1">
          <KeyRound size={18} className="text-[var(--brand-gold)]" />
          <h2 className="text-lg font-semibold">{t.security.passwordTitle}</h2>
        </div>
        <p className="text-sm text-[var(--t-3)] mb-6">
          {user.passwordHash
            ? t.security.passwordDescHas
            : t.security.passwordDescNoPass}
        </p>
        <ChangePasswordForm hasPassword={!!user.passwordHash} />
      </Card>

      <Card padding="lg">
        <div className="flex items-center gap-2 mb-1">
          <ScrollText size={18} className="text-[var(--brand-gold)]" />
          <h2 className="text-lg font-semibold">{t.security.logTitle}</h2>
        </div>
        <p className="text-sm text-[var(--t-3)] mb-6">
          {t.security.logDesc}
        </p>
        <LoginLog
          events={events.map((e) => ({
            id: e.id,
            kind: e.kind,
            ip: e.ip,
            userAgent: e.userAgent,
            createdAt: e.createdAt.toISOString(),
          }))}
        />
      </Card>
    </div>
  );
}
