import { useReducer } from "react";
import type { Recipe } from "../data/recipes";
import LeftToBuyColumn from "./LeftToBuyColumn";
import RecipeColumn from "./RecipeColumn";
import ShoppingColumn from "./ShoppingColumn";
import {
  createInitialState,
  createMealPlannerReducer,
} from "./utils/mealPlannerReducer";

interface MealPlannerProps {
  recipes: Recipe[];
}

export default function MealPlanner({ recipes }: MealPlannerProps) {
  const mealPlannerReducer = createMealPlannerReducer(recipes);
  const [state, dispatch] = useReducer(
    mealPlannerReducer,
    createInitialState()
  );

  const handleRecipeToggle = (recipeId: string) => {
    dispatch({ type: "TOGGLE_RECIPE", recipeId });
  };

  const handleIngredientToggle = (ingredientId: string) => {
    dispatch({ type: "TOGGLE_OWNED_INGREDIENT", ingredientId });
  };

  const handleResetSelections = () => {
    dispatch({ type: "RESET_SELECTIONS" });
  };

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8 flex justify-between items-end">
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Meal Guru</h1>
          <p className="text-gray-600 mb-4">
            Plan your meals, aggregate ingredients, and optimize your shopping
          </p>
        </div>
        {/* Reset button */}
        {(state.selectedRecipeIds.length > 0 ||
          state.ownedIngredientIds.length > 0) && (
          <button
            type="button"
            onClick={handleResetSelections}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Reset All Selections
          </button>
        )}
      </div>

      {/* Three-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecipeColumn
          recipes={recipes}
          selectedRecipeIds={state.selectedRecipeIds}
          onRecipeToggle={handleRecipeToggle}
        />

        <ShoppingColumn
          aggregatedIngredients={state.aggregatedIngredients}
          ownedIngredientIds={state.ownedIngredientIds}
          onIngredientToggle={handleIngredientToggle}
        />

        <LeftToBuyColumn
          remainingIngredients={state.remainingToBuy}
          totalPrice={state.totalPrice}
          targetAmount={40}
        />
      </div>

      {/* Debug info (only in development) */}
      {import.meta.env.DEV && (
        <div className="mt-8 p-4 bg-gray-100 rounded-lg text-sm">
          <h3 className="font-semibold mb-2">Debug Info:</h3>
          <p>
            Selected Recipes: {state.selectedRecipeIds.join(", ") || "None"}
          </p>
          <p>
            Owned Ingredients: {state.ownedIngredientIds.join(", ") || "None"}
          </p>
          <p>
            Total Aggregated: {state.aggregatedIngredients.length} ingredients
          </p>
          <p>Left to Buy: {state.remainingToBuy.length} ingredients</p>
          <p>Total Price: £{state.totalPrice.toFixed(2)}</p>
        </div>
      )}
    </div>
  );
}
