export default function SettingsLoading() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <div className="h-7 w-32 rounded shimmer-block mb-2" />
        <div className="h-4 w-64 rounded shimmer-block" />
      </div>

      {/* Groups */}
      {Array.from({ length: 3 }).map((_, g) => (
        <div key={g}>
          <div className="h-3 w-20 rounded shimmer-block mb-3 ml-1" />
          <div className="rounded-2xl border border-[var(--b-soft)] bg-[var(--bg-1)] overflow-hidden divide-y divide-[var(--b-soft)]">
            {Array.from({ length: g === 0 ? 3 : 2 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                <div className="w-10 h-10 rounded-xl shimmer-block shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-4 w-28 rounded shimmer-block" />
                  <div className="h-3 w-44 rounded shimmer-block" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
