import type { Ingredient } from "../../lib/database";

export interface IngredientFormData {
  id: string;
  name: string;
  amount: number;
  unit: string;
  shelf: boolean;
  source: {
    url: string;
    price: number;
    amount: number;
  };
  // For autocomplete - reference to existing ingredient if reused
  existingIngredientId?: string;
}

export interface InstructionFormData {
  id: string;
  text: string;
  ingredientIds: string[];
}

export interface AddRecipeState {
  // Core state - user inputs
  currentStep: "upload" | "edit" | "output";
  uploadedFile: File | null;
  extractedText: string;
  recipeName: string;
  ingredients: IngredientFormData[];
  instructions: InstructionFormData[];

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
        name: string;
        ingredients: {
          name: string;
          amount?: number;
          unit?: string;
          shelf?: boolean;
          source?: { url: string; price: number; amount: number };
        }[];
        instructions: { text: string; ingredientIds?: string[] }[];
      };
    }
  | {
      type: "UPDATE_INGREDIENT";
      index: number;
      ingredient: Partial<IngredientFormData>;
    }
  | { type: "ADD_INGREDIENT" }
  | { type: "REMOVE_INGREDIENT"; index: number }
  | {
      type: "UPDATE_INSTRUCTION";
      index: number;
      instruction: Partial<InstructionFormData>;
    }
  | { type: "ADD_INSTRUCTION" }
  | { type: "REMOVE_INSTRUCTION"; index: number }
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
    instructions: [],
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

      const instructions: InstructionFormData[] = recipe.instructions.map(
        (inst, index) => ({
          id: `instruction-${index}`,
          text: inst.text,
          ingredientIds: inst.ingredientIds || [],
        })
      );

      return {
        ...state,
        recipeName: recipe.name,
        ingredients,
        instructions,
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

    case "ADD_INGREDIENT":
      return {
        ...state,
        ingredients: [
          ...state.ingredients,
          {
            id: generateId("new-ingredient"),
            name: "",
            amount: 0,
            unit: "unit",
            shelf: false,
            source: {
              url: "",
              price: 0,
              amount: 0,
            },
          },
        ],
      };

    case "REMOVE_INGREDIENT": {
      const { index } = action;
      const newIngredients = state.ingredients.filter((_, i) => i !== index);

      return {
        ...state,
        ingredients: newIngredients,
      };
    }

    case "UPDATE_INSTRUCTION": {
      const { index, instruction } = action;
      const newInstructions = [...state.instructions];
      newInstructions[index] = { ...newInstructions[index], ...instruction };

      return {
        ...state,
        instructions: newInstructions,
      };
    }

    case "ADD_INSTRUCTION":
      return {
        ...state,
        instructions: [
          ...state.instructions,
          {
            id: `instruction-${state.instructions.length}`,
            text: "",
            ingredientIds: [],
          },
        ],
      };

    case "REMOVE_INSTRUCTION": {
      const { index } = action;
      const newInstructions = state.instructions.filter((_, i) => i !== index);

      return {
        ...state,
        instructions: newInstructions,
      };
    }

    case "RESET_FORM":
      return createInitialState();

    default:
      return state;
  }
}
