import { aggregateIngredients } from "@/components/meal-planner/utils/mealPlannerUtils";
import QueryProvider from "@/components/QueryProvider";
import LoadingSkeleton from "@/components/shared/LoadingSkeleton";
import { useShop, useShopIngredients } from "@/lib/queries";
import ShopPage from "./ShopPage";

interface ShopPageWrapperProps {
  shopId: string;
}

function Content({ shopId }: ShopPageWrapperProps) {
  const { data: shop, isLoading: shopLoading } = useShop(shopId);
  const { data: shopIngredients, isLoading: ingredientsLoading } =
    useShopIngredients(shopId);

  if (shopLoading || ingredientsLoading) {
    return <LoadingSkeleton />;
  }

  if (!shop) {
    window.location.href = "/";
    return null;
  }

  const groups = aggregateIngredients(
    shop.recipes,
    shop.recipes.map((r) => r.id)
  );

  return (
    <ShopPage
      shopId={shopId}
      recipes={shop.recipes}
      groups={groups}
      shopIngredients={shopIngredients ?? []}
      initialStatus={shop.status ?? "shopping"}
    />
  );
}

export default function ShopPageWrapper({ shopId }: ShopPageWrapperProps) {
  return (
    <QueryProvider>
      <Content shopId={shopId} />
    </QueryProvider>
  );
}
