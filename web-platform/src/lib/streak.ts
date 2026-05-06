/**
 * Daily streak tracker. Call `touchStreak(userId)` on dashboard load to mark
 * the user as "active today"; the function increments `streakDays` if the
 * previous active day was yesterday, resets to 1 if longer ago, no-op if
 * already today.
 */
import { prisma } from "@/lib/prisma";

function startOfDayUTC(d: Date): Date {
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
  );
}

export async function touchStreak(userId: string): Promise<{
  streakDays: number;
  unchanged: boolean;
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { streakDays: true, lastActivityDay: true },
  });
  if (!user) return { streakDays: 0, unchanged: true };

  const today = startOfDayUTC(new Date());
  const last = user.lastActivityDay
    ? startOfDayUTC(new Date(user.lastActivityDay))
    : null;

  if (last && last.getTime() === today.getTime()) {
    return { streakDays: user.streakDays, unchanged: true };
  }

  let next = 1;
  if (last) {
    const delta = (today.getTime() - last.getTime()) / 86_400_000;
    next = delta === 1 ? user.streakDays + 1 : 1;
  }

  await prisma.user.update({
    where: { id: userId },
    data: { streakDays: next, lastActivityDay: today },
  });
  return { streakDays: next, unchanged: false };
}
