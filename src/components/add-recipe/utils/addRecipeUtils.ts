import type { Constants } from "../../../types/database";
import type { EditableIngredient } from "./addRecipeReducer";

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export type AllowedUnit =
  (typeof Constants)["public"]["Enums"]["unit_type"][number];
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
] as AllowedUnit[];

// Generate consistent IDs

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
  recipeIngredient: EditableIngredient
): ValidationResult {
  const errors: string[] = [];

  const { ingredient, amount } = recipeIngredient;

  if (!ingredient.name.trim()) {
    errors.push("Ingredient name is required");
  }

  if (!amount || amount <= 0) {
    errors.push("Amount must be greater than 0");
  }

  if (
    !ingredient.unit ||
    !ALLOWED_UNITS.includes(ingredient.unit as AllowedUnit)
  ) {
    errors.push(`Unit must be one of: ${ALLOWED_UNITS.join(", ")}`);
  }

  // Source validation - required for new ingredients
  if (!ingredient?.id) {
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
  ingredients: EditableIngredient[]
): ValidationResult {
  const errors: string[] = [];

  if (ingredients.length === 0) {
    errors.push("At least one ingredient is required");
  }

  // Check for duplicate ingredient names
  const names = ingredients.map((ing) =>
    ing.ingredient.name.toLowerCase().trim()
  );
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

// Validate entire recipe form
export function validateRecipeForm(
  recipeName: string,
  ingredients: EditableIngredient[]
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

  return {
    isValid: errors.length === 0,
    errors,
  };
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
