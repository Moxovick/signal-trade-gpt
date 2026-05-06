import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { verifyTelegramPayload } from "@/lib/telegram";
import { authConfig } from "./auth.config";

const TELEGRAM_FIELDS = [
  "id",
  "first_name",
  "last_name",
  "username",
  "photo_url",
  "auth_date",
  "hash",
] as const;

function generateReferralCode(): string {
  return `STG${randomBytes(4).toString("hex").toUpperCase()}`;
}

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
     * Telegram Login Widget — primary v2 sign-in path.
     *
     * The widget POSTs `id, first_name, username, photo_url, auth_date, hash`
     * which we re-verify with our bot token.  On success, find-or-create the
     * user and proceed.
     */
    Credentials({
      id: "telegram",
      name: "telegram",
      credentials: Object.fromEntries(
        TELEGRAM_FIELDS.map((f) => [f, { label: f, type: "text" }]),
      ),
      async authorize(raw) {
        const botToken = process.env["TELEGRAM_LOGIN_BOT_TOKEN"];
        if (!botToken) {
          console.warn("[auth/telegram] TELEGRAM_LOGIN_BOT_TOKEN not set");
          return null;
        }
        const payload = Object.fromEntries(
          TELEGRAM_FIELDS.map((f) => [f, raw?.[f] as string | undefined]),
        );
        const verified = verifyTelegramPayload(payload, botToken);
        if (!verified) return null;

        const tgId = BigInt(verified.id);
        const existing = await prisma.user.findUnique({
          where: { telegramId: tgId },
        });

        const user =
          existing ??
          (await prisma.user.create({
            data: {
              telegramId: tgId,
              username: verified.username ?? null,
              firstName: verified.first_name ?? null,
              lastName: verified.last_name ?? null,
              avatar: verified.photo_url ?? null,
              referralCode: generateReferralCode(),
            },
          }));

        if (existing) {
          await prisma.user.update({
            where: { id: existing.id },
            data: {
              lastLogin: new Date(),
              username: verified.username ?? existing.username,
              firstName: verified.first_name ?? existing.firstName,
              lastName: verified.last_name ?? existing.lastName,
              avatar: verified.photo_url ?? existing.avatar,
            },
          });
        }
        await prisma.loginEvent
          .create({
            data: {
              userId: user.id,
              kind: "login_ok",
              details: { via: "telegram" },
            },
          })
          .catch(() => undefined);

        return {
          id: user.id,
          email: user.email ?? "",
          name: user.firstName ?? user.username ?? `tg:${verified.id}`,
          role: user.role,
          tier: user.tier,
        };
      },
    }),
  ],
});
