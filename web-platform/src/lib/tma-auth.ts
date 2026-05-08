/**
 * Telegram Mini App — request authentication helper.
 *
 * Mini-App pages run in Telegram's iframe; cookies don't reliably round-trip
 * across the WebApp boundary. So instead of using NextAuth sessions, the
 * client sends `Telegram.WebApp.initData` on every API call via the
 * `X-Telegram-Init-Data` header (or `?initData=` query param), and the
 * server re-verifies it.
 *
 * If the request is valid but no User row matches the Telegram ID, we return
 * `{ user: null, telegramId }` so the API can return a 401 with a redirect
 * hint to the onboarding screen.
 */
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyInitData, type TmaUser } from "@/lib/telegram-initdata";

export type TmaSession =
  | { ok: true; userId: string; tgId: number; tgUser: TmaUser }
  | { ok: false; reason: "no_init_data" | "invalid_init_data" | "no_account"; tgId?: number };

export async function authTmaRequest(req: NextRequest): Promise<TmaSession> {
  const botToken = process.env["TELEGRAM_LOGIN_BOT_TOKEN"];
  if (!botToken) return { ok: false, reason: "invalid_init_data" };

  let initData = req.headers.get("x-telegram-init-data") ?? "";
  if (!initData) {
    initData = new URL(req.url).searchParams.get("initData") ?? "";
  }
  if (!initData) return { ok: false, reason: "no_init_data" };

  const verified = verifyInitData(initData, botToken);
  if (!verified) return { ok: false, reason: "invalid_init_data" };

  const tgId = verified.user.id;
  const user = await prisma.user.findUnique({
    where: { telegramId: BigInt(tgId) },
    select: { id: true },
  });
  if (!user) return { ok: false, reason: "no_account", tgId };

  return { ok: true, userId: user.id, tgId, tgUser: verified.user };
}
