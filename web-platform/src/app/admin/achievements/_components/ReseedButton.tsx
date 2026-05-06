"use client";

import { useTransition } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";

export function ReseedButton() {
  const [pending, start] = useTransition();
  const router = useRouter();

  function run() {
    start(async () => {
      const r = await fetch("/api/admin/achievements/reseed", {
        method: "POST",
      });
      if (!r.ok) {
        alert("Не получилось пересеять");
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
      {pending ? "Пересеиваю..." : "Пересеять"}
    </Button>
  );
}
