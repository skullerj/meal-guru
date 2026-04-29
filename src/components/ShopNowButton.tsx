import Button from "@/components/shared/Button";

interface ShopNowButtonProps {
  recipeIds: string[];
  excludeIds?: string[];
}

export default function ShopNowButton({ recipeIds, excludeIds = [] }: ShopNowButtonProps) {
  if (recipeIds.length < 2) {
    return (
      <p className="text-sm text-muted-foreground">
        Add at least 2 recipes to use Shop Now.{" "}
        <a href="/add-recipe" className="text-primary underline underline-offset-4">
          Add your first recipe
        </a>
        .
      </p>
    );
  }

  const excludeSet = new Set(excludeIds);
  const available = recipeIds.filter((id) => !excludeSet.has(id));
  const pool = available.length >= 2 ? available : recipeIds;

  const skippedCount = recipeIds.length - available.length;
  const showSkippingMessage = available.length < recipeIds.length && available.length >= 2;
  const showFallbackMessage = available.length < 2 && recipeIds.length >= 2 && skippedCount > 0;

  function handleClick() {
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const picked = shuffled.slice(0, 2);
    const params = new URLSearchParams();
    for (const id of picked) {
      params.append("r", id);
    }
    window.location.href = `/shop?${params.toString()}`;
  }

  return (
    <div className="flex flex-col items-center">
      <Button variant="primary" size="lg" leftIcon="shopping-cart" onClick={handleClick}>
        Shop Now
      </Button>
      {showSkippingMessage && (
        <p className="text-xs text-muted-foreground mt-2">
          Skipping {skippedCount} recently cooked recipe(s)
        </p>
      )}
      {showFallbackMessage && (
        <p className="text-xs text-muted-foreground mt-2">
          All recipes cooked recently — picking from the full list
        </p>
      )}
    </div>
  );
}
