import ShoppingListSkeleton from "./ShoppingListSkeleton";

export default function ShopPageSkeleton() {
  return (
    <div className="max-w-5xl w-full mx-auto px-6 py-8">
      <div className="h-4 w-20 rounded bg-muted animate-pulse" />
      <div className="h-8 w-48 rounded bg-muted animate-pulse mt-4" />
      <div className="flex items-center gap-2 mt-3">
        <div className="h-3 w-24 rounded bg-muted animate-pulse" />
        <span className="text-muted-foreground">·</span>
        <div className="h-3 w-24 rounded bg-muted animate-pulse" />
        <span className="text-muted-foreground">·</span>
        <div className="h-3 w-24 rounded bg-muted animate-pulse" />
      </div>
      <div className="rounded-lg border border-border bg-card p-6 mt-6">
        <ShoppingListSkeleton />
      </div>
    </div>
  );
}
