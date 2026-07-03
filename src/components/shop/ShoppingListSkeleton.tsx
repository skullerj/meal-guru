export default function ShoppingListSkeleton() {
  return (
    <div className="space-y-6">
      {[0, 1].map((group) => (
        <div key={group}>
          <div className="h-3 w-20 rounded bg-muted animate-pulse mb-2" />
          <div className="space-y-0">
            {[0, 1, 2].map((row) => (
              <div
                key={row}
                className="py-3 flex items-center gap-3 border-b border-border/50 last:border-0"
              >
                <div className="h-5 w-5 rounded-full bg-muted animate-pulse flex-shrink-0" />
                <div className="h-4 w-32 rounded bg-muted animate-pulse" />
                <div className="h-4 w-16 rounded bg-muted animate-pulse ml-auto" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
