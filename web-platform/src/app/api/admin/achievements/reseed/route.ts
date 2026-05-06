import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { seedAchievementsIfMissing } from "@/lib/achievements";

export async function POST(): Promise<Response> {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  await seedAchievementsIfMissing();
  return NextResponse.json({ ok: true });
}
