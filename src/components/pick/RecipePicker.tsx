import { Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useMemo, useReducer } from "react";
import type { Recipe } from "@/data/types";
import { useStartWeekWithRecipes } from "@/lib/mutations";
import PickableRecipeCard from "./PickableRecipeCard";
import PickFooter from "./PickFooter";
import {
  createInitialState,
  recipePickerReducer,
} from "./utils/recipePickerReducer";
import { deriveOrdering } from "./utils/recipePickerUtils";

interface RecipePickerProps {
  recipes: Recipe[];
}

const settleStyle = `
@keyframes pick-card-settle {
  from {
    opacity: 0.4;
    transform: translateY(-6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.pick-card-settle-odd,
.pick-card-settle-even {
  animation: pick-card-settle 260ms ease-out;
}
`;

export default function RecipePicker({ recipes }: RecipePickerProps) {
  const [state, dispatch] = useReducer(
    recipePickerReducer,
    undefined,
    createInitialState
  );

  const { selected, unselected, sharedCount } = useMemo(
    () => deriveOrdering(recipes, state.selectedIds),
    [recipes, state.selectedIds]
  );

  const navigate = useNavigate();
  const startWeek = useStartWeekWithRecipes();

  const handleToggle = useCallback((id: string) => {
    dispatch({ type: "TOGGLE_RECIPE", id });
  }, []);

  function handleStart() {
    startWeek.mutate(state.selectedIds, {
      onSuccess: (shop) => {
        navigate({ to: "/shop/$id", params: { id: shop.id } });
      },
    });
  }

  if (recipes.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No recipes yet.{" "}
        <Link
          to="/recipes"
          className="text-primary underline underline-offset-4"
        >
          Add your first recipe
        </Link>
        .
      </p>
    );
  }

  const hasSelection = state.selectedIds.length > 0;

  return (
    <div className="pb-40">
      <style>{settleStyle}</style>

      {hasSelection && (
        <section className="mb-8">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Your week
          </h2>
          <div className="flex flex-col gap-3">
            {selected.map((recipe) => (
              <PickableRecipeCard
                key={recipe.id}
                recipe={recipe}
                isSelected
                sharedNames={[]}
                showPairing={hasSelection}
                settleKey={state.version}
                onToggle={handleToggle}
              />
            ))}
          </div>
        </section>
      )}

      <div className="flex flex-col gap-3">
        {unselected.map((entry) => (
          <PickableRecipeCard
            key={entry.recipe.id}
            recipe={entry.recipe}
            isSelected={false}
            sharedNames={entry.sharedNames}
            showPairing={hasSelection}
            settleKey={state.version}
            onToggle={handleToggle}
          />
        ))}
      </div>

      <PickFooter
        selectedCount={state.selectedIds.length}
        sharedCount={sharedCount}
        isPending={startWeek.isPending}
        isError={startWeek.isError}
        onStart={handleStart}
      />
    </div>
  );
}
