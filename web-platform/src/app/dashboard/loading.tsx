import { getDictionary } from "@/lib/i18n";

export default async function DashboardLoading() {
  const t = await getDictionary("ru");
  return (
    <div className="flex items-center justify-center py-20 animate-fade-in">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-2 border-[var(--brand-gold)] border-t-transparent animate-spin" />
        <span className="text-sm text-[var(--t-3)]">{t.common?.loading ?? "Загрузка…"}</span>
      </div>
    </div>
  );
}
