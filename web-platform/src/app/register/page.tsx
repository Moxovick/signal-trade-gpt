/**
 * /register — v2.
 *
 * Telegram-only registration. Email signup deprecated (no password creation).
 * Existing /register URL still resolves so old links don't 404; we redirect
 * to /login which contains the Telegram widget.
 */
import { redirect } from "next/navigation";

export default function RegisterPage(): never {
  redirect("/login");
}
