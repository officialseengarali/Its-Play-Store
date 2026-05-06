export function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-card border border-border/30 p-3 animate-pulse">
      <div className="w-full aspect-square rounded-xl bg-secondary mb-3" />
      <div className="h-3 rounded bg-secondary w-3/4 mb-2" />
      <div className="h-2.5 rounded bg-secondary w-1/2 mb-2" />
      <div className="h-2 rounded bg-secondary w-1/3" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex gap-3 p-3 animate-pulse">
      <div className="w-14 h-14 rounded-xl bg-secondary shrink-0" />
      <div className="flex-1 space-y-2 py-1">
        <div className="h-3 rounded bg-secondary w-3/4" />
        <div className="h-2.5 rounded bg-secondary w-1/2" />
        <div className="h-2 rounded bg-secondary w-1/4" />
      </div>
    </div>
  );
}

export function SkeletonHero() {
  return (
    <div className="w-full h-64 sm:h-80 rounded-2xl bg-secondary animate-pulse" />
  );
}
