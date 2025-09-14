import type { Ingredient, RecipeIngredient } from "../../../lib/database";

export type EditableIngredient = Omit<
  RecipeIngredient,
  "order_index" | "id" | "ingredient"
> & {
  ingredient: Omit<Ingredient, "created_at" | "id"> & { id?: string | null };
};

export interface AddRecipeState {
  // Core state - user inputs
  currentStep: "upload" | "edit" | "output";
  uploadedFile: File | null;
  extractedText: string;
  recipeName: string;
  ingredients: EditableIngredient[];

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
      recipe: {
        ingredients: EditableIngredient[];
        name: string;
      };
    }
  | {
      type: "UPDATE_INGREDIENT";
      index: number;
      ingredient: Partial<EditableIngredient>;
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

      return {
        ...state,
        recipeName: recipe.name,
        ingredients: recipe.ingredients,
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
