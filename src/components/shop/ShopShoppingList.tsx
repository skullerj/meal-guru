import ShoppingList from "@/components/meal-planner/ShoppingList";
import type { IngredientGroup } from "@/components/meal-planner/utils/mealPlannerUtils";
import { useShopIngredientsSuspense } from "@/lib/queries";

interface ShopShoppingListProps {
  shopId: string;
  groups: IngredientGroup[];
}

export default function ShopShoppingList({
  shopId,
  groups,
}: ShopShoppingListProps) {
  const { data } = useShopIngredientsSuspense(shopId);

  return (
    <ShoppingList groups={groups} shopIngredients={data} shopId={shopId} />
  );
}
