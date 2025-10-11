import type { Ingredient, Recipe } from "../../../data/recipes";
import {
  type AggregatedIngredient,
  aggregateIngredients,
  calculateIngredientCost,
  calculateTotalPrice,
  getIngredientsLeftToBuy,
} from "./mealPlannerUtils";

export interface ExtraIngredient {
  ingredient: Omit<Ingredient, "amount">;
  amount: number;
}

export interface MealPlannerState {
  selectedRecipeIds: string[];
  ownedIngredientIds: string[];
  extraIngredients: ExtraIngredient[];
  aggregatedIngredients: AggregatedIngredient[];
  remainingToBuy: AggregatedIngredient[];
  totalPrice: number;
}

export type MealPlannerAction =
  | { type: "TOGGLE_RECIPE"; recipeId: string }
  | { type: "TOGGLE_OWNED_INGREDIENT"; ingredientId: string }
  | {
      type: "ADD_EXTRA_INGREDIENT";
      ingredient: Omit<Ingredient, "amount">;
      amount: number;
    }
  | { type: "REMOVE_EXTRA_INGREDIENT"; ingredientId: string }
  | { type: "RESET_SELECTIONS" };

export function createInitialState(): MealPlannerState {
  return {
    selectedRecipeIds: [],
    ownedIngredientIds: [],
    extraIngredients: [],
    aggregatedIngredients: [],
    remainingToBuy: [],
    totalPrice: 0,
  };
}

function recalculateState(
  selectedRecipeIds: string[],
  ownedIngredientIds: string[],
  extraIngredients: ExtraIngredient[],
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
  const recipeIngredients = aggregateIngredients(selectedRecipes);

  // Convert extra ingredients to AggregatedIngredient format
  const extraAggregatedIngredients: AggregatedIngredient[] =
    extraIngredients.map((extra) => ({
      id: `extra-${extra.ingredient.id}`,
      amount: extra.amount,
      order_index: 0, // Extra ingredients don't have a specific order
      ingredient: extra.ingredient,
      totalCost: calculateIngredientCost({
        id: `extra-${extra.ingredient.id}`,
        amount: extra.amount,
        ingredient: extra.ingredient,
        order_index: 0,
      }),
    }));

  // Combine recipe ingredients with extra ingredients
  const aggregatedIngredients = [
    ...recipeIngredients,
    ...extraAggregatedIngredients,
  ];

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
          state.extraIngredients,
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
          state.extraIngredients,
          allRecipes
        );

        return {
          ...state,
          ownedIngredientIds,
          ...calculatedState,
        };
      }

      case "ADD_EXTRA_INGREDIENT": {
        const { ingredient, amount } = action;
        const newExtraIngredient: ExtraIngredient = { ingredient, amount };
        const extraIngredients = [
          ...state.extraIngredients,
          newExtraIngredient,
        ];

        const calculatedState = recalculateState(
          state.selectedRecipeIds,
          state.ownedIngredientIds,
          extraIngredients,
          allRecipes
        );

        return {
          ...state,
          extraIngredients,
          ...calculatedState,
        };
      }

      case "REMOVE_EXTRA_INGREDIENT": {
        const { ingredientId } = action;
        const extraIngredients = state.extraIngredients.filter(
          (extra) => extra.ingredient.id !== ingredientId
        );

        const calculatedState = recalculateState(
          state.selectedRecipeIds,
          state.ownedIngredientIds,
          extraIngredients,
          allRecipes
        );

        return {
          ...state,
          extraIngredients,
          ...calculatedState,
        };
      }

      case "RESET_SELECTIONS": {
        return {
          ...createInitialState(),
        };
      }

      default:
        return state;
    }
  };
}
