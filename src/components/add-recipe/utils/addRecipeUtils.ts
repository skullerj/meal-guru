import type { Ingredient, Recipe } from "../../../lib/database";
import type { Constants } from "../../../types/database";
import type { IngredientFormData } from "./addRecipeReducer";

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

// Validate entire recipe form
export function validateRecipeForm(
  recipeName: string,
  ingredients: IngredientFormData[]
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

// Transform form data to recipe JSON
export function transformToRecipeJson(
  recipeName: string,
  ingredients: IngredientFormData[]
): Recipe {
  const recipeId = generateId(recipeName);

  return {
    id: recipeId,
    name: recipeName.trim(),
    created_at: new Date().toISOString(),
    ingredients: ingredients.map((ingredient) => ({
      id: ingredient.existingIngredientId || generateId(ingredient.name),
      created_at: new Date().toISOString(),
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
  };
}

// Filter ingredients for autocomplete
export function filterIngredientsForAutocomplete(
  availableIngredients: Array<Omit<Ingredient, "amount">>,
  query: string,
  limit: number = 5
): Array<Omit<Ingredient, "amount">> {
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
