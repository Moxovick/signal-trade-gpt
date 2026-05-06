import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPreferences } from "@/lib/user-preferences";
import { Card } from "@/components/ui/Card";
import { ChangePasswordForm } from "./_components/ChangePasswordForm";
import { TwoFactorForm } from "./_components/TwoFactorForm";
import { LoginLog } from "./_components/LoginLog";
import { Shield, KeyRound, ScrollText } from "lucide-react";

export default async function SecuritySettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [user, prefs, events] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        email: true,
        emailVerifiedAt: true,
        passwordHash: true,
      },
    }),
    getPreferences(session.user.id),
    prisma.loginEvent.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);
  if (!user) redirect("/login");

  return (
    <div className="space-y-6">
      <Card padding="lg">
        <div className="flex items-center gap-2 mb-1">
          <KeyRound size={18} className="text-[var(--brand-gold)]" />
          <h2 className="text-lg font-semibold">Пароль</h2>
        </div>
        <p className="text-sm text-[var(--t-3)] mb-6">
          {user.passwordHash
            ? "Смени пароль, если подозреваешь что им мог завладеть кто-то ещё."
            : "У твоего аккаунта ещё нет пароля — ты входил через Telegram. Установи пароль, чтобы иметь запасной способ входа."}
        </p>
        <ChangePasswordForm hasPassword={!!user.passwordHash} />
      </Card>

      <Card padding="lg">
        <div className="flex items-center gap-2 mb-1">
          <Shield size={18} className="text-[var(--brand-gold)]" />
          <h2 className="text-lg font-semibold">Двухфакторная аутентификация</h2>
        </div>
        <p className="text-sm text-[var(--t-3)] mb-6">
          При входе мы отправим 6-значный код на твой email. Включи, если
          переживаешь за аккаунт.
        </p>
        <TwoFactorForm
          email={user.email}
          emailVerified={!!user.emailVerifiedAt}
          twoFactorEmail={prefs.twoFactorEmail}
        />
      </Card>

      <Card padding="lg">
        <div className="flex items-center gap-2 mb-1">
          <ScrollText size={18} className="text-[var(--brand-gold)]" />
          <h2 className="text-lg font-semibold">Журнал безопасности</h2>
        </div>
        <p className="text-sm text-[var(--t-3)] mb-6">
          Последние 20 событий: входы, смены пароля, неудачные попытки.
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
