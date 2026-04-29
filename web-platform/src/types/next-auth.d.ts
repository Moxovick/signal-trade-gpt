import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "user" | "admin";
      /** @deprecated v2 — replaced by `tier`. Kept for backwards compatibility. */
      subscriptionPlan?: "free" | "premium" | "vip";
      tier?: number;
    } & DefaultSession["user"];
  }

  interface User {
    role?: "user" | "admin";
    subscriptionPlan?: "free" | "premium" | "vip";
    tier?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "user" | "admin";
    subscriptionPlan?: "free" | "premium" | "vip";
    tier?: number;
  }
}
