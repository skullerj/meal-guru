import { Link, useNavigate } from "@tanstack/react-router";
import { Suspense, useMemo, useState } from "react";
import { aggregateIngredients } from "@/components/meal-planner/utils/mealPlannerUtils";
import StartNewWeekButton from "@/components/StartNewWeekButton";
import Button from "@/components/shared/Button";
import PageLayout from "@/components/shared/PageLayout";
import ShoppingListSkeleton from "@/components/shop/ShoppingListSkeleton";
import ShopShoppingList from "@/components/shop/ShopShoppingList";
import type { ShopStatus } from "@/data/types";
import { updateShopStatus } from "@/lib/database";
import { queryKeys, useShopSuspense } from "@/lib/queries";
import { queryClient } from "@/lib/query-client";
import { supabase } from "@/lib/supabase-browser";

interface ShopPageProps {
  shopId: string;
}

export default function ShopPage({ shopId }: ShopPageProps) {
  const { data: shop } = useShopSuspense(shopId);
  const navigate = useNavigate();

  const recipes = shop?.recipes ?? [];
  const groups = useMemo(
    () =>
      aggregateIngredients(
        recipes,
        recipes.map((r) => r.id)
      ),
    [recipes]
  );

  const [status, setStatus] = useState<ShopStatus>(shop?.status ?? "shopping");
  const [finishing, setFinishing] = useState(false);

  if (!shop) {
    navigate({ to: "/" });
    return null;
  }

  async function handleFinishShopping() {
    setFinishing(true);
    try {
      await updateShopStatus(supabase, shopId, "cooking");
      setStatus("cooking");
      queryClient.invalidateQueries({ queryKey: queryKeys.shop(shopId) });
    } catch {
      // silently fail
    } finally {
      setFinishing(false);
    }
  }

  const recipeLinks = (
    <div className="text-sm">
      {recipes.map((r, i) => (
        <span key={r.id}>
          {i > 0 && <span className="text-muted-foreground"> · </span>}
          <Link
            to="/recipe/$id"
            params={{ id: r.id }}
            className="text-muted-foreground hover:text-foreground hover:underline transition-colors"
          >
            {r.name}
          </Link>
        </span>
      ))}
    </div>
  );

  return (
    <PageLayout
      title={status === "shopping" ? "Your shopping list" : "Time to cook!"}
      backUrl="/"
      backLabel="Back"
      actions={<StartNewWeekButton />}
      subtitle={recipeLinks}
    >
      {status === "shopping" ? (
        <div>
          <div className="rounded-lg border border-border bg-card p-6">
            <Suspense fallback={<ShoppingListSkeleton />}>
              <ShopShoppingList shopId={shopId} groups={groups} />
            </Suspense>
          </div>
          <div className="mt-6">
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              loading={finishing}
              onClick={handleFinishShopping}
            >
              Done shopping
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {recipes.map((recipe) => (
            <Link
              key={recipe.id}
              to="/recipe/$id"
              params={{ id: recipe.id }}
              className="block rounded-lg border border-border bg-card p-5 hover:border-primary transition-colors"
            >
              <h2 className="text-lg font-semibold text-foreground font-heading">
                {recipe.name}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {recipe.ingredients.length} ingredient
                {recipe.ingredients.length !== 1 ? "s" : ""}
                {recipe.steps && recipe.steps.length > 0 && (
                  <>
                    {" "}
                    · {recipe.steps.length} step
                    {recipe.steps.length !== 1 ? "s" : ""}
                  </>
                )}
              </p>
            </Link>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
