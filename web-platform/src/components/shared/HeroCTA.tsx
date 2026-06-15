"use client";

import { useSession } from "next-auth/react";
import { ArrowRight, LayoutDashboard } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";

export function HeroCTA() {
  const { status } = useSession();
  const isLoggedIn = status === "authenticated";

  if (isLoggedIn) {
    return (
      <ButtonLink
        href="/dashboard"
        size="lg"
        iconRight={<LayoutDashboard size={18} />}
      >
        Личный кабинет
      </ButtonLink>
    );
  }

  return (
    <ButtonLink
      href="/register"
      size="lg"
      iconRight={<ArrowRight size={18} />}
    >
      Зарегистрироваться
    </ButtonLink>
  );
}
