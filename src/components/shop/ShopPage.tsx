import { actions } from "astro:actions";
import { useState } from "react";
import ShoppingList from "@/components/meal-planner/ShoppingList";
import type { IngredientGroup } from "@/components/meal-planner/utils/mealPlannerUtils";
import StartNewWeekButton from "@/components/StartNewWeekButton";
import Button from "@/components/shared/Button";
import PageLayout from "@/components/shared/PageLayout";
import type { Recipe, ShopStatus } from "@/data/types";
import type { ShopIngredient } from "@/lib/database";

interface ShopPageProps {
  shopId: string;
  recipes: Recipe[];
  groups: IngredientGroup[];
  shopIngredients: ShopIngredient[];
  initialStatus: ShopStatus;
}

export default function ShopPage({
  shopId,
  recipes,
  groups,
  shopIngredients,
  initialStatus,
}: ShopPageProps) {
  const [status, setStatus] = useState<ShopStatus>(initialStatus);
  const [finishing, setFinishing] = useState(false);

  async function handleFinishShopping() {
    setFinishing(true);
    const { error } = await actions.shops.finishShopping({ shopId });
    if (error) {
      setFinishing(false);
      return;
    }
    setStatus("cooking");
    setFinishing(false);
  }

  const recipeLinks = (
    <div className="text-sm">
      {recipes.map((r, i) => (
        <span key={r.id}>
          {i > 0 && <span className="text-muted-foreground"> · </span>}
          <a
            href={`/recipe/${r.id}`}
            className="text-muted-foreground hover:text-foreground hover:underline transition-colors"
          >
            {r.name}
          </a>
        </span>
      ))}
    </div>
  );

  return (
    <PageLayout
      title={status === "shopping" ? "Your shopping list" : "Time to cook!"}
      backUrl="/pick"
      backLabel="Change recipes"
      actions={<StartNewWeekButton />}
      subtitle={recipeLinks}
    >
      {status === "shopping" ? (
        <div>
          <div className="rounded-lg border border-border bg-card p-6">
            <ShoppingList groups={groups} shopIngredients={shopIngredients} />
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
            <a
              key={recipe.id}
              href={`/recipe/${recipe.id}`}
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
            </a>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
