import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        login: { label: "Login", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: () => null,
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id ?? "";
        token.role = user.role ?? "user";
        token.subscriptionPlan = user.subscriptionPlan;
        token.tier = user.tier;
        token.tierRefreshedAt = Date.now();
      }
      // Refresh tier from DB every 60 seconds so postback upgrades are reflected
      if (
        token.id &&
        trigger !== "signIn" &&
        (typeof token.tierRefreshedAt !== "number" || Date.now() - token.tierRefreshedAt > 60_000)
      ) {
        try {
          const { prisma } = await import("@/lib/prisma");
          const freshUser = await prisma.user.findUnique({
            where: { id: String(token.id) },
            select: { tier: true, role: true },
          });
          if (freshUser) {
            token.tier = freshUser.tier;
            token.role = freshUser.role;
          }
        } catch {
          // Edge runtime or DB unavailable — keep cached tier
        }
        token.tierRefreshedAt = Date.now();
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = String(token.id ?? "");
      session.user.role = (token.role as "user" | "admin") ?? "user";
      session.user.subscriptionPlan = token.subscriptionPlan as
        | "free"
        | "premium"
        | "vip"
        | undefined;
      session.user.tier = (token.tier as number | undefined) ?? 0;
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;

      if (
        pathname.startsWith("/dashboard") ||
        pathname.startsWith("/admin") ||
        pathname.startsWith("/onboarding")
      ) {
        return isLoggedIn;
      }

      if ((pathname === "/login" || pathname === "/register") && isLoggedIn) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      return true;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
};
