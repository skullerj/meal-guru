import type { Ingredient } from "../../../lib/database";

export function filterIngredients(
  ingredients: Ingredient[],
  searchQuery: string
): Ingredient[] {
  if (!searchQuery.trim()) {
    return ingredients;
  }

  const query = searchQuery.toLowerCase();
  return ingredients.filter((ingredient) =>
    ingredient.name.toLowerCase().includes(query)
  );
}

export function sortIngredients(
  ingredients: Ingredient[],
  sortBy: "name" | "unit"
): Ingredient[] {
  return [...ingredients].sort((a, b) => {
    if (sortBy === "name") {
      return a.name.localeCompare(b.name);
    }
    return a.unit.localeCompare(b.unit);
  });
}
