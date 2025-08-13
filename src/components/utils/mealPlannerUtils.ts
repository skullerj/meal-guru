import type { Ingredient, Recipe } from "../../data/recipes";

export interface AggregatedIngredient {
  id: string;
  name: string;
  unit: string;
  amount: number;
  source: {
    url: string;
    price: number;
    amount: number;
  };
  shelf: boolean;
  totalCost: number;
}

/**
 * Calculate the cost of an ingredient based on amount needed vs source amount
 */
export function calculateIngredientCost(ingredient: Ingredient): number {
  const { amount: needed, source, shelf } = ingredient;
  const { amount: sourceAmount, price: sourcePrice } = source;

  if (shelf) {
    return sourcePrice;
  }
  // Calculate cost per unit
  const costPerUnit = sourcePrice / sourceAmount;
  return Math.max(needed * costPerUnit, sourcePrice);
}

/**
 * Calculate the total cost of a recipe
 */
export function calculateRecipePrice(recipe: Recipe): number {
  return recipe.ingredients.reduce((total, ingredient) => {
    return total + calculateIngredientCost(ingredient);
  }, 0);
}

/**
 * Aggregate ingredients from multiple recipes, combining quantities for non-shelf items
 */
export function aggregateIngredients(
  recipes: Recipe[]
): AggregatedIngredient[] {
  const ingredientMap = new Map<string, AggregatedIngredient>();

  for (const recipe of recipes) {
    for (const ingredient of recipe.ingredients) {
      const existing = ingredientMap.get(ingredient.id);

      if (existing) {
        // If ingredient already exists and is not a shelf item, combine amounts
        if (!ingredient.shelf) {
          existing.amount += ingredient.amount;
          existing.totalCost = calculateIngredientCost({
            ...ingredient,
            amount: existing.amount,
          });
        }
        // For shelf items, keep original amount (they don't combine)
      } else {
        // First time seeing this ingredient
        const aggregated: AggregatedIngredient = {
          ...ingredient,
          totalCost: calculateIngredientCost(ingredient),
        };
        ingredientMap.set(ingredient.id, aggregated);
      }
    }
  }

  return Array.from(ingredientMap.values());
}

/**
 * Filter ingredients to get only those that haven't been marked as owned
 */
export function getIngredientsLeftToBuy(
  aggregatedIngredients: AggregatedIngredient[],
  ownedIngredientIds: string[]
): AggregatedIngredient[] {
  return aggregatedIngredients.filter(
    (ingredient) => !ownedIngredientIds.includes(ingredient.id)
  );
}

/**
 * Calculate the total price of ingredients left to buy
 */
export function calculateTotalPrice(
  ingredients: AggregatedIngredient[]
): number {
  return ingredients.reduce(
    (total, ingredient) => total + ingredient.totalCost,
    0
  );
}

/**
 * Calculate remaining amount needed to reach target (e.g., £40)
 */
export function calculateRemainingToTarget(
  currentTotal: number,
  target: number
): number {
  const remaining = target - currentTotal;
  return Math.max(0, remaining);
}

/**
 * Separate ingredients into shelf and non-shelf categories
 */
export function separateIngredientsByShelf(
  ingredients: AggregatedIngredient[]
) {
  return {
    shelfIngredients: ingredients.filter((ing) => ing.shelf),
    nonShelfIngredients: ingredients.filter((ing) => !ing.shelf),
  };
}
