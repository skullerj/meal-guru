import Button from "@/components/shared/Button";

interface ShopNowButtonProps {
  recipeIds: string[];
}

export default function ShopNowButton({ recipeIds }: ShopNowButtonProps) {
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

  function handleClick() {
    const shuffled = [...recipeIds].sort(() => Math.random() - 0.5);
    const picked = shuffled.slice(0, 2);
    const params = new URLSearchParams();
    for (const id of picked) {
      params.append("r", id);
    }
    window.location.href = `/shop?${params.toString()}`;
  }

  return (
    <Button variant="primary" size="lg" leftIcon="shopping-cart" onClick={handleClick}>
      Shop Now
    </Button>
  );
}
