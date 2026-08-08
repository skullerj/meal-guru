import Button from "@/components/shared/Button";

interface PickFooterProps {
  selectedCount: number;
  sharedCount: number;
  isPending: boolean;
  isError: boolean;
  onStart: () => void;
}

export default function PickFooter({
  selectedCount,
  sharedCount,
  isPending,
  isError,
  onStart,
}: PickFooterProps) {
  const recipeLabel = `${selectedCount} ${selectedCount === 1 ? "recipe" : "recipes"}`;
  const sharedLabel =
    sharedCount > 0
      ? ` · ${sharedCount} shared ${sharedCount === 1 ? "item" : "items"}`
      : "";

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-6 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <p className="text-xs text-muted-foreground mb-2">
          {recipeLabel}
          {sharedLabel}
        </p>
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          disabled={selectedCount === 0}
          loading={isPending}
          onClick={onStart}
        >
          Start the week
        </Button>
        {isError && (
          <p className="text-xs text-destructive mt-2">
            Something went wrong. Try again.
          </p>
        )}
      </div>
    </div>
  );
}
