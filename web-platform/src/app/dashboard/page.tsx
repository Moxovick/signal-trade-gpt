/**
 * Dashboard root — signals-first redirect.
 *
 * The "Overview" page was deprecated in v6a (per product feedback: it added
 * cognitive load without showing the main feature). Hitting /dashboard now
 * lands directly on the signals feed.
 */
import { redirect } from "next/navigation";

export default function DashboardPage() {
  redirect("/dashboard/signals");
}
