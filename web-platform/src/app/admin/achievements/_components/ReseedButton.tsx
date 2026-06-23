"use client";

import { useTransition } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/context";

export function ReseedButton() {
  const [pending, start] = useTransition();
  const router = useRouter();
  const { t } = useI18n();
  const ar = (t?.admin?.achievements as Record<string, Record<string, string>> | undefined)?.reseed ?? {};

  function run() {
    start(async () => {
      const r = await fetch("/api/admin/achievements/reseed", {
        method: "POST",
      });
      if (!r.ok) {
        alert(ar.error ?? "Не получилось пересеять");
        return;
      }
      router.refresh();
    });
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={run}
      disabled={pending}
      iconLeft={<RefreshCw size={13} className={pending ? "animate-spin" : ""} />}
    >
      {pending ? (ar.reseeding ?? "Пересеиваю...") : (ar.reseed ?? "Пересеять")}
    </Button>
  );
}
