import type { Recipe } from "@/data/types";
import { aggregateIngredients, type IngredientGroup } from "./mealPlannerUtils";

export interface MealPlannerState {
  selectedIds: string[];
  groups: IngredientGroup[];
}

export type MealPlannerAction = { type: "TOGGLE_RECIPE"; id: string };

export function mealPlannerReducer(
  state: MealPlannerState,
  action: MealPlannerAction,
  recipes: Recipe[]
): MealPlannerState {
  switch (action.type) {
    case "TOGGLE_RECIPE": {
      const isSelected = state.selectedIds.includes(action.id);
      const selectedIds = isSelected
        ? state.selectedIds.filter((id) => id !== action.id)
        : [...state.selectedIds, action.id];
      return {
        selectedIds,
        groups: aggregateIngredients(recipes, selectedIds),
      };
    }
    default:
      return state;
  }
}

export function createInitialState(): MealPlannerState {
  return { selectedIds: [], groups: [] };
}
