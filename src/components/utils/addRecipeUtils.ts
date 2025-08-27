import type {
  IngredientFormData,
  InstructionFormData,
} from "./addRecipeReducer";

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface RecipeJsonData {
  id: string;
  name: string;
  ingredients: {
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
  }[];
  instructions: {
    text: string;
    ingredientIds: string[];
  }[];
}

// Standardized units allowed in the system
export const ALLOWED_UNITS = [
  "g",
  "kg",
  "ml",
  "l",
  "tsp",
  "tbsp",
  "cup",
  "oz",
  "lb",
  "unit",
] as const;

export type AllowedUnit = (typeof ALLOWED_UNITS)[number];

// Generate consistent IDs
export function generateId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "-")
    .substring(0, 20);
}

// Validate recipe name
export function validateRecipeName(name: string): ValidationResult {
  const errors: string[] = [];

  if (!name.trim()) {
    errors.push("Recipe name is required");
  } else if (name.trim().length < 3) {
    errors.push("Recipe name must be at least 3 characters");
  } else if (name.trim().length > 100) {
    errors.push("Recipe name must be less than 100 characters");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Validate individual ingredient
export function validateIngredient(
  ingredient: IngredientFormData
): ValidationResult {
  const errors: string[] = [];

  if (!ingredient.name.trim()) {
    errors.push("Ingredient name is required");
  }

  if (!ingredient.amount || ingredient.amount <= 0) {
    errors.push("Amount must be greater than 0");
  }

  if (
    !ingredient.unit ||
    !ALLOWED_UNITS.includes(ingredient.unit as AllowedUnit)
  ) {
    errors.push(`Unit must be one of: ${ALLOWED_UNITS.join(", ")}`);
  }

  // Source validation - required for new ingredients
  if (!ingredient.existingIngredientId) {
    if (!ingredient.source.url) {
      errors.push("Store URL is required");
    } else {
      try {
        new URL(ingredient.source.url);
      } catch {
        errors.push("Store URL must be valid");
      }
    }

    if (!ingredient.source.price || ingredient.source.price <= 0) {
      errors.push("Store price must be greater than 0");
    }

    if (!ingredient.source.amount || ingredient.source.amount <= 0) {
      errors.push("Store amount must be greater than 0");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Validate all ingredients
export function validateIngredients(
  ingredients: IngredientFormData[]
): ValidationResult {
  const errors: string[] = [];

  if (ingredients.length === 0) {
    errors.push("At least one ingredient is required");
  }

  // Check for duplicate ingredient names
  const names = ingredients.map((ing) => ing.name.toLowerCase().trim());
  const duplicates = names.filter(
    (name, index) => names.indexOf(name) !== index
  );
  if (duplicates.length > 0) {
    errors.push("Duplicate ingredient names are not allowed");
  }

  // Validate each ingredient
  ingredients.forEach((ingredient, index) => {
    const result = validateIngredient(ingredient);
    if (!result.isValid) {
      errors.push(`Ingredient ${index + 1}: ${result.errors.join(", ")}`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Validate instruction
export function validateInstruction(
  instruction: InstructionFormData
): ValidationResult {
  const errors: string[] = [];

  if (!instruction.text.trim()) {
    errors.push("Instruction text is required");
  } else if (instruction.text.trim().length < 10) {
    errors.push("Instruction must be at least 10 characters");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Validate all instructions
export function validateInstructions(
  instructions: InstructionFormData[]
): ValidationResult {
  const errors: string[] = [];

  if (instructions.length === 0) {
    errors.push("At least one instruction is required");
  }

  // Validate each instruction
  instructions.forEach((instruction, index) => {
    const result = validateInstruction(instruction);
    if (!result.isValid) {
      errors.push(`Step ${index + 1}: ${result.errors.join(", ")}`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Validate entire recipe form
export function validateRecipeForm(
  recipeName: string,
  ingredients: IngredientFormData[],
  instructions: InstructionFormData[]
): ValidationResult {
  const errors: string[] = [];

  const nameValidation = validateRecipeName(recipeName);
  if (!nameValidation.isValid) {
    errors.push(...nameValidation.errors);
  }

  const ingredientsValidation = validateIngredients(ingredients);
  if (!ingredientsValidation.isValid) {
    errors.push(...ingredientsValidation.errors);
  }

  const instructionsValidation = validateInstructions(instructions);
  if (!instructionsValidation.isValid) {
    errors.push(...instructionsValidation.errors);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Transform form data to recipe JSON
export function transformToRecipeJson(
  recipeName: string,
  ingredients: IngredientFormData[],
  instructions: InstructionFormData[]
): RecipeJsonData {
  const recipeId = generateId(recipeName);

  return {
    id: recipeId,
    name: recipeName.trim(),
    ingredients: ingredients.map((ingredient) => ({
      id: ingredient.existingIngredientId || generateId(ingredient.name),
      name: ingredient.name.trim(),
      amount: ingredient.amount,
      unit: ingredient.unit,
      shelf: ingredient.shelf,
      source: {
        url: ingredient.source.url,
        price: ingredient.source.price,
        amount: ingredient.source.amount,
      },
    })),
    instructions: instructions.map((instruction) => ({
      text: instruction.text.trim(),
      ingredientIds: instruction.ingredientIds,
    })),
  };
}

// Filter ingredients for autocomplete
export function filterIngredientsForAutocomplete(
  availableIngredients: Array<{ id: string; name: string; unit: string }>,
  query: string,
  limit: number = 5
): Array<{ id: string; name: string; unit: string }> {
  if (!query.trim()) return [];

  const lowercaseQuery = query.toLowerCase().trim();

  return availableIngredients
    .filter((ingredient) =>
      ingredient.name.toLowerCase().includes(lowercaseQuery)
    )
    .slice(0, limit);
}

// Extract text from PDF (client-side utility)
export async function extractTextFromPdf(file: File): Promise<string> {
  // This will be used on the client side
  // The actual implementation will use pdf-parse-new
  const arrayBuffer = await file.arrayBuffer();

  // Dynamic import to avoid SSR issues
  const pdfParse = await import("pdf-parse-new");
  const data = await pdfParse.default(arrayBuffer);

  return data.text;
}
