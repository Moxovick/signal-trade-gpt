/**
 * POST /api/signals/request — on-demand signal generation (web session auth).
 *
 * All signal generation logic lives in `@/lib/signal-generator.ts`.
 */
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateSignalForUser } from "@/lib/signal-generator";

export const dynamic = "force-dynamic";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await generateSignalForUser(session.user.id);
  if (!result.ok) {
    return NextResponse.json(result.data, { status: result.statusCode });
  }
  return NextResponse.json(result.data);
}
