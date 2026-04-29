import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
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

        if (!user || user.status === "banned" || !user.passwordHash) return null;

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash,
        );
        if (!valid) return null;

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() },
        });

        // Legacy v1 plans (free/premium/vip) coexist with v2 'elite'; the
        // session type only carries v1 plans. v2 access is controlled by `tier`.
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
  ],
});
