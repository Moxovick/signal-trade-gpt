/**
 * Admin · GET /api/admin/users/search?q=…
 *
 * Lightweight user lookup for the unmatched-postback bind dialog and
 * other admin UIs. Returns up to 10 users matching the query across
 * id / username / email / firstName. Case-insensitive.
 */
import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ ok: false, reason: "forbidden" }, { status: 403 });
  }
  const q = (new URL(req.url).searchParams.get("q") ?? "").trim();
  if (q.length < 2) {
    return NextResponse.json({ ok: true, users: [] });
  }
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { id: q },
        { username: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { firstName: { contains: q, mode: "insensitive" } },
        { lastName: { contains: q, mode: "insensitive" } },
        // Allow searching by Telegram ID (numeric string)
        ...((/^\d+$/.test(q))
          ? [{ telegramId: BigInt(q) }]
          : []),
      ],
    },
    select: {
      id: true,
      firstName: true,
      username: true,
      email: true,
      telegramId: true,
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });
  return NextResponse.json({ ok: true, users });
}
