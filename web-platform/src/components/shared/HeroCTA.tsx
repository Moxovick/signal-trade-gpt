"use client";

import { useSession } from "next-auth/react";
import { ArrowRight, LayoutDashboard } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";

export type HeroCTATranslations = {
  register: string;
  dashboard: string;
};

const DEFAULT_TRANSLATIONS: HeroCTATranslations = {
  register: "Зарегистрироваться",
  dashboard: "Личный кабинет",
};

export function HeroCTA({
  translations,
}: {
  translations?: HeroCTATranslations;
}) {
  const t = translations ?? DEFAULT_TRANSLATIONS;
  const { status } = useSession();
  const isLoggedIn = status === "authenticated";

  if (isLoggedIn) {
    return (
      <ButtonLink
        href="/dashboard"
        size="lg"
        iconRight={<LayoutDashboard size={18} />}
      >
        {t.dashboard}
      </ButtonLink>
    );
  }

  return (
    <ButtonLink
      href="/register"
      size="lg"
      iconRight={<ArrowRight size={18} />}
    >
      {t.register}
    </ButtonLink>
  );
}
