export default function LoadingSkeleton() {
  return (
    <div className="max-w-5xl w-full mx-auto px-6 py-8 space-y-6">
      <div className="h-4 w-20 rounded bg-muted animate-pulse" />
      <div className="h-8 w-48 rounded bg-muted animate-pulse" />
      <div className="space-y-3">
        <div className="h-4 w-full rounded bg-muted animate-pulse" />
        <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
        <div className="h-4 w-5/6 rounded bg-muted animate-pulse" />
      </div>
    </div>
  );
}
