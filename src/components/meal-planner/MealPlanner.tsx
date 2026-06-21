import { useCallback, useReducer } from "react";
import type { Recipe } from "@/data/types";
import RecipeGrid from "./RecipeGrid";
import ShoppingList from "./ShoppingList";
import {
  createInitialState,
  mealPlannerReducer,
} from "./utils/mealPlannerReducer";

interface MealPlannerProps {
  recipes: Recipe[];
}

export default function MealPlanner({ recipes }: MealPlannerProps) {
  const [state, dispatch] = useReducer(
    (
      state: ReturnType<typeof createInitialState>,
      action: { type: "TOGGLE_RECIPE"; id: string }
    ) => mealPlannerReducer(state, action, recipes),
    undefined,
    createInitialState
  );

  const handleToggle = useCallback((id: string) => {
    dispatch({ type: "TOGGLE_RECIPE", id });
  }, []);

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <section className="flex-1 min-w-0">
        <h2 className="text-lg font-semibold text-foreground mb-4">Recipes</h2>
        {recipes.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No recipes yet.{" "}
            <a
              href="/add-recipe"
              className="text-primary underline underline-offset-4"
            >
              Add your first recipe
            </a>
            .
          </p>
        ) : (
          <RecipeGrid
            recipes={recipes}
            selectedIds={state.selectedIds}
            onToggle={handleToggle}
          />
        )}
      </section>

      <aside className="lg:w-80 xl:w-96 shrink-0">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Shopping List
        </h2>
        <div className="rounded-lg border border-border bg-card p-4">
          <ShoppingList groups={state.groups} />
        </div>
      </aside>
    </div>
  );
}
