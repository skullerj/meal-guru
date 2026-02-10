import { useMemo, useReducer } from "react";
import type { Ingredient, Recipe } from "../../data/recipes";
import Button from "../shared/Button";
import RecipeColumn from "./RecipeColumn";
import ShoppingColumn from "./ShoppingColumn";
import ShopSummaryColumn from "./ShopSummaryColumn";
import {
  createInitialState,
  createMealPlannerReducer,
} from "./utils/mealPlannerReducer";
import { calculateGeneralSimilarityScore } from "./utils/mealPlannerUtils";

interface MealPlannerProps {
  recipes: Recipe[];
  ingredients: Ingredient[];
}

export default function MealPlanner({
  recipes,
  ingredients: availableIngredients,
}: MealPlannerProps) {
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

  const handleAddExtraIngredient = (
    ingredient: Omit<Ingredient, "amount">,
    amount: number
  ) => {
    dispatch({ type: "ADD_EXTRA_INGREDIENT", ingredient, amount });
  };

  const handleRemoveExtraIngredient = (ingredientId: string) => {
    dispatch({ type: "REMOVE_EXTRA_INGREDIENT", ingredientId });
  };

  const similarityScore = useMemo(
    () => calculateGeneralSimilarityScore(recipes),
    [recipes]
  );

  return (
    <div className="container mx-auto p-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex justify-between items-end">
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Meal Guru</h1>
          <p className="text-gray-600 mb-4">
            Plan your meals, aggregate ingredients, and optimize your shopping
          </p>
          <p className="text-grey-600">
            General Recipe Similarity: {similarityScore.toFixed(2)}%
          </p>
        </div>
        <div className="flex gap-3">
          {/* Reset button */}
          {(state.selectedRecipeIds.length > 0 ||
            state.ownedIngredientIds.length > 0 ||
            state.extraIngredients.length > 0) && (
            <Button
              variant="secondary"
              onClick={handleResetSelections}
              leftIcon="reset"
            >
              Reset All Selections
            </Button>
          )}
          {/* Add Recipe button */}
          <a href="/add-recipe">
            <Button variant="primary" leftIcon="add">
              Add Recipe
            </Button>
          </a>
        </div>
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
          extraIngredients={state.extraIngredients}
          availableIngredients={availableIngredients}
          onIngredientToggle={handleIngredientToggle}
          onAddExtraIngredient={handleAddExtraIngredient}
          onRemoveExtraIngredient={handleRemoveExtraIngredient}
        />

        <ShopSummaryColumn
          remainingIngredients={state.remainingToBuy}
          totalPrice={state.totalPrice}
          selectedRecipeIds={state.selectedRecipeIds}
          onShopCreated={handleResetSelections}
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
            Extra Ingredients:{" "}
            {state.extraIngredients
              .map(
                (e) => `${e.ingredient.name} (${e.amount}${e.ingredient.unit})`
              )
              .join(", ") || "None"}
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
