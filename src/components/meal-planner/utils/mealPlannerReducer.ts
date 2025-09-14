import type { Recipe } from "../../../data/recipes";
import {
  type AggregatedIngredient,
  aggregateIngredients,
  calculateTotalPrice,
  getIngredientsLeftToBuy,
} from "./mealPlannerUtils";

export interface MealPlannerState {
  selectedRecipeIds: string[];
  ownedIngredientIds: string[];
  aggregatedIngredients: AggregatedIngredient[];
  remainingToBuy: AggregatedIngredient[];
  totalPrice: number;
}

export type MealPlannerAction =
  | { type: "TOGGLE_RECIPE"; recipeId: string }
  | { type: "TOGGLE_OWNED_INGREDIENT"; ingredientId: string }
  | { type: "RESET_SELECTIONS" };

export function createInitialState(): MealPlannerState {
  return {
    selectedRecipeIds: [],
    ownedIngredientIds: [],
    aggregatedIngredients: [],
    remainingToBuy: [],
    totalPrice: 0,
  };
}

function recalculateState(
  selectedRecipeIds: string[],
  ownedIngredientIds: string[],
  allRecipes: Recipe[]
): Pick<
  MealPlannerState,
  "aggregatedIngredients" | "remainingToBuy" | "totalPrice"
> {
  // Get selected recipes
  const selectedRecipes = allRecipes.filter((recipe) =>
    selectedRecipeIds.includes(recipe.id)
  );

  // Aggregate ingredients from selected recipes
  const aggregatedIngredients = aggregateIngredients(selectedRecipes);

  // Filter out owned ingredients
  const remainingToBuy = getIngredientsLeftToBuy(
    aggregatedIngredients,
    ownedIngredientIds
  );

  // Calculate total price
  const totalPrice = calculateTotalPrice(remainingToBuy);

  return {
    aggregatedIngredients,
    remainingToBuy,
    totalPrice,
  };
}

export function createMealPlannerReducer(allRecipes: Recipe[]) {
  return function mealPlannerReducer(
    state: MealPlannerState,
    action: MealPlannerAction
  ): MealPlannerState {
    switch (action.type) {
      case "TOGGLE_RECIPE": {
        const { recipeId } = action;
        const isSelected = state.selectedRecipeIds.includes(recipeId);

        const selectedRecipeIds = isSelected
          ? state.selectedRecipeIds.filter((id) => id !== recipeId)
          : [...state.selectedRecipeIds, recipeId];

        const calculatedState = recalculateState(
          selectedRecipeIds,
          state.ownedIngredientIds,
          allRecipes
        );

        return {
          ...state,
          selectedRecipeIds,
          ...calculatedState,
        };
      }

      case "TOGGLE_OWNED_INGREDIENT": {
        const { ingredientId } = action;
        const isOwned = state.ownedIngredientIds.includes(ingredientId);

        const ownedIngredientIds = isOwned
          ? state.ownedIngredientIds.filter((id) => id !== ingredientId)
          : [...state.ownedIngredientIds, ingredientId];

        const calculatedState = recalculateState(
          state.selectedRecipeIds,
          ownedIngredientIds,
          allRecipes
        );

        return {
          ...state,
          ownedIngredientIds,
          ...calculatedState,
        };
      }

      case "RESET_SELECTIONS": {
        return createInitialState();
      }

      default:
        return state;
    }
  };
}
