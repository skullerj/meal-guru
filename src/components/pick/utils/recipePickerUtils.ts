import type { Recipe } from "@/data/types";

export interface PairingInfo {
  sharedNames: string[];
}

export interface OverlapResult {
  /** Shared ingredient names keyed by unselected recipe id. */
  pairings: Map<string, PairingInfo>;
  /** Distinct ingredients used by more than one selected recipe. */
  sharedCount: number;
}

export interface PickableEntry {
  recipe: Recipe;
  sharedNames: string[];
}

export interface RecipeOrdering {
  selected: Recipe[];
  unselected: PickableEntry[];
  sharedCount: number;
}

function byName(a: { name: string }, b: { name: string }) {
  return a.name.localeCompare(b.name);
}

/**
 * Selected recipes first (alphabetical), then the rest ordered by how many
 * ingredients they share with the selection, alphabetical as a tiebreak.
 */
export function deriveOrdering(
  recipes: Recipe[],
  selectedIds: string[]
): RecipeOrdering {
  const { pairings, sharedCount } = computeOverlap(recipes, selectedIds);

  const selected = recipes
    .filter((r) => selectedIds.includes(r.id))
    .sort(byName);

  const unselected = recipes
    .filter((r) => !selectedIds.includes(r.id))
    .map((recipe) => ({
      recipe,
      sharedNames: pairings.get(recipe.id)?.sharedNames ?? [],
    }))
    .sort((a, b) => {
      const diff = b.sharedNames.length - a.sharedNames.length;
      if (diff !== 0) return diff;
      return byName(a.recipe, b.recipe);
    });

  return { selected, unselected, sharedCount };
}

export function computeOverlap(
  recipes: Recipe[],
  selectedIds: string[]
): OverlapResult {
  const selected = recipes.filter((r) => selectedIds.includes(r.id));

  // ingredient_id -> { name, recipeCount }
  const selectedIngredients = new Map<
    string,
    { name: string; recipeCount: number }
  >();

  for (const recipe of selected) {
    const seen = new Set<string>();
    for (const ri of recipe.ingredients) {
      const key = ri.ingredient_id;
      if (seen.has(key)) continue;
      seen.add(key);
      const existing = selectedIngredients.get(key);
      if (existing) {
        existing.recipeCount += 1;
      } else {
        selectedIngredients.set(key, {
          name: ri.ingredient.name,
          recipeCount: 1,
        });
      }
    }
  }

  let sharedCount = 0;
  for (const entry of selectedIngredients.values()) {
    if (entry.recipeCount > 1) sharedCount += 1;
  }

  const pairings = new Map<string, PairingInfo>();

  for (const recipe of recipes) {
    if (selectedIds.includes(recipe.id)) continue;

    const sharedNames: string[] = [];
    const seen = new Set<string>();
    for (const ri of recipe.ingredients) {
      const key = ri.ingredient_id;
      if (seen.has(key)) continue;
      seen.add(key);
      if (selectedIngredients.has(key)) {
        sharedNames.push(ri.ingredient.name);
      }
    }

    sharedNames.sort((a, b) => a.localeCompare(b));
    pairings.set(recipe.id, { sharedNames });
  }

  return { pairings, sharedCount };
}
