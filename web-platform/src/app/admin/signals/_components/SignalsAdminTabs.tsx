"use client";

import { useState } from "react";
import {
  ListOrdered,
  LayoutTemplate,
  Wand2,
  CalendarClock,
} from "lucide-react";
import { CreateSignalForm } from "./CreateSignalForm";
import { TemplatesPanel } from "./TemplatesPanel";
import { BulkPanel } from "./BulkPanel";
import { SchedulePanel } from "./SchedulePanel";
import type { SignalTemplate, SignalSchedule } from "@/lib/signal-config";

type Tab = "publish" | "templates" | "bulk" | "schedule";

const TABS: Array<{ id: Tab; label: string; Icon: typeof ListOrdered }> = [
  { id: "publish", label: "Опубликовать", Icon: ListOrdered },
  { id: "templates", label: "Шаблоны", Icon: LayoutTemplate },
  { id: "bulk", label: "Bulk-генерация", Icon: Wand2 },
  { id: "schedule", label: "Авто-расписание", Icon: CalendarClock },
];

type Props = {
  initialTemplates: SignalTemplate[];
  initialSchedule: SignalSchedule;
};

export function SignalsAdminTabs({
  initialTemplates,
  initialSchedule,
}: Props) {
  const [tab, setTab] = useState<Tab>("publish");

  return (
    <div className="space-y-5">
      <div className="flex gap-1 p-1 rounded-2xl bg-[#0d0d18] border border-white/[0.06] w-fit">
        {TABS.map(({ id, label, Icon }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              onClick={() => setTab(id)}
              className="inline-flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-medium transition-colors"
              style={{
                background: active ? "#f5c518" : "transparent",
                color: active ? "#1a1208" : "#aaa",
              }}
            >
              <Icon size={14} />
              {label}
            </button>
          );
        })}
      </div>

      {tab === "publish" ? <CreateSignalForm /> : null}
      {tab === "templates" ? (
        <TemplatesPanel initial={initialTemplates} />
      ) : null}
      {tab === "bulk" ? <BulkPanel templates={initialTemplates} /> : null}
      {tab === "schedule" ? <SchedulePanel initial={initialSchedule} /> : null}
    </div>
  );
}
