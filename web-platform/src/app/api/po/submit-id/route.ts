import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { manualAttachPoAccount } from "@/lib/pocketoption";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, reason: "unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as { traderId?: string } | null;
  const traderId = body?.traderId?.toString().trim();
  if (!traderId) {
    return NextResponse.json({ ok: false, reason: "missing_trader_id" }, { status: 400 });
  }

  const result = await manualAttachPoAccount(session.user.id, traderId);
  if (!result.ok) {
    const status = result.reason === "po_unreachable" ? 503 : 400;
    return NextResponse.json({ ok: false, reason: result.reason }, { status });
  }
  return NextResponse.json({
    ok: true,
    status: result.status,
    depositTotal: result.depositTotal,
  });
}
