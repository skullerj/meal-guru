import type { Recipe } from "../../../lib/database";
import {
  checkAndMarkIngredientModified,
  createEditableIngredients,
  type EditableRecipeIngredient,
  hasUnsavedChanges,
  revertIngredient,
} from "./editRecipeUtils";

export interface EditRecipeState {
  // Original recipe data (immutable reference)
  originalRecipe: Recipe;

  // Current working state
  recipeName: string;
  ingredients: EditableRecipeIngredient[];

  // UI state
  selectedIngredientId: string | null;
  hasUnsavedChanges: boolean;

  // Form state
  isLoading: boolean;
  error: string | null;
}

export type EditRecipeAction =
  | { type: "SET_RECIPE_NAME"; name: string }
  | { type: "SELECT_INGREDIENT"; ingredientId: string | null }
  | {
      type: "UPDATE_INGREDIENT";
      ingredientId: string;
      updates: Partial<EditableRecipeIngredient>;
    }
  | { type: "DELETE_INGREDIENT"; ingredientId: string }
  | { type: "RESTORE_INGREDIENT"; ingredientId: string }
  | { type: "RESET_INGREDIENT"; ingredientId: string }
  | { type: "RESET_ALL_CHANGES" }
  | { type: "SET_LOADING"; isLoading: boolean }
  | { type: "SET_ERROR"; error: string | null };

export function createInitialState(recipe: Recipe): EditRecipeState {
  return {
    originalRecipe: recipe,
    recipeName: recipe.name,
    ingredients: createEditableIngredients(recipe),
    selectedIngredientId: null,
    hasUnsavedChanges: false,
    isLoading: false,
    error: null,
  };
}

export function editRecipeReducer(
  state: EditRecipeState,
  action: EditRecipeAction
): EditRecipeState {
  switch (action.type) {
    case "SET_RECIPE_NAME": {
      const newState = {
        ...state,
        recipeName: action.name,
      };

      // Update unsaved changes flag
      newState.hasUnsavedChanges = hasUnsavedChanges(
        state.originalRecipe,
        action.name,
        state.ingredients
      );

      return newState;
    }

    case "SELECT_INGREDIENT": {
      return {
        ...state,
        selectedIngredientId: action.ingredientId,
      };
    }

    case "UPDATE_INGREDIENT": {
      const updatedIngredients = state.ingredients.map((ingredient) => {
        if (ingredient.id === action.ingredientId) {
          const updatedIngredient = {
            ...ingredient,
            ...action.updates,
          };

          // Check if ingredient should be marked as modified
          return checkAndMarkIngredientModified(updatedIngredient);
        }
        return ingredient;
      });

      const newState = {
        ...state,
        ingredients: updatedIngredients,
      };

      // Update unsaved changes flag
      newState.hasUnsavedChanges = hasUnsavedChanges(
        state.originalRecipe,
        state.recipeName,
        updatedIngredients
      );

      return newState;
    }

    case "DELETE_INGREDIENT": {
      const updatedIngredients = state.ingredients.map((ingredient) => {
        if (ingredient.id === action.ingredientId) {
          return {
            ...ingredient,
            isDeleted: true,
            isModified: true, // Mark as modified since it's being deleted
          };
        }
        return ingredient;
      });

      const newState = {
        ...state,
        ingredients: updatedIngredients,
        // Clear selection if deleted ingredient was selected
        selectedIngredientId:
          state.selectedIngredientId === action.ingredientId
            ? null
            : state.selectedIngredientId,
      };

      // Update unsaved changes flag
      newState.hasUnsavedChanges = hasUnsavedChanges(
        state.originalRecipe,
        state.recipeName,
        updatedIngredients
      );

      return newState;
    }

    case "RESTORE_INGREDIENT": {
      const updatedIngredients = state.ingredients.map((ingredient) => {
        if (ingredient.id === action.ingredientId) {
          return {
            ...ingredient,
            isDeleted: false,
            isModified: false, // Reset modification status
          };
        }
        return ingredient;
      });

      const newState = {
        ...state,
        ingredients: updatedIngredients,
      };

      // Update unsaved changes flag
      newState.hasUnsavedChanges = hasUnsavedChanges(
        state.originalRecipe,
        state.recipeName,
        updatedIngredients
      );

      return newState;
    }

    case "RESET_INGREDIENT": {
      const updatedIngredients = state.ingredients.map((ingredient) => {
        if (ingredient.id === action.ingredientId) {
          return revertIngredient(ingredient);
        }
        return ingredient;
      });

      const newState = {
        ...state,
        ingredients: updatedIngredients,
      };

      // Update unsaved changes flag
      newState.hasUnsavedChanges = hasUnsavedChanges(
        state.originalRecipe,
        state.recipeName,
        updatedIngredients
      );

      return newState;
    }

    case "RESET_ALL_CHANGES": {
      return createInitialState(state.originalRecipe);
    }

    case "SET_LOADING": {
      return {
        ...state,
        isLoading: action.isLoading,
      };
    }

    case "SET_ERROR": {
      return {
        ...state,
        error: action.error,
      };
    }

    default:
      return state;
  }
}
