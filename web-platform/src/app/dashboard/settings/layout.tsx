import type { ReactNode } from "react";
import { SettingsSidebar } from "./_components/SettingsSidebar";

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[240px,1fr] gap-6">
      <aside>
        <h1 className="text-sm text-[var(--t-3)] uppercase tracking-wider mb-3 px-3">
          Настройки
        </h1>
        <SettingsSidebar />
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
