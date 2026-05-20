import type { ReactNode } from "react";
import { SettingsBackNav } from "./_components/SettingsBackNav";

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-2xl mx-auto w-full space-y-5">
      <SettingsBackNav />
      {children}
    </div>
  );
}
