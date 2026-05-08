import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { verifyInitData } from "@/lib/telegram-initdata";
import { authConfig } from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || user.status === "banned" || !user.passwordHash) {
          if (user?.id) {
            await prisma.loginEvent
              .create({
                data: {
                  userId: user.id,
                  kind: "login_fail",
                  details: { reason: "no_password_or_banned" },
                },
              })
              .catch(() => undefined);
          }
          return null;
        }

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash,
        );
        if (!valid) {
          await prisma.loginEvent
            .create({
              data: {
                userId: user.id,
                kind: "login_fail",
                details: { reason: "bad_password" },
              },
            })
            .catch(() => undefined);
          return null;
        }

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() },
        });
        await prisma.loginEvent
          .create({
            data: { userId: user.id, kind: "login_ok" },
          })
          .catch(() => undefined);

        const legacyPlan =
          user.subscriptionPlan === "free" ||
          user.subscriptionPlan === "premium" ||
          user.subscriptionPlan === "vip"
            ? user.subscriptionPlan
            : undefined;

        return {
          id: user.id,
          email: user.email ?? "",
          name: user.firstName ?? user.username ?? user.email ?? "user",
          role: user.role,
          subscriptionPlan: legacyPlan,
          tier: user.tier,
        };
      },
    }),
    /**
     * Telegram deep-link — bot-mediated sign-in / sign-up.
     *
     * The web client kicks off the flow with `start-link?purpose=login` →
     * gets a one-shot token → opens `t.me/<bot>?start=link_<token>`. The bot
     * redeems the token (creates or matches user) and writes back into the
     * `telegram_link_tokens` row. The web then calls `signIn("tg-deeplink",
     * { token })` once polling reports `linked`.
     *
     * Authorize:
     *   - Token must exist, be consumed, not expired, and have a userId.
     *   - That userId must resolve to a real, non-banned user.
     */
    Credentials({
      id: "tg-deeplink",
      name: "telegram deeplink",
      credentials: {
        token: { label: "token", type: "text" },
      },
      async authorize(raw) {
        const token = (raw?.["token"] as string | undefined)?.trim();
        if (!token) return null;
        const record = await prisma.telegramLinkToken.findUnique({ where: { token } });
        if (!record || !record.consumedAt || !record.userId) return null;
        if (record.expiresAt.getTime() < Date.now()) return null;
        const user = await prisma.user.findUnique({ where: { id: record.userId } });
        if (!user || user.status === "banned") return null;
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() },
        });
        await prisma.loginEvent
          .create({
            data: {
              userId: user.id,
              kind: "login_ok",
              details: { via: "tg-deeplink" },
            },
          })
          .catch(() => undefined);
        return {
          id: user.id,
          email: user.email ?? "",
          name: user.firstName ?? user.username ?? `tg:${user.telegramId ?? user.id}`,
          role: user.role,
          tier: user.tier,
        };
      },
    }),
    /**
     * Telegram Mini App — initData credentials.
     *
     * The Mini App passes `Telegram.WebApp.initData` (URL-encoded). We verify
     * with `WebAppData` HMAC, then resolve the user by `telegramId`.
     *
     * Important: we do NOT auto-create a user here. If the user has not
     * registered on the website yet, we surface that as a hard `null` so the
     * Mini App can show its onboarding screen instead of a session.
     */
    Credentials({
      id: "tma",
      name: "Telegram Mini App",
      credentials: {
        initData: { label: "initData", type: "text" },
      },
      async authorize(raw) {
        const botToken = process.env["TELEGRAM_LOGIN_BOT_TOKEN"];
        if (!botToken) return null;
        const initData = (raw?.["initData"] as string | undefined) ?? "";
        const verified = verifyInitData(initData, botToken);
        if (!verified) return null;

        const tgId = BigInt(verified.user.id);
        const user = await prisma.user.findUnique({ where: { telegramId: tgId } });
        if (!user) {
          // No website account yet — Mini App will show onboarding.
          return null;
        }
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() },
        });
        await prisma.loginEvent
          .create({
            data: {
              userId: user.id,
              kind: "login_ok",
              details: { via: "tma" },
            },
          })
          .catch(() => undefined);
        return {
          id: user.id,
          email: user.email ?? "",
          name: user.firstName ?? user.username ?? `tg:${verified.user.id}`,
          role: user.role,
          tier: user.tier,
        };
      },
    }),
  ],
});
