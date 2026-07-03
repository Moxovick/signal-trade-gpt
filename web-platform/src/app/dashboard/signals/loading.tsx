/**
 * Skeleton loading state for the signals page.
 * Shown while server component fetches data.
 */
export default function SignalsLoading() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title skeleton */}
      <div>
        <div className="h-3 w-28 rounded bg-[var(--bg-2)] mb-2" />
        <div className="h-9 w-40 rounded-lg bg-[var(--bg-2)]" />
      </div>

      {/* Tier strip skeleton */}
      <div className="h-12 rounded-2xl bg-[var(--bg-1)] border border-[var(--b-soft)]" />

      {/* Live signal hero skeleton */}
      <div className="rounded-3xl border-2 border-dashed border-white/[0.06] p-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-2xl shimmer-block" />
          <div className="flex-1 space-y-3">
            <div className="h-8 w-36 rounded shimmer-block" />
            <div className="h-4 w-48 rounded shimmer-block" />
          </div>
          <div className="hidden md:block text-right space-y-2">
            <div className="h-3 w-24 rounded shimmer-block ml-auto" />
            <div className="h-12 w-28 rounded shimmer-block ml-auto" />
          </div>
        </div>
      </div>

      {/* Feed header */}
      <div className="flex items-center justify-between">
        <div className="h-5 w-36 rounded shimmer-block" />
        <div className="h-4 w-20 rounded shimmer-block" />
      </div>

      {/* Signal cards skeleton */}
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-xl border border-[var(--b-soft)] bg-[var(--bg-1)] px-4 py-3"
          >
            <div className="w-9 h-9 rounded-lg shimmer-block shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-24 rounded shimmer-block" />
              <div className="h-3 w-16 rounded shimmer-block" />
            </div>
            <div className="hidden sm:block w-28 space-y-1.5">
              <div className="h-3 w-full rounded shimmer-block" />
              <div className="h-2 w-full rounded-full shimmer-block" />
            </div>
            <div className="w-12 h-4 rounded shimmer-block" />
          </div>
        ))}
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-[var(--b-soft)] bg-[var(--bg-1)] px-4 py-4 space-y-3"
          >
            <div className="h-3 w-16 rounded shimmer-block" />
            <div className="h-7 w-20 rounded shimmer-block" />
          </div>
        ))}
      </div>
    </div>
  );
}
