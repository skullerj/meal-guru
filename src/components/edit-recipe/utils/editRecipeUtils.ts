import type { Recipe, RecipeIngredient } from "../../../lib/database";

export interface EditableRecipeIngredient extends RecipeIngredient {
  isModified: boolean;
  isDeleted: boolean;
  originalAmount?: number;
  originalIngredient?: RecipeIngredient["ingredient"];
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Convert a recipe ingredient to an editable one
export function createEditableRecipeIngredient(
  recipeIngredient: RecipeIngredient
): EditableRecipeIngredient {
  return {
    ...recipeIngredient,
    isModified: false,
    isDeleted: false,
    originalAmount: recipeIngredient.amount,
    originalIngredient: recipeIngredient.ingredient,
  };
}

// Convert recipe ingredients to editable format
export function createEditableIngredients(
  recipe: Recipe
): EditableRecipeIngredient[] {
  return recipe.ingredients.map(createEditableRecipeIngredient);
}

// Check if recipe has any unsaved changes
export function hasUnsavedChanges(
  originalRecipe: Recipe,
  currentRecipeName: string,
  currentIngredients: EditableRecipeIngredient[]
): boolean {
  // Check if recipe name changed
  if (originalRecipe.name !== currentRecipeName) {
    return true;
  }

  // Check if any ingredient is modified or deleted
  return currentIngredients.some(
    (ingredient) => ingredient.isModified || ingredient.isDeleted
  );
}

// Validate recipe form before saving
export function validateRecipeForm(
  recipeName: string,
  ingredients: EditableRecipeIngredient[]
): ValidationResult {
  const errors: string[] = [];

  // Validate recipe name
  if (!recipeName || recipeName.trim().length === 0) {
    errors.push("Recipe name is required");
  }

  if (recipeName.trim().length > 100) {
    errors.push("Recipe name must be less than 100 characters");
  }

  // Filter out deleted ingredients for validation
  const activeIngredients = ingredients.filter((ing) => !ing.isDeleted);

  // Validate ingredients
  if (activeIngredients.length === 0) {
    errors.push("Recipe must have at least one ingredient");
  }

  activeIngredients.forEach((ingredient, index) => {
    if (
      !ingredient.ingredient.name ||
      ingredient.ingredient.name.trim().length === 0
    ) {
      errors.push(`Ingredient ${index + 1}: Name is required`);
    }

    if (ingredient.amount <= 0) {
      errors.push(`Ingredient ${index + 1}: Amount must be greater than 0`);
    }

    if (!ingredient.ingredient.unit) {
      errors.push(`Ingredient ${index + 1}: Unit is required`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Get only the ingredients that have been modified
export function getModifiedIngredients(
  ingredients: EditableRecipeIngredient[]
): EditableRecipeIngredient[] {
  return ingredients.filter(
    (ingredient) => ingredient.isModified && !ingredient.isDeleted
  );
}

// Get ingredients that are marked for deletion
export function getDeletedIngredients(
  ingredients: EditableRecipeIngredient[]
): EditableRecipeIngredient[] {
  return ingredients.filter((ingredient) => ingredient.isDeleted);
}

// Revert ingredient to original values
export function revertIngredient(
  ingredient: EditableRecipeIngredient
): EditableRecipeIngredient {
  return {
    ...ingredient,
    amount: ingredient.originalAmount || ingredient.amount,
    ingredient: {
      ...ingredient.ingredient,
      name: ingredient.originalIngredient?.name || ingredient.ingredient.name,
      unit: ingredient.originalIngredient?.unit || ingredient.ingredient.unit,
      shelf:
        ingredient.originalIngredient?.shelf ?? ingredient.ingredient.shelf,
      source:
        ingredient.originalIngredient?.source || ingredient.ingredient.source,
    },
    isModified: false,
  };
}

// Get active (non-deleted) ingredients
export function getActiveIngredients(
  ingredients: EditableRecipeIngredient[]
): EditableRecipeIngredient[] {
  return ingredients.filter((ingredient) => !ingredient.isDeleted);
}

// Check if ingredient has valid changes
export function hasValidIngredientChanges(
  ingredient: EditableRecipeIngredient
): boolean {
  const originalIngredient = ingredient.originalIngredient;
  if (!originalIngredient) return false;

  return (
    ingredient.ingredient.name !== originalIngredient.name ||
    ingredient.amount !== ingredient.originalAmount ||
    ingredient.ingredient.unit !== originalIngredient.unit ||
    ingredient.ingredient.shelf !== originalIngredient.shelf ||
    ingredient.ingredient.source.price !== originalIngredient.source.price ||
    ingredient.ingredient.source.amount !== originalIngredient.source.amount ||
    ingredient.ingredient.source.url !== originalIngredient.source.url
  );
}

// Mark ingredient as modified if it has changes
export function checkAndMarkIngredientModified(
  ingredient: EditableRecipeIngredient
): EditableRecipeIngredient {
  const hasChanges = hasValidIngredientChanges(ingredient);
  return {
    ...ingredient,
    isModified: hasChanges,
  };
}
