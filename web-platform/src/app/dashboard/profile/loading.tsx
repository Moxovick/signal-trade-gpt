export default function ProfileLoading() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-full shimmer-block" />
        <div className="space-y-2">
          <div className="h-6 w-40 rounded shimmer-block" />
          <div className="h-4 w-56 rounded shimmer-block" />
        </div>
      </div>

      {/* Cards */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-[var(--b-soft)] bg-[var(--bg-1)] p-6 space-y-4"
        >
          <div className="h-5 w-32 rounded shimmer-block" />
          <div className="space-y-2">
            <div className="h-4 w-full rounded shimmer-block" />
            <div className="h-4 w-3/4 rounded shimmer-block" />
          </div>
        </div>
      ))}
    </div>
  );
}
