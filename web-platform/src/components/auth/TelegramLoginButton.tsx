"use client";

import { useEffect, useRef } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

type TelegramAuthData = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
};

declare global {
  interface Window {
    onTelegramAuth?: (user: TelegramAuthData) => void;
  }
}

type Props = {
  botUsername: string;
  size?: "small" | "medium" | "large";
  cornerRadius?: number;
};

/**
 * Renders the official Telegram Login Widget.
 *
 * The widget calls `window.onTelegramAuth` with signed user data; we forward
 * it to NextAuth's "telegram" credentials provider.
 *
 * IMPORTANT: in @BotFather your bot must have `/setdomain` configured for the
 * domain that hosts this page, otherwise the widget displays nothing.
 */
export function TelegramLoginButton({
  botUsername,
  size = "large",
  cornerRadius = 12,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!ref.current) return;

    window.onTelegramAuth = async (user: TelegramAuthData) => {
      const fields = [
        "id",
        "first_name",
        "last_name",
        "username",
        "photo_url",
        "auth_date",
        "hash",
      ] as const;
      const payload = Object.fromEntries(
        fields.map((f) => [f, user[f] != null ? String(user[f]) : ""]),
      );
      const res = await signIn("telegram", { ...payload, redirect: false });
      if (res?.ok) router.push("/dashboard");
    };

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;
    script.setAttribute("data-telegram-login", botUsername);
    script.setAttribute("data-size", size);
    script.setAttribute("data-radius", String(cornerRadius));
    script.setAttribute("data-onauth", "onTelegramAuth(user)");
    script.setAttribute("data-request-access", "write");
    ref.current.appendChild(script);

    const node = ref.current;
    return () => {
      node.innerHTML = "";
      delete window.onTelegramAuth;
    };
  }, [botUsername, size, cornerRadius, router]);

  return <div ref={ref} aria-label="Войти через Telegram" />;
}
