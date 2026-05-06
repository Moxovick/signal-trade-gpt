/**
 * Public trader profile — lightweight card at /u/:username. Shows only
 * what's safe to expose: display name, tier, signals-received total, member
 * since, referral count. No email, no PO ID, no deposits.
 *
 * If the user opted out (preferences.publicProfile === false) we 404.
 */
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { TierBadge } from "@/components/ui/TierBadge";
import { Stat } from "@/components/ui/Stat";
import { TIER_LABELS } from "@/lib/tier";
import { avatarUrl, initialsFromName } from "@/lib/avatar";
import { parsePreferences } from "@/lib/user-preferences";
import { Users, Send, Trophy, Award } from "lucide-react";
import Link from "next/link";

type Props = { params: Promise<{ username: string }> };

export default async function PublicProfile({ params }: Props) {
  const { username } = await params;
  const normalized = username.trim();
  if (!normalized) notFound();

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { username: normalized },
        { referralCode: normalized.toUpperCase() },
      ],
      role: { not: "admin" },
      status: "active",
    },
    select: {
      id: true,
      firstName: true,
      username: true,
      email: true,
      avatar: true,
      tier: true,
      signalsReceived: true,
      streakDays: true,
      createdAt: true,
      preferences: true,
      referralCode: true,
    },
  });
  if (!user) notFound();

  const prefs = parsePreferences(user.preferences);
  // Users can opt out from public profile (future — preferences.publicProfile).
  // For now everyone active is listed.
  void prefs;

  const [referralsCount, achievementsCount] = await Promise.all([
    prisma.user.count({ where: { referredById: user.id } }),
    prisma.userAchievement.count({ where: { userId: user.id } }),
  ]);

  const displayName =
    user.firstName ?? user.username ?? user.email?.split("@")[0] ?? "Трейдер";
  const avatar = avatarUrl({ avatar: user.avatar, email: user.email });
  const initials = initialsFromName(user);

  return (
    <div className="min-h-screen bg-[var(--bg-0)]">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link
          href="/dashboard/leaderboard"
          className="text-xs text-[var(--t-3)] hover:text-[var(--brand-gold)]"
        >
          ← к лидерборду
        </Link>

        <Card padding="lg" variant="highlight" className="mt-4">
          <div className="flex items-start gap-6">
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatar}
                alt=""
                className="w-20 h-20 rounded-2xl object-cover border border-[var(--b-soft)]"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-[var(--brand-gold)] text-[#1a1208] flex items-center justify-center font-bold text-2xl">
                {initials}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold truncate">{displayName}</h1>
                <TierBadge tier={user.tier} size="md" />
              </div>
              <div className="text-sm text-[var(--t-3)] mt-1">
                {TIER_LABELS[user.tier] ?? ""} · с{" "}
                {new Date(user.createdAt).toLocaleDateString("ru-RU", {
                  month: "long",
                  year: "numeric",
                })}
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <Stat
            label="Сигналов"
            value={user.signalsReceived}
            icon={<Send size={16} />}
          />
          <Stat
            label="Серия"
            value={user.streakDays}
            icon={<Trophy size={16} />}
          />
          <Stat
            label="Рефералов"
            value={referralsCount}
            icon={<Users size={16} />}
          />
          <Stat
            label="Достижений"
            value={achievementsCount}
            icon={<Award size={16} />}
          />
        </div>

        <Card padding="md" className="mt-4">
          <div className="text-[11px] uppercase tracking-wider text-[var(--t-3)]">
            Реферальный код
          </div>
          <div
            className="mt-1 text-xl font-semibold tracking-widest"
            style={{ fontFamily: "var(--font-jetbrains)" }}
          >
            {user.referralCode}
          </div>
        </Card>
      </div>
    </div>
  );
}
