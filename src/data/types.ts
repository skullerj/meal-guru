export const UNITS = [
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
export type Unit = (typeof UNITS)[number];

export const CATEGORIES = [
  "produce",
  "tins",
  "dairy",
  "meat",
  "pantry",
] as const;
export type Category = (typeof CATEGORIES)[number] | null;

export interface Ingredient {
  id: string;
  name: string;
  unit: Unit;
  category: Category;
  created_at: string;
}

export interface RecipeIngredient {
  id: string;
  recipe_id: string;
  ingredient_id: string;
  amount: number;
  order_index: number;
  ingredient: Ingredient;
}

export interface Recipe {
  id: string;
  name: string;
  created_at: string;
  ingredients: RecipeIngredient[];
}
