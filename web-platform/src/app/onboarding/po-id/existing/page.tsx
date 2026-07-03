/**
 * Onboarding · existing PocketOption account dead-end.
 *
 * Per supervisor decision: if the user already has a PO account that's NOT
 * tied to our partner network, we don't admit them. They must create a NEW
 * account via our referral link.
 */
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getPoReferralUrl } from "@/lib/pocketoption";
import { Card } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { ArrowLeft, ExternalLink, AlertTriangle } from "lucide-react";
import { getDictionaryForUser } from "@/lib/i18n";

export const dynamic = "force-dynamic";
export const metadata = { title: "Нужен новый аккаунт PocketOption" };

export default async function ExistingPoAccountInfoPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const t = await getDictionaryForUser(session.user.id);

  const poIdExisting = (t.onboarding as {
    poIdExisting: {
      pageTitle: string;
      title: string;
      body1: string;
      body2prefix: string;
      body2new: string;
      body2suffix: string;
      howToLabel: string;
      howToSteps: string[];
      createAccountButton: string;
      backButton: string;
      supportNote: string;
      supportBotLink: string;
    };
  }).poIdExisting;

  const referralUrl = await getPoReferralUrl();

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-2xl space-y-6">
        <Card padding="lg" className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="shrink-0 size-12 rounded-full bg-[var(--brand-gold)]/10 flex items-center justify-center">
              <AlertTriangle size={24} className="text-[var(--brand-gold)]" />
            </div>
            <div className="flex-1 space-y-3">
              <h1 className="text-2xl md:text-3xl font-bold">
                {poIdExisting.title}
              </h1>
              <p className="text-[var(--t-2)] leading-relaxed">
                {poIdExisting.body1}
              </p>
              <p className="text-[var(--t-2)] leading-relaxed">
                {poIdExisting.body2prefix}{" "}
                <span className="text-[var(--t-1)] font-semibold">{poIdExisting.body2new}</span>
                {poIdExisting.body2suffix}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--b-soft)] bg-[var(--bg-2)] p-4 space-y-2">
            <div className="text-xs uppercase tracking-[0.18em] text-[var(--t-3)]">
              {poIdExisting.howToLabel}
            </div>
            <ol className="space-y-1.5 text-sm text-[var(--t-2)] list-decimal list-inside">
              {poIdExisting.howToSteps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <ButtonLink
              href={referralUrl}
              external
              variant="primary"
              iconRight={<ExternalLink size={16} />}
            >
              {poIdExisting.createAccountButton}
            </ButtonLink>
            <ButtonLink
              href="/onboarding/po-id"
              variant="secondary"
              iconLeft={<ArrowLeft size={16} />}
            >
              {poIdExisting.backButton}
            </ButtonLink>
          </div>
        </Card>

        <p className="text-center text-xs text-[var(--t-3)]">
          {poIdExisting.supportNote}{" "}
          <a
            href={process.env["NEXT_PUBLIC_BOT_URL"] ?? ""}
            className="text-[var(--brand-gold)] hover:underline"
            target="_blank"
            rel="noreferrer noopener"
          >
            {poIdExisting.supportBotLink}
          </a>
          .
        </p>
      </div>
    </div>
  );
}
