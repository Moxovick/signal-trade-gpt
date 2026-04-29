/**
 * /pricing — DEPRECATED in v2.
 *
 * Subscriptions removed. Tier perks are now described on the landing page.
 */
import { redirect } from "next/navigation";

export default function PricingPage(): never {
  redirect("/#tiers");
}
