import type { Recipe } from "../../../data/recipes";
import type { RecipeIngredient } from "../../../lib/database";

export interface AggregatedIngredient extends RecipeIngredient {
  totalCost: number;
}

/**
 * Calculate the cost of an ingredient based on amount needed vs source amount
 */
export function calculateIngredientCost(ingredient: RecipeIngredient): number {
  const { amount: needed } = ingredient;
  const { amount: sourceAmount, price: sourcePrice } =
    ingredient.ingredient.source;

  if (ingredient.ingredient.shelf) {
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
    for (const recipeIngredient of recipe.ingredients) {
      const { ingredient, amount } = recipeIngredient;
      const existing = ingredientMap.get(ingredient.id);

      if (existing) {
        // If ingredient already exists and is not a shelf item, combine amounts
        if (!ingredient.shelf) {
          existing.amount += amount;
          existing.totalCost = calculateIngredientCost({
            ...recipeIngredient,
            amount: existing.amount,
          });
        }
        // For shelf items, keep original amount (they don't combine)
      } else {
        // First time seeing this ingredient
        const aggregated: AggregatedIngredient = {
          ...recipeIngredient,
          totalCost: calculateIngredientCost(recipeIngredient),
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
    shelfIngredients: ingredients.filter((ing) => ing.ingredient.shelf),
    nonShelfIngredients: ingredients.filter((ing) => !ing.ingredient.shelf),
  };
}

/**
 * Calculate Jaccard similarity between two sets
 * Returns a value between 0 (no overlap) and 1 (identical sets)
 */
export function calculateJaccardSimilarity(
  setA: string[],
  setB: string[]
): number {
  if (setA.length === 0 && setB.length === 0) return 1;
  if (setA.length === 0 || setB.length === 0) return 0;

  const setAUnique = new Set(setA);
  const setBUnique = new Set(setB);

  const intersection = new Set(
    [...setAUnique].filter((x) => setBUnique.has(x))
  );
  const union = new Set([...setAUnique, ...setBUnique]);

  return intersection.size / union.size;
}

/**
 * Calculate similarity between two recipes based on their ingredients
 */
export function calculateRecipeSimilarity(
  recipeA: Recipe,
  recipeB: Recipe,
  avoidShelfItems = true
): number {
  const filterShelf = (ing: RecipeIngredient) =>
    avoidShelfItems ? !ing.ingredient.shelf : true;
  const ingredientIdsA = recipeA.ingredients
    .filter(filterShelf)
    .map((ing) => ing.ingredient.id);
  const ingredientIdsB = recipeB.ingredients
    .filter(filterShelf)
    .map((ing) => ing.ingredient.id);

  return calculateJaccardSimilarity(ingredientIdsA, ingredientIdsB);
}

/**
 * Calculate recommendation score for a recipe against selected recipes
 * Returns the maximum similarity score with any selected recipe
 */
export function calculateRecommendationScore(
  recipe: Recipe,
  selectedRecipes: Recipe[]
): number {
  if (selectedRecipes.length === 0) return 0;

  const similarities = selectedRecipes.map((selectedRecipe) =>
    calculateRecipeSimilarity(recipe, selectedRecipe)
  );

  return Math.max(...similarities);
}

/**
 * Sort recipes with selected recipes first, then by recommendation score
 * Unselected recipes are sorted by similarity to selected recipes (highest first)
 */
export function sortRecipesByRecommendation(
  recipes: Recipe[],
  selectedRecipeIds: string[]
): Recipe[] {
  // Get selected recipes, filtering out any undefined values
  const selectedRecipes = selectedRecipeIds
    .map((id) => recipes.find((r) => r.id === id))
    .filter((recipe): recipe is Recipe => recipe !== undefined);
  const unselectedRecipes = recipes.filter(
    (recipe) => !selectedRecipeIds.includes(recipe.id)
  );

  // If no recipes are selected, return original order
  if (selectedRecipes.length === 0) {
    return [...recipes].sort((a, b) => a.name.localeCompare(b.name));
  }

  // Sort unselected recipes by recommendation score (highest first)
  const sortedUnselected = unselectedRecipes
    .map((recipe) => ({
      recipe,
      score: calculateRecommendationScore(recipe, selectedRecipes),
    }))
    .sort((a, b) => {
      // Primary sort: by recommendation score (descending)
      if (b.score !== a.score) return b.score - a.score;
      // Tie-breaker: alphabetical by name
      return a.recipe.name.localeCompare(b.recipe.name);
    })
    .map((item) => item.recipe);

  // Return selected recipes first, then sorted unselected recipes
  return [...selectedRecipes, ...sortedUnselected];
}

/**
 * Calculate general similarity score for entire recipe collection
 * Returns average pairwise similarity between all recipes (0-1 scale)
 */
export function calculateGeneralSimilarityScore(recipes: Recipe[]): number {
  if (recipes.length < 2) return 0;

  let totalSimilarity = 0;
  let pairCount = 0;

  for (let i = 0; i < recipes.length; i++) {
    for (let j = i + 1; j < recipes.length; j++) {
      totalSimilarity += calculateRecipeSimilarity(recipes[i], recipes[j]);
      pairCount++;
    }
  }

  return pairCount > 0 ? totalSimilarity / pairCount : 0;
}
