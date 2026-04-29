/**
 * Admin · Site settings (tier thresholds, ref-link template, etc.)
 *
 * Editable via the inline form below; updates go through `/api/admin/settings`.
 */
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { SettingsForm } from "./_components/SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const allSettings = await prisma.siteSettings.findMany();
  const map = Object.fromEntries(allSettings.map((s) => [s.key, s]));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Настройки</h1>
      <Card padding="lg">
        <SettingsForm
          tierThresholds={map.tier_thresholds?.value ?? null}
          refLinkTemplate={map.po_referral_link_template?.value ?? null}
          partnerAccount={map.po_partner_account?.value ?? null}
          subAffiliateRate={map.sub_affiliate_rate?.value ?? null}
          siteDisclaimer={map.site_disclaimer?.value ?? null}
        />
      </Card>
    </div>
  );
}
