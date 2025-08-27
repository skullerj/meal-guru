import type { Ingredient, Recipe } from "../../lib/database";

export interface IngredientFormData extends Ingredient {
  // For autocomplete - reference to existing ingredient if reused
  existingIngredientId?: string;
}

export interface AddRecipeState {
  // Core state - user inputs
  currentStep: "upload" | "edit" | "output";
  uploadedFile: File | null;
  extractedText: string;
  recipeName: string;
  ingredients: IngredientFormData[];

  // Computed state - for autocomplete and validation
  availableIngredients: Omit<Ingredient, "amount">[];

  // UI state
  isLoading: boolean;
  error: string | null;
}

export type AddRecipeAction =
  | { type: "SET_STEP"; step: AddRecipeState["currentStep"] }
  | { type: "SET_LOADING"; isLoading: boolean }
  | { type: "SET_ERROR"; error: string | null }
  | { type: "SET_UPLOADED_FILE"; file: File }
  | { type: "SET_EXTRACTED_TEXT"; text: string }
  | { type: "SET_RECIPE_NAME"; name: string }
  | {
      type: "SET_PARSED_RECIPE";
      recipe: Omit<Recipe, "created_at">;
    }
  | {
      type: "UPDATE_INGREDIENT";
      index: number;
      ingredient: Partial<IngredientFormData>;
    }
  | { type: "ADD_INGREDIENT" }
  | { type: "REMOVE_INGREDIENT"; index: number }
  | { type: "RESET_FORM" };

export function createInitialState(
  availableIngredients: Omit<Ingredient, "amount">[] = []
): AddRecipeState {
  return {
    currentStep: "upload",
    uploadedFile: null,
    extractedText: "",
    recipeName: "",
    ingredients: [],
    availableIngredients,
    isLoading: false,
    error: null,
  };
}

function generateId(name: string): string {
  return `${name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "-")
    .substring(0, 20)}-${Date.now()}`;
}

export function addRecipeReducer(
  state: AddRecipeState,
  action: AddRecipeAction
): AddRecipeState {
  switch (action.type) {
    case "SET_STEP":
      return {
        ...state,
        currentStep: action.step,
      };

    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.isLoading,
      };

    case "SET_ERROR":
      return {
        ...state,
        error: action.error,
      };

    case "SET_UPLOADED_FILE":
      return {
        ...state,
        uploadedFile: action.file,
        error: null,
      };

    case "SET_EXTRACTED_TEXT":
      return {
        ...state,
        extractedText: action.text,
      };

    case "SET_RECIPE_NAME":
      return {
        ...state,
        recipeName: action.name,
      };

    case "SET_PARSED_RECIPE": {
      const { recipe } = action;

      const ingredients: IngredientFormData[] = recipe.ingredients.map(
        (ing) => ({
          id: generateId(ing.name),
          created_at: new Date().toISOString(),
          name: ing.name,
          amount: ing.amount || 0,
          unit: ing.unit || "unit",
          shelf: ing.shelf || false,
          source: {
            url: ing.source?.url || "",
            price: ing.source?.price || 0,
            amount: ing.source?.amount || 0,
          },
        })
      );

      return {
        ...state,
        recipeName: recipe.name,
        ingredients,
        currentStep: "edit",
      };
    }

    case "UPDATE_INGREDIENT": {
      const { index, ingredient } = action;
      const newIngredients = [...state.ingredients];
      newIngredients[index] = { ...newIngredients[index], ...ingredient };

      return {
        ...state,
        ingredients: newIngredients,
      };
    }

    case "REMOVE_INGREDIENT": {
      const { index } = action;
      const newIngredients = state.ingredients.filter((_, i) => i !== index);

      return {
        ...state,
        ingredients: newIngredients,
      };
    }

    case "RESET_FORM":
      return createInitialState(state.availableIngredients);

    default:
      return state;
  }
}
