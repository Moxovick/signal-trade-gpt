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
import { buildReferralLink } from "@/lib/pocketoption";
import { Card } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { ExternalLink, ShieldCheck } from "lucide-react";
import { PoIdGateForm } from "./_components/PoIdGateForm";
import { getDictionaryForUser } from "@/lib/i18n";

export const dynamic = "force-dynamic";
export const metadata = { title: "Привязка PocketOption — SpaceSignal" };

export default async function OnboardingPoIdPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const t = await getDictionaryForUser(session.user.id);

  const onboarding = t.onboarding as {
    poId: {
      pageTitle: string;
      stepBadge: string;
      title: string;
      subtitle: string;
      step1Title: string;
      step1Desc: string;
      step1Button: string;
      step2Title: string;
      step2Desc: string;
      existingAccountNote: string;
      existingAccountLink: string;
    };
    poIdForm: {
      placeholder: string;
      submitButton: string;
      submittingButton: string;
      existingAccountLink: string;
      errors: {
        invalid_trader_id: string;
        trader_id_taken: string;
        not_in_our_network: string;
        po_unreachable: string;
        unauthorized: string;
        missing_trader_id: string;
        fallback: string;
        invalidFallback: string;
      };
    };
  };

  // Используем персональную реф-ссылку с `click_id={user.id}`: при регистрации
  // на PO к нам прилетает postback с этим ID и автоматически создаётся/линкуется
  // PocketOptionAccount даже до того, как юзер вручную вобьёт свой trader ID.
  const [account, referralUrl] = await Promise.all([
    prisma.pocketOptionAccount.findUnique({
      where: { userId: session.user.id },
      select: { status: true, poTraderId: true },
    }),
    buildReferralLink(session.user.id),
  ]);

  // Already verified → straight to dashboard.
  if (account?.status === "verified") redirect("/dashboard");

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[var(--t-3)]">
            <ShieldCheck size={14} className="text-[var(--brand-gold)]" />
            {onboarding.poId.stepBadge}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">
            {onboarding.poId.title}
          </h1>
          <p className="text-[var(--t-2)] max-w-lg mx-auto">
            {onboarding.poId.subtitle}
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
                    {onboarding.poId.step1Title}
                  </div>
                  <p className="text-sm text-[var(--t-2)] mt-0.5">
                    {onboarding.poId.step1Desc}
                  </p>
                </div>
                <ButtonLink
                  href={referralUrl}
                  external
                  variant="primary"
                  iconRight={<ExternalLink size={16} />}
                >
                  {onboarding.poId.step1Button}
                </ButtonLink>
              </div>
            </li>

            <li className="flex gap-4">
              <div className="shrink-0 size-8 rounded-full bg-[var(--bg-2)] border border-[var(--b-soft)] flex items-center justify-center text-sm font-semibold text-[var(--brand-gold)]">
                2
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <div className="font-semibold">{onboarding.poId.step2Title}</div>
                  <p className="text-sm text-[var(--t-2)] mt-0.5">
                    {onboarding.poId.step2Desc}
                  </p>
                </div>
                <PoIdGateForm
                  initialTraderId={account?.poTraderId ?? ""}
                  translations={onboarding.poIdForm}
                />
              </div>
            </li>
          </ol>
        </Card>

        <p className="text-center text-xs text-[var(--t-3)]">
          {onboarding.poId.existingAccountNote}{" "}
          <a
            href="/onboarding/po-id/existing"
            className="text-[var(--brand-gold)] hover:underline"
          >
            {onboarding.poId.existingAccountLink}
          </a>
        </p>
      </div>
    </div>
  );
}
