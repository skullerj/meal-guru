import type { Ingredient } from "../../../lib/database";
import { filterIngredients, sortIngredients } from "./ingredientManagerUtils";

export interface IngredientManagerState {
  ingredients: Ingredient[];
  filteredIngredients: Ingredient[];
  searchQuery: string;
  sortBy: "name" | "unit";
  isAddDialogOpen: boolean;
  isEditDialogOpen: boolean;
  selectedIngredient: Ingredient | null;
}

export type IngredientManagerAction =
  | { type: "SET_SEARCH_QUERY"; query: string }
  | { type: "SET_SORT_BY"; sortBy: "name" | "unit" }
  | { type: "OPEN_ADD_DIALOG" }
  | { type: "CLOSE_ADD_DIALOG" }
  | { type: "OPEN_EDIT_DIALOG"; ingredient: Ingredient }
  | { type: "CLOSE_EDIT_DIALOG" }
  | { type: "ADD_INGREDIENT"; ingredient: Ingredient }
  | { type: "UPDATE_INGREDIENT"; ingredient: Ingredient }
  | { type: "DELETE_INGREDIENT"; id: string };

export function createInitialState(
  ingredients: Ingredient[]
): IngredientManagerState {
  const sortedIngredients = sortIngredients(ingredients, "name");
  return {
    ingredients: sortedIngredients,
    filteredIngredients: sortedIngredients,
    searchQuery: "",
    sortBy: "name",
    isAddDialogOpen: false,
    isEditDialogOpen: false,
    selectedIngredient: null,
  };
}

function recalculateFilteredIngredients(
  state: IngredientManagerState
): Ingredient[] {
  const filtered = filterIngredients(state.ingredients, state.searchQuery);
  return sortIngredients(filtered, state.sortBy);
}

export function ingredientManagerReducer(
  state: IngredientManagerState,
  action: IngredientManagerAction
): IngredientManagerState {
  switch (action.type) {
    case "SET_SEARCH_QUERY": {
      const newState = { ...state, searchQuery: action.query };
      return {
        ...newState,
        filteredIngredients: recalculateFilteredIngredients(newState),
      };
    }

    case "SET_SORT_BY": {
      const newState = { ...state, sortBy: action.sortBy };
      return {
        ...newState,
        filteredIngredients: recalculateFilteredIngredients(newState),
      };
    }

    case "OPEN_ADD_DIALOG":
      return { ...state, isAddDialogOpen: true };

    case "CLOSE_ADD_DIALOG":
      return { ...state, isAddDialogOpen: false };

    case "OPEN_EDIT_DIALOG":
      return {
        ...state,
        isEditDialogOpen: true,
        selectedIngredient: action.ingredient,
      };

    case "CLOSE_EDIT_DIALOG":
      return {
        ...state,
        isEditDialogOpen: false,
        selectedIngredient: null,
      };

    case "ADD_INGREDIENT": {
      const newState = {
        ...state,
        ingredients: [...state.ingredients, action.ingredient],
        isAddDialogOpen: false,
      };
      return {
        ...newState,
        filteredIngredients: recalculateFilteredIngredients(newState),
      };
    }

    case "UPDATE_INGREDIENT": {
      const newState = {
        ...state,
        ingredients: state.ingredients.map((ing) =>
          ing.id === action.ingredient.id ? action.ingredient : ing
        ),
        isEditDialogOpen: false,
        selectedIngredient: null,
      };
      return {
        ...newState,
        filteredIngredients: recalculateFilteredIngredients(newState),
      };
    }

    case "DELETE_INGREDIENT": {
      const newState = {
        ...state,
        ingredients: state.ingredients.filter((ing) => ing.id !== action.id),
      };
      return {
        ...newState,
        filteredIngredients: recalculateFilteredIngredients(newState),
      };
    }

    default:
      return state;
  }
}
