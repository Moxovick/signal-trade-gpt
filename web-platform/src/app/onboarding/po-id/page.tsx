/**
 * Onboarding · PocketOption ID gate.
 *
 * After registration, every user must:
 *   1. Open the admin-configurable PocketOption referral URL (in a new tab),
 *      sign up there with our partner click_id,
 *   2. Paste their resulting PO trader ID here,
 *   3. Be verified live against the PO Affiliate API (only IDs that belong to
 *      our partner network are accepted; otherwise → /onboarding/po-id/existing).
 *
 * Until verification succeeds, /dashboard is gated (see dashboard/layout.tsx).
 */
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPoReferralUrl } from "@/lib/pocketoption";
import { Card } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { ExternalLink, ShieldCheck } from "lucide-react";
import { PoIdGateForm } from "./_components/PoIdGateForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Привязка PocketOption — Signal Trade GPT" };

export default async function OnboardingPoIdPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [account, referralUrl] = await Promise.all([
    prisma.pocketOptionAccount.findUnique({
      where: { userId: session.user.id },
      select: { status: true, poTraderId: true },
    }),
    getPoReferralUrl(),
  ]);

  // Already verified → straight to dashboard.
  if (account?.status === "verified") redirect("/dashboard");

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[var(--t-3)]">
            <ShieldCheck size={14} className="text-[var(--brand-gold)]" />
            Шаг 2 из 2 — привязка аккаунта
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">
            Привяжи свой PocketOption
          </h1>
          <p className="text-[var(--t-2)] max-w-lg mx-auto">
            Чтобы открыть доступ к сигналам, зарегистрируйся на PocketOption по
            нашей ссылке и привяжи свой ID. Это занимает 1 минуту.
          </p>
        </div>

        <Card padding="lg" className="space-y-6">
          <ol className="space-y-5">
            <li className="flex gap-4">
              <div className="shrink-0 size-8 rounded-full bg-[var(--bg-2)] border border-[var(--b-soft)] flex items-center justify-center text-sm font-semibold text-[var(--brand-gold)]">
                1
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <div className="font-semibold">
                    Зарегистрируйся на PocketOption
                  </div>
                  <p className="text-sm text-[var(--t-2)] mt-0.5">
                    Используй именно нашу ссылку — без неё ID не пройдёт
                    проверку.
                  </p>
                </div>
                <ButtonLink
                  href={referralUrl}
                  external
                  variant="primary"
                  iconRight={<ExternalLink size={16} />}
                >
                  Открыть PocketOption
                </ButtonLink>
              </div>
            </li>

            <li className="flex gap-4">
              <div className="shrink-0 size-8 rounded-full bg-[var(--bg-2)] border border-[var(--b-soft)] flex items-center justify-center text-sm font-semibold text-[var(--brand-gold)]">
                2
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <div className="font-semibold">Введи свой PO ID</div>
                  <p className="text-sm text-[var(--t-2)] mt-0.5">
                    ID — числовой, обычно 7-9 цифр. Найдёшь его в Профиль →
                    мой ID на PocketOption.
                  </p>
                </div>
                <PoIdGateForm
                  initialTraderId={account?.poTraderId ?? ""}
                />
              </div>
            </li>
          </ol>
        </Card>

        <p className="text-center text-xs text-[var(--t-3)]">
          Если у тебя уже есть PocketOption-аккаунт, не привязанный к нашей
          партнёрке —{" "}
          <a
            href="/onboarding/po-id/existing"
            className="text-[var(--brand-gold)] hover:underline"
          >
            что делать?
          </a>
        </p>
      </div>
    </div>
  );
}
